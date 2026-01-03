# 🔥 Firebase Setup Instructions for Verse One

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add Project"**
3. Project name: `verse-one`
4. Disable Google Analytics (optional)
5. Click **"Create Project"**

---

## Step 2: Enable Firebase Authentication

1. In Firebase Console, go to **Authentication** → **Get Started**
2. Click **"Sign-in method"** tab
3. Enable **Email/Password** provider
4. Click **"Save"**

### Create Admin User

1. Go to **Authentication** → **Users** tab
2. Click **"Add user"**
3. Enter:
   - Email: `admin@verseone.com`
   - Password: (create a strong password)
4. Click **"Add user"**

✅ **Save this email and password** - you'll use it to login!

---

## Step 3: Enable Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Start in **Production mode** (we'll add rules later)
3. Choose a location (closest to your users)
4. Click **"Enable"**

---

## Step 4: Enable Firebase Storage

1. Go to **Storage** → **Get Started**
2. Start in **Production mode**
3. Use the same location as Firestore
4. Click **"Done"**

---

## Step 5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Click **Web icon** (`</>`)
4. Register app name: `Verse One Web`
5. **Copy the config object**

It looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "verse-one.firebaseapp.com",
  projectId: "verse-one",
  storageBucket: "verse-one.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Step 6: Update Your Code

1. Open `js/firebase-config.js`
2. Replace the placeholder values with your actual Firebase config
3. Save the file

---

## Step 7: Test Admin Login

1. Open `admin-login.html` in your browser
2. Login with:
   - Email: `admin@verseone.com`
   - Password: (the password you created)
3. You should be redirected to the admin dashboard

---

## 🔒 Security Rules (Add Later)

After testing, we'll add Firestore security rules to protect your data.

---

## ✅ What's Working Now

- ✅ Firebase Authentication (replaces hardcoded login)
- ✅ Secure admin login
- ✅ Session management
- ✅ Fallback to localStorage if Firebase not configured

---

## 🚀 Next Steps

Once Firebase Auth is working:
1. Migrate products to Firestore
2. Add Firebase Storage for images
3. Migrate orders to Firestore
4. Add security rules
5. Deploy to Firebase Hosting

---

## 🆘 Troubleshooting

**"Firebase SDK not loaded"**
- Make sure Firebase scripts are loaded before `firebase-config.js`
- Check browser console for errors

**"Invalid email or password"**
- Make sure you created the admin user in Firebase Console
- Check that Email/Password auth is enabled

**"Permission denied"**
- Security rules need to be configured (we'll do this next)

---

## 📝 Notes

- The code includes **fallback to localStorage** if Firebase is not configured
- This allows you to test locally before setting up Firebase
- Once Firebase is configured, it will automatically use Firebase Auth

