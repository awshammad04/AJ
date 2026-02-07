# Database Migration: Add Letters Column

This migration adds the `letters` column to the `practice_sessions` table to store diagnosed letter issues from speech assessments.

## How to Run

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `002-add-letters-column.sql`
4. Click **Run**

### Option 2: Using Supabase CLI
```bash
supabase db push --file scripts/002-add-letters-column.sql
```

## What This Does

- Adds a `letters` column of type `TEXT[]` (array of text) to the `practice_sessions` table
- Sets default value to empty array `{}`
- Adds documentation comment explaining the column's purpose

## Example Data

After running this migration, the `practice_sessions` table will store diagnosed letters like:
```json
{
  "id": "...",
  "user_id": "...",
  "letters": ["KAF", "RA", "SIN"],
  "created_at": "..."
}
```

If no issues were detected, the array will be empty: `[]`
