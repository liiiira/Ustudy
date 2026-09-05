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

export async function getAllCommunity(communityId: string): Promise<Post[]>{
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

