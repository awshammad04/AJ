-- Create training_sessions table for tracking individual training sessions
CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    letter TEXT NOT NULL, -- 'KAF', 'SIN', or 'RA'
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    words_practiced INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    total_attempts INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0, -- Percentage score (0-100)
    results JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {word, isCorrect, attempts}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_letter ON training_sessions(letter);
CREATE INDEX IF NOT EXISTS idx_training_sessions_created_at ON training_sessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own training sessions
CREATE POLICY "Users can view own training sessions"
    ON training_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy: Users can insert their own training sessions
CREATE POLICY "Users can insert own training sessions"
    ON training_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own training sessions
CREATE POLICY "Users can update own training sessions"
    ON training_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy: Users can delete their own training sessions
CREATE POLICY "Users can delete own training sessions"
    ON training_sessions
    FOR DELETE
    USING (auth.uid() = user_id);
