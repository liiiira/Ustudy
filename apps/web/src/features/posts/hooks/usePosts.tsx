import * as postsApi from "../../posts/api/posts.api.ts"
import { useState, useEffect } from "react"
import type { UsePosts } from "../types.ts";
import type { Post } from "../../posts/types.ts";


export default function usePosts(params?: {communityId?: string, userId?: string}): UsePosts{

  const {communityId, userId} = params ?? {}

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post[]>([])
  
  useEffect(() => {
    async function loadCommunityPosts(){

      try{

        const fetchedPosts: Post[] = await postsApi.getPosts({communityId, userId});
        setPosts(fetchedPosts);

      }catch{
        setError(true);

      }finally{
        setLoading(false);

      }
    }
    loadCommunityPosts();

  }, [communityId, userId])

  return {loading, error, posts}
}
