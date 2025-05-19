/**
 * Utility to clear all experience-related cache data
 * This can be called when experiences need to be refreshed from the server
 */

export const clearExperienceCache = () => {
    try {
        // Clear experience-related items from sessionStorage
        const keysToRemove = [];
        
        // Find all experience-related keys in sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (
                key.startsWith('experience_') || 
                key === 'allExperiences' || 
                key.startsWith('experiencePagination_') ||
                key.startsWith('experienceByCategory_')
            )) {
                keysToRemove.push(key);
            }
        }
        
        // Remove all found keys
        keysToRemove.forEach(key => {
            sessionStorage.removeItem(key);
        });
        
        console.log(`Cleared ${keysToRemove.length} experience cache entries`);
        return true;
    } catch (error) {
        console.error('Error clearing experience cache:', error);
        return false;
    }
};

/**
 * Utility to clear all category-related cache data
 * This can be called when categories need to be refreshed from the server
 */
export const clearCategoryCache = () => {
    try {
        // Clear category-related items from sessionStorage
        const keysToRemove = [];
        
        // Find all category-related keys in sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (
                key.startsWith('category_') || 
                key === 'categories' || 
                key.startsWith('categoriesByType_') ||
                key.startsWith('categoriesBySlug_')
            )) {
                keysToRemove.push(key);
            }
        }
        
        // Remove all found keys
        keysToRemove.forEach(key => {
            sessionStorage.removeItem(key);
        });
        
        console.log(`Cleared ${keysToRemove.length} category cache entries`);
        return true;
    } catch (error) {
        console.error('Error clearing category cache:', error);
        return false;
    }
};

export default clearExperienceCache; 