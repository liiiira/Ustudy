import * as commentApi from "../api/comments.api.ts"
import { useState } from "react";
import type { CommentInput, CommentJoinUser } from "../types";
import { validateLength } from "../../../utils/validators";
import TextField from "../../../components/ui/textField.tsx";
import Button from "../../../components/ui/button.tsx";

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
  const [inputError, setInputError] = useState<CommentError>({ textContent: []});
  const [valid, setValid] = useState<boolean>(false);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>){
    
    const newComment: CommentInput = {...comment, [e.target.name]: e.target.value};
    setComment(newComment)
    setValid(validateCommunity(newComment));
  }


  function validateCommunity(comment: CommentInput): boolean{
    
    const {textContent} = comment;

    const textContentErrors: string[] = validateLength("Comment Text Content", textContent, 1, 1000);

    setInputError({textContent: textContentErrors  })

    return ![textContentErrors].some((error: string[]) => error.length > 0);
  }  


  async function handleSubmit(e: React.SubmitEvent){
    e.preventDefault();
    
    try{

      if(mode === "Create"){
        const createdComment: CommentJoinUser = await commentApi.create(communityId, postId, comment);
        onSuccess!(createdComment);
        setComment({textContent: ""})
      }
      if(mode == "Update"){
        const pass = "";
      }
    }catch(err){
      if(err instanceof Error)
        setApiError(err.message);
    }
  }

  return (
    <form 
      className="flex flex-col w-full px-4 py-2 "
      onSubmit={handleSubmit}>
      <TextField
        id="text-content" 
        name="textContent" 
        value={comment.textContent} 
        charLimit={1000} 
        placeholder="Join the discussion" 
        label="Comment"
        inputError={inputError.textContent}
        handleChange={handleChange}
        rows={2}
      />
      <div id="form-footer" className="flex justify-center items-center">

        <Button 
          variant="Primary"
          disabled={!valid}
          type="submit"
        > 
          {mode === "Create" ? "Create" : mode === "Update" ? "Update" : ""} 
        </Button>

      </div>      
      <div className="min-h-[1.25rem] text-red-500 text-sm text-center">
          {apiError}
      </div>
    </form> 
    )
}
