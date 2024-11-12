-- Add timezone column with EST as default
ALTER TABLE subscriptions 
ADD COLUMN timezone VARCHAR(50) DEFAULT 'America/New_York';

-- Update existing records to use EST
UPDATE subscriptions 
SET timezone = 'America/New_York';

-- Make timezone column NOT NULL after updating existing records
ALTER TABLE subscriptions 
ALTER COLUMN timezone SET NOT NULL; 