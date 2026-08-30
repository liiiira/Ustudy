type FieldType = {
  id: string;
  name: string;
  type: "text" | "email" | "password";
  value: string;
  placeholder: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputError: string[];
} 

export default function FormField({id, name, type,  value, placeholder, handleChange, inputError } : FieldType){

  return (
      <div className="flex flex-col gap-1">

        <label className="text-gray-600" htmlFor="email">{placeholder} </label>
      
        <input className={`bg-white px-4 py-2 border-2 border-gray-200 rounded-md 
          ${ inputError.length === 0 && value.length > 0? "valid": "" } 
          ${value.length > 0  && inputError.length > 0 ? "invalid" : ""}
          [&.invalid]:border-red-500 [&.invalid]:bg-red-50 [&.valid]:border-green-500 [&.valid]:bg-green-50` }
            id={id} type={type} name={name} placeholder={placeholder}  onChange={handleChange} required />

        <div className=" min-h-5 text-red-500 text-xs">{value.length > 0 && inputError[0]}</div>
      </div>
  );
}
