# RawhahBooking Mobile App

A React Native mobile application built with Expo and TypeScript for the RawhahBooking platform.

## Features

- 🔐 **Authentication**: Supabase-powered authentication with session persistence
- 🎨 **Styling**: NativeWind for Tailwind CSS support
- 📱 **Cross-platform**: iOS and Android support via Expo
- 🔄 **TypeScript**: Full type safety and better developer experience
- 💾 **Session Persistence**: Automatic session management with AsyncStorage

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Supabase
- **Authentication**: Supabase Auth with AsyncStorage persistence
- **State Management**: React Context API

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

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

2. Update `.env` with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Start the Development Server

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
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── screens/
│   │   └── LoginScreen.tsx      # Login/signup screen
│   └── lib/
│       └── supabase.ts          # Supabase client configuration
├── App.tsx                      # Main app component
├── global.css                   # NativeWind global styles
├── tailwind.config.js           # Tailwind configuration
├── babel.config.js              # Babel configuration
├── metro.config.js              # Metro bundler configuration
├── nativewind-env.d.ts          # NativeWind TypeScript declarations
└── .env                         # Environment variables
```

## Authentication Flow

The app uses Supabase authentication with the following features:

- **Session Persistence**: Sessions are automatically persisted using AsyncStorage
- **Auto-refresh**: Tokens are automatically refreshed
- **Context Provider**: Authentication state is managed globally via React Context
- **Loading States**: Proper loading states during authentication operations

## Styling

The app uses NativeWind for styling, which provides:

- Tailwind CSS classes for React Native components
- Responsive design support
- Custom theme configuration
- Type-safe styling

## Development

### Adding New Screens

1. Create a new screen component in `src/screens/`
2. Use NativeWind classes for styling
3. Import and use the `useAuth` hook for authentication state

### Adding New Features

1. Follow the existing project structure
2. Use TypeScript for type safety
3. Implement proper error handling
4. Add loading states where appropriate

## Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **NativeWind not working**: Ensure babel.config.js includes the NativeWind plugin
3. **TypeScript errors**: Check that nativewind-env.d.ts is included in tsconfig.json

### Environment Variables

Make sure your `.env` file contains the correct Supabase credentials and that the variables are prefixed with `EXPO_PUBLIC_` for client-side access.

## Contributing

1. Follow the existing code style and structure
2. Use TypeScript for all new code
3. Add proper error handling and loading states
4. Test on both iOS and Android platforms

## License

This project is part of the RawhahBooking platform. 