CREATE TABLE IF NOT EXISTS claude_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('admin', 'advisory', 'shell')),
    teammate_mode TEXT NOT NULL DEFAULT 'in-process' CHECK (teammate_mode IN ('tmux', 'in-process')),
    tmux_name TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'stopped')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    stopped_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_claude_sessions_status ON claude_sessions(status, created_at DESC);

-- Migration: add teammate_mode, remove old type column if exists
DO $$ BEGIN
    -- Add teammate_mode if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='claude_sessions' AND column_name='teammate_mode') THEN
        ALTER TABLE claude_sessions ADD COLUMN teammate_mode TEXT NOT NULL DEFAULT 'in-process' CHECK (teammate_mode IN ('tmux', 'in-process'));
    END IF;
    -- Drop old type column if it was added by mistake
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='claude_sessions' AND column_name='type') THEN
        ALTER TABLE claude_sessions DROP COLUMN type;
    END IF;
    -- Restore tmux_name NOT NULL (may have been dropped)
    ALTER TABLE claude_sessions ALTER COLUMN tmux_name SET NOT NULL;
    -- Restore unique constraint if missing
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='claude_sessions_tmux_name_key') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_claude_sessions_tmux_name_unique') THEN
            ALTER TABLE claude_sessions ADD CONSTRAINT claude_sessions_tmux_name_key UNIQUE (tmux_name);
        END IF;
    END IF;
    -- Drop partial unique index if exists (from previous migration)
    DROP INDEX IF EXISTS idx_claude_sessions_tmux_name_unique;
END $$;
