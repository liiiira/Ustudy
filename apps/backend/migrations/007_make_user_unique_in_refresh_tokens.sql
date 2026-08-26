TRUNCATE TABLE refresh_tokens;
ALTER TABLE refresh_tokens
ADD CONSTRAINT unq_refresh_token_user_id UNIQUE(user_id);
