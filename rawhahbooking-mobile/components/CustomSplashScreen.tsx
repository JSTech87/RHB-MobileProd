import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const CustomSplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/rawhah-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandText}>RawhahBooking</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D6D5C9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.4, // 40% of screen width
    height: width * 0.4, // Keep it square
    marginBottom: 20,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: 1,
    fontFamily: 'System', // Use system font for consistency
  },
}); 