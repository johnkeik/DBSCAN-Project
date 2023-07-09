import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const HeaderComponent = () => {
  const { openSigningModal, user, logout } = useAuth();
  return (
    <div className=" fixed z-50 w-full h-auto py-5 px-28 bg-white border-b-[1px] border-black flex flex-row justify-between items-center gap-10">
      <h1 className="font-extrabold text-transparent text-3xl bg-clip-text bg-gradient-to-r from-blue-600 to-violet-400">
        DBSCAN Web App
      </h1>
      <ul className="gap-3 flex flex-row">
        <li>
          <Link href={"/"}>Home</Link>
        </li>
        <li>
          <Link href={"/dbscan"}>DBSCAN</Link>
        </li>
        {user && (
          <li>
            <Link href={"/profile"}>Profile</Link>
          </li>
        )}
        <li>
          <h1
            onClick={() => {
              if (user) logout();
              else openSigningModal();
            }}
            className=" cursor-pointer"
          >
            {user ? "Logout" : "Login"}
          </h1>
        </li>
      </ul>
    </div>
  );
};

export default HeaderComponent;