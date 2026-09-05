import * as communitiesApi from "../api/communities.api";
import { type CommunityJoinUser } from "../types";
import { useState, useEffect } from "react";
import { type UseCommunity } from "../types";

export default function useCommunity(id: string): UseCommunity{
  
  const [loading, setLoading] = useState<boolean>(true);
  const [community, setCommunity] = useState<CommunityJoinUser | null>(null)

  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    async function loadCommunities(){
      try{

        const fetchedCommunity: CommunityJoinUser = await communitiesApi.getById(id)
        setCommunity(fetchedCommunity);

      }catch{

        setError(true);

      }finally{

        setLoading(false);
      }
    }
    loadCommunities();
  }, [id])
  return {loading, community, error}
}
