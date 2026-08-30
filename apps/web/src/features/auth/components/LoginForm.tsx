import { useAuth } from "../hooks/useAuth"
import {useState} from 'react';
import { type AuthContextType } from "../context/auth.context.ts"
import { useNavigate} from 'react-router';
import FormField from "../../../components/ui/formField.tsx";

type LoginUser = {
  email: string;
  password: string;
}

type LoginError = {
  email: string[];
  password: string[];
}
export default function LoginForm(){

  const navigate = useNavigate();

  const {login}: AuthContextType = useAuth();
  const [user, setUser] = useState<LoginUser>({email: "", password: ""});
  const [inputError, setInputError] = useState<LoginError>({email: [], password: []});
  const [error, setError] = useState<string>("");


  function handleChange(e: React.ChangeEvent<HTMLInputElement>){
    
    const newUser: LoginUser = {...user, [e.target.name]: e.target.value};
    setUser(newUser)
    validateUser(newUser);
  }

  function validateUser(user: LoginUser): boolean{

    const passwordErrors: string[] = [];

    if (user.password.length < 8)
      passwordErrors.push("Password must have at least 8 characters");
    
    const emailErrors: string[] = [];
    
    const emailRegex = /^[^\s@]+@[^\s@.]+\.[^\s@.]+$/;
    const validEmail: boolean = emailRegex.test(user.email);

    if(!validEmail) 
      emailErrors.push("Invalid format of email")

    setInputError({email: emailErrors, password: passwordErrors})

    return ![passwordErrors, emailErrors].some((error: string[]) => error.length > 0);
  }


  async function handleSubmit(e: React.SubmitEvent){
    e.preventDefault();

    if(!validateUser(user)){
      return ;
    }
    try{
      await login(user);
      navigate("/test")
    }catch(err){
      if(err instanceof Error)
        setError(err.message);

    }
  }
  

  return (
  <form className=" p-4 w-1/2 h-max max-w-md flex flex-col content-between border-2 gap-3 border-gray-300 rounded-2xl bg-white" 
      onSubmit={handleSubmit}>
    
    <div id="form-header" className="flex flex-col gap-0.5">

      <div className="text-3xl font-extrabold text-shadow-gray-900 text-center w-full "> Welcome Back</div>
      <div className="text-md font-light text-gray-600 text-center w-full">Sign in to your account</div>

    </div>
     
    <div id="form-body" className="flex flex-col gap-2">
    
      <FormField id="email" name="email" value={user.email} placeholder="Email" type="email" handleChange={handleChange} inputError={inputError.email}/>

      <FormField id="password" name="password" value={user.password} placeholder="Password" type="password" handleChange={handleChange} inputError={inputError.password}/> 

    </div>

    <div id="form-footer" className="flex justify-center items-center">
      <button className="bg-blue-600 px-6 py-3 text-white font-bold rounded-3xl"
        type="submit">Log In Now</button> 
    </div>
     <p>{error} </p>

  </form>
  );
}
