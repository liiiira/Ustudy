CREATE TABLE users(
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_users PRIMARY KEY(id),
  CONSTRAINT unq_users_email UNIQUE(email),
  CONSTRAINT unq_users_username UNIQUE(username)
)
