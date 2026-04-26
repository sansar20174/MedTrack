import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-transparent dark:border-slate-700 transition-colors duration-300 animate-fade-in">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 10h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10Z" />
              <path d="M7 6h10v4H7z" />
              <path d="M9 2h6v4H9z" />
            </svg>
          </div>
          <h1 className="text-[2.5rem] font-extrabold text-[#1a202c] dark:text-white tracking-tight leading-none mb-3">
            MedTrack
          </h1>
          <p className="text-[#64748b] dark:text-slate-400 font-medium">
            {isLogin ? 'Welcome back! Please login to your account.' : 'Create an account to track your medicines.'}
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-5">
          
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-bold text-[#1a202c] dark:text-slate-300 ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-[#1a202c] dark:text-white outline-none font-medium placeholder-slate-400"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-bold text-[#1a202c] dark:text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="email" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-[#1a202c] dark:text-white outline-none font-medium placeholder-slate-400"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-[#1a202c] dark:text-slate-300 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="password" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-[#1a202c] dark:text-white outline-none font-medium placeholder-slate-400"
                placeholder="••••••••"
                required
              />
            </div>
            {isLogin && (
              <div className="flex justify-end mt-2">
                <a href="#" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</a>
              </div>
            )}
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-between bg-[#3b5998] hover:bg-[#2d4373] text-white px-6 py-4 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-900/10 mt-2"
          >
            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </button>

        </form>

        <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-700 pt-6">
          <p className="text-[15px] text-[#64748b] dark:text-slate-400 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-blue-600 dark:text-blue-400 font-bold hover:underline focus:outline-none"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Auth;
