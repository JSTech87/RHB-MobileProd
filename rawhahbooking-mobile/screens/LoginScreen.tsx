import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = () => {
    // Authentication logic will be implemented later
    console.log('Auth action:', isSignUp ? 'Sign Up' : 'Sign In');
    console.log('Email:', email);
    console.log('Password:', password);
    if (isSignUp) {
      console.log('First Name:', firstName);
      console.log('Last Name:', lastName);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D6D5C9" />
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../assets/rawhah-adaptive-icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.brandContainer}>
              <Text style={styles.brandTextBlack}>Rawhah</Text>
              <Text style={styles.brandTextRed}>Booking</Text>
            </View>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {isSignUp 
                ? 'Join thousands of travelers who trust us with their journey'
                : 'Sign in to continue your travel planning'
              }
            </Text>
          </View>

          {/* Auth Card */}
          <View style={styles.authCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={isSignUp ? "person-add-outline" : "log-in-outline"} 
                  size={32} 
                  color="#A83442" 
                />
              </View>
              <Text style={styles.cardTitle}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {isSignUp 
                  ? 'Fill in your details to get started'
                  : 'Enter your credentials to continue'
                }
              </Text>
            </View>

            <View style={styles.formContainer}>
              {isSignUp && (
                <>
                  <View style={styles.nameRow}>
                    <View style={[styles.inputContainer, styles.halfWidth]}>
                      <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    <View style={[styles.inputContainer, styles.halfWidth]}>
                      <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>
                </>
              )}

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>

              {!isSignUp && (
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.authButton}
                onPress={handleAuth}
              >
                <Text style={styles.authButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
                <Ionicons 
                  name={isSignUp ? "person-add-outline" : "arrow-forward-outline"} 
                  size={20} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={20} color="#000000" />
                <Text style={styles.socialButtonText}>Continue with Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Switch Auth Mode */}
          <TouchableOpacity
            style={styles.switchContainer}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchText}>
              {isSignUp 
                ? 'Already have an account? ' 
                : "Don't have an account? "
              }
            </Text>
            <Text style={styles.switchTextBold}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Main Layout
  container: {
    flex: 1,
    backgroundColor: '#D6D5C9', // Beige background
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  
  // Header Section
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextBlack: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  brandTextRed: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#A83442',
  },
  
  // Welcome Section
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  
  // Auth Card
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Form Elements
  formContainer: {
    gap: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 4,
  },
  passwordToggle: {
    padding: 4,
    marginLeft: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#A83442',
    fontWeight: '500',
  },
  
  // Buttons
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A83442',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  authButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Social Buttons
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    gap: 12,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  
  // Switch Auth Mode
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  switchText: {
    fontSize: 16,
    color: '#6B7280',
  },
  switchTextBold: {
    fontSize: 16,
    color: '#A83442',
    fontWeight: '600',
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#A83442',
    fontWeight: '500',
  },
}); 