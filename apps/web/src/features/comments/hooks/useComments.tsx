import * as commentsApi from "../../comments/api/comments.api.ts"
import { useState, useEffect } from "react"
import type { CommentJoinUser, UseComments } from "../types.ts";


export default function useComments(communityId: string, postId: string): UseComments{

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentJoinUser[]>([])
  
  useEffect(() => {
    async function loadComments(){

      try{

        const fetchedComments: CommentJoinUser[] = await commentsApi.getPostComments(communityId, postId);
        setComments(fetchedComments);

      }catch{
        setError(true);

      }finally{
        setLoading(false);

      }
    }
    loadComments();

  }, [communityId, postId])

  return {loading, error, comments, setComments}
}
