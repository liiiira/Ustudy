-- 013 set ON DELETE CASCADE on these FKs, which deletes the *referencing*
-- row (a user/post/community) whenever the *referenced* uploads row is
-- deleted — backwards from the intended behavior. Deleting an upload
-- should clear the image/avatar reference, not delete the owning record.
ALTER TABLE users
  DROP CONSTRAINT fk_user_avatar_id_upload,
  ADD CONSTRAINT fk_user_avatar_id_upload
    FOREIGN KEY(avatar_id) REFERENCES uploads(id) ON DELETE SET NULL;

ALTER TABLE posts
  DROP CONSTRAINT fk_post_image_id_upload,
  ADD CONSTRAINT fk_post_image_id_upload
    FOREIGN KEY(image_id) REFERENCES uploads(id) ON DELETE SET NULL;

-- also fixes a copy-paste constraint name (was fk_post_image_id_upload)
ALTER TABLE communities
  DROP CONSTRAINT fk_post_image_id_upload,
  ADD CONSTRAINT fk_community_image_id_upload
    FOREIGN KEY(image_id) REFERENCES uploads(id) ON DELETE SET NULL;
