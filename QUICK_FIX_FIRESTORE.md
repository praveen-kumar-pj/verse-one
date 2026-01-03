# ⚡ Quick Fix: Create Firestore Database

## Error Message
```
The database (default) does not exist for project verse-one-2f640
```

## Solution: Create Firestore Database

Your Firebase project exists, but you haven't created the Firestore database yet. Here's how to fix it:

### Step 1: Open Firebase Console

Click this link or go to Firebase Console:
**https://console.firebase.google.com/project/verse-one-2f640/firestore**

### Step 2: Create Database

1. You'll see a screen saying "Cloud Firestore"
2. Click the **"Create database"** button

### Step 3: Choose Mode

1. Select **"Start in production mode"** (we'll add rules next)
2. Click **"Next"**

### Step 4: Choose Location

1. Select a location closest to your users
   - **Recommended for India:** `asia-south1` (Mumbai)
   - **Other options:** `asia-south2` (Delhi) or `us-central1`
2. Click **"Enable"**

### Step 5: Wait for Creation

- The database will take about 1-2 minutes to create
- You'll see a loading screen
- Once done, you'll see the Firestore Database interface

### Step 6: Add Security Rules (IMPORTANT)

1. Go to **"Rules"** tab (top of the page)
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products: Anyone can read, only authenticated admins can write
    match /products/{productId} {
      allow read: if true;  // Customers can view products
      allow write: if request.auth != null;  // Only logged-in admins
    }
    
    // Orders: Anyone can create, only admins can read/update
    match /orders/{orderId} {
      allow create: if true;  // Customers can place orders
      allow read, update: if request.auth != null;  // Only admins
    }
  }
}
```

3. Click **"Publish"**

### Step 7: Test

1. Go back to your admin panel
2. Try adding a product
3. Check Firebase Console → Firestore → Data tab
4. Your product should appear!

## Alternative: Direct Link

If the console link doesn't work, go to:
**https://console.cloud.google.com/datastore/setup?project=verse-one-2f640**

Then click "Create Database" and follow the steps above.

---

## That's It!

Once the database is created, the error will disappear and your products will start saving to Firestore automatically.

