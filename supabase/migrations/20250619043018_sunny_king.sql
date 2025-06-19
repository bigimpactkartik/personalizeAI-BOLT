/*
  # Create projects table and user profiles

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `project_name` (text)
      - `description` (text)
      - `target_audience` (text)
      - `data_source` (text, enum: excel/googlesheet)
      - `google_sheet_link` (text, nullable)
      - `excel_file_path` (text, nullable)
      - `ai_model_provider` (text)
      - `email_capacity` (jsonb)
      - `company_targeting` (jsonb)
      - `status` (text, enum: pending/processing/completed/failed)
      - `progress` (integer, 0-100)
      - `result_file_path` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `projects` table
    - Add policies for authenticated users to manage their own projects
    - Create storage bucket and policies for file uploads

  3. Functions and Triggers
    - Create updated_at trigger function
    - Add trigger to automatically update updated_at column
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read their own projects" ON projects;
  DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
  DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
  DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
  DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist yet, continue
    NULL;
  WHEN undefined_object THEN
    -- Policy doesn't exist, continue
    NULL;
END $$;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create policies for projects table
CREATE POLICY "Users can read their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

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

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create storage bucket for project files (only if it doesn't exist)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('project-files', 'project-files', false);
EXCEPTION
  WHEN unique_violation THEN
    -- Bucket already exists, continue
    NULL;
END $$;

-- Create storage policies
CREATE POLICY "Users can upload their own files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);