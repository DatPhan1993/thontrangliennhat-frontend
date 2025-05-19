import { useCallback } from 'react';

/**
 * Custom hook for refreshing data and clearing cache
 */
const useDataRefresh = () => {
  /**
   * Clears all session storage cache data related to experiences
   */
  const clearExperienceCache = useCallback(() => {
    // Clear all experiences list
    sessionStorage.removeItem('allExperiences');
    
    // Try to clear all potential experience detail caches
    // We use a loop to clear all possible IDs up to 100 (or any reasonable number)
    for (let i = 1; i <= 100; i++) {
      sessionStorage.removeItem(`experience_${i}`);
    }
    
    // Clear experience pagination caches
    for (let page = 1; page <= 10; page++) {
      for (let limit of [4, 8, 10, 20]) {
        sessionStorage.removeItem(`experiencePagination_page_${page}_limit_${limit}`);
      }
    }
    
    console.log('Experience cache cleared');
  }, []);

  /**
   * Clears session storage for a specific data type
   * @param {string} type - The type of data to clear (e.g., 'news', 'products')
   */
  const clearCacheByType = useCallback((type) => {
    // Get all sessionStorage keys
    const keys = Object.keys(sessionStorage);
    
    // Filter keys that include the specified type
    const keysToRemove = keys.filter(key => key.toLowerCase().includes(type.toLowerCase()));
    
    // Remove all matching keys
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
    });
    
    console.log(`Cleared ${keysToRemove.length} cache entries for ${type}`);
  }, []);

  /**
   * Clears all session storage data
   */
  const clearAllCache = useCallback(() => {
    sessionStorage.clear();
    console.log('All session storage cache cleared');
  }, []);

  return {
    clearExperienceCache,
    clearCacheByType,
    clearAllCache
  };
};

export default useDataRefresh; 