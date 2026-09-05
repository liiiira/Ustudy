import { useNavigate } from "react-router";
import React, { useState } from "react";
import type { CreatePostData, CreatePostError } from "../types";
import { validateLength } from "../../../utils/validators";
import * as postApi from "../api/posts.api";
import Button from "../../../components/ui/button";
import FormField from "../../../components/ui/formField";
import TextField from "../../../components/ui/textField";

type PostFormProps = {
  postId?: string;
  communityId: string;
  title?: string;
  textContent?: string;
  mode: "Create" | "Update",
}

export default function PostForm({title = "", textContent = "", mode = "Create", postId, communityId}: PostFormProps){
  
  const navigate = useNavigate();

  const [post, setPost] = useState<CreatePostData>({title: title, textContent: textContent});
  const [apiError, setApiError] = useState<string>("");
  const [inputError, setInputError] = useState<CreatePostError>({title: [], textContent: []});
  const [valid, setValid] = useState<boolean>(false);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>){
    
    const newPost: CreatePostData = {...post, [e.target.name]: e.target.value};
    setPost(newPost)
    setValid(validateCommunity(newPost));
  }


  function validateCommunity(post: CreatePostData): boolean{
    
    const {title, textContent} = post;

    const nameErrors: string[] = validateLength("Community title", title, 1, 100);
    const textContentErrors: string[] = validateLength("Community Description", textContent, 1, 1000);

    setInputError({title: nameErrors, textContent: textContentErrors  })

    return ![nameErrors, textContentErrors].some((error: string[]) => error.length > 0);
  }  


  async function handleSubmit(e: React.SubmitEvent){
    e.preventDefault();
    
    try{

      if(mode === "Create")
        await postApi.create(communityId, post);

      else if(mode === "Update")
        await postApi.updateById(communityId, postId!, post);

      navigate(`/communities/${communityId}/`)
    }catch(err){
      if(err instanceof Error)
        setApiError(err.message);
    }
  }

  const formTitle =  mode === "Create" ?  "Create a post" : mode === "Update" ? "Update your post": "";
  const subtitle =  mode === "Create" ?  "Share your thoughts" : "";

  return (
  <form className=" p-6 w-1/2 h-max max-w-md flex flex-col content-between border-2 gap-4 border-gray-300 rounded-2xl bg-white" 
      onSubmit={handleSubmit}>
    
    <div id="form-header" className="flex flex-col gap-1 ">

      <div className="text-3xl font-extrabold text-shadow-gray-900 text-center w-full ">
          {formTitle}
      </div>

      <div className="text-md font-light text-gray-600 text-center w-full mb-3">
          {subtitle}
      </div>

      <div className="min-h-[1.25rem] text-red-500 text-sm text-center">
          {apiError}
      </div>

    </div>
     
    <div id="form-body" className="flex flex-col gap-2">

      <FormField 
          id="title" 
          name="title" 
          value={post.title} 
          charLimit={100} 
          type="text" 
          placeholder="Enter your post title" 
          label="Post title" 
          inputError={inputError.title} 
          handleChange={handleChange} 
      />
      
      <TextField
          id="text-content" 
          name="textContent" 
          value={post.textContent} 
          charLimit={1000} 
          placeholder="Enter your post text content" 
          label="Post text content"
          inputError={inputError.textContent}
          handleChange={handleChange} 
          rows={4} 
      />
    
    </div>

    <div id="form-footer" className="flex justify-center items-center">

      <Button 
          variant="Primary"
          disabled={!valid}
          type="submit"
      > 
          {mode === "Create" ? "Create Community" : mode === "Update" ? "Update Community" : ""} 
      </Button>

    </div>

  </form>
  );
}
