/*
  # Fix User Profiles Policies

  1. Security Updates
    - Ensure proper RLS policies exist for user_profiles table
    - Add missing policies for profile management
    - Handle policy conflicts by using IF NOT EXISTS pattern

  2. Changes
    - Add policy for authenticated users to insert their own profile
    - Add policy for authenticated users to read their own profile  
    - Add policy for authenticated users to update their own profile
    - Ensure all operations work with auth.uid()
*/

-- Drop existing conflicting policy if it exists
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;

-- Create individual policies for better control and clarity
DO $$
BEGIN
  -- Policy for inserting user profiles (needed during registration)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON user_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Policy for reading user profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can read their own profile'
  ) THEN
    CREATE POLICY "Users can read their own profile"
      ON user_profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Policy for updating user profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON user_profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;