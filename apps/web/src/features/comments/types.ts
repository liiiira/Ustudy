import type { Dispatch, SetStateAction } from "react";

export type UseComments = {
  loading: boolean; 
  error: boolean;
  comments: CommentJoinUser[];
  setComments: Dispatch<SetStateAction<CommentJoinUser[]>>;
}

export type CommentInput = {
  textContent: string;
}

export type Comment = CommentInput & {
  ownerId: string;
  postId: string;
  id: string;
  createdAt: string;
}


export type CommentJoinUser = Comment & {
  ownerUsername: string;
}

