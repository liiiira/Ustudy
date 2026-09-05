export type CreatePostData = {
  title: string;
  textContent: string;
}


export type CreatePostError = {
  title: string[];
  textContent: string[];
}

export type PostProps = {
  title?: string;
  textContent?:string;
}

export type PostUpdate = {
  title?: string;
  textContent?: string;
}

export type Post = {
  id: string;
  title: string;
  textContent: string;
  ownerId: string;
  communityId: string;
  cratedAt: Date,
}

export type PostJoined = {
  id: string;
  title: string;
  textContent: string;
  ownerId: string;
  ownerName: string;
  communityId: string;
  communityName: string;
  cratedAt: Date,
}

export type UseCommunityPosts = {
  loading: boolean, 
  error: boolean,
  communityPosts: Post[]
}
export type UsePost = {
  loading: boolean, 
  error: boolean,
  post: PostJoined | null;
}

