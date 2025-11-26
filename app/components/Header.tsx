import { useSubmit } from "react-router";
import { LogOut, CheckSquare } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { account } from "~/services/appwrite";

export function Header({ user }: { user: any }) {
  const submit = useSubmit();

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Logout error:", error);
    }
    // Proceed to server logout regardless of client success
    submit(null, { method: "post", action: "/logout" });
  };

  return (
    <header className="app-header">
      <div className="logo">
        <CheckSquare size={24} />
        <span>Recursive To-Do</span>
      </div>
      <div className="actions">
        <span className="user-name">{user?.name}</span>
        <ThemeToggle />
        <button onClick={handleLogout} className="icon-btn" aria-label="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
