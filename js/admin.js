/**
 * Admin Dashboard Logic
 */

let editingProductId = null;

/**
 * Load and display all products in admin dashboard
 */
function loadAdminProducts() {
    const products = getProducts();
    const container = document.getElementById('admin-products');
    
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No products yet</h3><p>Add your first verse board using the form above.</p></div>';
        return;
    }
    
    container.innerHTML = products.map(product => {
        const imageSrc = product.imagePath || product.image || '';
        return `
        <div class="admin-product-card" data-product-id="${product.id}">
            <img src="${imageSrc}" alt="${product.title}" class="admin-product-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI0Y1RjFFOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2QjZCNkIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4='">
            <div class="admin-product-details">
                <h3 class="product-title">${escapeHtml(product.title)}</h3>
                <p class="product-verse">${escapeHtml(product.verseText)}</p>
                <p><strong>Category:</strong> ${escapeHtml(product.category || 'N/A')}</p>
                <p><strong>Price:</strong> ${formatPrice(product.price)}</p>
                <p><strong>Description:</strong> ${escapeHtml(product.description || 'N/A')}</p>
            </div>
            <div class="admin-product-actions">
                <button class="btn btn-gold" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteProductConfirm('${product.id}')">Delete</button>
            </div>
        </div>
    `;
    }).join('');
}

// Store uploaded image data
let uploadedImageData = null;

/**
 * Handle image upload preview
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        uploadedImageData = null;
        updateImagePreview(null);
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageData = e.target.result; // Base64 data URL
        updateImagePreview(uploadedImageData);
    };
    reader.readAsDataURL(file);
}

/**
 * Update image preview
 */
function updateImagePreview(imageData) {
    const preview = document.getElementById('image-preview');
    if (!preview) return;
    
    if (imageData) {
        preview.innerHTML = `<img src="${imageData}" alt="Preview">`;
    } else {
        preview.innerHTML = '<div class="image-preview-placeholder">No image selected</div>';
    }
}

/**
 * Handle form submission for adding/editing products
 */
function handleProductFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const imageUrl = formData.get('image');
    
    const productData = {
        title: formData.get('title'),
        verseText: formData.get('verseText'),
        category: formData.get('category'),
        size: formData.get('size'),
        rating: parseInt(formData.get('rating')) || 5,
        price: parseFloat(formData.get('price')),
        description: formData.get('description'),
        image: imageUrl || '', // Keep image URL field for compatibility
        imagePath: uploadedImageData || '', // Store base64 data URL
        reviews: editingProductId ? (getProductById(editingProductId)?.reviews || []) : []
    };
    
    // Use uploaded image if available, otherwise use URL
    if (!productData.imagePath && imageUrl) {
        productData.imagePath = imageUrl;
    }
    
    // Validation
    if (!productData.title || !productData.verseText || !productData.price || !productData.category || !productData.size) {
        alert('Please fill in all required fields (Title, Verse Text, Category, Size, Price)');
        return;
    }
    
    if (editingProductId) {
        // Update existing product - preserve existing image if no new one uploaded
        const existingProduct = getProductById(editingProductId);
        if (!productData.imagePath && existingProduct) {
            productData.imagePath = existingProduct.imagePath || existingProduct.image || '';
        }
        
        const success = updateProduct(editingProductId, productData);
        if (success) {
            showSuccessMessage('Product updated successfully!', document.querySelector('.admin-form').parentElement);
            resetProductForm();
            loadAdminProducts();
        } else {
            alert('Error updating product');
        }
    } else {
        // Add new product
        addProduct(productData);
        showSuccessMessage('Product added successfully!', document.querySelector('.admin-form').parentElement);
        resetProductForm();
        loadAdminProducts();
    }
}

/**
 * Edit product - populate form with product data
 * @param {string} productId
 */
function editProduct(productId) {
    const product = getProductById(productId);
    if (!product) return;
    
    editingProductId = productId;
    uploadedImageData = product.imagePath || product.image || null;
    
    // Populate form
    document.getElementById('product-title').value = product.title || '';
    document.getElementById('product-verse').value = product.verseText || '';
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-size').value = product.size || '';
    document.getElementById('product-rating').value = product.rating || 5;
    document.getElementById('product-price').value = product.price || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-image').value = product.image || '';
    
    // Update image preview
    updateImagePreview(uploadedImageData);
    
    // Update form heading and button
    const formHeading = document.querySelector('.admin-form h2');
    if (formHeading) {
        formHeading.textContent = 'Edit Verse Board';
    }
    
    const submitButton = document.querySelector('.admin-form button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Update Product';
    }
    
    // Scroll to form
    document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Reset product form to add new product
 */
function resetProductForm() {
    editingProductId = null;
    uploadedImageData = null;
    document.getElementById('product-form').reset();
    updateImagePreview(null);
    
    const formHeading = document.querySelector('.admin-form h2');
    if (formHeading) {
        formHeading.textContent = 'Add New Verse Board';
    }
    
    const submitButton = document.querySelector('.admin-form button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Add Product';
    }
}

/**
 * Load and display orders in admin dashboard
 */
function loadOrders() {
    const orders = getOrders();
    const container = document.getElementById('orders-container');
    
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<div class="no-orders"><h3>No orders yet</h3><p>Orders will appear here once customers place them.</p></div>';
        return;
    }
    
    // Group orders by orderId
    const groupedOrders = {};
    orders.forEach(order => {
        if (!groupedOrders[order.orderId]) {
            groupedOrders[order.orderId] = {
                orderId: order.orderId,
                customerName: order.customerName,
                phone: order.phone,
                email: order.email,
                date: order.date,
                items: []
            };
        }
        groupedOrders[order.orderId].items.push(...(order.items || []));
    });
    
    const orderList = Object.values(groupedOrders);
    
    container.innerHTML = `
        <table class="orders-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${orderList.map(order => {
                    const total = order.items.reduce((sum, item) => sum + (item.totalPrice || item.price * item.quantity), 0);
                    const itemCount = order.items.length;
                    const date = new Date(order.date).toLocaleDateString();
                    return `
                        <tr>
                            <td>${order.orderId}</td>
                            <td>${escapeHtml(order.customerName)}</td>
                            <td>${escapeHtml(order.phone)}</td>
                            <td>${escapeHtml(order.email)}</td>
                            <td>${itemCount} item(s)</td>
                            <td>${formatPrice(total)}</td>
                            <td>${date}</td>
                            <td>
                                <button class="btn btn-primary" onclick="downloadOrderCSV('${order.orderId}')" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Download CSV</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Download CSV for a specific order
 * @param {string} orderId
 */
function downloadOrderCSV(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) {
        alert('Order not found');
        return;
    }
    
    // Group items by orderId if needed
    const orderItems = orders.filter(o => o.orderId === orderId).flatMap(o => o.items || []);
    const fullOrder = {
        orderId: order.orderId,
        customerName: order.customerName,
        phone: order.phone,
        email: order.email,
        items: orderItems
    };
    
    const csvContent = generateOrderCSV(fullOrder);
    const filename = `order_${orderId}_${Date.now()}.csv`;
    downloadCSV(csvContent, filename);
}

/**
 * Confirm and delete product
 * @param {string} productId
 */
function deleteProductConfirm(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    const success = deleteProduct(productId);
    if (success) {
        showSuccessMessage('Product deleted successfully!', document.getElementById('admin-products').parentElement);
        loadAdminProducts();
    } else {
        alert('Error deleting product');
    }
}

/**
 * Logout admin
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        logout();
        window.location.href = 'admin-login.html';
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize admin dashboard on load
document.addEventListener('DOMContentLoaded', function() {
    protectAdminPage();
    loadAdminProducts();
    loadOrders();
    
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductFormSubmit);
    }
    
    const resetButton = document.getElementById('reset-form');
    if (resetButton) {
        resetButton.addEventListener('click', function(e) {
            e.preventDefault();
            resetProductForm();
        });
    }
    
    const imageUpload = document.getElementById('product-image-upload');
    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }
});
