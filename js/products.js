/**
 * Product Management Logic
 */

// Initialize default products if none exist
function initializeProducts() {
    const products = getProducts();
    
    if (products.length === 0) {
        const defaultProducts = [
            {
                id: '1',
                title: 'Psalm 23:1',
                verseText: 'The Lord is my shepherd; I shall not want.',
                category: 'Faith',
                size: '12 x 18 inches',
                price: 1299,
                description: 'A beautiful verse board featuring the comforting words of Psalm 23:1, perfect for your home or as a gift.',
                image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
                imagePath: '',
                rating: 5,
                reviews: [
                    { id: '1', customer: 'Sarah M.', comment: 'Beautiful board, perfect quality and very inspiring.', rating: 5, date: '2024-01-15' },
                    { id: '2', customer: 'John D.', comment: 'Great addition to our living room. Highly recommend!', rating: 5, date: '2024-01-20' }
                ]
            },
            {
                id: '2',
                title: 'Jeremiah 29:11',
                verseText: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
                category: 'Prayer',
                size: '14 x 20 inches',
                price: 1499,
                description: 'An inspiring verse board with Jeremiah 29:11, reminding you of God\'s perfect plans for your life.',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                imagePath: '',
                rating: 5,
                reviews: [
                    { id: '3', customer: 'Maria L.', comment: 'Absolutely love this verse board. The quality is exceptional!', rating: 5, date: '2024-02-01' }
                ]
            },
            {
                id: '3',
                title: 'John 3:16',
                verseText: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
                category: 'Living Room',
                size: '10 x 14 inches',
                price: 999,
                description: 'The most famous verse in the Bible, beautifully displayed on this elegant verse board.',
                image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=400&fit=crop',
                imagePath: '',
                rating: 4,
                reviews: []
            }
        ];
        
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }
}

/**
 * Get all products from localStorage
 * @returns {Array}
 */
function getProducts() {
    const productsJson = localStorage.getItem('products');
    if (!productsJson) return [];
    
    try {
        return JSON.parse(productsJson);
    } catch (e) {
        console.error('Error parsing products:', e);
        return [];
    }
}

/**
 * Get a single product by ID
 * @param {string} id
 * @returns {Object|null}
 */
function getProductById(id) {
    const products = getProducts();
    return products.find(p => p.id === id) || null;
}

/**
 * Save products to localStorage
 * @param {Array} products
 */
function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

/**
 * Add a new product
 * @param {Object} product
 * @returns {Promise<string>|string} - The new product ID
 */
async function addProduct(product) {
    const products = getProducts();
    
    // Try to save to Firestore first
    if (typeof saveProductToFirestore === 'function' && typeof isFirestoreAvailable === 'function' && isFirestoreAvailable()) {
        try {
            const firestoreId = await saveProductToFirestore(product);
            if (firestoreId) {
                // Sync back to localStorage
                const newProduct = { ...product, id: firestoreId };
                products.push(newProduct);
                saveProducts(products);
                console.log('Product saved to Firestore with ID:', firestoreId);
                return firestoreId;
            }
        } catch (error) {
            console.error('Firestore add failed, using localStorage:', error);
            console.error('Firestore error details:', error.message, error.code);
        }
    }
    
    // Fallback to localStorage
    const newId = Date.now().toString();
    const newProduct = {
        ...product,
        id: newId
    };
    
    products.push(newProduct);
    saveProducts(products);
    console.log('Product saved to localStorage with ID:', newId);
    return newId;
}

/**
 * Update an existing product
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<boolean>|boolean} - true if product was found and updated
 */
async function updateProduct(id, updates) {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return false;
    
    // Try to update in Firestore first
    if (typeof updateProductInFirestore === 'function') {
        try {
            const firestoreSuccess = await updateProductInFirestore(id, updates);
            if (firestoreSuccess) {
                // Sync to localStorage
                products[index] = {
                    ...products[index],
                    ...updates,
                    id: id
                };
                saveProducts(products);
                return true;
            }
        } catch (error) {
            console.error('Firestore update failed, using localStorage:', error);
        }
    }
    
    // Fallback to localStorage
    products[index] = {
        ...products[index],
        ...updates,
        id: id // Ensure ID doesn't change
    };
    
    saveProducts(products);
    return true;
}

/**
 * Delete a product
 * @param {string} id
 * @returns {Promise<boolean>|boolean} - true if product was found and deleted
 */
async function deleteProduct(id) {
    const products = getProducts();
    
    // Try to delete from Firestore first
    if (typeof deleteProductFromFirestore === 'function') {
        try {
            await deleteProductFromFirestore(id);
        } catch (error) {
            console.error('Firestore delete failed, using localStorage:', error);
        }
    }
    
    // Delete from localStorage
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) {
        return false; // Product not found
    }
    
    saveProducts(filteredProducts);
    return true;
}

// Initialize products on load
initializeProducts();

// Initialize Firestore sync if available (will run after Firebase loads)
if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
        setTimeout(async () => {
            if (typeof initializeProductSync === 'function') {
                await initializeProductSync();
            }
        }, 1000); // Wait for Firebase to initialize
    });
}
