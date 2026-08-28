import { useAuth } from "../hooks/useAuth"
import {useState} from 'react';
import { type AuthContextType } from "../context/auth.context.ts"
import {useNavigate} from 'react-router';


type UserLogin = {
  email: string;
  password: string;
}

export function LoginForm(){

  const navigate = useNavigate();

  const {login}: AuthContextType = useAuth();
  const [user, setUser] = useState<UserLogin>({email: "", password: ""});
  const [error, setError] = useState<boolean>(false);


  function handleChange(e: React.ChangeEvent<HTMLInputElement>){

    setUser((user: UserLogin) =>(
      {
        ...user, 
        [e.target.name]: e.target.value
      }
    ));
  }


  async function handleSubmit(e: React.SubmitEvent){
    e.preventDefault();
    try{
      await login(user);
      navigate("/")
    }catch{
      setError(true);
    }
  }
  

  return (
  <form className="mx-auto my-auto p-2 w-1/2 h-1/2 flex flex-col border border-blue-400 rounded-2xl" 
      onSubmit={handleSubmit}>

    <input className="bg-white px-4 py-2 border-2 border-blue-300" 
        type="email" name="email" placeholder="Email" onChange={handleChange} required />

    <input className="bg-white px-4 py-2 border-2 border-blue-300" 
        type="password" name="password" placeholder="Password" onChange={handleChange} required />  

    <div>
      <button className="bg-blue-500 px-4 py-2"
        type="submit">submit</button> 
    </div>
    {error && <p>error ... </p>}

  </form>
  );
}
