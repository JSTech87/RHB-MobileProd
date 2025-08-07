# Rawhah Booking Logo Setup Instructions

## Required Logo File
You need to create a logo image file at: `assets/rawhah-logo.png`

## Logo Specifications
- **File name**: `rawhah-logo.png`
- **Location**: `rawhahbooking-mobile/assets/rawhah-logo.png`
- **Recommended size**: 1284x2778 pixels (iPhone 14 Pro Max resolution)
- **Minimum size**: 1242x2688 pixels (iPhone XS Max resolution)
- **Background**: Transparent PNG or solid #D6D5C9 background
- **Logo content**: The Rawhah Booking "JR" logo (black "J" and red "R" with "Rawhah Booking" text)

## How to Create the Image
1. Take the third image you provided (the Rawhah Booking logo)
2. Create a 1284x2778 pixel image with #D6D5C9 background
3. Center the "JR" logo and "Rawhah Booking" text
4. Save as `rawhah-logo.png` in the assets folder
5. The logo should be large enough to be clearly visible but not too large

## Alternative Approach
If you have the logo as a vector file (SVG, AI, etc.), you can:
1. Export it as a PNG with transparent background
2. The splash screen will automatically center it on the #D6D5C9 background

## After Adding the Logo
Once you add the `rawhah-logo.png` file, run:
```bash
npx expo start --clear
```

This will refresh the app with your new splash screen. 