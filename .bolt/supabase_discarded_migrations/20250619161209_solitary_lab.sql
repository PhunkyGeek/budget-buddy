/*
  # Initial Voice Budget Planner Schema

  1. New Tables
    - `user_profiles`
      - `user_id` (uuid, primary key, references auth.users)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `theme` ('light' | 'dark')
      - `subscription_status` ('free' | 'pro')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `income_sources`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable, references user_profiles)
      - `name` (text)
      - `is_custom` (boolean)
      - `created_at` (timestamp)
    
    - `incomes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `source_id` (uuid, references income_sources)
      - `amount` (numeric)
      - `date` (date)
      - `created_at` (timestamp)
    
    - `categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable, references user_profiles)
      - `name` (text)
      - `is_custom` (boolean)
      - `created_at` (timestamp)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `category_id` (uuid, references categories)
      - `amount` (numeric)
      - `date` (date)
      - `created_at` (timestamp)
    
    - `budgets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `category_id` (uuid, references categories)
      - `amount` (numeric)
      - `date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Insert predefined income sources and categories

  3. Predefined Data
    - Default income sources: salary, insurance, self-employment
    - Default categories: groceries, utilities, miscellaneous, shopping
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  subscription_status text DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create income_sources table
CREATE TABLE IF NOT EXISTS income_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  name text NOT NULL,
  is_custom boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create incomes table
CREATE TABLE IF NOT EXISTS incomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES income_sources(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  name text NOT NULL,
  is_custom boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for income_sources
CREATE POLICY "Users can read income sources"
  ON income_sources
  FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can insert custom income sources"
  ON income_sources
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_custom = true);

-- Create policies for incomes
CREATE POLICY "Users can manage own incomes"
  ON incomes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for categories
CREATE POLICY "Users can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can insert custom categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_custom = true);

-- Create policies for expenses
CREATE POLICY "Users can manage own expenses"
  ON expenses
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for budgets
CREATE POLICY "Users can manage own budgets"
  ON budgets
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insert predefined income sources
INSERT INTO income_sources (name, is_custom) VALUES
  ('Salary', false),
  ('Insurance', false),
  ('Self-employment', false)
ON CONFLICT DO NOTHING;

-- Insert predefined categories
INSERT INTO categories (name, is_custom) VALUES
  ('Groceries', false),
  ('Utilities', false),
  ('Miscellaneous', false),
  ('Shopping', false),
  ('Food & Dining', false),
  ('Transportation', false),
  ('Entertainment', false),
  ('Healthcare', false)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_incomes_user_date ON incomes(user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_date ON budgets(user_id, date);
CREATE INDEX IF NOT EXISTS idx_income_sources_user ON income_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();