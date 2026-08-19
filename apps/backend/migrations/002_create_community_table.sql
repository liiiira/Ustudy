CREATE TABLE communities(
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  community_name VARCHAR(36) NOT NULL,
  owner_id uuid NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
  
  CONSTRAINT pk_community PRIMARY KEY(id),
  CONSTRAINT unq_community_name UNIQUE(community_name),
  CONSTRAINT fk_community_owner_id_user FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE SET NULL
);
