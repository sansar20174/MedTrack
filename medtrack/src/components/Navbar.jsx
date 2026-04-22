import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

function Navbar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDark]);

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "My Medicines", path: "/medicines" },
    { name: "Add Medicine", path: "/add-medicine" },
    { name: "API Data", path: "/api-data" },
  ];

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
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-[#4a5568] dark:text-slate-300 hover:text-[#1a202c] dark:hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
             <button className="text-slate-600 dark:text-slate-300 hover:text-blue-600">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
               </svg>
             </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;