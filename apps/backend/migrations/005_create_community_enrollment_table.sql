CREATE TYPE  community_role AS ENUM (
  'admin',
  'modertor',
  'member'
);

CREATE TABLE community_enrollments(
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  community_id UUID NOT NULL, 
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role community_role NOT NULL DEFAULT 'member',

  CONSTRAINT pk_community_enrollment PRIMARY KEY(id),
  CONSTRAINT fk_community_enrollment_user_id_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_enrollment_community_id_community FOREIGN KEY(community_id) REFERENCES communities(id) ON DELETE CASCADE
);
