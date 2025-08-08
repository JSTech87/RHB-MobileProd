import 'react-native-url-polyfill/auto';
import './global.css';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import { BottomTabNavigator } from './components/BottomTabNavigator';
import { FlightResultsScreen } from './screens/FlightResultsScreen';
import { HotelInquiryScreen } from './screens/HotelInquiryScreen';
import { CustomSplashScreen } from './components/CustomSplashScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

function AppContent() {
  const { user, loading } = useAuth();
  const [testMode, setTestMode] = React.useState(false);
  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Hide the native splash screen
        await SplashScreen.hideAsync();
        
        // Show our custom splash screen for 2 seconds
        setTimeout(() => {
          setShowCustomSplash(false);
          setAppIsReady(true);
        }, 2000);
      } catch (e) {
        console.warn(e);
        setShowCustomSplash(false);
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Show custom splash screen
  if (showCustomSplash) {
    return <CustomSplashScreen />;
  }

  // Show loading state after splash screen
  if (loading || !appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Test mode bypass for development
  if (testMode || user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen 
            name="FlightResults" 
            component={FlightResultsScreen}
            options={{
              presentation: 'card',
              cardStyle: { backgroundColor: '#D6D5C9' }
            }}
          />
          <Stack.Screen 
            name="HotelInquiry" 
            component={HotelInquiryScreen}
            options={{
              presentation: 'card',
              cardStyle: { backgroundColor: '#D6D5C9' }
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <View style={styles.container}>
      <LoginScreen />
      {/* Temporary test button */}
      <View style={styles.testButtonContainer}>
        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => setTestMode(true)}
        >
          <Text style={styles.testButtonText}>Skip Login (Test Mode)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D6D5C9',
  },
  loadingText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '500',
  },
  testButtonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
  },
  testButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
