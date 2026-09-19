CREATE TABLE messages(

  id UUID NOT NULL DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL, 
  sender_id UUID,
  text_content VARCHAR(500), 
  upload_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT pk_messages 
    PRIMARY KEY(id),

  CONSTRAINT fk_messages_conversation_id_conversations
    FOREIGN KEY(conversation_id)
      REFERENCES conversations(id)
        ON DELETE CASCADE,

  CONSTRAINT fk_messages_conversation_id_users 
    FOREIGN KEY(sender_id)
      REFERENCES users(id)
        ON DELETE SET NULL,
  
  CONSTRAINT fk_messages_upload_id_uploads
    FOREIGN KEY(upload_id)
      REFERENCES uploads(id)
        ON DELETE SET NULL
);
