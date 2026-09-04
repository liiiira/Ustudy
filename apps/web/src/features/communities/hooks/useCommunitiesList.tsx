import * as communitiesApi from "../api/communities.api";
import { type Community } from "../types";
import { useState, useEffect } from "react";
import { type UseCommunitiesList } from "../types";

export default function useCommunitiesList(): UseCommunitiesList{
  
  const [loading, setLoading] = useState<boolean>(true);
  const [communities, setCommunities] = useState<Community[]>([])
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    async function loadCommunities(){
      try{

        const fetchedCommunities: Community[] = await communitiesApi.getAllCommunities()
        setCommunities(fetchedCommunities);

      }catch{

        setError(true);

      }finally{

        setLoading(false);
      }
    }
    loadCommunities();
  }, [])
  return {loading, communities, error}
}
