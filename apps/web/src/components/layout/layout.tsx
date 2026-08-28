import { Outlet } from "react-router";

export default function Layout(){
  return (
    <div className="h-screen w-screen">
      <p className="sticky top-0 w-full bg-blue-950 text-white font-bold size-10">NavBar</p>
      <Outlet />
      <p className="bg-blue-950 text-white size-10 font-extrabold w-full">Footer</p>
    </div>
  );
}

