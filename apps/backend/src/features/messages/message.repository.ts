import pool from "../../config/postgres";
import type { Message } from "./message.schema";

type CreateMessageRepository = {
  conversationId: string;
  senderId: string;
  textContent?: string;
  uploadId?: string;
};

export async function create({
  conversationId,
  senderId,
  textContent,
  uploadId,
}: CreateMessageRepository): Promise<Message | null> {
  const result = await pool.query(
    `
    WITH inserted AS(
      INSERT INTO messages(conversation_id, sender_id, text_content, upload_id)
      VALUES 
        ($1, $2, $3, $4)
      RETURNING *
    )
    SELECT 
      inserted.id AS "id",
      inserted.sender_id AS "senderId",
      users.username AS "senderUsername",
      inserted.text_content AS "textContent",
      inserted.conversation_id AS "conversationId",
      inserted.created_at AS "createdAt",
      uploads.public_url AS "imageUrl"
    FROM inserted 
    LEFT JOIN uploads
      ON inserted.upload_id = uploads.id
    LEFT JOIN users 
      ON inserted.sender_id = users.id`,
    [conversationId, senderId, textContent, uploadId],
  );

  return result.rows[0] ?? null;
}

export async function findById(
  conversationId: string,
  messageId: string,
): Promise<Message | null> {
  const result = await pool.query(
    `
    SELECT 
      messages.id AS "id",
      messages.sender_id AS "senderId",
      users.username AS "senderUsername",
      messages.text_content AS "textContent",
      messages.conversation_id AS "conversationId",
      messages.created_at AS "createdAt",
      uploads.public_url AS "imageUrl"
    FROM messages
    LEFT JOIN uploads
      ON messages.upload_id = uploads.id
    LEFT JOIN users 
      ON messages.sender_id = users.id
    WHERE messages.conversation_id = $1 AND messages.id = $2`,
    [conversationId, messageId],
  );

  return result.rows[0] ?? null;
}

export async function findAllConversation(
  conversationId: string,
  limit: number,
  cursor?: number,
): Promise<Message[]> {
  const result = await pool.query(
    `
    SELECT 
      messages.id AS "id",
      messages.sender_id AS "senderId",
      users.username AS "senderUsername",
      messages.text_content AS "textContent",
      messages.conversation_id AS "conversationId",
      messages.created_at AS "createdAt",
      uploads.public_url AS "imageUrl"
    FROM messages
    LEFT JOIN uploads
      ON messages.upload_id = uploads.id
    LEFT JOIN users 
      ON messages.sender_id = users.id
    WHERE messages.conversation_id = $1
    ORDER BY messages.created_at DESC, id DESC

    LIMIT $2::int OFFSET $3::int`,
    [conversationId, limit, cursor],
  );

  return result.rows;
}
export async function deleteById(
  conversationId: string,
  messageId: string,
): Promise<{ id: string } | null> {
  const result = await pool.query(
    `
    DELETE FROM messages
    WHERE id = $1 AND conversation_id = $2
    RETURNING 
      id`,
    [messageId, conversationId],
  );

  return result.rows[0] ?? null;
}
