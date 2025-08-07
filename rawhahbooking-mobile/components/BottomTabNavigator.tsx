import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';

const Tab = createBottomTabNavigator();

// Icon components for tabs
const HomeIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.icon, { backgroundColor: focused ? '#A83442' : '#6c757d' }]} />
);

const SearchIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.icon, { backgroundColor: focused ? '#A83442' : '#6c757d' }]} />
);

const BookingsIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.icon, { backgroundColor: focused ? '#A83442' : '#6c757d' }]} />
);

const NewsIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.icon, { backgroundColor: focused ? '#A83442' : '#6c757d' }]} />
);

const ProfileIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.icon, { backgroundColor: focused ? '#A83442' : '#6c757d' }]} />
);

// Placeholder screens with beige backgrounds
const NewsScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>News</Text>
    <Text style={styles.placeholderText}>Latest travel news and updates</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Profile</Text>
    <Text style={styles.placeholderText}>Manage your profile and settings</Text>
  </View>
);

const BookingsScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Bookings</Text>
    <Text style={styles.placeholderText}>Your booking history will appear here</Text>
  </View>
);

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#e9ecef',
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: 20,
          height: 80,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarActiveTintColor: '#A83442',
        tabBarInactiveTintColor: '#6c757d',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused }) => <SearchIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <BookingsIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{
          tabBarIcon: ({ focused }) => <NewsIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
    borderRadius: 2,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D6D5C9',
    paddingHorizontal: 24,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  placeholderText: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
  },
}); 