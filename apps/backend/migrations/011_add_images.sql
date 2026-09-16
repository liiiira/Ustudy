ALTER TABLE users 
ADD COLUMN avatar_url TEXT;

ALTER TABLE posts
ADD COLUMN image_url TEXT;

ALTER TABLE communities 
ADD COLUMN image_url TEXT;
