export type CreateCommunityData = {
  name: string;
  description: string;
}

export type CreateCommunityError = {
  name: string[];
  descripition: string[];
}

export type Community = {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
}

export type UseCommunitiesList = {
  loading: boolean;
  error: boolean;
  communities: Community[];
}

export type UseCommunity = {
  loading: boolean;
  error: boolean;
  community: Community | null;
}

