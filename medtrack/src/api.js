import axios from 'axios';

/**
 * Standardize medicine name using the RxNorm API
 * @param {string} query User inputted medicine name
 * @returns {string} Standardized name or original query if not found
 */
export const standardizeMedicineName = async (query) => {
  try {
    const response = await axios.get(
      `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=1`
    );
    
    if (response.data?.approximateGroup?.candidate) {
      const candidates = response.data.approximateGroup.candidate;
      // Try to find the candidate with a name property, usually source: "RXNORM"
      const validCandidate = candidates.find(c => c.name) || candidates[0];
      if (validCandidate && validCandidate.name) {
        return validCandidate.name;
      }
    }
    
    // Fallback to original query if no standard name found
    return query;
  } catch (error) {
    console.error('RxNorm API Error:', error);
    return query; // Fallback to original query on error
  }
};

/**
 * Simulate backend API: /medicine?name=...
 * Fetches multiple results and filters for exact matches.
 * @param {string} query User inputted medicine name
 * @returns {Object} { exact: boolean, results: Array, standardName: string }
 */
export const searchMedicine = async (query) => {
  const standardName = await standardizeMedicineName(query);
  const searchName = standardName && standardName !== query ? standardName : query;
  
  try {
    // Fetch up to 10 candidates
    const response = await axios.get(
      `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(searchName)}&limit=10`
    );
    
    if (response.data?.results) {
      // Filter out entries without openfda or generic_name
      const validResults = response.data.results.filter(
        drug => drug.openfda && drug.openfda.generic_name && drug.openfda.generic_name.length > 0
      );
      
      if (validResults.length === 0) {
        return { exact: false, results: [], standardName };
      }

      // Check for exact match (case-insensitive)
      const lowerQuery = query.toLowerCase();
      const lowerStandard = searchName.toLowerCase();
      
      const exactMatches = validResults.filter(drug => {
        const brands = drug.openfda.brand_name || [];
        const generics = drug.openfda.generic_name || [];
        
        return brands.some(b => b.toLowerCase() === lowerQuery || b.toLowerCase() === lowerStandard) ||
               generics.some(g => g.toLowerCase() === lowerQuery || g.toLowerCase() === lowerStandard);
      });
      
      if (exactMatches.length > 0) {
        // Return only the exact matches
        return { exact: true, results: exactMatches, standardName };
      }
      
      // If no exact match, return the closest matches
      return { exact: false, results: validResults, standardName };
    }
    
    return { exact: false, results: [], standardName };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { exact: false, results: [], standardName };
    }
    throw error;
  }
};
