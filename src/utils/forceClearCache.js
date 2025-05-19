/**
 * Utility to forcefully clear all cache related to experiences
 */

// Clear all sessionStorage items related to experiences
export const clearAllExperienceCache = () => {
  console.log('Forcefully clearing all experience caches');
  
  // Clear specific experience cache items
  try {
    // Clear any items with 'experience' in the key
    Object.keys(sessionStorage).forEach(key => {
      if (key.toLowerCase().includes('experience')) {
        console.log(`Clearing cache for ${key}`);
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear our known experience-related keys
    sessionStorage.removeItem('allExperiences');
    sessionStorage.removeItem('featuredExperiences');
    console.log('Cleared all experience session storage items');
    
    // Also clear localStorage if needed
    Object.keys(localStorage).forEach(key => {
      if (key.toLowerCase().includes('experience')) {
        console.log(`Clearing localStorage for ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // Add a cache busting flag
    sessionStorage.setItem('cache_bust_timestamp', Date.now().toString());
    
    return true;
  } catch (error) {
    console.error('Error clearing experience cache:', error);
    return false;
  }
};

// Add this to window to allow calling from browser console for debugging
if (typeof window !== 'undefined') {
  window.forceClearCache = clearAllExperienceCache;
}

export default clearAllExperienceCache; 