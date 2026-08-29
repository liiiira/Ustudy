import { Outlet } from "react-router";
import { Navbar } from "./navbar";
export default function Layout(){
  return (
    <div className="h-screen w-screen">
      <Navbar />
      <Outlet />
      <p className="bg-blue-950 text-white size-10 font-extrabold w-full">Footer</p>
    </div>
  );
}

