CREATE TABLE converation_members(

  member_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role TEXT NOT NULL DEFAULT 'member',
  last_read_message_id UUID,

  CONSTRAINT pk_conversation_members 
    PRIMARY KEY(member_id, conversation_id),

  CONSTRAINT fk_conversation_members_member_id_users
    FOREIGN KEY(member_id) 
      REFERENCES users(id)
        ON DELETE CASCADE,

  CONSTRAINT fk_conversation_members_conversation_id_conversations
    FOREIGN KEY(conversation_id)
      REFERENCES conversations(id)
        ON DELETE CASCADE,

  CONSTRAINT fk_conversation_members_last_read_message_id_messages 
    FOREIGN KEY(last_read_message_id)
      REFERENCES messages(id)
        ON DELETE SET NULL,

  CONSTRAINT ck_conversation_members_role
    CHECK (role IN ('member', 'admin'))
);
