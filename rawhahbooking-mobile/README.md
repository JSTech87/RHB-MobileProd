# RawhahBooking Mobile App

A React Native mobile application built with Expo and TypeScript for the RawhahBooking platform.

## Features

- 🔐 **Authentication**: Clerk-powered authentication with session management
- 🎨 **Styling**: React Native StyleSheet for consistent design
- 📱 **Cross-platform**: iOS and Android support via Expo
- 🔄 **TypeScript**: Full type safety and better developer experience
- 🧭 **Navigation**: Bottom tab navigation with React Navigation
- ✈️ **Flight Search**: Beautiful flight search interface matching design mockups

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Styling**: React Native StyleSheet
- **Navigation**: React Navigation v6 with bottom tabs
- **Authentication**: Clerk Auth
- **State Management**: React Context API

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- Clerk account and app setup

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Clerk credentials:
   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

### 3. Get Your Clerk Credentials

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Go to **API Keys** in your Clerk dashboard
4. Copy the **Publishable Key**
5. Paste it in your `.env` file

### 4. Start the Development Server

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Project Structure

```
rawhahbooking-mobile/
├── components/
│   └── BottomTabNavigator.tsx   # Bottom tab navigation setup
├── contexts/
│   └── AuthContext.tsx          # Clerk authentication context
├── screens/
│   ├── LoginScreen.tsx          # Login/signup screen
│   ├── HomeScreen.tsx           # Home screen for authenticated users
│   └── SearchScreen.tsx         # Flight/hotel search interface
├── App.tsx                      # Main app component with navigation
├── global.css                   # Global styles
├── tailwind.config.js           # Tailwind configuration (unused currently)
├── babel.config.js              # Babel configuration
├── metro.config.js              # Metro bundler configuration
├── nativewind-env.d.ts          # NativeWind TypeScript declarations (unused currently)
└── .env                         # Environment variables
```

## Screens

### 🏠 **Home Screen**
- Welcome message with user info
- Sign out functionality
- Navigation to other sections

### 🔍 **Search Screen**
- Flight and hotel search tabs
- Trip type selection (One Way, Round Trip, Multi City)
- Location input with swap functionality
- Date picker for departure
- Class and passenger selection
- Beautiful glassmorphism design matching mockups

### 🔐 **Login Screen**
- Email/password authentication via Clerk
- Sign up functionality
- Error handling and loading states

### 📱 **Bottom Navigation**
- Home, Search, Bookings, News, Profile tabs
- Active state indicators
- Consistent with design mockups

## Authentication Flow

The app uses Clerk authentication with the following features:

- **Session Management**: Sessions are automatically managed by Clerk
- **Auto-refresh**: Tokens are automatically refreshed
- **Context Provider**: Authentication state is managed globally via React Context
- **Loading States**: Proper loading states during authentication operations

## Styling

The app uses React Native StyleSheet for styling, which provides:

- Native performance and consistency
- Platform-specific styling capabilities
- Type-safe styling
- Glassmorphism effects matching design mockups

## Development

### Adding New Screens

1. Create a new screen component in `screens/`
2. Use React Native StyleSheet for styling
3. Import and use the `useAuth` hook for authentication state
4. Add to navigation in `BottomTabNavigator.tsx`

### Adding New Features

1. Follow the existing project structure
2. Use TypeScript for type safety
3. Implement proper error handling
4. Add loading states where appropriate
5. Match the glassmorphism design language

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both platforms
eas build --platform all
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **Clerk authentication issues**: Verify your publishable key is correct
3. **TypeScript errors**: Ensure all types are properly imported
4. **Navigation issues**: Ensure React Navigation dependencies are properly installed

### Environment Variables

Make sure your `.env` file contains the correct Clerk publishable key and that the variable is prefixed with `EXPO_PUBLIC_` for client-side access.

### Clerk Setup Issues

1. **"Missing Clerk Publishable Key"**: Ensure your `.env` file has the correct key
2. **Authentication not working**: Check your Clerk dashboard settings
3. **Sign up issues**: Verify your Clerk app allows sign-ups

## Contributing

1. Follow the existing code style and structure
2. Use TypeScript for all new code
3. Add proper error handling and loading states
4. Test on both iOS and Android platforms
5. Match the design mockups and glassmorphism style

## License

This project is part of the RawhahBooking platform. 