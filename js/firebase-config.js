/**
 * Firebase Configuration for Verse One
 * 
 * INSTRUCTIONS:
 * 1. Go to Firebase Console: https://console.firebase.google.com
 * 2. Create a new project named "verse-one"
 * 3. Go to Project Settings → General → Your apps
 * 4. Add a web app and copy the config
 * 5. Replace the values below with your actual Firebase config
 */

// TODO: Replace with your actual Firebase config from Firebase Console


const firebaseConfig = {
    apiKey: "AIzaSyDR_QvAY1IRST60wHqjeGSTztW-xnhwdWc",
    authDomain: "verse-one-2f640.firebaseapp.com",
    projectId: "verse-one-2f640",
    storageBucket: "verse-one-2f640.firebasestorage.app",
    messagingSenderId: "833794267998",
    appId: "1:833794267998:web:e35428b56850df26d2cdcf",
    measurementId: "G-YN4441JCHS"
  };

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    
    // Initialize Firebase services
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();
    
    // Make available globally
    window.firebaseAuth = auth;
    window.firebaseDb = db;
    window.firebaseStorage = storage;
    
    console.log('Firebase initialized successfully');
} else {
    console.error('Firebase SDK not loaded. Make sure Firebase scripts are included before this file.');
}

