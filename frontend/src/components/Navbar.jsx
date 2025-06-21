import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 w-full flex items-center">
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between w-full gap-3">
          {/* LOGO */}
          {isChatPage && (
            <div className="md:block hidden">
              <div className="flex items-center gap-2.5 ">
                <Link to="/" className="flex items-center gap-2.5">
                  <ShipWheelIcon className="size-8 sm:size-9 text-[#FF9900]" />
                  <span className="text-2xl sm:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-[#097054] to-[#FF9900] tracking-wider whitespace-nowrap">
                    Friendify
                  </span>
                </Link>
              </div>
            </div>
          )}
          <div className="block md:hidden">
            <div className="flex items-center gap-1 ">
              <Link to="/" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-5 text-[#FF9900]" />
                <span className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-[#097054] to-[#FF9900] tracking-wider whitespace-nowrap">
                  Friendify
                </span>
              </Link>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <Link to="/notifications">
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="size-5 sm:size-6 text-base-content opacity-70" />
              </button>
            </Link>

            <ThemeSelector />

            <Link to="/profile">
              <div className="avatar">
                <div className="w-8 sm:w-9 rounded-full">
                  <img
                    src={authUser?.profilePic || "/default.svg"}
                    alt={`${authUser?.fullName || "User"} Avatar`}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </Link>

            <button
              className="btn btn-ghost btn-circle"
              onClick={logoutMutation}
            >
              <LogOutIcon className="size-5 sm:size-6 text-base-content opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
