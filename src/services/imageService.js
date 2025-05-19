import axios from 'axios';

// Determine API base URL based on environment
let baseURL = '';

// Development environment
if (process.env.NODE_ENV === 'development') {
    baseURL = 'http://localhost:3001/api';
} 
// Production environment
else {
    // Check if we're running on Vercel
    if (process.env.VERCEL_URL) {
        baseURL = `https://${process.env.VERCEL_URL}/api`;
    } 
    // For other production environments
    else {
        baseURL = 'https://thontrangliennhat.com/api';
    }
}

/**
 * Upload a single image for a product
 * @param {number} productId - The ID of the product
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} - The response from the server
 */
export const uploadProductImage = async (productId, imageFile) => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await axios.post(
            `${baseURL}/products/${productId}/image`, 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error uploading product image:', error);
        throw error;
    }
};

/**
 * Delete an image from a product
 * @param {number} productId - The ID of the product
 * @param {string} imageUrl - The URL of the image to delete
 * @returns {Promise<Object>} - The response from the server
 */
export const deleteProductImage = async (productId, imageUrl) => {
    try {
        // Extract just the filename from the URL
        const filename = imageUrl.split('/').pop();
        
        const response = await axios.delete(
            `${baseURL}/products/${productId}/image/${encodeURIComponent(filename)}`
        );
        
        return response.data;
    } catch (error) {
        console.error('Error deleting product image:', error);
        throw error;
    }
}; 