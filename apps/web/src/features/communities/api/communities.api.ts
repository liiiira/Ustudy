import { authFetch } from "../../../lib/api"
import { type CreateCommunityData, type Community, type CommunityUpdate, type CommunityJoinUser} from "../types";


export async function create(communityData: CreateCommunityData): Promise<Community>{

  const data = await authFetch("/communities/",
    {
      method: "POST", 
      body: communityData
    });

    return data.community 
}

export async function getAll(): Promise<Community[]>{

  const data = await authFetch("/communities",
  {
    method: "GET",
  });

  return data.communities;
}

export async function getById(id: string): Promise<CommunityJoinUser>{
  const data = await authFetch(`/communities/${id}`, 
    {
      method: "GET",
    }
  );

  return data.community;
}

export async function updateById(id: string, community: CommunityUpdate){

  const data = await authFetch(`/communities/${id}`, 
    {
      method: "PATCH",
      body: community,
    })

  return data.community;
}

export async function deleteById(id: string): Promise<{id: string}>{
  const data = await authFetch(`/communities/${id}`, 
    {
      method: "DELETE",
    }
  );

  return data.community;
}

