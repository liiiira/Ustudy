import { authFetch } from "../../../lib/api";
import type { CreatePostData, Post, PostJoined, PostUpdate } from "../types";


export async function create(communityId: string , postData: CreatePostData): Promise<Post>{
  const data = await authFetch(`/communities/${communityId}/posts`, {
    method: "POST",
    body: postData,
  })

  return data.post;
}

export async function getById(communityId:string, postId: string): Promise<PostJoined>{
  const data = await authFetch(`/communities/${communityId}/posts/${postId}`, 
    {
      method: "GET",
    }
  );
  return data.post;
} 


export async function getPosts(params?: {communityId?: string, userId?: string}){

  let posts; 
  // HACK: it doesn't handle case of no params for now
  if(params && params.communityId)
    posts = await getAllCommunity(params.communityId);
  
  return posts!;
}


async function getAllCommunity(communityId: string): Promise<Post[]>{
  const data = await authFetch(`/communities/${communityId}/posts`, 
    {
      method: "GET",
    })

  return data.posts;
}

export async function updateById(communityId: string, postId: string, postData: PostUpdate): Promise<Post | null>{

  const data = await authFetch(`/communities/${communityId}/posts/${postId}`, 
    {
      method: "PATCH",
      body: postData,
    })

  return data.post;
}

export async function deleteById(communityId: string, postId: string): Promise<{id: string}>{

  const data = await authFetch(`/communities/${communityId}/posts/${postId}`,
    {
      method: "DELETE"
    })
  return data.post
}

