import { useAuth } from "../hooks/useAuth"
import {useState} from 'react';
import { type AuthContextType } from "../context/auth.context.ts"
import {useNavigate} from 'react-router';


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
  const [validInput, setValidInput] = useState<boolean>(false);
  const [inputError, setInputError] = useState<LoginError>({email: [], password: []});
  const [error, setError] = useState<string>("");


  function handleChange(e: React.ChangeEvent<HTMLInputElement>){
    
    const newUser: LoginUser = {...user, [e.target.name]: e.target.value};
    setUser(newUser)
    setValidInput(validateUser(newUser));
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
  <form className=" p-4 w-1/2 h-1/2 max-w-md flex flex-col content-between border-2 gap-3 border-gray-300 rounded-2xl bg-white" 
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

        <div className=" text-red-500 text-xs">{user.email.length > 0 && inputError.email[0]}</div>
      </div>
    
    
          
      <div className="flex flex-col gap-1">
        <label className="text-gray-600" htmlFor="password">Password</label>

        <input className={`bg-white px-4 py-2 border-2 border-gray-200 rounded-md ${ inputError.password.length === 0 && user.password.length > 0? "valid": "" } 
          ${user.password.length > 0 && inputError.password.length > 0 ? "invalid" : ""} [&.invalid]:border-red-500 [&.valid]:border-green-500 [&.invalid]:bg-red-50 [&.valid]:bg-green-50`}
            id="password" type="password" name="password" placeholder="Password" onChange={handleChange} required />  

        <div className="text-red-500 text-xs">{user.password.length > 0 && inputError.password[0]}</div>
      </div>

    </div>

    <div id="form-footer" className="flex justify-center items-center">
      <button className="bg-blue-600 px-6 py-3 text-white font-bold rounded-3xl"
        type="submit">Log In Now</button> 
    </div>
     <p>{error} </p>

  </form>
  );
}
