ALTER TABLE uploads
DROP CONSTRAINT ck_uploads_kind,
ADD CONSTRAINT ck_uploads_kind CHECK (kind IN ('avatar', 'community', 'post', 'conversation'));
