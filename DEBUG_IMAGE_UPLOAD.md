# 🔍 Debugging Image Upload Issues

## Problem
Images are uploaded but not saved to localStorage or Firestore.

## Debugging Steps

### 1. Check Browser Console

Open browser console (F12) and look for these messages when uploading/saving:

**When selecting image:**
- ✅ "Image uploaded to Firebase Storage: [URL]" - Image uploaded successfully
- ❌ "Failed to upload image to Firebase Storage" - Upload failed, using base64

**When saving product:**
- ✅ "Uploading image to Firebase Storage before saving product..."
- ✅ "Image uploaded successfully: [URL]"
- ✅ "Saving product with image data: { image: 'Present', imagePath: 'Present' }"
- ✅ "Saving to Firestore - Image data: { hasImage: true, hasImagePath: true }"
- ✅ "Product saved to Firestore with ID: [ID]"

### 2. Check What's Being Saved

In the console, when you save a product, you should see:
```javascript
Saving product with image data: {
  image: 'Present' or 'Missing',
  imagePath: 'Present' or 'Missing',
  imageLength: [number]
}
```

**If image is 'Missing':**
- Check if image file was selected
- Check if Firebase Storage upload completed
- Check if base64 data exists

### 3. Check Firestore Database

1. Go to Firebase Console → Firestore Database → Data
2. Open a product document
3. Check fields:
   - `image` - Should have URL or base64 data
   - `imagePath` - Should have URL or base64 data

**If fields are empty:**
- Image data wasn't included in productData
- Check console for errors

### 4. Check localStorage

1. Open browser console
2. Run: `JSON.parse(localStorage.getItem('products'))`
3. Find your product
4. Check `image` and `imagePath` fields

**If fields are empty:**
- Product wasn't synced from Firestore
- Or product save failed

## Common Issues

### Issue 1: Image Upload Not Completing

**Symptoms:**
- Console shows "Uploading..." but never completes
- `uploadedImageUrl` remains null

**Solutions:**
- Check Firebase Storage is enabled
- Check Storage security rules allow authenticated writes
- Check browser console for Storage errors
- Verify you're logged in as admin

### Issue 2: Image Not Included in Product Data

**Symptoms:**
- Console shows "image: 'Missing'"
- Product saved but no image fields

**Solutions:**
- Ensure image file is selected
- Check that `uploadedImageData` or `uploadedImageUrl` is set
- Verify form submission happens after image selection

### Issue 3: Image Saved but Not Showing

**Symptoms:**
- Product has image data in Firestore/localStorage
- But image doesn't display

**Solutions:**
- Check image URL is valid (open in new tab)
- Check for CORS errors in console
- Verify image URL format (should start with http:// or https:// or data:)

## Quick Test

1. Open admin panel
2. Open browser console (F12)
3. Select an image file
4. Fill in product form
5. Click "Add Product"
6. Watch console for:
   - Image upload messages
   - Product save messages
   - Any error messages

## Expected Console Output

```
Image uploaded to Firebase Storage: https://firebasestorage.googleapis.com/...
Saving product with image data: { image: 'Present', imagePath: 'Present', imageLength: 123 }
Saving to Firestore - Image data: { hasImage: true, hasImagePath: true, imageType: 'URL' }
Product saved to Firestore with ID: abc123
```

## Still Not Working?

Check:
1. ✅ Firebase Storage enabled
2. ✅ Storage rules allow authenticated writes
3. ✅ Logged in as admin
4. ✅ Browser console shows no errors
5. ✅ Image file is valid (JPEG, PNG, etc.)
6. ✅ Image file size < 5MB

