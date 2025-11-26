import { Form } from "react-router";
import { Moon, Sun, LogOut, CheckSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { getTheme, setTheme } from "~/utils/theme";

export function Header({ user }: { user: any }) {
  const [theme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = getTheme();
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    setTheme(newTheme);
  };

  return (
    <header className="app-header">
      <div className="logo">
        <CheckSquare size={24} />
        <span>Recursive To-Do</span>
      </div>
      <div className="actions">
        <span className="user-name">{user.name}</span>
        <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <Form action="/logout" method="post" style={{ display: 'inline' }}>
          <button type="submit" className="icon-btn" aria-label="Logout">
            <LogOut size={20} />
          </button>
        </Form>
      </div>
    </header>
  );
}
