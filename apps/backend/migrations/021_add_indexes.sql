CREATE UNIQUE INDEX unq_idx_refresh_tokens_hashed_token ON refresh_tokens(hashed_token);

CREATE UNIQUE INDEX unq_idx_communities_image_url ON communities(image_id);
CREATE UNIQUE INDEX unq_idx_users_avatar_id ON users(avatar_id);
CREATE UNIQUE INDEX unq_idx_posts_image_id ON posts(image_id);
CREATE UNIQUE INDEX unq_idx_comments_upload_id ON messages(upload_id);
CREATE UNIQUE INDEX unq_idx_conversations_upload_id ON conversations(upload_id);
CREATE INDEX idx_communities_owner_id ON communities(owner_id);

CREATE INDEX idx_posts_owner_id ON posts(owner_id);
CREATE INDEX idx_posts_community_id ON posts(community_id);

CREATE UNIQUE INDEX unq_idx_uploads_public_url ON uploads(public_url);
CREATE INDEX idx_uploads_owner_id ON uploads(owner_id);

CREATE INDEX idx_comments_owner_id ON comments(owner_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);

CREATE INDEX idx_conversations_owner_id ON conversations(owner_id);

CREATE INDEX idx_conversation_members ON conversation_members(last_read_message_id);
CREATE INDEX idx_conversation_members_member_id ON conversation_members(member_id);
CREATE INDEX idx_conversation_members_converation_id ON conversation_members(conversation_id);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

