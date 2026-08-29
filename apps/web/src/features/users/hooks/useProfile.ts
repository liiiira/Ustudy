import { useEffect, useState } from "react";
import { type User } from "../types";
import { getProfile } from "../api/users.api";

export function useProfile(){
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    async function loadProfile(){

      try{

        const user: User = await getProfile();
        setUser(user);

      }catch{

        setError(true);

      }finally{

        setLoading(false);

      }
    }
    loadProfile();
  }, []);

  return {loading, user, error}
}
