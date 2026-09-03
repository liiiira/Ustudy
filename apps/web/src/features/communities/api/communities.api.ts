import { authFetch } from "../../../lib/api"
import { type CreateCommunityData } from "../types";


export async function createCommunity(communityData: CreateCommunityData){

  const data = await authFetch("/communities/",
    {
      method: "POST", 
      body: communityData
    });

    return data.community 
}

