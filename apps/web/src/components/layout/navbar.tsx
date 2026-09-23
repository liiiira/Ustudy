import { useAuth } from "../../features/auth/hooks/useAuth";
import { Link, useNavigate } from "react-router";
import NavbarDropDownMenu from "../ui/navbarDropdownMenu";
import Button from "../ui/button";

export function Navbar() {
  const navigate = useNavigate();

  const { isAuthenticated, logout, loading, user } = useAuth();

  if (loading)
    return (
      <div
        id="navbar"
        className="flex flex-row items-center justify-between px-10 py-2 sticky top-0 w-full bg-white font-bold border-b-2 border-gray-400"
      >
        <div
          id="navbar-logo"
          className="flex items-center justify-center px-4 py-2"
        >
          <Link to="/">Ustudy</Link>
        </div>
      </div>
    );

  return (
    <div
      id="navbar"
      className="flex flex-row items-center justify-between px-10 py-2 sticky top-0 w-full bg-white font-bold border-b-2 border-gray-400"
    >
      <div
        id="navbar-logo"
        className="flex items-center justify-center px-4 py-2"
      >
        <Link to="/">Ustudy</Link>
      </div>

      {isAuthenticated ? (
        <div id="navbar-right-side" className="flex flex-row gap-20">
          <div className="flex flex-row items-center gap-4">
            <Link
              to="/communities"
              className="font-light transition-colors hover:text-blue-700"
            >
              Communities
            </Link>
            <Link
              to="/messages"
              className="font-light transition-colors hover:text-blue-700"
            >
              Messages
            </Link>
          </div>
          <NavbarDropDownMenu imageUrl={user?.avatarUrl} logout={logout} />
        </div>
      ) : (
        <div className="flex flex-row justify-center items-center">
          <Button onClick={() => navigate("/login")}>Log In</Button>
        </div>
      )}
    </div>
  );
}
