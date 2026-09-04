import { authFetch } from "../../../lib/api"
import { type CreateCommunityData, type Community } from "../types";


export async function createCommunity(communityData: CreateCommunityData): Promise<Community>{

  const data = await authFetch("/communities/",
    {
      method: "POST", 
      body: communityData
    });

    return data.community 
}

export async function getAllCommunities(): Promise<Community[]>{

  const data = await authFetch("/communities",
  {
    method: "GET",
  });

  return data.communities;
}

export async function getCommunity(id: string): Promise<Community>{
  const data = await authFetch(`/communities/${id}`, 
    {
      method: "GET",
    }
  );

  return data.community;
}
