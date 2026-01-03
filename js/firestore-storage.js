/**
 * Firebase Storage Image Upload
 * Handles image uploads to Firebase Storage
 */

// Check if Firebase Storage is available (make it globally available)
window.isStorageAvailable = function() {
    return typeof firebase !== 'undefined' && window.firebaseStorage;
};

/**
 * Upload image file to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} productId - Optional product ID (for updates)
 * @param {Function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<string>} - Download URL of uploaded image
 */
async function uploadImageToStorage(file, productId = null, onProgress = null) {
    if (!isStorageAvailable()) {
        throw new Error('Firebase Storage is not available');
    }
    
    if (!file || !(file instanceof File)) {
        throw new Error('Invalid file');
    }
    
    try {
        // Create unique filename
        const timestamp = Date.now();
        const fileName = productId 
            ? `products/${productId}_${timestamp}_${file.name}`
            : `products/${timestamp}_${file.name}`;
        
        // Create storage reference
        const storageRef = window.firebaseStorage.ref();
        const imageRef = storageRef.child(fileName);
        
        // Upload file
        const uploadTask = imageRef.put(file);
        
        // Monitor upload progress
        if (onProgress) {
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(progress);
                },
                (error) => {
                    console.error('Upload error:', error);
                    throw error;
                }
            );
        }
        
        // Wait for upload to complete
        await uploadTask;
        
        // Get download URL
        const downloadURL = await imageRef.getDownloadURL();
        
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image to Firebase Storage:', error);
        throw error;
    }
}

/**
 * Delete image from Firebase Storage
 * @param {string} imageUrl - The download URL of the image to delete
 * @returns {Promise<boolean>}
 */
async function deleteImageFromStorage(imageUrl) {
    if (!isStorageAvailable()) {
        return false;
    }
    
    if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
        // Not a Firebase Storage URL, skip deletion
        return false;
    }
    
    try {
        // Extract path from URL
        const url = new URL(imageUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
        if (!pathMatch) {
            return false;
        }
        
        const decodedPath = decodeURIComponent(pathMatch[1]);
        const imageRef = window.firebaseStorage.ref().child(decodedPath);
        
        await imageRef.delete();
        return true;
    } catch (error) {
        console.error('Error deleting image from Firebase Storage:', error);
        return false;
    }
}

/**
 * Validate image file
 * @param {File} file
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateImageFile(file) {
    if (!file) {
        return { valid: false, error: 'No file selected' };
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP image.' };
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return { valid: false, error: 'File size too large. Maximum size is 5MB.' };
    }
    
    return { valid: true };
}

/**
 * Convert file to base64 (fallback)
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

