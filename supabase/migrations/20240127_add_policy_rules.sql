-- Add policy_rules column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS policy_rules JSONB DEFAULT NULL;
