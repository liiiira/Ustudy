import pool from "../../config/postgres";
import type {
  DirectConversationInput,
  DirectConversation,
  GroupConversation,
  ConversationMember,
  GetConversation,
  MessageRead,
} from "./conversation.schema";

type GroupConversationInputRepository = {
  ownerId: string;
  memberIds: string[];
  name: string;
  uploadId?: string;
};

type GroupConversationUpdateRepository = {
  name?: string;
  uploadId?: string;
};

export async function findOrCreateDirect({
  directKey,
  requesterId,
  otherUserId,
}: DirectConversationInput): Promise<{
  created: boolean;
  conversation: DirectConversation;
} | null> {
  const result = await pool.query(
    `
      WITH inserted AS (
        INSERT INTO conversations(type, direct_key)
        VALUES ('direct', $1)
        ON CONFLICT (direct_key) DO NOTHING
        RETURNING id, type, created_at
      ),
      conv AS (
        SELECT id, type, created_at, true AS created FROM inserted
        UNION ALL
        SELECT id, type, created_at, false AS created
        FROM conversations
        WHERE direct_key = $1 AND NOT EXISTS (SELECT 1 FROM inserted)
      ),
      members AS (
        INSERT INTO conversation_members(conversation_id, member_id)
        SELECT conv.id, m.member_id
        FROM conv, unnest($2::uuid[]) AS m(member_id)
        ON CONFLICT DO NOTHING
      )
      SELECT
        conv.id AS "id",
        conv.type AS "type",
        conv.created_at AS "createdAt",
        conv.created AS "created"
      FROM conv`,
    [directKey, [requesterId, otherUserId]],
  );

  if (result.rows[0]) {
    const { created, ...conversation } = result.rows[0];
    return { created, conversation };
  }
  return null;
}

export async function createGroup({
  memberIds,
  uploadId,
  name,
  ownerId,
}: GroupConversationInputRepository): Promise<GroupConversation | null> {
  const result = await pool.query(
    `
      WITH inserted AS (
        INSERT INTO conversations(owner_id, name, upload_id, type)
        VALUES ($1, $2, $3, 'group')
        RETURNING *
      ),
      members AS (
        INSERT INTO conversation_members(conversation_id, member_id, role)  
        SELECT 
          inserted.id AS "conversation_id", 
          m.member_id AS "member_id", 
          CASE WHEN member_id = inserted.owner_id THEN 'admin' ELSE 'member' END AS "role"
        FROM 
          inserted, unnest($4::uuid[]) as m(member_id)
      )
      SELECT 
        inserted.id AS "id",
        inserted.name AS "name",
        inserted.type AS "type",
        inserted.created_at AS "createdAt",
        inserted.owner_id AS "ownerId",
        uploads.public_url AS "imageUrl"
      FROM inserted
      LEFT JOIN uploads
      ON inserted.upload_id = uploads.id`,
    [ownerId, name, uploadId, memberIds],
  );

  return result.rows[0] ?? null;
}

export async function findById(
  conversationId: string,
): Promise<GroupConversation | DirectConversation | null> {
  const result = await pool.query(
    `
    SELECT 
      c.id AS "id",
      c.name AS "name", 
      c.type AS "type",
      c.created_at AS "createdAt",
      c.owner_id AS "ownerId",
      u.public_url AS "imageUrl"
    FROM conversations c 
    LEFT JOIN uploads u 
      ON c.upload_id = u.id
    WHERE 
      c.id = $1`,
    [conversationId],
  );

  return result.rows[0] ?? null;
}

export async function getAll(userId: string): Promise<GetConversation[]> {
  type ConversationRow = {
    id: string;
    ownerId: string | null;
    name: string | null;
    type: "group" | "direct";
    createdAt: Date;
    imageUrl: string | null;
    unreadMessagesCount: number;
    lastMessageId?: string | null;
    lastMessageTextContent?: string;
    lastMessageImageUrl?: string;
    lastMessageCreatedAt: Date;
    lastMessageSenderUsername?: string;
  };
  const result = await pool.query(
    `
      SELECT      
        c.id AS "id",
        c.owner_id AS "ownerId",
        c.name AS "name", 
        c.type AS "type",
        c.created_at AS "createdAt",
        u.public_url AS "imageUrl",
        unread.count AS "unreadMessagesCount",
        lm.id AS "lastMessageId",
        lm.text_content AS "lastMessageTextContent",
        lm.image_url AS "lastMessageImageUrl",
        lm.created_at AS "lastMessageCreatedAt",
        lm.sender_username AS "lastMessageSenderUsername"
      FROM
        conversations c       
      LEFT JOIN uploads u 
        ON c.upload_id = u.id
      JOIN conversation_members cm 
        ON cm.conversation_id = c.id 
      LEFT JOIN messages lr
        ON cm.last_read_message_id = lr.id
      LEFT JOIN LATERAL (
        SELECT 
          m.id,
          m.created_at,
          s.username as "sender_username",
          m.text_content,
          mu.public_url as "image_url"
        FROM messages m
        LEFT JOIN users s 
          ON m.sender_id = s.id
        LEFT JOIN uploads mu 
          ON m.upload_id = mu.id
        WHERE m.conversation_id = cm.conversation_id 
        ORDER BY m.created_at DESC 
        LIMIT 1
      ) lm 
        ON TRUE
      LEFT JOIN LATERAL (
        SELECT 
          COUNT(*)::int as count
          FROM messages m
          WHERE m.conversation_id = c.id 
            AND m.sender_id IS DISTINCT FROM cm.member_id
            AND (lr.created_at IS NULL OR m.created_at > lr.created_at)
      ) unread
        ON TRUE
      WHERE cm.member_id = $1
      ORDER BY COALESCE(lm.created_at, c.created_at) DESC, c.id DESC`,
    [userId],
  );

  return result.rows.map((row: ConversationRow): GetConversation => {
    return {
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
      type: row.type,
      imageUrl: row.imageUrl,
      unreadMessagesCount: row.unreadMessagesCount,
      ownerId: row.ownerId,
      lastMessage: row.lastMessageId
        ? {
            id: row.lastMessageId,
            textContent: row.lastMessageTextContent,
            imageUrl: row.lastMessageImageUrl,
            senderUsername: row.lastMessageSenderUsername,
            createdAt: row.lastMessageCreatedAt,
          }
        : null,
    };
  });
}

export async function updateGroup(
  conversationId: string,
  { name, uploadId }: GroupConversationUpdateRepository,
): Promise<GroupConversation | null> {
  let updateQuery: string[] = [];
  let queryValues: string[] = [];

  if (name) {
    queryValues.push(name);
    updateQuery.push(` name = $${queryValues.length} `);
  }

  if (uploadId) {
    queryValues.push(uploadId);
    updateQuery.push(` upload_id = $${queryValues.length} `);
  }

  queryValues.push(conversationId);
  const result = await pool.query(
    `
    WITH updated AS (
      UPDATE conversations
      SET
        ${updateQuery.join(",")}
      WHERE id = $${queryValues.length}
      RETURNING id, name, type, created_at, owner_id, upload_id
    )
    SELECT
      updated.id AS "id",
      updated.name AS "name",
      updated.type AS "type",
      updated.created_at AS "createdAt",
      updated.owner_id AS "ownerId",
      uploads.public_url AS "imageUrl"
    FROM updated
    LEFT JOIN uploads
      ON updated.upload_id = uploads.id`,
    queryValues,
  );

  return result.rows[0] ?? null;
}

export async function deleteGroup(
  conversationId: string,
): Promise<{ id: string } | null> {
  const result = await pool.query(
    `
      DELETE FROM conversations 
      WHERE id = $1 AND type = 'group'
      RETURNING 
        id`,
    [conversationId],
  );

  return result.rows[0] ?? null;
}

// Members

export async function addMembers(
  conversationId: string,
  memberIds: string[],
): Promise<string[]> {
  const result = await pool.query(
    `
    INSERT INTO conversation_members (conversation_id, member_id, role)
    SELECT $1, m.member_id, 'member'
    FROM unnest($2::uuid[]) AS m(member_id)
    ON CONFLICT (conversation_id, member_id) DO NOTHING
    RETURNING member_id
    `,
    [conversationId, memberIds],
  );

  return result.rows.map((row) => row.member_id);
}

export async function findMember(
  conversationId: string,
  memberId: string,
): Promise<ConversationMember | null> {
  const result = await pool.query(
    `
      SELECT 
        member_id AS "memberId",
        conversation_id AS "conversationId",
        role,
        joined_at AS "joinedAt",
        last_read_message_id AS "lastReadMessageId"
      FROM conversation_members
      WHERE conversation_id = $1 AND member_id = $2`,
    [conversationId, memberId],
  );

  return result.rows[0] ?? null;
}

export async function findMemberIds(conversationId: string): Promise<string[]> {
  const result = await pool.query(
    `
    SELECT member_id AS "memberId"
    FROM conversation_members
      WHERE conversation_id = $1`,
    [conversationId],
  );

  return result.rows.map((row) => row.memberId);
}

export async function removeMember(
  conversationId: string,
  memberId: string,
): Promise<{ memberId: string } | null> {
  const result = await pool.query(
    `
    DELETE FROM conversation_members
    WHERE conversation_id = $1 AND member_id = $2
    RETURNING member_id AS "memberId"`,
    [conversationId, memberId],
  );

  return result.rows[0] ?? null;
}

// read message

export async function readMessage(
  conversationId: string,
  memberId: string,
  messageId: string,
): Promise<MessageRead | null> {
  const result = await pool.query(
    `
    UPDATE conversation_members 
    SET last_read_message_id = $3
    WHERE conversation_id = $1 
      AND message_id = $2
    RETURNING 
      last_read_message_id as "lastReadMessasgeId",
      conversation_Id as "conversationId",
      member_id as "memberId"`,
    [conversationId, memberId, messageId],
  );

  return result.rows[0] ?? null;
}
