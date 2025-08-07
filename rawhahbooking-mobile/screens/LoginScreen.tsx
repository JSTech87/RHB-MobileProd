import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert(
        'Success',
        isSignUp 
          ? 'Account created! Please check your email to verify your account.'
          : 'Successfully signed in!'
      );
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <View className="space-y-6">
        <Text className="text-3xl font-bold text-center text-gray-800">
          RawhahBooking
        </Text>
        
        <Text className="text-xl font-semibold text-center text-gray-600">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>

        <View className="space-y-4">
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            className={`w-full py-3 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setIsSignUp(!isSignUp)}
          className="mt-4"
        >
          <Text className="text-center text-blue-600">
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}; 