
export default function FormBg({children}: {children: React.ReactNode}){
  return (
    <div className="w-full min-h-screen pt-2 flex justify-center items-center bg-slate-200 ">
      {children}
    </div>
  )
}
