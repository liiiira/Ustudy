import { useState } from "react";
import { createUser } from "../api/users.api";
import {useNavigate } from "react-router";
import FormField from "../../../components/ui/formField";

type SignupUser = {
  username: string,
  password: string,
  email: string,
}

type SignupError = {
  username: string[];
  password: string[];
  email: string[];
}

export default function SignupForm(){
  
  const navigate = useNavigate();

  const [user, setUser] = useState<SignupUser>({username: "", password: "", email: ""});
  const [error, setError] = useState<string>("");
  const [inputError, setInputError] = useState<SignupError>({email: [], password: [], username: []});


  function handleChange(e: React.ChangeEvent<HTMLInputElement>){
    
    const newUser: SignupUser = {...user, [e.target.name]: e.target.value};
    setUser(newUser)
    validateUser(newUser);
  }

  function validateUser(user: SignupUser): boolean{
    const emailErrors: string[] = [];
    
    const emailRegex = /^[^\s@]+@[^\s@.]+\.[^\s@.]+$/;
    const validEmail: boolean = emailRegex.test(user.email);

    if(!validEmail) 
      emailErrors.push("Invalid format of email")
  
    const usernameErrors: string[] = [];

    if(user.username.length < 3)
      usernameErrors.push("Username must contain atleast 3 characters")
    
    const passwordErrors: string[] = [];

    if (user.password.length < 8)
      passwordErrors.push("Password must have at least 8 characters");   

    setInputError({email: emailErrors, username: usernameErrors, password: passwordErrors  })

    return ![passwordErrors, emailErrors].some((error: string[]) => error.length > 0);
  }  


  async function handleSubmit(e: React.SubmitEvent){
    e.preventDefault();
    
    try{

      await createUser(user);
       navigate("/login")

    }catch(err){
      if(err instanceof Error)
        setError(err.message);
    }
  }

  return (
  <form className=" p-4 w-1/2 h-max max-w-md flex flex-col content-between border-2 gap-6 border-gray-300 rounded-2xl bg-white" 
      onSubmit={handleSubmit}>
    
    <div id="form-header" className="flex flex-col gap-0.5">

      <div className="text-3xl font-extrabold text-shadow-gray-900 text-center w-full "> Welcome Back</div>
      <div className="text-md font-light text-gray-600 text-center w-full">Sign in to your account</div>

    </div>
     
    <div id="form-body" className="flex flex-col gap-2">

     
      <FormField id="email" name="email" value={user.email} type="email" placeholder="Email" inputError={inputError.email} handleChange={handleChange}  />

      <FormField id="username" name="username" value={user.username} type="text" placeholder="Username" inputError={inputError.username} handleChange={handleChange} />
      
      <FormField id="password" name="password" value={user.password} type="password" placeholder="Password" inputError={inputError.password} handleChange={handleChange} />
  
    </div>

    <div id="form-footer" className="flex justify-center items-center">
      <button className="bg-blue-600 px-6 py-3 text-white font-bold rounded-3xl"
        type="submit"> Sign Up </button> 
    </div>
     <p>{error} </p>
  </form>
  );
}
