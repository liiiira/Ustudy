import { useNavigate } from "react-router";
import { useState } from "react";
import { type CreateCommunityData, type CreateCommunityError } from "../types";
import { validateLength } from "../../../utils/validators";
import { createCommunity } from "../api/communities.api";
import Button from "../../../components/ui/button";
import FormField from "../../../components/ui/formField";

export default function SignupForm(){
  
  const navigate = useNavigate();

  const [community, setCommunity] = useState<CreateCommunityData>({name: "", description: ""});
  const [apiError, setApiError] = useState<string>("");
  const [inputError, setInputError] = useState<CreateCommunityError>({name: [], descripition: []});
  const [valid, setValid] = useState<boolean>(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>){
    
    const newCommunity: CreateCommunityData = {...community, [e.target.name]: e.target.value};
    setCommunity(newCommunity)
    setValid(validateCommunity(newCommunity));
  }


  function validateCommunity(community: CreateCommunityData): boolean{
    
    const {name, description} = community;

    const nameErrors: string[] = validateLength("Community Name", name, 3, 40);
    const descriptionErrors: string[] = validateLength("Community Description", description, 3, 100);

    setInputError({name: nameErrors, descripition: descriptionErrors  })

    return ![nameErrors, descriptionErrors].some((error: string[]) => error.length > 0);
  }  


  async function handleSubmit(e: React.SubmitEvent){
    e.preventDefault();
    
    try{

      await createCommunity(community);
       navigate("/login")

    }catch(err){
      if(err instanceof Error)
        setApiError(err.message);
    }
  }

  return (
  <form className=" p-6 w-1/2 h-max max-w-md flex flex-col content-between border-2 gap-4 border-gray-300 rounded-2xl bg-white" 
      onSubmit={handleSubmit}>
    
    <div id="form-header" className="flex flex-col gap-1 ">

      <div className="text-3xl font-extrabold text-shadow-gray-900 text-center w-full "> Create Your own community</div>
      <div className="text-md font-light text-gray-600 text-center w-full mb-3">Sign up and Start Learning </div>
      <div className="min-h-[1.25rem] text-red-500 text-sm text-center">{apiError}</div>
    </div>
     
    <div id="form-body" className="flex flex-col gap-2">

      <FormField id="name" name="name" value={community.name} charLimit={40} type="text" placeholder="Community Name" inputError={inputError.name} handleChange={handleChange}  />

    </div>

    <div id="form-footer" className="flex justify-center items-center">
      <Button variant="Primary" disabled={!valid} type="submit"> Create </Button>
    </div>
  </form>
  );
}
