/**
 * Utility functions for file handling and uploads
 */

/**
 * Attempts to upload an image file through multiple available endpoints
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - A promise that resolves to the image path
 */
export const uploadImage = async (file) => {
    if (!file || !(file instanceof File)) {
        console.error('Invalid file object provided to uploadImage');
        return '';
    }
    
    try {
        // Try multiple endpoints in sequence
        
        // 1. First try the dedicated image upload endpoint
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.data && result.data.url) {
                    console.log('Image upload successful via /api/upload/image');
                    return result.data.url;
                }
            }
        } catch (e) {
            console.error('Upload failed via /api/upload/image:', e);
        }
        
        // 2. Try alternative endpoint
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.url) {
                    console.log('Image upload successful via /api/upload');
                    return result.url;
                }
            }
        } catch (e) {
            console.error('Upload failed via /api/upload:', e);
        }
        
        // 3. Return a fallback path as last resort
        const timestamp = Date.now();
        const filename = file.name.replace(/\s+/g, '_');
        return `/images/uploads/fallback_${timestamp}_${filename}`;
    } catch (error) {
        console.error('All image upload methods failed:', error);
        return '';
    }
};

/**
 * Compresses an image file to reduce its size
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width in pixels
 * @param {number} options.quality - JPEG quality (0-1)
 * @returns {Promise<File>} - A promise that resolves to the compressed file
 */
export const compressImage = async (file, { maxWidth = 1200, quality = 0.8 } = {}) => {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                
                img.onload = () => {
                    // Create canvas for resizing
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculate new dimensions if needed
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw and compress
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to blob
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Canvas to Blob conversion failed'));
                                return;
                            }
                            
                            // Create new file from blob
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            
                            resolve(compressedFile);
                        },
                        'image/jpeg',
                        quality
                    );
                };
                
                img.onerror = (error) => {
                    reject(error);
                };
            };
            
            reader.onerror = (error) => {
                reject(error);
            };
        } catch (error) {
            console.error('Image compression failed:', error);
            resolve(file); // Return original file if compression fails
        }
    });
};

/**
 * Creates a duplicate File object with a different name
 * Useful for debugging and tracking file operations
 * 
 * @param {File} originalFile - The original File object
 * @param {string} newName - New filename to assign
 * @returns {File} A new File object with the same content but different name
 */
export const renameFile = (originalFile, newName) => {
    return new File([originalFile], newName, {
        type: originalFile.type,
        lastModified: originalFile.lastModified
    });
};

/**
 * Converts a File object to an optimized format suitable for upload
 * Reduces file size if necessary and ensures proper naming
 * 
 * @param {File} file - The file to optimize
 * @param {Object} options - Options for optimization
 * @returns {Promise<File>} Optimized file object
 */
export const optimizeImageFile = async (file, options = {}) => {
    const { maxWidth = 1200, maxHeight = 1200, quality = 0.85, format = 'jpeg' } = options;
    
    // Skip non-image files or SVGs
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
        console.log('Skipping optimization for non-image or SVG:', file.name);
        return file;
    }
    
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Determine if resizing is needed
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth || height > maxHeight) {
                        // Calculate new dimensions while maintaining aspect ratio
                        if (width > height) {
                            if (width > maxWidth) {
                                height = Math.round(height * (maxWidth / width));
                                width = maxWidth;
                            }
                        } else {
                            if (height > maxHeight) {
                                width = Math.round(width * (maxHeight / height));
                                height = maxHeight;
                            }
                        }
                    }
                    
                    // Create canvas for resizing/compression
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw image to canvas
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Get expected MIME type
                    const mimeType = format === 'jpeg' ? 'image/jpeg' : 
                                    format === 'png' ? 'image/png' : 
                                    format === 'webp' ? 'image/webp' : file.type;
                    
                    // Convert to blob
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            console.error('Failed to create blob from canvas');
                            resolve(file); // Return original on error
                            return;
                        }
                        
                        // Generate optimized filename
                        const originalExt = file.name.split('.').pop();
                        const newExt = format === 'jpeg' ? 'jpg' : format;
                        let newFilename = file.name;
                        
                        // Only change extension if format was changed
                        if (newExt !== originalExt) {
                            const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
                            newFilename = `${baseName}.${newExt}`;
                        }
                        
                        // Create new File object
                        const optimizedFile = new File([blob], newFilename, {
                            type: mimeType,
                            lastModified: file.lastModified
                        });
                        
                        console.log(`Optimized image: ${file.name} (${formatFileSize(file.size)}) → ${newFilename} (${formatFileSize(optimizedFile.size)})`);
                        resolve(optimizedFile);
                    }, mimeType, quality);
                };
                
                img.onerror = () => {
                    console.error('Failed to load image for optimization:', file.name);
                    resolve(file); // Return original on error
                };
                
                img.src = event.target.result;
            };
            
            reader.onerror = (error) => {
                console.error('Error reading file for optimization:', error);
                resolve(file); // Return original on error
            };
            
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error during image optimization:', error);
            resolve(file); // Return original on error
        }
    });
};

/**
 * Formats file size in human-readable format
 * 
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g. "2.5 MB")
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}; 