# Rawhah Booking App Icon Setup Instructions

## Required Icon Files

You need to create these icon files from your existing logo assets:

### 1. Main App Icon: `app-icon.png`
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Content**: Rawhah Booking "JR" logo
- **Background**: White or your brand color #D6D5C9
- **Source**: Use `Original Logo Symbol.png` or `Transparent Logo.png`

### 2. Android Adaptive Icon: `rawhah-adaptive-icon.png`
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparent background
- **Content**: Just the "JR" logo symbol (no background)
- **Padding**: Leave 25% padding around the logo for Android's adaptive icon system
- **Source**: Use `Transparent Logo.png`

## How to Create the Icons

### Option 1: Using Your Existing Files
1. **For app-icon.png**:
   - Take `Original Logo Symbol.png` (105KB file)
   - Resize it to exactly 1024x1024 pixels
   - Ensure the logo is centered
   - Save as `app-icon.png`

2. **For rawhah-adaptive-icon.png**:
   - Take `Transparent Logo.png` (94KB file) 
   - Resize to 1024x1024 pixels
   - Make sure there's transparent padding around the logo
   - The logo should occupy about 50% of the canvas (Android will crop/mask it)
   - Save as `rawhah-adaptive-icon.png`

### Option 2: Quick Setup (Temporary)
If you want to test immediately, you can:
1. Copy `Original Logo Symbol.png` to `app-icon.png`
2. Copy `Transparent Logo.png` to `rawhah-adaptive-icon.png`
3. The system will auto-resize them (may not be optimal quality)

## Icon Specifications

### iOS App Icon Requirements:
- 1024x1024 pixels (App Store)
- 180x180 pixels (iPhone)
- 167x167 pixels (iPad Pro)
- 152x152 pixels (iPad)
- 120x120 pixels (iPhone smaller)

### Android Adaptive Icon Requirements:
- 1024x1024 pixels foreground image
- Transparent background (the system adds the background color)
- Logo should be centered with safe area padding

## What Each Icon Is Used For

- **app-icon.png**: Main iOS app icon, Expo development builds
- **rawhah-adaptive-icon.png**: Android home screen icon (foreground layer)
- **Favicon Original.ico**: Web version favicon (already configured)

## After Creating the Icons

Once you create both icon files, run:
```bash
npx expo start --clear
```

## Expected Result

Your app will have:
- ✅ Professional Rawhah Booking logo as the app icon
- ✅ Consistent branding across iOS and Android
- ✅ Proper adaptive icon behavior on Android
- ✅ High-quality icons at all sizes

## File Locations Summary
```
rawhahbooking-mobile/assets/
├── app-icon.png              (1024x1024 - Main iOS icon)
├── rawhah-adaptive-icon.png  (1024x1024 - Android foreground)
├── rawhah-logo.png           (Splash screen - ✅ Done)
└── Favicon Original.ico      (Web favicon - ✅ Done)
``` 