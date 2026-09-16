CREATE TABLE uploads (
  id           UUID DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL,
  kind         TEXT NOT NULL ,
  object_key   TEXT NOT NULL,
  public_url   TEXT NOT NULL,
  content_type TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_uploads 
    PRIMARY KEY(id), 
  
  CONSTRAINT unq_uploads_object_key 
    UNIQUE(object_key),

  CONSTRAINT fk_uploads_owner_id_users 
    FOREIGN KEY(owner_id)
      REFERENCES users(id),

  CONSTRAINT ck_uploads_kind 
    CHECK (kind IN ('avatar', 'community', 'post'))
);
