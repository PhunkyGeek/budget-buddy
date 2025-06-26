/*
  # Create Wallets Table for Budget Safe

  1. New Table
    - `wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `balance` (numeric, default 0)
      - `locked_amount` (numeric, default 0)
      - `lock_expiry` (timestamp, nullable)
      - `last_updated` (timestamp)

  2. Security
    - Enable RLS on wallets table
    - Add policies for authenticated users to manage their own wallet
*/

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  locked_amount numeric DEFAULT 0 CHECK (locked_amount >= 0),
  lock_expiry timestamptz,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wallet"
  ON wallets
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);

-- Create trigger to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_updated_at();