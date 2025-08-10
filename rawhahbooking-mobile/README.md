# RawhahBooking Mobile App

A professional, production-ready mobile application for flight and hotel booking, built with React Native and Expo.

## ✅ Completed Features

### Core Flight Booking
- **Real Duffel API Integration**: Complete implementation using Duffel API v2
- **Flight Search**: Multi-city, round-trip, and one-way flight searches
- **Flight Results**: Advanced filtering, sorting, and real-time data
- **Flight Checkout**: Multi-step booking process with passenger management
- **Airport Search**: Real-time airport search with Duffel API

### User Management & Family System
- **Profile Management**: Edit profile, change pictures, manage preferences
- **Family Management**: Add, edit, and manage family members
- **Travel Documents**: Passport and visa management
- **Authentication**: Secure user registration and login

### Professional UI/UX
- **Modern Design**: Clean, professional interface with Islamic calendar integration
- **Responsive Layout**: Optimized for various screen sizes
- **Smooth Navigation**: React Navigation with proper stack management
- **Loading States**: Professional loading indicators and error handling

### Data Management
- **Local Caching**: Efficient data caching with AsyncStorage
- **Offline Support**: Basic offline capabilities for cached data
- **Real-time Updates**: Live flight data from Duffel API

## 🔧 Technical Implementation

### Duffel API Integration
```javascript
// Custom fetch-based wrapper for React Native compatibility
import DuffelApiService from './services/duffelApi';

// Search flights
const offers = await DuffelApiService.searchOffers({
  cabin_class: 'economy',
  passengers: [{ type: 'adult' }],
  slices: [{
    origin: 'LHR',
    destination: 'JFK',
    departure_date: '2024-12-25'
  }]
});
```

### Key Services
- **`services/duffelApi.ts`**: Direct Duffel API v2 integration
- **`services/authService.ts`**: User authentication and management
- **`services/databaseService.ts`**: Local data persistence
- **`services/backendApi.ts`**: Backend API client (for production)

### Architecture
- **React Native + Expo**: Cross-platform mobile development
- **TypeScript**: Type safety and better development experience
- **React Navigation**: Screen navigation and routing
- **AsyncStorage**: Local data persistence
- **Fetch API**: HTTP requests (Node.js-free for React Native)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Duffel API test account

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy and edit .env file
   cp .env.example .env
   ```

4. Add your Duffel API test token:
   ```bash
   EXPO_PUBLIC_DUFFEL_API_TOKEN=your_test_token_here
   ```

5. Start the development server:
   ```bash
   npm start
   ```

### Duffel API Setup
1. Sign up at [Duffel](https://app.duffel.com/)
2. Get your test API token
3. Add it to your `.env` file
4. Test connection in the app

## 📱 Key Screens

### Flight Search (`SearchScreen.tsx`)
- Professional search interface with Islamic calendar
- Real-time airport search
- Multi-city and round-trip support
- Passenger and class selection

### Flight Results (`FlightResultsScreen.tsx`)
- Real Duffel API data display
- Advanced filtering (price, duration, airlines, stops)
- Sorting options (price, duration, departure time)
- Professional flight cards with airline info

### Flight Checkout (`FlightCheckoutScreen.tsx`)
- Multi-step booking process
- Family member integration
- Passenger information collection
- Payment processing preparation

### Profile Management (`ProfileScreen.tsx`)
- User profile editing
- Family member management
- Travel document handling
- Settings and preferences

## 🔐 Security & Production

### API Security
- **Test Tokens Only**: Client-side uses test tokens only
- **Backend Proxy**: Production should proxy sensitive API calls
- **Environment Variables**: Secure token management
- **Error Handling**: Comprehensive error management

### Production Checklist
- [ ] Move Duffel API calls to secure backend
- [ ] Implement proper authentication
- [ ] Add payment processing
- [ ] Set up push notifications
- [ ] Implement analytics
- [ ] Add crash reporting
- [ ] Performance optimization
- [ ] App store preparation

## 🧪 Testing

The app includes:
- **Connection Testing**: Automatic Duffel API connectivity check
- **Error Handling**: Comprehensive error management
- **Loading States**: Professional loading indicators
- **Offline Support**: Basic offline capabilities

## 📚 API Documentation

### Duffel API v2 Integration
- **Offer Requests**: Create flight searches with immediate results
- **Offers**: Retrieve and display flight options
- **Airports**: Search and display airport information
- **Orders**: Create bookings (backend implementation recommended)

### Custom Services
- **DuffelApiService**: Lightweight fetch-based wrapper
- **AuthService**: User authentication and management
- **DatabaseService**: Local caching and persistence

## 🎯 Next Steps

1. **Backend Development**: Create secure backend API
2. **Payment Integration**: Implement Stripe or similar
3. **Push Notifications**: Real-time booking updates
4. **Analytics**: User behavior tracking
5. **Testing**: Comprehensive test suite
6. **App Store**: Deployment and distribution

## 📄 License

This project is proprietary and confidential. 