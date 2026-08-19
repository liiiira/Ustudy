CREATE TABLE posts(
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  community_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  text_content VARCHAR(1000) NOT NULL,
  CONSTRAINT pk_post PRIMARY KEY(id),
  CONSTRAINT fk_post_creator_user FOREIGN KEY(creator_id) REFERENCES users(id) ON DELETE CASCADE
);
