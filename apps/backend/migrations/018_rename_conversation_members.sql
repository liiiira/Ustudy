-- 017 created the table as "converation_members" (typo); the constraints
-- inside it were already named conversation_members_*, only the table
-- name was wrong.
ALTER TABLE converation_members RENAME TO conversation_members;
