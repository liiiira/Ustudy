import { useState } from "react";
import { createUser } from "../api/users.api";
import {useNavigate } from "react-router";
import FormField from "../../../components/ui/formField";
import {validateEmail, validateLength} from '../../../utils/validators.ts'

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
  const [apiError, setApiError] = useState<string>("");
  const [inputError, setInputError] = useState<SignupError>({email: [], password: [], username: []});
  const [valid, setValid] = useState<boolean>(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>){
    
    const newUser: SignupUser = {...user, [e.target.name]: e.target.value};
    setUser(newUser)
    setValid(validateUser(newUser));
  }


  function validateUser(user: SignupUser): boolean{

    const emailErrors = validateEmail(user.email, 200);
    const usernameErrors = validateLength("Username", user.username, 3, 25);
    const passwordErrors = validateLength("Password", user.password, 8, 24)

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
        setApiError(err.message);
    }
  }

  return (
  <form className=" p-4 w-1/2 h-max max-w-md flex flex-col content-between border-2 gap-5 border-gray-300 rounded-2xl bg-white" 
      onSubmit={handleSubmit}>
    
    <div id="form-header" className="flex flex-col gap-1 ">

      <div className="text-3xl font-extrabold text-shadow-gray-900 text-center w-full "> Welcome to Ustudy</div>
      <div className="text-md font-light text-gray-600 text-center w-full mb-3">Sign up and Start Learning </div>
      <div className="min-h-[1.25rem] text-red-500 text-sm text-center">{apiError}</div>
    </div>
     
    <div id="form-body" className="flex flex-col gap-2">

     
      <FormField id="email" name="email" value={user.email} charLimit={200} type="email" placeholder="Email" inputError={inputError.email} handleChange={handleChange}  />

      <FormField id="username" name="username" value={user.username} charLimit={25} type="text" placeholder="Username" inputError={inputError.username} handleChange={handleChange} />
      
      <FormField id="password" name="password" value={user.password} charLimit={24} type="password" placeholder="Password" inputError={inputError.password} handleChange={handleChange} />
  
    </div>

    <div id="form-footer" className="flex justify-center items-center">
      <button className="bg-blue-600 cursor-pointer hover:bg-blue-400 transition-colors disabled:bg-blue-300 disabled:cursor-auto 
          px-6 py-3 text-white font-bold rounded-3xl"
        type="submit" disabled={!valid}> Sign Up </button> 
    </div>
  </form>
  );
}
