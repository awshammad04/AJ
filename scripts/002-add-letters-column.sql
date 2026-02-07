-- Add letters column to practice_sessions table
-- This column stores diagnosed letter issues from assessments (e.g., ["KAF", "RA", "SIN"])

ALTER TABLE practice_sessions 
ADD COLUMN IF NOT EXISTS letters TEXT[] DEFAULT '{}';

-- Add comment to document the column
COMMENT ON COLUMN practice_sessions.letters IS 'Array of diagnosed letter codes (e.g., KAF, RA, SIN) from speech assessment';
