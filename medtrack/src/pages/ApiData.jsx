import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Loader2, AlertCircle, Database } from 'lucide-react';

const ApiData = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 1. Fetch data on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
        
        // English translations for the first 10 Latin placeholder posts
        const englishContent = {
          1: { title: "The Importance of Routine", body: "Consistency is key when managing your daily schedule. Maintaining a proper routine ensures that you do not miss out on important tasks and responsibilities." },
          2: { title: "Understanding Your Health", body: "It is essential to keep track of your well-being. Regular check-ups and monitoring can prevent complications and help you live a healthier life." },
          3: { title: "Managing Daily Stress", body: "Stress can have a significant impact on your physical condition. Finding time to relax and performing breathing exercises can reduce anxiety levels." },
          4: { title: "The Benefits of Hydration", body: "Drinking enough water every day is crucial for your body to function correctly. It helps in digestion, keeps your skin clear, and maintains energy." },
          5: { title: "Healthy Sleep Habits", body: "A good night's sleep is the foundation of a productive day. Aim for seven to eight hours of uninterrupted rest to allow your body to recover." },
          6: { title: "Nutrition and Diet", body: "Eating a balanced diet rich in vegetables and proteins provides the necessary fuel. Avoid excessive sugars and processed foods for better long-term health." },
          7: { title: "Physical Activity", body: "Engaging in at least thirty minutes of exercise daily strengthens the heart and muscles. Even a light walk can significantly improve your mood." },
          8: { title: "Mental Health Awareness", body: "Taking care of your mind is just as important as taking care of your body. Do not hesitate to seek support when you feel overwhelmed." },
          9: { title: "Tracking Your Progress", body: "Using an application to log your daily activities can provide valuable insights into your habits, helping you make informed lifestyle adjustments." },
          10: { title: "Consistency is Key", body: "The secret to long-term success in any endeavor is sticking to your plan. Small, continuous efforts yield massive results over time." }
        };

        // Display only first 10 items and translate them to English
        const firstTen = response.data.slice(0, 10).map(post => ({
          ...post,
          title: englishContent[post.id]?.title || post.title,
          body: englishContent[post.id]?.body || post.body
        }));
        
        setPosts(firstTen);
        setFilteredPosts(firstTen);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data from API');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 2. Implement Debouncing for Search (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    // Cleanup function runs if searchTerm changes before 500ms finishes
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 3. Filter posts when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => 
        post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
    setCurrentPage(1); // Reset to first page on new search
  }, [debouncedSearchTerm, posts]);

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 dark:text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        <p className="text-lg font-medium">Loading API data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl flex flex-col items-center max-w-md text-center border border-red-100 dark:border-red-900/50">
          <AlertCircle className="w-12 h-12 mb-4" />
          <h2 className="text-lg font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <Database className="text-blue-500 dark:text-blue-400 w-8 h-8" />
          API Data Source
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Fetching and filtering posts from JSONPlaceholder with a 500ms debounce.
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-8 relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search posts by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none shadow-sm dark:shadow-none"
        />
      </div>

      {/* Results List */}
      {filteredPosts.length === 0 ? (
        <div className="glass-panel text-center py-12 rounded-3xl border border-transparent dark:border-slate-800">
          <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No posts found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all flex flex-col h-full"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                    {post.id}
                  </span>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize line-clamp-1">
                    {post.title}
                  </h2>
                </div>
                <p className="text-slate-600 dark:text-slate-400 line-clamp-3 text-sm leading-relaxed mt-1">
                  {post.body}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm shadow-sm dark:shadow-none"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-lg border border-transparent dark:border-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm shadow-sm dark:shadow-none"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ApiData;
