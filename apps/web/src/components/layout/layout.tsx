import { Outlet } from "react-router";

export default function Layout(){
  return (
    <div>
      <p>NavBar</p>
      <Outlet />
      <p>Footer</p>
    </div>
  );
}

