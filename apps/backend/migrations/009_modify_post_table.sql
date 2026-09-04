ALTER TABLE posts
ADD CONSTRAINT fk_post_community FOREIGN KEY(community_id) REFERENCES communities(id) ON DELETE CASCADE;

ALTER TABLE posts
ADD COLUMN title VARCHAR(100) NOT NULL;

ALTER TABLE posts
RENAME COLUMN creator_id TO owner_id;

ALTER TABLE posts
RENAME CONSTRAINT fk_post_creator_user TO fk_post_owner_user;


