import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <View className="w-full max-w-sm space-y-6">
        <Text className="text-3xl font-bold text-center text-gray-800">
          Welcome to RawhahBooking!
        </Text>
        
        <View className="bg-gray-50 p-4 rounded-lg">
          <Text className="text-gray-600 text-center mb-2">
            You are signed in as:
          </Text>
          <Text className="text-gray-800 font-semibold text-center">
            {user?.email}
          </Text>
        </View>

        <Text className="text-gray-600 text-center">
          Your mobile booking app is ready! Start building your features here.
        </Text>

        <TouchableOpacity
          className="w-full py-3 bg-red-600 rounded-lg"
          onPress={handleSignOut}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}; 