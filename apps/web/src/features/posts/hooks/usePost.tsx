import * as postsApi from "../api/posts.api";
import { type PostJoined} from "../types";
import { useState, useEffect } from "react";
import { type UsePost} from "../types";

export default function usePost(communityId: string, postId: string): UsePost{
  
  const [loading, setLoading] = useState<boolean>(true);
  const [post, setPost] = useState<PostJoined | null>(null)
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {

    async function loadPost(){

      try{

        const fetchedPost: PostJoined = await postsApi.getById(communityId, postId)
        setPost(fetchedPost);

      }catch{

        setError(true);

      }finally{

        setLoading(false);
      }
    }

    loadPost();
  }, [communityId, postId])

  return {loading, post, error};
}
