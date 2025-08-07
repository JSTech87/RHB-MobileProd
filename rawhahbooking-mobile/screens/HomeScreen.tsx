import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>
            Welcome to RawhahBooking!
          </Text>
          
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoLabel}>
              You are signed in as:
            </Text>
            <Text style={styles.userEmail}>
              {user?.email}
            </Text>
          </View>

          <Text style={styles.description}>
            Your mobile booking app is ready! Use the Search tab to find flights and hotels.
          </Text>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutButtonText}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  innerContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
  },
  userInfoContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoLabel: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 16,
  },
  userEmail: {
    color: '#1f2937',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  description: {
    color: '#6b7280',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  signOutButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 