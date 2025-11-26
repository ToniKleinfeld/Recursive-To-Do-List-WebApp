import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { getTheme, setTheme } from "~/utils/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Sync state with current theme
    setCurrentTheme(getTheme());
    
    // Listen for storage changes (optional, but good for multi-tab)
    const handleStorageChange = () => {
      setCurrentTheme(getTheme());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    setTheme(newTheme);
  };

  return (
    <button 
      onClick={toggleTheme} 
      className={`icon-btn ${className || ''}`} 
      aria-label="Toggle Theme"
      type="button"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
