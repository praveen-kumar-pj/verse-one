/**
 * Order Management Logic
 */

/**
 * Get all orders from localStorage
 * @returns {Array}
 */
function getOrders() {
    const ordersJson = localStorage.getItem('orders');
    if (!ordersJson) return [];
    
    try {
        return JSON.parse(ordersJson);
    } catch (e) {
        console.error('Error parsing orders:', e);
        return [];
    }
}

/**
 * Save orders to localStorage
 * @param {Array} orders
 */
function saveOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

/**
 * Add a new order
 * @param {Object} orderData
 * @returns {string} - The new order ID
 */
function addOrder(orderData) {
    const orders = getOrders();
    // Get highest order ID or start from 001
    let maxOrderId = 0;
    orders.forEach(order => {
        const id = parseInt(order.orderId);
        if (id > maxOrderId) maxOrderId = id;
    });
    const orderId = String(maxOrderId + 1).padStart(3, '0');
    
    // Save each item as a separate order entry for CSV generation
    orderData.items.forEach(item => {
        const newOrder = {
            orderId: orderId,
            customerName: orderData.customerName,
            phone: orderData.phone,
            email: orderData.email,
            items: [item],
            date: new Date().toISOString()
        };
        orders.push(newOrder);
    });
    
    saveOrders(orders);
    return orderId;
}

/**
 * Generate CSV content from order
 * @param {Object} order - Order object with items array
 * @returns {string}
 */
function generateOrderCSV(order) {
    let csv = 'Order ID,Customer Name,Phone,Email,Product Title,Category,Quantity,Price,Total\n';
    
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            csv += `${order.orderId},${order.customerName},${order.phone},${order.email},"${item.title}","${item.category || 'N/A'}",${item.quantity},${item.price},${item.totalPrice}\n`;
        });
    }
    
    return csv;
}

/**
 * Download CSV file
 * @param {string} csvContent
 * @param {string} filename
 */
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

