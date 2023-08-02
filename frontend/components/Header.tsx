import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";

const HeaderComponent = () => {
  const { openSigningModal, user, logout } = useAuth();
  const router = useRouter();
  return (
    <div className=" fixed z-50 w-full h-auto py-5 px-28 bg-[#ffffff]/[0.1] border-b-[1px] border-white flex flex-row justify-between items-center gap-10">
      <h1 className="font-extrabold text-transparent text-3xl bg-clip-text bg-gradient-to-r from-blue-600 to-violet-400">
        DBSCAN Web App
      </h1>
      <ul className="gap-3 flex flex-row text-white font-bold text-2xl">
        <li>
          <Link href={"/"}>Home</Link>
        </li>
        <li>
          <Link href={"/dbscan"}>DBSCAN</Link>
        </li>

        <li>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfamx75X9wKlqzfjEXv0l4LmmAAi_xZeAx6xWhqt9CGyU5uww/viewform?usp=sf_link"
            target="_blank"
          >
            Rate Us!
          </a>
        </li>
        <li>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfamx75X9wKlqzfjEXv0l4LmmAAi_xZeAx6xWhqt9CGyU5uww/viewform?usp=sf_link"
            target="_blank"
          >
            Api Docs
          </a>
        </li>
        <li>
          <h1
            onClick={() => {
              if (user) {
                logout();
                router.push("/");
              } else openSigningModal();
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
