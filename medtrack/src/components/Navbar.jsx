import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Moon, Sun, LogOut } from "lucide-react";

function Navbar(props) {
  const location = useLocation();
  const onLogout = props.onLogout;

  // State to track if dark mode is turned on
  const [isDark, setIsDark] = useState(false);

  // Check the initial theme when the component loads
  useEffect(function () {
    let hasDarkModeClass = document.documentElement.classList.contains("dark");
    if (hasDarkModeClass === true) {
      setIsDark(true);
    }
  }, []);

  // Update the theme when the state changes
  useEffect(function () {
    if (isDark === true) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Function to toggle the theme
  function handleThemeToggle() {
    if (isDark === true) {
      setIsDark(false);
    } else {
      setIsDark(true);
    }
  }

  // List of all navigation pages
  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "My Medicines", path: "/medicines" },
    { name: "Add Medicine", path: "/add-medicine" },
    { name: "API Data", path: "/api-data" },
  ];

  // Create the navigation links using a basic for loop
  function renderNavItems() {
    let elements = [];

    for (let i = 0; i < navItems.length; i++) {
      let item = navItems[i];
      let isActive = false;

      // Check if the current URL path matches the item path
      if (location.pathname === item.path) {
        isActive = true;
      }
      
      // We also want dashboard to be active on the root path
      if (location.pathname === "/" && item.path === "/") {
         isActive = true;
      }

      let linkClass = "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ";

      if (isActive === true) {
        linkClass = linkClass + "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm";
      } else {
        linkClass = linkClass + "text-[#4a5568] dark:text-slate-300 hover:text-[#1a202c] dark:hover:text-white";
      }

      elements.push(
        <Link key={item.path} to={item.path} className={linkClass}>
          {item.name}
        </Link>
      );
    }

    return elements;
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-4">
          <div className="text-blue-600 dark:text-blue-400">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 10h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10Z" />
              <path d="M7 6h10v4H7z" />
              <path d="M9 2h6v4H9z" />
            </svg>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-2xl font-extrabold tracking-tight text-[#1e293b] dark:text-white leading-none mb-1">
              MedTrack
            </span>
            <span className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-none">
              Smart Medicine Reminder & Refill Prediction
            </span>
          </div>
        </Link>

        {/* Right Section: Nav & Toggle */}
        <div className="flex items-center gap-6">
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center bg-[#b8c6e6]/50 dark:bg-slate-800 p-1.5 rounded-full transition-colors duration-300">
            {renderNavItems()}
          </nav>

          {/* Theme Toggle Button */}
          <button 
            onClick={handleThemeToggle}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

        </div>
      </div>
    </header>
  );
}

export default Navbar;