 
type ButtonProps = {
  children?: React.ReactNode;
  variant?: "Primary" | "Danger";
  disabled?: boolean;
  onClick?: () => Promise<void> | void;
  type?: "submit" | "button" | "reset"
}

const VARIANTS = {
  "Primary": "bg-blue-600 text-white hover:bg-blue-700  ",
  "Danger": "bg-red-600 text-white hover:bg-red-700"
}

export default function Button({variant = "Primary", disabled, onClick, children, type}: ButtonProps){

  let styleVariant = "" 

  if(variant)
    styleVariant = VARIANTS[variant];

  return (
  <button className={`px-4 py-2 rounded-md transition-colors hover:cursor-pointer disabled:opacity-50
    disabled:cursor-not-allowed ${styleVariant}`} 
    disabled={disabled}
    onClick={onClick}
    type={type}
  >
    {children}
  </button>
  )

}
