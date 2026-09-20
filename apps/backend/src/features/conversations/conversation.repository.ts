import pool from "../../config/postgres";
import type { DirectConversationInput, DirectConversation, GroupConversation, ConversationMember} from "./conversation.schema";

type GroupConversationInputRepository= {

  ownerId: string;
  memberIds: string[];
  name: string;
  uploadId?: string;
}

type GroupConversationUpdateRepository= {
  name?: string;
  uploadId?: string;
}

export async function findOrCreateDirect({directKey, requesterId, otherUserId}: DirectConversationInput): Promise<{created: boolean, conversation: DirectConversation} | null>{
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
      [directKey, [requesterId, otherUserId]]
  );

  if(result.rows[0]){
    const {created, ...conversation} = result.rows[0];
    return {created, conversation}
  }
  return null;
}

export async function createGroup({memberIds, uploadId, name, ownerId}: GroupConversationInputRepository): Promise<GroupConversation | null>{
  
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
    [ownerId, name, uploadId, memberIds]
  );

  return result.rows[0] ?? null;
}

export async function findMemberIds(conversationId: string): Promise<string[]>{
  
  const result = await pool.query(
    `
    SELECT member_id AS "memberId"
    FROM conversation_members
      WHERE conversation_id = $1`,
    [conversationId]
  );

  return result.rows.map((row) => row.memberId);
}


export async function findById(conversationId: string): Promise<GroupConversation | DirectConversation | null>{
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
    [conversationId]
  );

  return result.rows[0] ?? null;
}

export async function findMember(conversationId: string, memberId: string): Promise<ConversationMember | null>{
  
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
    [conversationId, memberId]
  );

  return result.rows[0] ?? null;
}

export async function updateGroup(conversationId: string, {name, uploadId}: GroupConversationUpdateRepository): Promise<GroupConversation | null>{


  let updateQuery: string[] = [];
  let queryValues: string[] = [];

  if(name){
    queryValues.push(name);
    updateQuery.push(` name = $${queryValues.length} `)
  }

  if(uploadId){
    queryValues.push(uploadId);
    updateQuery.push(` upload_id = $${queryValues.length} `)
  }

  queryValues.push(conversationId);
  const result = await pool.query(`
    WITH updated AS (
      UPDATE conversations
      SET
        ${updateQuery.join(',')}
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
    queryValues
  );

  return result.rows[0] ?? null;
}

