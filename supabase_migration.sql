-- Add custom_name and updated_at columns to saved_links table
ALTER TABLE saved_links 
ADD COLUMN IF NOT EXISTS custom_name TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create an updated_at trigger to automatically update the timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for saved_links table
DROP TRIGGER IF EXISTS update_saved_links_updated_at ON saved_links;
CREATE TRIGGER update_saved_links_updated_at 
BEFORE UPDATE ON saved_links 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();