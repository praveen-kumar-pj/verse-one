/**
 * Main JavaScript - Common functionality
 */

/**
 * Format price as Indian Rupee
 * @param {number} price
 * @returns {string}
 */
function formatPrice(price) {
    return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Initialize WhatsApp float button
 * @param {string} phoneNumber - WhatsApp number (without +91)
 */
function initWhatsAppFloat(phoneNumber = '8682892798') {
    const whatsappFloat = document.getElementById('whatsapp-float');
    if (!whatsappFloat) return;
    
    // Set click handler
    whatsappFloat.addEventListener('click', function(e) {
        e.preventDefault();
        const message = encodeURIComponent('Hello! I\'m interested in your Bible verse boards. Can you help me?');
        const url = `https://wa.me/91${phoneNumber}?text=${message}`;
        window.open(url, '_blank');
    });
}

/**
 * Show success message
 * @param {string} message
 * @param {HTMLElement} container
 */
function showSuccessMessage(message, container) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-success';
    messageDiv.textContent = message;
    
    container.insertBefore(messageDiv, container.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

/**
 * Show error message
 * @param {string} message
 * @param {HTMLElement} container
 */
function showErrorMessage(message, container) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-error';
    messageDiv.textContent = message;
    
    container.insertBefore(messageDiv, container.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

/**
 * Update cart count in navigation (if element exists)
 */
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const count = getCartItemCount();
        cartCountElement.textContent = count;
        cartCountElement.style.display = count > 0 ? 'inline' : 'none';
    }
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    initWhatsAppFloat();
});
