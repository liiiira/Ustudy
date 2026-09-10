

type DropdownMenuProps = {
  options: Record<string, ((e: React.MouseEvent<HTMLDivElement>) => void)> 
  size: "xs" | "md" | "xl"
}
const PADDINGS: Record<DropdownMenuProps["size"], string> = {
  "xs": "px-4 py-2",
  "md": "px-8 py-2",
  "xl": "px-12 py-2",
}

const ROUNDED: Record<DropdownMenuProps["size"], string> = {
  "xs": "rounded-xl",
  "md": "rounded-md",
  "xl": "rounded-md",
}

export default function DropdownMenu({options, size}: DropdownMenuProps){

  const labels: string[] = Object.keys(options);
  const functions: ((e: React.MouseEvent<HTMLDivElement>) => void)[] = Object.values(options)

  const padding: string = PADDINGS[size];
  const rounded: string = ROUNDED[size];

  return(

    <div 
      className={`flex flex-col w-max h-max right-0 ${rounded} border-2  border-gray-400 overflow-hidden shadow-2xl bg-white`}>
      
      {labels.map((label, index) => (
        <div 
          key={index} 
          onClick={functions[index]}
          className={`flex flex-row justify-center items-center ${padding} hover:cursor-pointer hover:bg-gray-200 transition-colors font-light`}
        >
           {label}
        </div>
      ))}

    </div>
  );
}
