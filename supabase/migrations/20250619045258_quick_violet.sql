/*
  # Fix user profiles RLS policies

  1. Security
    - Add missing policy for public access to manage profiles
    - Ensure proper RLS policies for user profile management
*/

-- Add policy for public role to manage own profile (needed for some operations)
CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO public
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);