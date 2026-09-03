import {useState} from 'react';
import FormField from "./components/ui/formField";
import TextField from './components/ui/textField';
import Button from './components/ui/button';

type UserTest = {
  email: string;
}
type UserError = {
  email: string[];
}


export default function TestPage(){
  const [user, setUser] = useState<UserTest>({email: ""})
  const [inputError, setInputError] = useState<UserError>({email: []})
  
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>){

    const newUser: UserTest = {...user, [e.target.name]: e.target.value};
    setUser(newUser)
    validateUser(newUser);  
  }
  
  function validateUser(user: UserTest): boolean{

    const emailErrors: string[] = [];
    

    if(user.email.length < 10) 
      emailErrors.push("Email is less then 10 chars");

    if(user.email.length  > 700)
      emailErrors.push("Email is more than 700")

    setInputError({email: emailErrors})

    return ![emailErrors].some((error: string[]) => error.length > 0);
  }
  
  return (
  <div className="h-screen w-screen flex justify-center items-center ">
      <form className="h-1/2 w-1/2 flex flex-col gap-4" onSubmit={(e) =>{e.preventDefault(); console.log(user.email)}}>

        <div >
          <p>Form</p>
        </div>
        <TextField id="email" name="email" value={user.email} placeholder='Enter your email' inputError={inputError.email} maxLength={700} handleChange={handleChange} label="Email" rows={4}> 
        </TextField>

        <div className="flex flex-row justify-center items-center">
          <Button variant='Primary'> Submit</Button>         
        </div>

      </form>
    </div>
  )

}
