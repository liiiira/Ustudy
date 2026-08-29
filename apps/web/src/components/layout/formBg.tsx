
export default function FormBg({children}: {children: React.ReactNode}){
  return (
    <div className="w-full h-screen pt-5 flex justify-center items-center bg-gray-100 ">
      {children}
    </div>
  )
}
