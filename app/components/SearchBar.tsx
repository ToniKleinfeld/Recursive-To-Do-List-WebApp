import { Search, X } from "lucide-react";
import { useSearchParams, useSubmit } from "react-router";
import { useEffect, useState, useRef } from "react";

export function SearchBar() {
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [showCompleted, setShowCompleted] = useState(searchParams.get("showCompleted") !== "false");
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setShowCompleted(searchParams.get("showCompleted") !== "false");
  }, [searchParams]);

  const debouncedSubmit = (newQuery: string, newShowCompleted: boolean) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      submit(
        { q: newQuery, showCompleted: newShowCompleted ? "true" : "false" },
        { method: "get", replace: true }
      );
    }, 300);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSubmit(newQuery, showCompleted);
  };

  const clearSearch = () => {
    setQuery("");
    submit({ q: "", showCompleted: showCompleted ? "true" : "false" }, { method: "get", replace: true });
  };

  const toggleCompleted = () => {
    const newShowCompleted = !showCompleted;
    setShowCompleted(newShowCompleted);
    submit({ q: query, showCompleted: newShowCompleted ? "true" : "false" }, { method: "get", replace: true });
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search tasks by title or description..."
          className="search-input"
        />
        {query && (
          <button onClick={clearSearch} className="clear-btn">
            <X size={16} />
          </button>
        )}
      </div>
      <label className="filter-toggle">
        <input 
          type="checkbox" 
          checked={!showCompleted} 
          onChange={toggleCompleted} 
        />
        <span>Hide Completed</span>
      </label>
    </div>
  );
}
