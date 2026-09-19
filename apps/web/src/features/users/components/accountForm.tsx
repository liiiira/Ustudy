import { useState } from "react";
import {type UpdateUserAccountErrors, type UpdateUserAccount, type User } from "../types";
import FormField from "../../../components/ui/formField";
import { validateLength } from "../../../utils/validators"; 
import Button from "../../../components/ui/button";
import { updateUser } from "../api/users.api";

type AccountFormProps = {
  userId: string;
  username: string;
  avatarUrl?: string;
}

export default function AccountForm({userId, avatarUrl, username}: AccountFormProps){
  
  const [user, setUser] = useState<UpdateUserAccount>({imageUrl: avatarUrl, username: username!})
  const [userError, setUserError] = useState<UpdateUserAccountErrors>({imageUrl: [], username: []});
  const [valid, setValid] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");

  function validateUserAccount(user: UpdateUserAccount){
    const usernameErrors = validateLength("Username", user.username, 3, 25);

    setUserError({username: usernameErrors, imageUrl: []})

    return !([usernameErrors].some((inputError: Array<string>) => inputError.length > 0))

  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>){
    
    const newUser: UpdateUserAccount = {...user, [e.target.name]: e.target.value};
    setUser(newUser)
    setValid(validateUserAccount(newUser));
  }

  async function handleSubmit(){

    try{

      const updatedUser: User | null = await updateUser(userId, user);

      if(updatedUser)
        setUser(updatedUser)

    }catch(e){

      if(e instanceof Error)
        setApiError(e.message)
    }
    
    
  }

  return(
    <div className="w-full px-4 py-2 flex flex-col gap-2 rounded-xl bg-white">
      <div className="text-lg font-bold">
        Account preferences
      </div>

      <div className="min-h-[1.25rem] text-red-500 text-sm text-center">
          {apiError}
      </div>

      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="w-full flex items-center justify-start">
         
        </div>
        <div className="flex-col">

          <FormField 
            id="username"
            name="username"
            label="Username"
            type="text"
            value={user.username}
            handleChange={handleChange} 
            inputError={userError.username}
            charLimit={25}
          />

        </div>

 
          
      </div>
      <div className="w-full flex flex-row-reverse">
        <Button
          type="submit"
          variant="Primary"
          onClick={handleSubmit}
          disabled={!valid}
        >
         Apply Changes
        </Button>
      </div>
    </div>
  )
}
