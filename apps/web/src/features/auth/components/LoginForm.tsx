import { useAuth } from "../hooks/useAuth"
import {useState} from 'react';
import { type AuthContextType } from "../context/auth.context.ts"
import { useNavigate} from 'react-router';
import FormField from "../../../components/ui/formField.tsx";
import { validateEmail, validateLength } from "../../../utils/validators.ts";
import Button from "../../../components/ui/button.tsx";
import {type LoginUser, type LoginError} from "../types.ts"


export default function LoginForm(){

  const navigate = useNavigate();

  const {login}: AuthContextType = useAuth();
  const [user, setUser] = useState<LoginUser>({email: "", password: ""});
  const [inputError, setInputError] = useState<LoginError>({email: [], password: []});
  const [apiError, setApiError] = useState<string>("");
  const [valid, setValid] = useState<boolean>(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>){
    
    const newUser: LoginUser = {...user, [e.target.name]: e.target.value};
    setUser(newUser)
    setValid(validateUser(newUser));
  }

  function validateUser(user: LoginUser): boolean{

    const passwordErrors: string[] = validateLength("Password", user.password, 8, 24);

    const emailErrors: string[] = validateEmail(user.email, 200);
    
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
        setApiError(err.message);

    }
  }
  

  return (
  <form className=" p-6 w-1/2 h-max max-w-md flex flex-col content-between border-2 gap-5 border-gray-300 rounded-2xl bg-white" 
      onSubmit={handleSubmit}>

    <div id="form-header" className="flex flex-col gap-1">

      <div className="text-3xl font-extrabold text-shadow-gray-900 text-center w-full "> Welcome Back</div>
      <div className="text-md font-light text-gray-600 text-center w-full mb-2">Sign in to your account</div>
      <div className="min-h-[1.25rem] text-red-500 text-sm text-center">{apiError}</div>

    </div>
     
    <div id="form-body" className="flex flex-col gap-2">
    
      <FormField id="email" name="email" value={user.email} charLimit={200} placeholder="Email" type="email" handleChange={handleChange} inputError={inputError.email}/>

      <FormField id="password" name="password" value={user.password} charLimit={24} placeholder="Password" type="password" handleChange={handleChange} inputError={inputError.password}/> 

    </div>

    <div id="form-footer" className="flex justify-center items-center">
        <Button variant="Primary" disabled={!valid} type="submit">Log In Now</Button>
    </div>


  </form>
  );
}
