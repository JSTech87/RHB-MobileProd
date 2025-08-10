import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { BookingsScreen } from '../screens/BookingsScreen';

const Tab = createBottomTabNavigator();

// Icon components for tabs
const HomeIcon = ({ focused }: { focused: boolean }) => (
  <Ionicons 
    name="home" 
    size={24} 
    color={focused ? '#A83442' : '#6c757d'} 
  />
);

const SearchIcon = ({ focused }: { focused: boolean }) => (
  <Ionicons 
    name="search" 
    size={24} 
    color={focused ? '#A83442' : '#6c757d'} 
  />
);

const BookingsIcon = ({ focused }: { focused: boolean }) => (
  <MaterialIcons 
    name="event" 
    size={24} 
    color={focused ? '#A83442' : '#6c757d'} 
  />
);

const NewsIcon = ({ focused }: { focused: boolean }) => (
  <MaterialIcons 
    name="star" 
    size={24} 
    color={focused ? '#A83442' : '#6c757d'} 
  />
);

const ProfileIcon = ({ focused }: { focused: boolean }) => (
  <Ionicons 
    name="person" 
    size={24} 
    color={focused ? '#A83442' : '#6c757d'} 
  />
);

// Placeholder screens with beige backgrounds
const NewsScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>News</Text>
    <Text style={styles.placeholderText}>Latest travel news and updates</Text>
  </View>
);

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FAFAFA',
          borderTopColor: 'rgba(255, 255, 255, 0.3)',
          borderTopWidth: 1,
          paddingTop: 15,
          paddingBottom: 25,
          height: 90,
          shadowColor: 'rgba(31, 38, 135, 0.2)',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 1,
          shadowRadius: 40,
          elevation: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
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
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
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