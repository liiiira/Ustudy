import { fetchApi } from "./lib/api"
import {useState} from 'react';
import {useAuth} from './features/auth/hooks/useAuth.ts'

type User = {
  username: string;
  createdAt: Date;
  email: string,
  id: string,
}


export default function TestPage(){
  const [users, setUsers] = useState<User[]>([]);
  
  const {accessToken} = useAuth();
  async function handleClick(){
    const data = await fetchApi("/users", {method: "GET", accessToken: accessToken});
    setUsers(data.users);

  }

  

  return (
  <div className="h-screen w-max">
    <div className="accent-cyan-300">{
        users.map((user: User) => (
        <div className="bg-blue-500 text-black" key={user.id}>
            username: {user.username}
          </div>
        ))
      }</div> 
    <button className="bg-red-400 px-4 py-2" onClick={() => handleClick()}>fetch</button>
    </div>
  )

}
