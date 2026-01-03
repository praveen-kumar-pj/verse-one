# 🔍 Debugging Firestore Issues

## Common Issues and Solutions

### Issue: Products not saving to Firestore

**Symptoms:**
- Image uploads successfully
- Product appears in localStorage
- Product does NOT appear in Firestore Database

**Possible Causes:**

1. **Firestore Security Rules blocking writes**
   - Check: Firebase Console → Firestore Database → Rules
   - Solution: Ensure rules allow authenticated writes:
   ```javascript
   match /products/{productId} {
     allow read: if true;
     allow write: if request.auth != null;
   }
   ```

2. **Not logged in as admin**
   - Check: Are you logged in? Check browser console for auth errors
   - Solution: Log in via admin-login.html first

3. **Firestore not initialized**
   - Check: Browser console for "Firebase initialized successfully"
   - Solution: Verify firebase-config.js has correct config

4. **Product ID format issue**
   - Check: Firestore IDs should be 20 characters (auto-generated)
   - Solution: The code now handles this automatically

## Debugging Steps

### Step 1: Check Browser Console

Open browser console (F12) and look for:
- ✅ "Firebase initialized successfully"
- ✅ "Product saved to Firestore with ID: ..."
- ❌ Any red error messages

### Step 2: Check Firestore Rules

1. Go to Firebase Console → Firestore Database → Rules
2. Verify rules match:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /products/{productId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```
3. Click "Publish"

### Step 3: Check Authentication

1. Open admin panel
2. Check if you're logged in
3. If not, log in via admin-login.html
4. Try adding product again

### Step 4: Check Network Tab

1. Open browser DevTools → Network tab
2. Filter by "firestore"
3. Add/update a product
4. Look for:
   - ✅ POST requests to Firestore (success)
   - ❌ 403 Forbidden (rules issue)
   - ❌ 401 Unauthorized (auth issue)

### Step 5: Test Firestore Connection

Open browser console and run:
```javascript
// Check if Firestore is available
console.log('Firestore available:', typeof firebase !== 'undefined' && window.firebaseDb);

// Check if logged in
console.log('Logged in:', firebase.auth().currentUser);

// Try to read products
window.firebaseDb.collection('products').get().then(snap => {
  console.log('Products in Firestore:', snap.size);
  snap.forEach(doc => console.log(doc.id, doc.data()));
});
```

## Error Messages

### "Permission denied"
- **Cause:** Security rules blocking write
- **Fix:** Update Firestore rules to allow authenticated writes

### "Missing or insufficient permissions"
- **Cause:** Not logged in or rules too restrictive
- **Fix:** Log in as admin and check rules

### "Firestore add failed, using localStorage"
- **Cause:** Firestore save failed, falling back to localStorage
- **Fix:** Check console for specific error, verify rules and auth

### "Product saved to localStorage with ID: ..."
- **Cause:** Firestore not available or save failed
- **Fix:** Check if Firestore is enabled and rules are correct

## Quick Fix Checklist

- [ ] Firebase project created
- [ ] Firestore Database enabled
- [ ] Security rules published (allow authenticated writes)
- [ ] Logged in as admin
- [ ] Firebase config correct in firebase-config.js
- [ ] Browser console shows no errors
- [ ] Network tab shows successful Firestore requests

## Still Not Working?

1. **Clear browser cache** and reload
2. **Check Firebase Console** → Firestore Database → Data tab
3. **Try in incognito mode** to rule out cache issues
4. **Check Firebase Console** → Authentication → Users (verify admin user exists)
5. **Review browser console** for specific error messages

