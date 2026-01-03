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
let uploadedImageFile = null; // Store the actual File object
let uploadedImageUrl = null; // Store Firebase Storage URL

/**
 * Handle image upload preview
 */
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        uploadedImageData = null;
        uploadedImageFile = null;
        uploadedImageUrl = null;
        updateImagePreview(null);
        return;
    }
    
    // Validate file
    if (typeof validateImageFile === 'function') {
        const validation = validateImageFile(file);
        if (!validation.valid) {
            alert(validation.error);
            event.target.value = '';
            return;
        }
    } else {
        // Fallback validation
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            event.target.value = '';
            return;
        }
    }
    
    uploadedImageFile = file;
    
    // Show preview immediately (base64 for preview)
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageData = e.target.result; // Base64 data URL for preview
        updateImagePreview(uploadedImageData);
        
        // Try to upload to Firebase Storage if available
        if (typeof uploadImageToStorage === 'function' && isStorageAvailable()) {
            uploadImageToStorageAsync(file, editingProductId);
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Upload image to Firebase Storage asynchronously
 * @param {File} file
 * @param {string} productId
 */
async function uploadImageToStorageAsync(file, productId = null) {
    if (!isStorageAvailable() || typeof uploadImageToStorage !== 'function') {
        return;
    }
    
    try {
        // Show upload progress
        const preview = document.getElementById('image-preview');
        if (preview) {
            const progressDiv = document.createElement('div');
            progressDiv.id = 'upload-progress';
            progressDiv.style.cssText = 'position: absolute; bottom: 10px; left: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px; border-radius: 4px; font-size: 0.8rem; text-align: center;';
            progressDiv.textContent = 'Uploading...';
            preview.style.position = 'relative';
            preview.appendChild(progressDiv);
        }
        
        // Upload to Firebase Storage
        uploadedImageUrl = await uploadImageToStorage(file, productId, (progress) => {
            const progressDiv = document.getElementById('upload-progress');
            if (progressDiv) {
                progressDiv.textContent = `Uploading... ${Math.round(progress)}%`;
            }
        });
        
        // Remove progress indicator
        const progressDiv = document.getElementById('upload-progress');
        if (progressDiv) {
            progressDiv.remove();
        }
        
        console.log('Image uploaded to Firebase Storage:', uploadedImageUrl);
    } catch (error) {
        console.error('Failed to upload image to Firebase Storage, using base64 fallback:', error);
        // Remove progress indicator
        const progressDiv = document.getElementById('upload-progress');
        if (progressDiv) {
            progressDiv.remove();
        }
        // Will use base64 fallback
    }
}

// isStorageAvailable is defined in firestore-storage.js

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
async function handleProductFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const imageUrl = formData.get('image');
    
    // Determine image URL/Path
    let finalImagePath = '';
    let finalImageUrl = '';
    
    // Priority: Firebase Storage URL > Uploaded base64 > Manual URL > Existing
    if (uploadedImageUrl) {
        // Use Firebase Storage URL (best option)
        finalImagePath = uploadedImageUrl;
        finalImageUrl = uploadedImageUrl;
    } else if (uploadedImageData) {
        // Use base64 data URL (fallback)
        finalImagePath = uploadedImageData;
        finalImageUrl = uploadedImageData;
    } else if (imageUrl) {
        // Use manual URL input
        finalImagePath = imageUrl;
        finalImageUrl = imageUrl;
    } else if (editingProductId) {
        // Preserve existing image when editing
        const existingProduct = getProductById(editingProductId);
        if (existingProduct) {
            finalImagePath = existingProduct.imagePath || existingProduct.image || '';
            finalImageUrl = existingProduct.image || existingProduct.imagePath || '';
        }
    }
    
    const productData = {
        title: formData.get('title'),
        verseText: formData.get('verseText'),
        category: formData.get('category'),
        size: formData.get('size'),
        rating: parseInt(formData.get('rating')) || 5,
        price: parseFloat(formData.get('price')),
        description: formData.get('description'),
        image: finalImageUrl || '',
        imagePath: finalImagePath || '',
        reviews: editingProductId ? (getProductById(editingProductId)?.reviews || []) : []
    };
    
    // Ensure we always have image data if a file was uploaded
    if (uploadedImageFile && !productData.imagePath && !productData.image) {
        // Fallback to base64 if nothing else worked
        if (uploadedImageData) {
            productData.imagePath = uploadedImageData;
            productData.image = uploadedImageData;
            console.log('Using base64 image data as fallback');
        }
    }
    
    // If we have a new file but no Firebase URL yet, upload it now
    if (uploadedImageFile && !uploadedImageUrl && isStorageAvailable() && typeof uploadImageToStorage === 'function') {
        try {
            console.log('Uploading image to Firebase Storage before saving product...');
            // Upload synchronously before saving product
            const tempId = editingProductId || 'temp';
            uploadedImageUrl = await uploadImageToStorage(uploadedImageFile, tempId);
            productData.imagePath = uploadedImageUrl;
            productData.image = uploadedImageUrl;
            console.log('Image uploaded successfully:', uploadedImageUrl);
        } catch (error) {
            console.error('Error uploading image during save:', error);
            // Continue with base64 fallback - ensure we still have the data
            if (uploadedImageData) {
                productData.imagePath = uploadedImageData;
                productData.image = uploadedImageData;
                console.log('Using base64 fallback for image');
            }
        }
    }
    
    // Debug: Log what image data we're saving
    console.log('Saving product with image data:', {
        image: productData.image ? 'Present' : 'Missing',
        imagePath: productData.imagePath ? 'Present' : 'Missing',
        imageLength: productData.image ? productData.image.length : 0
    });
    
    // Validation
    if (!productData.title || !productData.verseText || !productData.price || !productData.category || !productData.size) {
        alert('Please fill in all required fields (Title, Verse Text, Category, Size, Price)');
        return;
    }
    
    if (editingProductId) {
        // If we're updating and have a new image, delete old Firebase Storage image
        const existingProduct = getProductById(editingProductId);
        if (existingProduct && uploadedImageUrl && typeof deleteImageFromStorage === 'function') {
            const oldImageUrl = existingProduct.imagePath || existingProduct.image;
            if (oldImageUrl && oldImageUrl !== uploadedImageUrl && oldImageUrl.includes('firebasestorage.googleapis.com')) {
                // Delete old image asynchronously (don't wait)
                deleteImageFromStorage(oldImageUrl).catch(err => console.error('Error deleting old image:', err));
            }
        }
        
        try {
            const success = await updateProduct(editingProductId, productData);
            if (success) {
                showSuccessMessage('Product updated successfully!', document.querySelector('.admin-form').parentElement);
                resetProductForm();
                loadAdminProducts();
            } else {
                showErrorMessage('Error updating product. Product not found.', document.querySelector('.admin-form').parentElement);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            showErrorMessage('Error updating product. Please try again.', document.querySelector('.admin-form').parentElement);
        }
    } else {
        // Add new product
        try {
            await addProduct(productData);
            showSuccessMessage('Product added successfully!', document.querySelector('.admin-form').parentElement);
            resetProductForm();
            loadAdminProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            console.error('Error details:', error.message, error.code);
            showErrorMessage(`Error adding product: ${error.message || 'Please try again.'}`, document.querySelector('.admin-form').parentElement);
        }
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
    const existingImage = product.imagePath || product.image || '';
    uploadedImageData = existingImage;
    uploadedImageFile = null;
    uploadedImageUrl = (existingImage && existingImage.includes('firebasestorage.googleapis.com')) ? existingImage : null;
    
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
    updateImagePreview(existingImage);
    
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
async function loadOrders() {
    // Sync orders from Firestore if available
    if (typeof syncOrdersFromFirestore === 'function') {
        await syncOrdersFromFirestore();
    }
    
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
async function deleteProductConfirm(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        // Get product to delete associated image
        const product = getProductById(productId);
        
        const success = await deleteProduct(productId);
        if (success) {
            // Delete associated image from Firebase Storage if exists
            if (product && typeof deleteImageFromStorage === 'function') {
                const imageUrl = product.imagePath || product.image;
                if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
                    deleteImageFromStorage(imageUrl).catch(err => console.error('Error deleting product image:', err));
                }
            }
            
            showSuccessMessage('Product deleted successfully!', document.getElementById('admin-products').parentElement);
            loadAdminProducts();
        } else {
            alert('Error deleting product. Product not found.');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
    }
}

/**
 * Logout admin
 */
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        await logout();
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
document.addEventListener('DOMContentLoaded', async function() {
    await protectAdminPage();
    
    // Initialize Firestore sync
    if (typeof initializeProductSync === 'function') {
        await initializeProductSync();
    }
    
    if (typeof initializeOrderSync === 'function') {
        await initializeOrderSync();
    }
    
    loadAdminProducts();
    await loadOrders();
    
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
