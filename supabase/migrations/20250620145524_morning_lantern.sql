/*
  # Add tutorial tracking to user profiles

  1. New Column
    - `last_tutorial_shown_month` (text, nullable)
      - Stores the month when tutorial was last shown in 'YYYY-MM' format
      - NULL for new users who haven't seen tutorial yet
      - Used to show tutorial on 1st of each month

  2. Changes
    - Add column to user_profiles table
    - No RLS changes needed as existing policies cover this column
*/

-- Add last_tutorial_shown_month column to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'last_tutorial_shown_month'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_tutorial_shown_month text;
  END IF;
END $$;