import 'react-native-url-polyfill/auto';
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <HomeScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
