import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, Database, Pill, AlertTriangle, Activity, Info, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchMedicine } from '../api';

function ApiData() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const [candidates, setCandidates] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isExactMatch, setIsExactMatch] = useState(false);
  const [standardName, setStandardName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // 1. Wait for user to stop typing before searching (Debounce)
  useEffect(function () {
    let timer = setTimeout(function () {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return function cleanup() {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // 2. Fetch data when the search term is ready
  useEffect(function () {
    // If the search is empty, reset everything
    if (debouncedSearchTerm.trim() === '') {
      setCandidates([]);
      setSelectedMedicine(null);
      setStandardName('');
      setIsExactMatch(false);
      setHasSearched(false);
      setError(null);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        setHasSearched(true);
        setSelectedMedicine(null);
        
        let data = await searchMedicine(debouncedSearchTerm);
        
        setStandardName(data.standardName);
        setIsExactMatch(data.exact);
        
        // Auto-select if there is exactly one exact match
        if (data.exact === true && data.results.length === 1) {
          setSelectedMedicine(data.results[0]);
          setCandidates([]);
        } else {
          setCandidates(data.results);
        }
      } catch (err) {
        setError('Failed to fetch data from APIs. Please try again later.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [debouncedSearchTerm]);

  // Helper function to cut text if it's too long
  function truncateText(text, maxLength) {
    if (maxLength === undefined) {
      maxLength = 150;
    }
    
    if (text === undefined || text === null) {
      return "Not available";
    }
    
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    } else {
      return text;
    }
  }

  function handleSelectMedicine(drug) {
    setSelectedMedicine(drug);
  }

  function handleBackToList() {
    setSelectedMedicine(null);
  }

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
  }

  // Draw the list of potential matches
  function renderCandidates() {
    let candidateElements = [];

    for (let i = 0; i < candidates.length; i++) {
      let drug = candidates[i];
      
      // Try to find the brand name or generic name safely
      let brandName = "Unknown Medicine";
      let genericName = "";

      if (drug.openfda !== undefined) {
        if (drug.openfda.brand_name !== undefined && drug.openfda.brand_name.length > 0) {
          brandName = drug.openfda.brand_name[0];
        } else if (drug.openfda.generic_name !== undefined && drug.openfda.generic_name.length > 0) {
          brandName = drug.openfda.generic_name[0];
        }

        if (drug.openfda.generic_name !== undefined && drug.openfda.generic_name.length > 0) {
          genericName = drug.openfda.generic_name[0];
        }
      } else if (drug.name !== undefined) {
        // Handle local data
        brandName = drug.name;
        if (drug.genericName !== undefined) {
          genericName = drug.genericName;
        }
      }
      
      // Don't show generic if it's the exact same as brand
      let showGeneric = false;
      if (genericName !== "" && genericName.toLowerCase() !== brandName.toLowerCase()) {
        showGeneric = true;
      }

      candidateElements.push(
        <button
          key={drug.id || i}
          onClick={function () { handleSelectMedicine(drug); }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all text-left group flex items-center justify-between"
        >
          <div className="pr-4">
            <h3 className="font-bold text-[#1a202c] dark:text-white capitalize text-[17px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {brandName}
            </h3>
            {showGeneric === true && (
              <p className="text-sm text-[#64748b] dark:text-slate-400 font-medium mt-1 line-clamp-1">
                Generic: {genericName}
              </p>
            )}
          </div>
          <ChevronRight className="w-6 h-6 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors shrink-0" />
        </button>
      );
    }

    return candidateElements;
  }

  // Determine what to show in the main content area using simple IF statements
  let contentArea = null;

  if (loading === true) {
    // Show a loading spinner
    contentArea = (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-transparent dark:border-slate-700">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
        <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Searching FDA Database...</p>
      </div>
    );
  } else if (error !== null) {
    // Show an error message
    contentArea = (
      <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-3xl border border-red-100 dark:border-red-900/30 flex flex-col items-center text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Something went wrong</h2>
        <p className="text-red-600 dark:text-red-500 font-medium">{error}</p>
      </div>
    );
  } else if (hasSearched === false) {
    // Show empty state before searching
    contentArea = (
      <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
        <Search className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Start typing to search</h3>
        <p className="text-[#64748b] dark:text-slate-400 mt-2 font-medium max-w-md mx-auto">
          Results will appear here automatically using the official OpenFDA API.
        </p>
      </div>
    );
  } else if (selectedMedicine === null && candidates.length === 0) {
    // Show no results found
    contentArea = (
      <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
        <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No medicine data found</h3>
        <p className="text-[#64748b] dark:text-slate-400 mt-2 font-medium max-w-md mx-auto">
          We couldn't find any FDA drug labels matching "{standardName || debouncedSearchTerm}". Try a different name or spelling.
        </p>
      </div>
    );
  } else if (selectedMedicine !== null) {
    // Show details for a specific medicine
    
    // Safely extract details
    let brandName = "Unknown Medicine";
    let genericName = "";
    
    let isLocalData = false;
    
    if (selectedMedicine.openfda !== undefined) {
      if (selectedMedicine.openfda.brand_name !== undefined && selectedMedicine.openfda.brand_name.length > 0) {
        brandName = selectedMedicine.openfda.brand_name[0];
      } else if (selectedMedicine.openfda.generic_name !== undefined && selectedMedicine.openfda.generic_name.length > 0) {
        brandName = selectedMedicine.openfda.generic_name[0];
      }

      if (selectedMedicine.openfda.generic_name !== undefined && selectedMedicine.openfda.generic_name.length > 0) {
        genericName = selectedMedicine.openfda.generic_name[0];
      }
    } else if (selectedMedicine.name !== undefined) {
      isLocalData = true;
      brandName = selectedMedicine.name;
      if (selectedMedicine.genericName !== undefined) {
        genericName = selectedMedicine.genericName;
      }
    }

    let showGeneric = false;
    if (genericName !== "" && genericName.toLowerCase() !== brandName.toLowerCase()) {
      showGeneric = true;
    }

    // Get text details safely from either external API array or local string
    let purposeText = "";
    if (selectedMedicine.purpose !== undefined) purposeText = selectedMedicine.purpose[0];
    else if (selectedMedicine.indications_and_usage !== undefined) purposeText = selectedMedicine.indications_and_usage[0];
    else if (selectedMedicine.uses !== undefined) purposeText = selectedMedicine.uses;

    let dosageText = "";
    if (selectedMedicine.dosage_and_administration !== undefined) dosageText = selectedMedicine.dosage_and_administration[0];
    else if (selectedMedicine.dosage !== undefined) dosageText = selectedMedicine.dosage;

    let warningsText = "";
    if (selectedMedicine.warnings !== undefined) {
      if (Array.isArray(selectedMedicine.warnings)) warningsText = selectedMedicine.warnings[0];
      else warningsText = selectedMedicine.warnings;
    }
    else if (selectedMedicine.boxed_warning !== undefined) warningsText = selectedMedicine.boxed_warning[0];

    let sideEffectsText = "";
    if (selectedMedicine.adverse_reactions !== undefined) sideEffectsText = selectedMedicine.adverse_reactions[0];
    else if (selectedMedicine.sideEffects !== undefined) sideEffectsText = selectedMedicine.sideEffects;

    contentArea = (
      <div className="space-y-6 animate-fade-in">
        {(candidates.length > 0 || isExactMatch === false) && (
          <button 
            onClick={handleBackToList}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline mb-2 px-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Matches
          </button>
        )}
        
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-transparent dark:border-slate-700 transition-colors duration-300">
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700 pb-5 mb-5">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Pill className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#1a202c] dark:text-white capitalize">
                    {brandName}
                  </h2>
                  {isLocalData === true ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-md">Local DB</span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-md">FDA Database</span>
                  )}
                </div>
                {showGeneric === true && (
                  <p className="text-sm font-bold text-[#64748b] dark:text-slate-400 mt-1">
                    Generic: {genericName}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Info className="w-5 h-5 text-blue-500" />
                Purpose (Benefits)
              </h3>
              <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 h-[120px] overflow-y-auto custom-scrollbar">
                {truncateText(purposeText, 300)}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Activity className="w-5 h-5 text-emerald-500" />
                Dosage
              </h3>
              <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 h-[120px] overflow-y-auto custom-scrollbar">
                {truncateText(dosageText, 300)}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Warnings
              </h3>
              <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 h-[120px] overflow-y-auto custom-scrollbar">
                {truncateText(warningsText, 300)}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                Side Effects
              </h3>
              <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium bg-rose-50/50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 h-[120px] overflow-y-auto custom-scrollbar">
                {truncateText(sideEffectsText, 300)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // Show a list of candidates
    
    // Create plural correctly
    let matchWord = "matches";
    if (candidates.length === 1) {
      matchWord = "match";
    }

    contentArea = (
      <div className="space-y-6 animate-fade-in">
        <div className="mb-4 px-2">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">
            Found {candidates.length} potential {matchWord} for "{debouncedSearchTerm}"
          </h2>
          {standardName !== "" && standardName.toLowerCase() !== debouncedSearchTerm.toLowerCase() && (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Standardized by RxNorm as: <span className="text-blue-600 dark:text-blue-400 font-bold">{standardName}</span>
            </p>
          )}
          {isExactMatch === false && (
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mt-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/50 inline-flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              No exact match found. Please select the closest match below.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderCandidates()}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-[2rem] font-extrabold text-[#1a202c] dark:text-white flex items-center gap-3">
          <Database className="text-blue-500 dark:text-blue-400 w-8 h-8" strokeWidth={2.5} />
          FDA Drug Database
        </h1>
        <p className="text-[#64748b] dark:text-slate-400 mt-2 font-medium">
          Search for medicines to view officially reported purposes, dosages, warnings, and side effects.
        </p>
      </div>

      <div className="mb-8 relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Enter medicine name (e.g., Tylenol, Aspirin)..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-medium text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none shadow-sm dark:shadow-none placeholder-slate-400"
        />
      </div>

      {contentArea}

    </div>
  );
}

export default ApiData;
