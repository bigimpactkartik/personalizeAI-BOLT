/*
  # Create projects table and storage setup

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `project_name` (text)
      - `description` (text)
      - `target_audience` (text)
      - `data_source` (text) - 'excel' or 'googlesheet'
      - `google_sheet_link` (text, nullable)
      - `excel_file_path` (text, nullable) - path to uploaded file in storage
      - `ai_model_provider` (text)
      - `email_capacity` (jsonb) - stores email capacity settings
      - `company_targeting` (jsonb) - stores company targeting settings
      - `status` (text) - 'pending', 'processing', 'completed', 'failed'
      - `progress` (integer) - 0-100
      - `result_file_path` (text, nullable) - path to result file in storage
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Storage
    - Create bucket for project files
    - Create bucket for result files

  3. Security
    - Enable RLS on projects table
    - Add policies for users to access only their own projects
    - Set up storage policies
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_name text NOT NULL,
  description text NOT NULL,
  target_audience text NOT NULL,
  data_source text NOT NULL CHECK (data_source IN ('excel', 'googlesheet')),
  google_sheet_link text,
  excel_file_path text,
  ai_model_provider text NOT NULL,
  email_capacity jsonb NOT NULL DEFAULT '{}',
  company_targeting jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  result_file_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('project-files', 'project-files', false),
  ('result-files', 'result-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project files
CREATE POLICY "Users can upload their own project files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their own project files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own project files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for result files
CREATE POLICY "Users can read their own result files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'result-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "System can upload result files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'result-files');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();