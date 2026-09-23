# API

Base path: `/api/v1`. All JSON responses are wrapped as
`{ status, message, <key> }`; the **Returns** column names `<key>`.
Auth is `Authorization: Bearer <accessToken>` unless noted.

Errors: `400` validation, `401` unauthenticated, `403` not owner/member,
`404` not found, `409` conflict.

## Auth

| Endpoint             | Auth   | Body                  | Returns                                     |
| -------------------- | ------ | --------------------- | ------------------------------------------- |
| `POST /auth/login`   | -      | `{ email, password }` | `200` `accessToken` + `refreshToken` cookie |
| `POST /auth/refresh` | cookie | -                     | `200` `accessToken`                         |
| `POST /auth/logout`  | cookie | -                     | `204` no body                               |

## Users

| Endpoint            | Auth | Body                                           | Returns                          |
| ------------------- | ---- | ---------------------------------------------- | -------------------------------- |
| `POST /users`       | -    | `{ username, email, password }`                | `201` `user`                     |
| `GET /users`        | ✓    | -                                              | `200` `users`                    |
| `GET /users/me`     | ✓    | -                                              | `200` `user`                     |
| `GET /users/:id`    | ✓    | -                                              | `200` `user`                     |
| `PATCH /users/:id`  | ✓    | `{ username?, email?, password?, avatarUrl? }` | `200` `user`, `204` if unchanged |
| `DELETE /users/:id` | ✓    | -                                              | `200` `user`                     |

## Communities

| Endpoint                  | Auth | Body                                 | Returns                               |
| ------------------------- | ---- | ------------------------------------ | ------------------------------------- |
| `GET /communities`        | ✓    | -                                    | `200` `communities`                   |
| `POST /communities`       | ✓    | `{ name, description, imageUrl? }`   | `201` `community`                     |
| `GET /communities/:id`    | ✓    | -                                    | `200` `community`                     |
| `PATCH /communities/:id`  | ✓    | `{ name?, description?, imageUrl? }` | `200` `community`, `204` if unchanged |
| `DELETE /communities/:id` | ✓    | -                                    | `200` `community`                     |

## Posts: `/communities/:communityId/posts`

| Endpoint          | Auth | Body                                  | Returns                          |
| ----------------- | ---- | ------------------------------------- | -------------------------------- |
| `GET /`           | ✓    | -                                     | `200` `posts`                    |
| `POST /`          | ✓    | `{ title, textContent, imageUrl? }`   | `201` `post`                     |
| `GET /:postId`    | ✓    | -                                     | `200` `post`                     |
| `PATCH /:postId`  | ✓    | `{ title?, textContent?, imageUrl? }` | `200` `post`, `204` if unchanged |
| `DELETE /:postId` | ✓    | -                                     | `200` `post`                     |

## Comments: `/communities/:communityId/posts/:postId/comments`

| Endpoint             | Auth | Body               | Returns                             |
| -------------------- | ---- | ------------------ | ----------------------------------- |
| `GET /`              | ✓    | -                  | `200` `comments`                    |
| `POST /`             | ✓    | `{ textContent }`  | `201` `comment`                     |
| `PATCH /:commentId`  | ✓    | `{ textContent? }` | `200` `comment`, `204` if unchanged |
| `DELETE /:commentId` | ✓    | -                  | `200` `comment`                     |

## Conversations

| Endpoint                                                  | Auth | Body                                                                                   | Returns                                                                |
| --------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `GET /conversations`                                      | ✓    | -                                                                                      | `200` `conversations` (each with `lastMessage`, `unreadMessagesCount`) |
| `POST /conversations`                                     | ✓    | `{ type: "direct", otherUserId }` or `{ type: "group", name, memberIds[], imageUrl? }` | `201` created / `200` existing, `conversation`                         |
| `GET /conversations/:conversationId`                      | ✓    | -                                                                                      | `200` `conversation`                                                   |
| `PATCH /conversations/:conversationId`                    | ✓    | `{ name?, imageUrl? }`                                                                 | `200` `conversation`                                                   |
| `DELETE /conversations/:conversationId`                   | ✓    | -                                                                                      | `200` `conversation`                                                   |
| `PATCH /conversations/:conversationId/read`               | ✓    | `{ messageId }`                                                                        | `204` no body                                                          |
| `POST /conversations/:conversationId/members`             | ✓    | `{ memberIds[] }`                                                                      | `200` `members`                                                        |
| `DELETE /conversations/:conversationId/members/:memberId` | ✓    | -                                                                                      | `200` `member`                                                         |

Group conversations only: `name`, `imageUrl`, members. The read marker moves
forward only; an older `messageId` is accepted but ignored.

## Messages: `/conversations/:conversationId/messages`

| Endpoint             | Auth | Query / Body                                        | Returns                        |
| -------------------- | ---- | --------------------------------------------------- | ------------------------------ |
| `GET /`              | ✓    | `?limit=1..100` (default `30`), `?cursor=<int ≥ 0>` | `200` `messages`, newest first |
| `POST /`             | ✓    | `{ textContent?, imageUrl? }` (at least one)        | `201` `chatMessage`            |
| `DELETE /:messageId` | ✓    | -                                                   | `200` `chatMessage`            |

## Uploads

| Endpoint                | Auth | Body                          | Returns                                |
| ----------------------- | ---- | ----------------------------- | -------------------------------------- |
| `POST /uploads/presign` | ✓    | `{ kind, contentType, size }` | `201` `urls: { publicUrl, uploadUrl }` |

`kind`: `avatar` \| `post` \| `community` \| `conversation` \| `message`.
`contentType`: `image/png` \| `image/jpeg` \| `image/webp`.
Flow: presign → `PUT` the file to `uploadUrl` → submit `publicUrl` as the
`imageUrl`/`avatarUrl` on the owning resource.

---

Known deviations: `GET /communities/:communityId/posts` returns its message
under `Message` (capital M) instead of `message`. `?cursor` on messages is
currently an offset, not a keyset cursor, and no `nextCursor` is returned.
