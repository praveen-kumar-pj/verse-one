/**
 * Shopping Cart Management
 */

/**
 * Get cart from localStorage
 * @returns {Array} - Array of cart items {productId, quantity}
 */
function getCart() {
    const cartJson = localStorage.getItem('cart');
    if (!cartJson) return [];
    
    try {
        return JSON.parse(cartJson);
    } catch (e) {
        console.error('Error parsing cart:', e);
        return [];
    }
}

/**
 * Save cart to localStorage
 * @param {Array} cart
 */
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Add product to cart
 * @param {string} productId
 * @param {number} quantity - Default 1
 */
function addToCart(productId, quantity = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ productId, quantity });
    }
    
    saveCart(cart);
}

/**
 * Remove product from cart
 * @param {string} productId
 */
function removeFromCart(productId) {
    const cart = getCart();
    const filteredCart = cart.filter(item => item.productId !== productId);
    saveCart(filteredCart);
}

/**
 * Update product quantity in cart
 * @param {string} productId
 * @param {number} quantity
 */
function updateCartQuantity(productId, quantity) {
    if (quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const cart = getCart();
    const item = cart.find(item => item.productId === productId);
    
    if (item) {
        item.quantity = quantity;
        saveCart(cart);
    }
}

/**
 * Clear entire cart
 */
function clearCart() {
    saveCart([]);
}

/**
 * Get cart items with product details
 * @returns {Array} - Array of cart items with product information
 */
function getCartItemsWithDetails() {
    const cart = getCart();
    const products = getProducts();
    
    return cart.map(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (!product) return null;
        
        return {
            ...product,
            quantity: cartItem.quantity,
            totalPrice: product.price * cartItem.quantity
        };
    }).filter(item => item !== null);
}

/**
 * Calculate cart total
 * @returns {number}
 */
function getCartTotal() {
    const items = getCartItemsWithDetails();
    return items.reduce((total, item) => total + item.totalPrice, 0);
}

/**
 * Get cart item count
 * @returns {number}
 */
function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}
