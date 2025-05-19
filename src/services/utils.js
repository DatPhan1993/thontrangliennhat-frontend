// Save data to sessionStorage
let categoryNamesCache = {};

export const saveToSessionStorage = (key, data) => {
    try {
        const serializedData = JSON.stringify(data);
        sessionStorage.setItem(key, serializedData);
    } catch (error) {
        console.error('Error saving to sessionStorage:', error);
    }
};

// Get data from sessionStorage
export const getFromSessionStorage = (key) => {
    try {
        const serializedData = sessionStorage.getItem(key);
        return serializedData ? JSON.parse(serializedData) : null;
    } catch (error) {
        console.error('Error getting from sessionStorage:', error);
        return null;
    }
};

// Clear a specific item from sessionStorage
export const clearFromSessionStorage = (key) => {
    try {
        sessionStorage.removeItem(key);
        console.log(`Cache cleared for key: ${key}`);
    } catch (error) {
        console.error('Error clearing sessionStorage item:', error);
    }
};

// Clear all cache related to products
export const clearProductCache = () => {
    try {
        // Remove all product related items
        const allProducts = 'allProducts';
        sessionStorage.removeItem(allProducts);
        
        // Find and remove other product related items
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('product_') || 
                key.startsWith('products_') ||
                key.startsWith('products_category_') ||
                key.startsWith('product_slug_')) {
                sessionStorage.removeItem(key);
            }
        });
        
        console.log('All product cache cleared');
    } catch (error) {
        console.error('Error clearing product cache:', error);
    }
};

// Clear all cache related to experiences
export const clearExperienceCache = () => {
    try {
        // Remove all experience related items
        sessionStorage.removeItem('allExperiences');
        
        // Find and remove other experience related items
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('experience_') || 
                key.startsWith('experiences_') ||
                key.startsWith('experiencePagination_') ||
                key.startsWith('experienceByCategory_')) {
                sessionStorage.removeItem(key);
            }
        });
        
        console.log('All experience cache cleared');
    } catch (error) {
        console.error('Error clearing experience cache:', error);
    }
};

// Clear all cache related to categories
export const clearCategoryCache = () => {
    try {
        // Remove all category related items
        sessionStorage.removeItem('categories');
        
        // Clear in-memory category names cache if it exists in this scope
        if (typeof categoryNamesCache !== 'undefined') {
            categoryNamesCache = {};
        }
        
        // Find and remove other category related items
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('category_') || 
                key.startsWith('categories_') ||
                key.startsWith('categoriesByType_')) {
                sessionStorage.removeItem(key);
            }
        });
        
        console.log('All category cache cleared');
    } catch (error) {
        console.error('Error clearing category cache:', error);
    }
};

// Function to refresh all app data after a successful update
export const refreshAppData = async () => {
    try {
        // Clear all session storage
        sessionStorage.clear();
        
        // Force database to resync
        try {
            // Đồng bộ database giữa các thư mục
            const syncResponse = await fetch('/api/sync-database', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                body: JSON.stringify({ timestamp: Date.now() })
            });
            
            const syncResult = await syncResponse.json();
            console.log('Database synchronized:', syncResult);
            
            // Kiểm tra database để đảm bảo nó đã được đồng bộ
            const checkResponse = await fetch('/api/check-database', { 
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            const checkResult = await checkResponse.json();
            console.log('Database revalidated:', checkResult);
        } catch (syncError) {
            console.error('Error syncing database:', syncError);
        }
        
        // Use a simple notification if available in the app
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            // Create a custom event to notify components about data refresh
            const refreshEvent = new CustomEvent('app:dataRefresh', {
                detail: { timestamp: Date.now() }
            });
            window.dispatchEvent(refreshEvent);
        }
        
        console.log('Application data refreshed successfully');
        return true;
    } catch (error) {
        console.error('Error refreshing application data:', error);
        return false;
    }
}; 