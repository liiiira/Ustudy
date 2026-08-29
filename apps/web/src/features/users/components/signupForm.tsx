import { useState } from "react";
import { createUser } from "../api/users.api";
import { useNavigate } from "react-router";

type LoginType = {
  username: string,
  password: string,
  email: string,
}

export default function SignupForm(){
  
  const navigate = useNavigate();

  const [user, setUser] = useState<LoginType>({username: "", password: "", email: ""});
  const [error, setError] = useState<boolean>(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>){
    setUser((oldUser: LoginType) => ({
      ...oldUser, [e.target.name]: e.target.value,
    }));
  }


  async function handleSubmit(e: React.SubmitEvent){
    e.preventDefault();
    
    try{

      await createUser(user);
       navigate("/login")

    }catch{
      setError(true);
    }
  }

  return (
    <form className="mx-auto my-auto p-2 w-1/2 h-1/2 flex flex-col gap-4 border border-blue-400 rounded-2xl" 
      onSubmit={handleSubmit}>

    <p>Sign up form</p>

    <input className="bg-white px-4 py-2 border-2 border-blue-300" 
        type="email" name="email" placeholder="Email" onChange={handleChange} required />

    <input className="bg-white px-4 py-2 border-2 border-blue-300" 
        type="text" name="username" placeholder="Username" onChange={handleChange} required />

    <input className="bg-white px-4 py-2 border-2 border-blue-300" 
        type="password" name="password" placeholder="Password" onChange={handleChange} required />  

    <div>
      <button className="bg-blue-500 px-4 py-2"
        type="submit">submit</button> 
    </div>
    {error && <p>error ... </p>}

  </form>
  )

}
