/**
 * Firestore Order Management
 * Syncs orders between Firestore and localStorage
 */

// Check if Firebase Firestore is available (reuse existing function from firestore-products.js)
// Use window.isFirestoreAvailable if available, otherwise define it
if (typeof window.isFirestoreAvailable === 'undefined') {
    window.isFirestoreAvailable = function() {
        return typeof firebase !== 'undefined' && window.firebaseDb;
    };
}

/**
 * Get all orders from Firestore
 * @returns {Promise<Array>}
 */
async function getOrdersFromFirestore() {
    if (!isFirestoreAvailable()) {
        return [];
    }
    
    try {
        const snapshot = await window.firebaseDb.collection('orders')
            .orderBy('date', 'desc')
            .get();
        const orders = [];
        
        snapshot.forEach(doc => {
            orders.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return orders;
    } catch (error) {
        console.error('Error fetching orders from Firestore:', error);
        return [];
    }
}

/**
 * Save order to Firestore
 * @param {Object} orderData
 * @returns {Promise<string>} - Order ID
 */
async function saveOrderToFirestore(orderData) {
    if (!isFirestoreAvailable()) {
        return null;
    }
    
    try {
        const orderDoc = {
            orderId: orderData.orderId || orderData.id || '',
            customerName: orderData.customerName || '',
            phone: orderData.phone || '',
            email: orderData.email || '',
            address: orderData.address || '',
            items: orderData.items || [],
            total: orderData.total || 0,
            date: orderData.date || new Date().toISOString(),
            status: orderData.status || 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Add order to Firestore
        const docRef = await window.firebaseDb.collection('orders').add(orderDoc);
        console.log('Order saved to Firestore with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error saving order to Firestore:', error);
        return null;
    }
}

/**
 * Update order status in Firestore
 * @param {string} orderId
 * @param {string} status
 * @returns {Promise<boolean>}
 */
async function updateOrderStatusInFirestore(orderId, status) {
    if (!isFirestoreAvailable()) {
        return false;
    }
    
    try {
        await window.firebaseDb.collection('orders').doc(orderId).update({
            status: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Order status updated in Firestore:', orderId, status);
        return true;
    } catch (error) {
        console.error('Error updating order status in Firestore:', error);
        return false;
    }
}

/**
 * Sync orders from Firestore to localStorage
 * @returns {Promise<void>}
 */
async function syncOrdersFromFirestore() {
    if (!isFirestoreAvailable()) {
        return;
    }
    
    try {
        const firestoreOrders = await getOrdersFromFirestore();
        if (firestoreOrders.length > 0) {
            // Update localStorage with Firestore data
            localStorage.setItem('orders', JSON.stringify(firestoreOrders));
            console.log('Orders synced from Firestore to localStorage');
        }
    } catch (error) {
        console.error('Error syncing orders from Firestore:', error);
    }
}

/**
 * Sync orders from localStorage to Firestore (migration)
 * @returns {Promise<void>}
 */
async function syncOrdersToFirestore() {
    if (!isFirestoreAvailable()) {
        return;
    }
    
    try {
        const localOrders = getOrders(); // Use existing function from orders.js
        const firestoreOrders = await getOrdersFromFirestore();
        
        // Only sync if Firestore is empty and localStorage has orders
        if (firestoreOrders.length === 0 && localOrders.length > 0) {
            console.log('Migrating orders from localStorage to Firestore...');
            
            for (const order of localOrders) {
                await saveOrderToFirestore(order);
            }
            
            console.log(`Migrated ${localOrders.length} orders to Firestore`);
        }
    } catch (error) {
        console.error('Error syncing orders to Firestore:', error);
    }
}

/**
 * Initialize order sync (run on page load)
 * @returns {Promise<void>}
 */
async function initializeOrderSync() {
    if (!isFirestoreAvailable()) {
        return;
    }
    
    try {
        // First, try to migrate localStorage to Firestore if Firestore is empty
        await syncOrdersToFirestore();
        
        // Then sync from Firestore to localStorage to ensure consistency
        await syncOrdersFromFirestore();
    } catch (error) {
        console.error('Error initializing order sync:', error);
    }
}

