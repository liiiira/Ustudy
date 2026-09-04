export type CreateCommunityData = {
  name: string;
  description: string;
}


export type CreateCommunityError = {
  name: string[];
  description: string[];
}

export type CommunityProps = {
  name?: string;
  description?:string;
}

export type CommunityUpdate = {
  name?: string;
  description?: string;
}

export type Community = {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  createdAt: string;
}

export type CommunityJoinUser = {
  id: string;
  ownerId: string;
  name: string; 
  description: string;
  createdAt: string;
  ownerName: string;
}

export type UseCommunitiesList = {
  loading: boolean;
  error: boolean;
  communities: Community[];
}

export type UseCommunity = {
  loading: boolean;
  error: boolean;
  community: CommunityJoinUser | null;
}

