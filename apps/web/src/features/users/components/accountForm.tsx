import { useState } from "react";
import {type UpdateUserAccountErrors, type UpdateUserAccount, type User } from "../types";
import FormField from "../../../components/ui/formField";
import ImageField from "../../../components/ui/imageField";
import { validateLength } from "../../../utils/validators";
import Button from "../../../components/ui/button";
import { updateUser } from "../api/users.api";
import useImageUpload from "../../uploads/hooks/useImageUpload";

type AccountFormProps = {
  userId: string;
  username: string;
  avatarUrl?: string;
}

export default function AccountForm({userId, avatarUrl, username}: AccountFormProps){

  const [user, setUser] = useState<UpdateUserAccount>({avatarUrl, username});
  const [userError, setUserError] = useState<UpdateUserAccountErrors>({username: []});
  const [valid, setValid] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string>("");
  const {upload, uploading, error: uploadError} = useImageUpload("avatar");

  function validateUserAccount(user: UpdateUserAccount){
    const usernameErrors = validateLength("Username", user.username, 3, 25);

    setUserError({username: usernameErrors})

    return usernameErrors.length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>){

    const newUser: UpdateUserAccount = {...user, [e.target.name]: e.target.value};
    setUser(newUser)
    setValid(validateUserAccount(newUser));
  }

  async function handleAvatarSelect(file: File){
    const url = await upload(file);
    if(url)
      setUser((prev: UpdateUserAccount): UpdateUserAccount => ({...prev, avatarUrl: url}));
  }

  async function handleSubmit(e: React.SubmitEvent){
    e.preventDefault();
    setApiError("");

    try{

      const updatedUser: User | null = await updateUser(userId, user);

      if(updatedUser)
        setUser({username: updatedUser.username, avatarUrl: updatedUser.avatarUrl});

    }catch(e){

      if(e instanceof Error)
        setApiError(e.message)
    }
  }

  return(
    <form className="w-full px-4 py-2 flex flex-col gap-2 rounded-xl bg-white" onSubmit={handleSubmit}>
      <div className="text-lg font-bold">
        Account preferences
      </div>

      <div className="min-h-[1.25rem] text-red-500 text-sm text-center">
          {apiError}
      </div>

      <div className="w-full max-w-md flex flex-col gap-4">

        <ImageField
          id="avatar"
          label="Avatar"
          variant="avatar"
          value={user.avatarUrl}
          onFileSelect={handleAvatarSelect}
          uploading={uploading}
          error={uploadError}
        />

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

      <div className="w-full flex flex-row-reverse">
        <Button
          type="submit"
          variant="Primary"
          disabled={!valid || uploading}
        >
         Apply Changes
        </Button>
      </div>
    </form>
  )
}
