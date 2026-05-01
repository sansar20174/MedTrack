import axios from 'axios';
import localDb from './data/localMedicineDb.json';

/**
 * Standardize medicine name using the RxNorm API
 * @param {string} query User inputted medicine name
 * @returns {string} Standardized name or original query if not found
 */
export async function standardizeMedicineName(query) {
  try {
    let url = "https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=" + encodeURIComponent(query) + "&maxEntries=1";
    let response = await axios.get(url);
    
    // Explicitly check properties instead of optional chaining
    if (response.data !== undefined && response.data.approximateGroup !== undefined) {
      if (response.data.approximateGroup.candidate !== undefined) {
        
        let candidates = response.data.approximateGroup.candidate;
        let validCandidateName = null;

        // Try to find the candidate with a name property, usually source: "RXNORM"
        for (let i = 0; i < candidates.length; i++) {
          if (candidates[i].name !== undefined && candidates[i].name !== null) {
            validCandidateName = candidates[i].name;
            break; // Stop looking once we found one
          }
        }
        
        // Fallback to the first one if we didn't find one with a name
        if (validCandidateName === null && candidates.length > 0) {
           if (candidates[0].name !== undefined) {
             validCandidateName = candidates[0].name;
           }
        }

        if (validCandidateName !== null) {
          return validCandidateName;
        }
      }
    }
    
    // Fallback to original query if no standard name found
    return query;
  } catch (error) {
    console.error('RxNorm API Error:', error);
    return query; // Fallback to original query on error
  }
}

/**
 * Simulate backend API: /medicine?name=...
 * Fetches multiple results and filters for exact matches.
 * @param {string} query User inputted medicine name
 * @returns {Object} { exact: boolean, results: Array, standardName: string, source: string }
 */
export async function searchMedicine(query) {
  let lowerQuery = query.toLowerCase();

  // 1. Search Local Database First
  let localMatches = [];
  
  for (let i = 0; i < localDb.length; i++) {
    let drug = localDb[i];
    let isMatch = false;

    // Check if name matches (partial or exact)
    if (drug.name.toLowerCase().includes(lowerQuery)) {
      isMatch = true;
    }

    // Check if generic name matches
    if (drug.genericName.toLowerCase().includes(lowerQuery)) {
      isMatch = true;
    }

    if (isMatch === true) {
      localMatches.push(drug);
    }
  }

  // If we found any local matches, return them immediately
  if (localMatches.length > 0) {
    // See if any of them are an EXACT match
    let exactMatches = [];
    for (let i = 0; i < localMatches.length; i++) {
      let drug = localMatches[i];
      if (drug.name.toLowerCase() === lowerQuery || drug.genericName.toLowerCase() === lowerQuery) {
        exactMatches.push(drug);
      }
    }

    if (exactMatches.length > 0) {
      return { exact: true, results: exactMatches, standardName: exactMatches[0].name, source: "local" };
    } else {
      return { exact: false, results: localMatches, standardName: localMatches[0].name, source: "local" };
    }
  }

  // 2. If no local match, proceed to external APIs
  let standardName = await standardizeMedicineName(query);
  
  let searchName = query;
  if (standardName !== "" && standardName !== query) {
    searchName = standardName;
  }
  
  try {
    // Fetch up to 10 candidates
    let url = "https://api.fda.gov/drug/label.json?search=" + encodeURIComponent(searchName) + "&limit=10";
    let response = await axios.get(url);
    
    if (response.data !== undefined && response.data.results !== undefined) {
      
      let allResults = response.data.results;
      let validResults = [];

      // Filter out entries without openfda or generic_name manually
      for (let i = 0; i < allResults.length; i++) {
        let drug = allResults[i];
        if (drug.openfda !== undefined) {
          if (drug.openfda.generic_name !== undefined) {
            if (drug.openfda.generic_name.length > 0) {
              validResults.push(drug);
            }
          }
        }
      }
      
      if (validResults.length === 0) {
        return { exact: false, results: [], standardName: standardName, source: "external" };
      }

      // Check for exact match (case-insensitive)
      let lowerStandard = searchName.toLowerCase();
      let exactMatches = [];
      
      for (let i = 0; i < validResults.length; i++) {
        let drug = validResults[i];
        let brands = [];
        let generics = [];

        if (drug.openfda.brand_name !== undefined) {
          brands = drug.openfda.brand_name;
        }
        
        if (drug.openfda.generic_name !== undefined) {
          generics = drug.openfda.generic_name;
        }
        
        let isMatch = false;

        // Check if any brand name matches
        for (let j = 0; j < brands.length; j++) {
          let brandLower = brands[j].toLowerCase();
          if (brandLower === lowerQuery || brandLower === lowerStandard) {
            isMatch = true;
          }
        }

        // Check if any generic name matches
        for (let j = 0; j < generics.length; j++) {
          let genericLower = generics[j].toLowerCase();
          if (genericLower === lowerQuery || genericLower === lowerStandard) {
            isMatch = true;
          }
        }

        if (isMatch === true) {
          exactMatches.push(drug);
        }
      }
      
      if (exactMatches.length > 0) {
        // Return only the exact matches
        return { exact: true, results: exactMatches, standardName: standardName, source: "external" };
      } else {
        // If no exact match, return the closest matches
        return { exact: false, results: validResults, standardName: standardName, source: "external" };
      }
    }
    
    return { exact: false, results: [], standardName: standardName, source: "external" };
  } catch (error) {
    if (error.response !== undefined && error.response.status === 404) {
      return { exact: false, results: [], standardName: standardName, source: "external" };
    }
    throw error;
  }
}
