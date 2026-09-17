ALTER TABLE users 
DROP COLUMN avatar_url,
ADD COLUMN avatar_id UUID,
ADD CONSTRAINT fk_user_avatar_id_upload
  FOREIGN KEY(avatar_id) REFERENCES uploads(id) ON DELETE CASCADE;


ALTER TABLE posts
DROP COLUMN image_url,
ADD COLUMN image_id UUID,
ADD CONSTRAINT fk_post_image_id_upload
  FOREIGN KEY(image_id) REFERENCES uploads(id) ON DELETE CASCADE;

ALTER TABLE communities 
DROP COLUMN image_url,
ADD COLUMN image_id UUID,
ADD CONSTRAINT fk_post_image_id_upload
  FOREIGN KEY(image_id) REFERENCES uploads(id) ON DELETE CASCADE;
