/**
 * Authentication Logic for Verse One Admin
 */

// Admin credentials (fixed)
const ADMIN_CREDENTIALS = {
    username: 'praveen0026kumar',
    password: 'praveen0026kumar'
};

/**
 * Check if admin is logged in
 * @returns {boolean}
 */
function isAdminLoggedIn() {
    const session = localStorage.getItem('adminSession');
    if (!session) return false;
    
    try {
        const sessionData = JSON.parse(session);
        // Check if session is still valid (not expired)
        if (sessionData.expires && new Date() > new Date(sessionData.expires)) {
            logout();
            return false;
        }
        return sessionData.isAdminLoggedIn === true;
    } catch (e) {
        return false;
    }
}

/**
 * Login admin with username and password
 * @param {string} username
 * @param {string} password
 * @returns {boolean} - true if login successful
 */
function login(username, password) {
    if (username === ADMIN_CREDENTIALS.username && 
        password === ADMIN_CREDENTIALS.password) {
        // Create session that expires in 24 hours
        const expires = new Date();
        expires.setHours(expires.getHours() + 24);
        
        const sessionData = {
            isAdminLoggedIn: true,
            expires: expires.toISOString()
        };
        
        localStorage.setItem('adminSession', JSON.stringify(sessionData));
        return true;
    }
    return false;
}

/**
 * Logout admin and clear session
 */
function logout() {
    localStorage.removeItem('adminSession');
}

/**
 * Protect admin page - redirect to login if not authenticated
 */
function protectAdminPage() {
    if (!isAdminLoggedIn()) {
        window.location.href = 'admin-login.html';
    }
}

/**
 * Redirect to admin if already logged in (for login page)
 */
function redirectIfLoggedIn() {
    if (isAdminLoggedIn()) {
        window.location.href = 'admin.html';
    }
}
