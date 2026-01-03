/**
 * Authentication Logic for Verse One Admin
 * Now using Firebase Authentication
 */

// Check if Firebase is available
const isFirebaseAvailable = () => {
    return typeof firebase !== 'undefined' && window.firebaseAuth;
};

/**
 * Check if admin is logged in
 * @returns {Promise<boolean>}
 */
async function isAdminLoggedIn() {
    if (!isFirebaseAvailable()) {
        // Fallback to localStorage if Firebase not available
        const session = localStorage.getItem('adminSession');
        if (!session) return false;
        
        try {
            const sessionData = JSON.parse(session);
            if (sessionData.expires && new Date() > new Date(sessionData.expires)) {
                logout();
                return false;
            }
            return sessionData.isAdminLoggedIn === true;
        } catch (e) {
            return false;
        }
    }
    
    // Use Firebase Auth
    return new Promise((resolve) => {
        window.firebaseAuth.onAuthStateChanged((user) => {
            resolve(!!user);
        });
    });
}

/**
 * Login admin with email and password using Firebase Auth
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function login(email, password) {
    if (!isFirebaseAvailable()) {
        // Fallback to old hardcoded credentials
        const ADMIN_CREDENTIALS = {
            username: 'praveen0026kumar',
            password: 'praveen0026kumar'
        };
        
        // Support both email and username for backward compatibility
        if ((email === ADMIN_CREDENTIALS.username || email === 'admin@verseone.com') && 
            password === ADMIN_CREDENTIALS.password) {
            const expires = new Date();
            expires.setHours(expires.getHours() + 24);
            
            const sessionData = {
                isAdminLoggedIn: true,
                expires: expires.toISOString()
            };
            
            localStorage.setItem('adminSession', JSON.stringify(sessionData));
            return { success: true };
        }
        return { success: false, error: 'Invalid credentials' };
    }
    
    // Use Firebase Auth
    try {
        const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(email, password);
        if (userCredential.user) {
            return { success: true };
        }
        return { success: false, error: 'Login failed' };
    } catch (error) {
        let errorMessage = 'Login failed. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
            default:
                errorMessage = error.message || errorMessage;
        }
        
        return { success: false, error: errorMessage };
    }
}

/**
 * Logout admin and clear session
 */
async function logout() {
    if (isFirebaseAvailable() && window.firebaseAuth.currentUser) {
        try {
            await window.firebaseAuth.signOut();
        } catch (error) {
            console.error('Firebase logout error:', error);
        }
    }
    
    // Clear localStorage fallback
    localStorage.removeItem('adminSession');
}

/**
 * Protect admin page - redirect to login if not authenticated
 */
async function protectAdminPage() {
    const loggedIn = await isAdminLoggedIn();
    if (!loggedIn) {
        window.location.href = 'admin-login.html';
    }
}

/**
 * Redirect to admin if already logged in (for login page)
 */
async function redirectIfLoggedIn() {
    const loggedIn = await isAdminLoggedIn();
    if (loggedIn) {
        window.location.href = 'admin.html';
    }
}

/**
 * Get current user (Firebase)
 * @returns {Object|null}
 */
function getCurrentUser() {
    if (isFirebaseAvailable() && window.firebaseAuth.currentUser) {
        return window.firebaseAuth.currentUser;
    }
    return null;
}
