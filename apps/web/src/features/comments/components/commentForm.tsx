import * as commentApi from "../api/comments.api.ts"
import { useState } from "react";
import type { CommentInput, CommentJoinUser } from "../types";
import { validateLength } from "../../../utils/validators";
import Composer from "../../../components/ui/composer.tsx";

type CommentFormProps = {
  textContent?: string;
  mode?: "Create" | "Update";
  postId: string; 
  communityId: string;
  commentId?: string;
  onSuccess?: (comment: CommentJoinUser) => void;
}

type CommentError = {
  textContent: string[];
}


export default function CommentForm({textContent = "", mode = "Create", postId, communityId, commentId, onSuccess}: CommentFormProps){
  
  const [comment, setComment] = useState<CommentInput>({textContent: textContent});
  const [apiError, setApiError] = useState<string>("");
  const [inputError, setInputError] = useState<CommentError>({textContent: []});
  const [valid, setValid] = useState<boolean>(false);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>){
    
    const newComment: CommentInput = {...comment, [e.target.name]: e.target.value};
    setComment(newComment)
    setValid(validateComment(newComment));
  }


  function validateComment(comment: CommentInput): boolean{
    
    const {textContent} = comment;

    const textContentErrors: string[] = validateLength("Comment Text Content", textContent, 1, 1000);

    setInputError({textContent: textContentErrors  })

    return ![textContentErrors].some((error: string[]) => error.length > 0);
  }  


  async function onSubmit(){
    try{
      if(mode === "Create"){
        const createdComment: CommentJoinUser = await commentApi.create(communityId, postId, comment);
        onSuccess!(createdComment);
        setComment({textContent: ""})
      }
    }catch(err){
      if(err instanceof Error)
        setApiError(err.message);
    }
  }

  return (
    <Composer
      inputError={inputError.textContent}
      name="textContent"
      value={comment.textContent}
      handleChange={handleChange}
      onSubmit={onSubmit}
      submitLabel="Comment"
      charLimit={1000}
      placeholder="Join the discussion"
    />
    )
}
