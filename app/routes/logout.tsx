import { useEffect } from "react";
import { useNavigate } from "react-router";
import { account } from "~/services/appwrite";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        await account.deleteSession("current");
      } catch (error) {
        console.error("Logout failed", error);
      } finally {
        navigate("/login");
      }
    };
    logout();
  }, [navigate]);

  return <div className="p-8 text-center">Logging out...</div>;
}
