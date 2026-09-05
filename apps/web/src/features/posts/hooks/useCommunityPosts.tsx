import * as postsApi from "../api/posts.api.ts"
import { useState, useEffect } from "react"
import type { Post, UseCommunityPosts } from "../types.ts";


export default function useCommunityPosts(communityId: string): UseCommunityPosts{
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [communityPosts, setCommunityPosts] = useState<Post[]>([])
  
  useEffect(() => {
    async function loadCommunityPosts(){
        
      try{
        const fetchedPosts: Post[] = await postsApi.getAllCommunity(communityId);
        setCommunityPosts(fetchedPosts);
      }catch{
        setError(true);
      }finally{
        setLoading(false);
      }
    }
    loadCommunityPosts();
  }, [communityId])

  return {loading, error, communityPosts}
}
