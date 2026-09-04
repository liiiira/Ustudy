import { useNavigate } from "react-router";
import React, { useState } from "react";
import {type CreateCommunityData, type CreateCommunityError } from "../types";
import { validateLength } from "../../../utils/validators";
import * as communityApi from "../api/communities.api";
import Button from "../../../components/ui/button";
import FormField from "../../../components/ui/formField";
import TextField from "../../../components/ui/textField";

type CommunityFormProps = {
  id?: string;
  name?: string;
  description?: string;
  mode: "Create" | "Update",
}
export default function CommunityForm({name = "", description = "", mode = "Create", id}: CommunityFormProps){
  
  const navigate = useNavigate();

  const [community, setCommunity] = useState<CreateCommunityData>({name: name, description: description});
  const [apiError, setApiError] = useState<string>("");
  const [inputError, setInputError] = useState<CreateCommunityError>({name: [], description: []});
  const [valid, setValid] = useState<boolean>(false);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>){
    
    const newCommunity: CreateCommunityData = {...community, [e.target.name]: e.target.value};
    setCommunity(newCommunity)
    setValid(validateCommunity(newCommunity));
  }


  function validateCommunity(community: CreateCommunityData): boolean{
    
    const {name, description} = community;

    const nameErrors: string[] = validateLength("Community Name", name, 3, 40);
    const descriptionErrors: string[] = validateLength("Community Description", description, 3, 100);

    setInputError({name: nameErrors, description: descriptionErrors  })

    return ![nameErrors, descriptionErrors].some((error: string[]) => error.length > 0);
  }  


  async function handleSubmit(e: React.SubmitEvent){
    e.preventDefault();
    
    try{

      if(mode === "Create")
        await communityApi.create(community);

      else if(mode === "Update")
        await communityApi.updateById(id!, community)

      navigate("/communities")
    }catch(err){
      if(err instanceof Error)
        setApiError(err.message);
    }
  }

  const title =  mode === "Create" ?  "Create Your own community" : mode === "Update" ? "Update your community": "";
  const subtitle =  mode === "Create" ?  "Find your people" : "";

  return (
  <form className=" p-6 w-1/2 h-max max-w-md flex flex-col content-between border-2 gap-4 border-gray-300 rounded-2xl bg-white" 
      onSubmit={handleSubmit}>
    
    <div id="form-header" className="flex flex-col gap-1 ">

      <div className="text-3xl font-extrabold text-shadow-gray-900 text-center w-full ">
          {title}
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
          id="name" 
          name="name" 
          value={community.name} 
          charLimit={40} 
          type="text" 
          placeholder="Enter your community name" 
          label="Community Name" 
          inputError={inputError.name} 
          handleChange={handleChange} 
      />
      
      <TextField
          id="description" 
          name="description" 
          value={community.description} 
          charLimit={100} 
          placeholder="Enter your community description" 
          label="Community description"
          inputError={inputError.description}
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
