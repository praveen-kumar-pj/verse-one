/**
 * Firestore Product Management
 * Syncs products between Firestore and localStorage
 */

// Check if Firebase Firestore is available (make it globally available)
window.isFirestoreAvailable = function() {
    return typeof firebase !== 'undefined' && window.firebaseDb;
};

/**
 * Get all products from Firestore
 * @returns {Promise<Array>}
 */
async function getProductsFromFirestore() {
    if (!isFirestoreAvailable()) {
        return [];
    }
    
    try {
        const snapshot = await window.firebaseDb.collection('products').get();
        const products = [];
        
        snapshot.forEach(doc => {
            products.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return products;
    } catch (error) {
        console.error('Error fetching products from Firestore:', error);
        return [];
    }
}

/**
 * Save product to Firestore
 * @param {Object} product
 * @returns {Promise<string>} - Product ID
 */
async function saveProductToFirestore(product) {
    if (!isFirestoreAvailable()) {
        return null;
    }
    
    try {
        const productData = {
            title: product.title,
            verseText: product.verseText,
            category: product.category || '',
            size: product.size || '',
            price: product.price,
            description: product.description || '',
            image: product.image || '',
            imagePath: product.imagePath || product.image || '',
            rating: product.rating || 5,
            reviews: product.reviews || [],
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Debug: Log image data being saved
        console.log('Saving to Firestore - Image data:', {
            hasImage: !!productData.image,
            hasImagePath: !!productData.imagePath,
            imageType: productData.image ? (productData.image.startsWith('http') ? 'URL' : 'base64') : 'none'
        });
        
        if (product.id && product.id.length <= 30) {
            // Update existing product (Firestore IDs are typically 20 chars, but allow up to 30)
            await window.firebaseDb.collection('products').doc(product.id).set(productData, { merge: true });
            return product.id;
        } else {
            // Add new product
            const docRef = await window.firebaseDb.collection('products').add({
                ...productData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        }
    } catch (error) {
        console.error('Error saving product to Firestore:', error);
        return null;
    }
}

/**
 * Update product in Firestore
 * @param {string} productId
 * @param {Object} updates
 * @returns {Promise<boolean>}
 */
async function updateProductInFirestore(productId, updates) {
    if (!isFirestoreAvailable()) {
        return false;
    }
    
    try {
        // Ensure all product fields are included
        const productData = {
            title: updates.title,
            verseText: updates.verseText,
            category: updates.category || '',
            size: updates.size || '',
            price: updates.price,
            description: updates.description || '',
            image: updates.image || '',
            imagePath: updates.imagePath || updates.image || '',
            rating: updates.rating || 5,
            reviews: updates.reviews || [],
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Debug: Log image data being updated
        console.log('Updating in Firestore - Image data:', {
            productId: productId,
            hasImage: !!productData.image,
            hasImagePath: !!productData.imagePath,
            imageType: productData.image ? (productData.image.startsWith('http') ? 'URL' : 'base64') : 'none'
        });
        
        await window.firebaseDb.collection('products').doc(productId).set(productData, { merge: true });
        console.log('Product updated in Firestore:', productId);
        return true;
    } catch (error) {
        console.error('Error updating product in Firestore:', error);
        console.error('Error code:', error.code, 'Error message:', error.message);
        return false;
    }
}

/**
 * Delete product from Firestore
 * @param {string} productId
 * @returns {Promise<boolean>}
 */
async function deleteProductFromFirestore(productId) {
    if (!isFirestoreAvailable()) {
        return false;
    }
    
    try {
        await window.firebaseDb.collection('products').doc(productId).delete();
        return true;
    } catch (error) {
        console.error('Error deleting product from Firestore:', error);
        return false;
    }
}

/**
 * Sync products from Firestore to localStorage
 * @returns {Promise<void>}
 */
async function syncProductsFromFirestore() {
    if (!isFirestoreAvailable()) {
        return;
    }
    
    try {
        const firestoreProducts = await getProductsFromFirestore();
        if (firestoreProducts.length > 0) {
            // Update localStorage with Firestore data
            localStorage.setItem('products', JSON.stringify(firestoreProducts));
            console.log('Products synced from Firestore to localStorage');
        }
    } catch (error) {
        console.error('Error syncing products from Firestore:', error);
    }
}

/**
 * Sync products from localStorage to Firestore (migration)
 * @returns {Promise<void>}
 */
async function syncProductsToFirestore() {
    if (!isFirestoreAvailable()) {
        return;
    }
    
    try {
        const localProducts = getProducts(); // Use existing function from products.js
        const firestoreProducts = await getProductsFromFirestore();
        
        // Only sync if Firestore is empty and localStorage has products
        if (firestoreProducts.length === 0 && localProducts.length > 0) {
            console.log('Migrating products from localStorage to Firestore...');
            
            for (const product of localProducts) {
                await saveProductToFirestore(product);
            }
            
            console.log(`Migrated ${localProducts.length} products to Firestore`);
        }
    } catch (error) {
        console.error('Error syncing products to Firestore:', error);
    }
}

/**
 * Initialize product sync (run on page load)
 * @returns {Promise<void>}
 */
async function initializeProductSync() {
    if (!isFirestoreAvailable()) {
        return;
    }
    
    try {
        // First, try to migrate localStorage to Firestore if Firestore is empty
        await syncProductsToFirestore();
        
        // Then sync from Firestore to localStorage to ensure consistency
        await syncProductsFromFirestore();
    } catch (error) {
        console.error('Error initializing product sync:', error);
    }
}

