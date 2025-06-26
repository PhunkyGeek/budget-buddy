/*
  # Create Wallet Transactions Table

  1. New Table
    - `wallet_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `transaction_type` (text, check constraint for valid types)
      - `amount` (numeric, must be positive)
      - `description` (text)
      - `timestamp` (timestamptz, default now)

  2. Security
    - Enable RLS on wallet_transactions table
    - Add policies for authenticated users to read their own transactions
    - Add index for efficient querying by user and timestamp

  3. Changes
    - Creates wallet_transactions table with proper constraints
    - Sets up RLS policies for data security
    - Adds indexes for performance optimization
*/

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('add', 'withdraw', 'lock', 'unlock')),
  amount numeric NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallet transactions"
  ON wallet_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_timestamp 
  ON wallet_transactions(user_id, timestamp DESC);