import { Outlet } from "react-router";
import { Navbar } from "./navbar";
export default function Layout(){
  return (
    <div className="min-h-screen w-full flex flex-col ">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <p className=" bg-blue-950 text-white  font-extrabold w-full">Footer</p>
    </div>
  );
}

