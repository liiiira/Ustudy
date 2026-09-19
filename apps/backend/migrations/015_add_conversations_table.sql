CREATE TABLE conversations(

  id UUID NOT NULL DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  name VARCHAR(100),
  owner_id UUID,
  upload_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  direct_key TEXT UNIQUE,
  
  CONSTRAINT pk_conversations
    PRIMARY KEY(id),

  CONSTRAINT fk_conversations_owner_id_users
    FOREIGN KEY (owner_id)
      REFERENCES users(id)
        ON DELETE SET NULL,

  CONSTRAINT fk_conversations_upload_id_uploads
    FOREIGN KEY (upload_id)
      REFERENCES uploads(id)
        ON DELETE SET NULL,

  CONSTRAINT ck_conversations_type 
    CHECK (type IN ('direct', 'group')),

  CONSTRAINT ck_conversations_shape 
    CHECK(
      (type = 'direct' AND name IS NULL AND owner_id IS NULL AND direct_key IS NOT NULL AND upload_id IS NULL) OR  
      (type = 'group' AND name IS NOT NULL AND owner_id IS NOT NULL AND direct_key IS NULL)
    )
);
