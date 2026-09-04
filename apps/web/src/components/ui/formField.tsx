
type FieldProps = {
  id: string;
  name: string;
  type: "text" | "email" | "password";
  value: string;
  placeholder: string;
  label: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputError: string[];
  charLimit: number;
} 

export default function FormField({id, name, type,  value, label, placeholder, handleChange, inputError,  charLimit} : FieldProps){

  return (
      <div className="flex flex-col gap-1">

        <label className=" text-sm text-gray-700 font-medium " htmlFor="email">{label} </label>
      
        <input className={`bg-white px-4 py-2 border-2 border-gray-300 rounded-md outline-none transition-colors
          ${ inputError.length === 0 && value.length > 0 ? "focus:ring-2 focus:ring-green-500 border-green-500 bg-green-50" : "" } 
          ${value.length > 0  && inputError.length > 0 ?  "focus:ring-2 focus:ring-red-500 border-red-500 bg-red-50" : ""}`}
            id={id} type={type} name={name} placeholder={placeholder} value={value}  onChange={handleChange} maxLength={charLimit} required />
        
        <div className="flex flex-row items-center justify-between"> 
          <div className=" min-h-5 text-red-500 text-xs">{value.length > 0 && inputError[0]}</div>
          <div className="text-sm text-gray-500 font-medium">{value.length}/{charLimit}</div>
        </div>
      </div>
  );
}
