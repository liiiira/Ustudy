export function validateLength(name: string, value: string, minLength: number, maxLength: number, errorArray: string[] = []): string[]{

  if(minLength > maxLength)
    throw new Error("minLength > maxLength in length validator");

  if(value.length < minLength)
    errorArray.push(`${name} must have at least ${minLength} characaters`);
  
  if(value.length > maxLength)
    errorArray.push(`${name} must have at most ${maxLength} characaters`);

  return errorArray;
}

export function validateEmail(email: string, maxLength: number, errorArray: string[] = []): string[]{
  const emailRegex = /^[^\s@]+@[^\s@.]+\.[^\s@.]+$/;

  if(!emailRegex.test(email) || email.length > maxLength)
    errorArray.push("Invalid Format of email") 
    
  return errorArray;
}

