export type CommentCreate = {
  ownerId: string;
  postId: string
  textContent: string;
}
export type CommentDB = {
  id: string;
  ownerId: string;
  postId: string;
  textContent: string;
  createdAt: string;
}

export type CommentInput = {
  textContent: string;
}
