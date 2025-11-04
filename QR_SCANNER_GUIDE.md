# 📷 QR Code Scanning Feature

## Overview

The Plant Tracker now includes a built-in QR code scanner that allows you to quickly access pot details by scanning the QR code labels on your pots. This is especially useful on mobile devices!

## How to Use

### 1. **Access the QR Scanner**
   - Click the **"Scan"** button (📷 icon) in the top navigation bar
   - The button is available on both desktop and mobile devices

### 2. **Scanning a QR Code**
   - **Allow Camera Access**: The first time you use the scanner, your browser will ask for camera permission
   - **Point and Scan**: Hold your device's camera over the QR code on the pot label
   - **Auto-Detection**: The scanner will automatically detect and process the QR code
   - **Instant Navigation**: Once detected, you'll be automatically redirected to the pot's detail page

### 3. **Manual Entry Alternative**
   - If camera access isn't available or scanning fails
   - Use the manual input field at the bottom of the scanner
   - Enter the pot's QR code ID (e.g., `QR-001`)
   - Click **"Go"** to navigate to the pot details

## Features on Pot Detail Page

Once you scan a QR code or manually enter a pot ID, you'll see:

### ✅ Success Banner
- Green confirmation banner showing "Pot Found!"
- Instant feedback that the scan was successful

### 🌱 Current Plants
- List of all plants currently in the pot
- Quick actions for each plant:
  - **Move Plant**: Navigate to move form with pre-filled source pot
  - **Remove**: Mark the plant as removed from your collection
- Botanical information (genus, species, family)
- Plant size information

### 📊 Pot Information
- QR Code ID
- Location/Room
- Pot Size
- Optional notes

### 🌾 Soil Information
- Current soil mix composition
- Date when plant was first potted

### 📜 Pot History
- Complete history of all plants that have been in this pot
- Timeline of movements

## Browser Compatibility

The QR scanner works best on:
- ✅ **Chrome/Edge** (Desktop & Mobile) - Full support with built-in barcode detection
- ✅ **Safari** (iOS) - Works with camera access
- ✅ **Firefox** (Desktop & Mobile) - Works with camera access
- ⚠️ **Older Browsers**: May require manual QR code entry

## Mobile Tips

📱 **Best Practices for Mobile Scanning:**
1. **Good Lighting**: Ensure the QR code is well-lit
2. **Steady Hand**: Hold your device steady for 1-2 seconds
3. **Right Distance**: Keep the camera 10-20cm from the QR code
4. **Clear Code**: Make sure the QR code isn't damaged or dirty
5. **Manual Fallback**: If scanning fails, use the manual input option

## Privacy & Security

🔒 **Camera Access:**
- Camera access is only used for QR code scanning
- No images are stored or transmitted
- You can revoke camera permissions anytime in your browser settings

## Troubleshooting

### Camera Won't Start
- **Check Permissions**: Ensure you've granted camera access in browser settings
- **HTTPS Required**: Camera access requires a secure connection
- **Use Manual Entry**: Enter the QR code manually as a fallback

### QR Code Not Detected
- **Improve Lighting**: Move to a brighter area
- **Clean the Code**: Wipe the QR code label if it's dirty
- **Try Different Angle**: Adjust the camera angle
- **Manual Entry**: Type the QR code ID manually

### Browser Shows "Camera Not Found"
- **Desktop Users**: Ensure you have a webcam connected
- **Mobile Users**: Check if another app is using the camera
- **Close Scanner**: Exit and try again

## Example Workflow

1. 📷 **Click "Scan" button** in navigation
2. 👁️ **Point camera** at pot's QR code label
3. ✅ **Auto-redirect** to pot detail page
4. 🌱 **View plants** currently in the pot
5. ↔️ **Click "Move Plant"** to relocate a plant
6. ✏️ **Pre-filled form** with source pot information
7. 🎯 **Complete move** by selecting destination pot

## Benefits

- ⚡ **Fast Access**: Instantly view pot details without manual searching
- 📱 **Mobile-Optimized**: Perfect for greenhouse or garden use
- 🔄 **Quick Actions**: Move or remove plants directly from scan results
- 📊 **Complete Info**: All pot and plant information in one place
- 🎯 **Error-Free**: No need to manually type QR codes

## Technical Details

- **Scanner Type**: Browser-based using native Barcode Detection API
- **Fallback**: Manual QR code input for all browsers
- **QR Format**: Supports standard QR codes
- **Camera**: Uses device's rear camera (mobile) or default webcam (desktop)
- **Real-time**: Continuous scanning until code detected
