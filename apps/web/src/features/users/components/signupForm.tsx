import { useState } from "react";
import { createUser } from "../api/users.api";
import { useNavigate } from "react-router";

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
  <form className=" p-4 w-1/2 h-3/4 max-w-md flex flex-col content-between border-2 gap-6 border-gray-300 rounded-2xl bg-white" 
      onSubmit={handleSubmit}>
    
    <div id="form-header" className="flex flex-col gap-0.5">

      <div className="text-3xl font-extrabold text-shadow-gray-900 text-center w-full "> Welcome Back</div>
      <div className="text-md font-light text-gray-600 text-center w-full">Sign in to your account</div>

    </div>
     
    <div id="form-body" className="flex flex-col gap-2">

      <div className="flex flex-col gap-1">
        <label className="text-gray-600" htmlFor="email">Email </label>
      
        <input className={`bg-white px-4 py-2 border-2 border-gray-200 rounded-md ${ inputError.email.length === 0 && user.email.length > 0? "valid": "" } 
          ${user.email.length > 0  && inputError.email.length > 0 ? "invalid" : ""} [&.invalid]:border-red-500 [&.invalid]:bg-red-50 [&.valid]:border-green-500 [&.valid]:bg-green-50` }
            id="email" type="email" name="email" placeholder="Email"  onChange={handleChange} required />

        <div className=" min-h-6 text-red-500 text-xs">{user.email.length > 0 && inputError.email[0]}</div>
      </div>
    
      <div className="flex flex-col gap-1">
        <label className="text-gray-600" htmlFor="username">Username </label>
      
        <input className={`bg-white px-4 py-2 border-2 border-gray-200 rounded-md ${ inputError.username.length === 0 && user.username.length > 0? "valid": "" } 
          ${user.username.length > 0  && inputError.username.length > 0 ? "invalid" : ""} [&.invalid]:border-red-500 [&.invalid]:bg-red-50 [&.valid]:border-green-500 [&.valid]:bg-green-50` }
            id="username" type="text" name="username" placeholder="Username"  onChange={handleChange} required />

        <div className=" min-h-6 text-red-500 text-xs">{user.username.length > 0 && inputError.username[0]}</div>
      </div>   
          
      <div className="flex flex-col gap-1">
        <label className="text-gray-600" htmlFor="password">Password</label>

        <input className={`bg-white px-4 py-2 border-2 border-gray-200 rounded-md ${ inputError.password.length === 0 && user.password.length > 0? "valid": "" } 
          ${user.password.length > 0 && inputError.password.length > 0 ? "invalid" : ""} [&.invalid]:border-red-500 [&.valid]:border-green-500 [&.invalid]:bg-red-50 [&.valid]:bg-green-50`}
            id="password" type="password" name="password" placeholder="Password" onChange={handleChange} required />  

        <div className=" min-h-6 text-red-500 text-xs">{user.password.length > 0 && inputError.password[0]}</div>
      </div>

    </div>

    <div id="form-footer" className="flex justify-center items-center">
      <button className="bg-blue-600 px-6 py-3 text-white font-bold rounded-3xl"
        type="submit"> Sign Up </button> 
    </div>
     <p>{error} </p>
  </form>
  );
}
