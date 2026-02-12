-- Inspect the enum values for funding_stage
SELECT unnest(enum_range(NULL::funding_stage)) AS enum_value;

-- Note: The user cannot stick this into the SQL editor directly if they don't know the type name.
-- Protocol:
-- 1. I will provide a script to DROP the enum constraint and make it TEXT, which is more flexible and less error-prone for this app.
-- 2. OR I will provide a script to ADD the missing values.

-- Decision: Make it TEXT. Enums in Postgres for something like this often cause friction.
-- Migration to convert funding_stage to TEXT
DO $$
BEGIN
    -- 1. Alter the column to text (this automatically casts the enum to text)
    ALTER TABLE startups ALTER COLUMN funding_stage TYPE TEXT;

    -- 2. Drop the enum type if it exists (optional, but clean)
    DROP TYPE IF EXISTS funding_stage;
END $$;
