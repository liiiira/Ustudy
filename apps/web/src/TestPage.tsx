import {  authFetch } from "./lib/api"
import {useState} from 'react';

type User = {
  username: string;
  createdAt: Date;
  email: string,
  id: string,
}


export default function TestPage(){
  const [users, setUsers] = useState<User[]>([]);
   
  async function handleClick(){
    const data = await authFetch("/users", {method: "GET"});
    setUsers(data.users);

  }

  

  return (
  <div className="h-screen w-max">
    <div>{
        users.map((user: User) => (
        <div className=" text-black" key={user.id}>
            username: {user.username}
          </div>
        ))
      }</div> 
    <button className="bg-blue-500 px-4 py-2" onClick={() => handleClick()}>fetch</button>
    </div>
  )

}
