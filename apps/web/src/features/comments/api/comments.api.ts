import { authFetch } from "../../../lib/api";
import type { CommentInput, CommentJoinUser } from "../types";


export async function getPostComments(communityId: string, postId: string): Promise<CommentJoinUser[]>{
  const data = await authFetch(`/communities/${communityId}/posts/${postId}/comments`, {
    method: "GET",
  });

  return data.comments;

}

export async function create(communityId: string, postId: string, commendData: CommentInput): Promise<CommentJoinUser>{
  const data = await authFetch(`/communities/${communityId}/posts/${postId}/comments`, {
    method: "POST",
    body: commendData,
  })

  return data.comment;
}
