export type CreatePostData = {
  title: string;
  textContent: string;
  imageUrl?: string;
}


export type CreatePostError = {
  title: string[];
  textContent: string[];
}

export type PostProps = {
  title?: string;
  textContent?:string;
  imageUrl?: string;
}

export type PostUpdate = {
  title?: string;
  textContent?: string;
  imageUrl?: string;
}

export type Post = {
  id: string;
  title: string;
  textContent: string;
  ownerId: string;
  communityId: string;
  createdAt: Date,
  imageUrl?: string;
}

export type PostJoined = Post &{
  ownerName: string;
  communityName: string;
}


export type UsePost = {
  loading: boolean;
  error: boolean;
  post: PostJoined | null;
}

export type UsePosts = {
  loading: boolean; 
  error: boolean;
  posts: Post[] | PostJoined[];
}
