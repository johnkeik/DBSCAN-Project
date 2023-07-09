import { fetchUserInfo } from "@/api/user";
import Cookies from "js-cookie";

const Profile = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <button
        onClick={async () => {
          const token = Cookies.get("accessToken");
          console.log(token);
          const response = await fetchUserInfo(token ?? "");
          console.log(response);
        }}
      >
        Fetch user info
      </button>
    </div>
  );
};

export default Profile;
