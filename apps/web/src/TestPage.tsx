import {useState} from 'react';
import FormField from "./components/ui/formField";


type UserTest = {
  email: string;
}
type UserError = {
  email: string[];
}


export default function TestPage(){
  const [user, setUser] = useState<UserTest>({email: ""})
  const [inputError, setInputError] = useState<UserError>({email: []})
  
  function handleChange(e: React.ChangeEvent<HTMLInputElement>){

    const newUser: UserTest = {...user, [e.target.name]: e.target.value};
    setUser(newUser)
    validateUser(newUser);  
  }
  
  function validateUser(user: UserTest): boolean{

    const emailErrors: string[] = [];
    
    const emailRegex = /^[^\s@]+@[^\s@.]+\.[^\s@.]+$/;
    const validEmail: boolean = emailRegex.test(user.email);

    if(!validEmail) 
      emailErrors.push("Invalid format of email")

    setInputError({email: emailErrors})

    return ![emailErrors].some((error: string[]) => error.length > 0);
  }
  
  return (
  <div className="h-screen w-screen flex justify-center items-center ">
      <form className="h-1/2 w-1/2 flex flex-col gap-4">

        <div >
          <p>Form</p>
        </div>

        <div className="flex flex-col gap-2 ">
        <FormField name="email" placeholder="email" id="email" value={user.email} inputError={inputError.email} handleChange={handleChange} type="email"/>
        </div>

        <div className="flex flex-row justify-center items-center">

          <button className="bg-blue-300 px-4 py-2 hover:cursor-pointer "
            type="submit" >Try</button>
        </div>

      </form>
    </div>
  )

}
