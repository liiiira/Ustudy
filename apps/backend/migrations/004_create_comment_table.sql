CREATE TABLE comments(
  id UUID NOT NULL,
  post_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  text_content VARCHAR(1000) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_comment PRIMARY KEY(id),
  CONSTRAINT fk_comment_owner_id_user FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_post_id_post FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
)
