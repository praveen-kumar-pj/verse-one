# 🔥 Firestore Setup for Products

## What's Been Implemented

✅ **Product sync between Firestore and localStorage**
- Products automatically sync to Firestore when added/updated/deleted
- Products sync from Firestore to localStorage on page load
- localStorage acts as cache/fallback

## Firestore Database Structure

Your products collection in Firestore:

```
products (collection)
  └── {productId} (document)
        ├── title: string
        ├── verseText: string
        ├── category: string
        ├── size: string
        ├── price: number
        ├── description: string
        ├── image: string (URL)
        ├── imagePath: string (URL or base64)
        ├── rating: number (1-5)
        ├── reviews: array
        ├── createdAt: timestamp
        └── updatedAt: timestamp
```

## How It Works

1. **On Page Load:**
   - Checks if Firestore has products
   - If Firestore is empty, migrates from localStorage
   - If Firestore has products, syncs to localStorage

2. **When Adding Product:**
   - Saves to Firestore first
   - Then syncs to localStorage

3. **When Updating Product:**
   - Updates in Firestore first
   - Then updates localStorage

4. **When Deleting Product:**
   - Deletes from Firestore
   - Then deletes from localStorage

## Setup Instructions

### Step 1: Create Firestore Database

1. Go to Firebase Console → **Firestore Database**
2. Click **"Create database"**
3. Start in **Production mode** (we'll add rules next)
4. Choose location (closest to your users)
5. Click **"Enable"**

### Step 2: Add Security Rules (IMPORTANT)

1. Go to **Firestore Database** → **Rules** tab
2. Replace with these rules:

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

### Step 3: Test Product Sync

1. Open your admin panel
2. Add a new product
3. Check Firebase Console → Firestore Database
4. You should see the product in the `products` collection
5. Refresh the page - product should still be there (synced from Firestore)

## Migration

Your existing localStorage products will automatically migrate to Firestore the first time you open the admin panel with Firestore enabled.

## Benefits

✅ **Permanent Storage** - Products saved in cloud
✅ **Multi-device** - Access from any device
✅ **Real-time** - Changes sync instantly
✅ **Backup** - Data safe in Firebase
✅ **Fallback** - Still works with localStorage if Firestore unavailable

## Next Steps

After products are working:
1. ✅ Add Firebase Storage for images (Phase 6)
2. ✅ Migrate orders to Firestore
3. ✅ Deploy to Firebase Hosting

