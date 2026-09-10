

type DropdownMenuProps = {
  options: Record<string, ((e: React.MouseEvent<HTMLDivElement>) => void)> 
}

export default function DropdownMenu({options}: DropdownMenuProps){

  const labels: string[] = Object.keys(options);
  const functions: ((e: React.MouseEvent<HTMLDivElement>) => void)[] = Object.values(options)
  return(

    <div 
      className="flex flex-col w-max h-max right-0 rounded-xl border-2  border-gray-500 overflow-hidden shadow-2xl bg-white">
      
      {labels.map((label, index) => (
        <div 
          key={index} 
          onClick={functions[index]}
          className="flex flex-row justify-center items-center px-4 py-2 hover:cursor-pointer hover:bg-gray-200 transition-colors"
        >
           {label}
        </div>
      ))}

    </div>
  );
}
