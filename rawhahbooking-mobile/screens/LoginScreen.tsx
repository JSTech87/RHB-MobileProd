import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = () => {
    console.log('Auth action:', isSignUp ? 'Sign Up' : 'Sign In');
    console.log('Form data:', { email, password, firstName, lastName, username, phoneNumber });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D6D5C9" />
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Auth Card */}
          <View style={styles.authCard}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/rawhah-adaptive-icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Title */}
        <Text style={styles.title}>
              {isSignUp ? 'Create your account' : 'Sign in to RawhahBooking'}
        </Text>
        <Text style={styles.subtitle}>
              {isSignUp 
                ? 'Welcome! Please fill in the details to get started.'
                : 'Welcome back! Please sign in to continue'
              }
        </Text>

            {/* Social Login Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={20} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.googleIcon}>G</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Form Fields */}
        <View style={styles.formContainer}>
              {isSignUp && (
                <>
                  {/* Name Row */}
                  <View style={styles.nameRow}>
                    <View style={styles.nameField}>
                      <Text style={styles.fieldLabel}>First name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="First name"
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    <View style={styles.nameField}>
                      <Text style={styles.fieldLabel}>Last name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Last name"
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>

                  {/* Username */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Username</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter username"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </>
              )}

              {/* Email */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  {isSignUp ? 'Email address' : 'Email address or username'}
                </Text>
          <TextInput
            style={styles.input}
                  placeholder={isSignUp ? 'Enter your email address' : 'Enter email or username'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Phone Number - Only for Sign Up */}
              {isSignUp && (
                <View style={styles.fieldContainer}>
                  <View style={styles.phoneHeader}>
                    <Text style={styles.fieldLabel}>Phone number</Text>
                    <Text style={styles.optionalLabel}>Optional</Text>
                  </View>
                  <View style={styles.phoneInput}>
                    <View style={styles.countryCode}>
                      <Text style={styles.countryCodeText}>SA</Text>
                      <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </View>
                    <Text style={styles.phonePrefix}>+966</Text>
                    <TextInput
                      style={styles.phoneNumberInput}
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              )}

              {/* Password */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.passwordContainer}>
          <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
                    secureTextEntry={!showPassword}
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
              </View>

              {/* Use phone toggle - Only for Sign In */}
              {!isSignUp && (
                <TouchableOpacity style={styles.usePhoneButton}>
                  <Text style={styles.usePhoneText}>Use phone</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Continue Button */}
            <TouchableOpacity style={styles.continueButton} onPress={handleAuth}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Switch Auth Mode */}
          <TouchableOpacity
            style={styles.switchContainer}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchText}>
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <Text style={styles.switchTextBold}>
                {isSignUp ? 'Sign in' : 'Sign up'}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D6D5C9',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
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
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  googleIcon: {
    fontSize: 24,
    color: '#EA4335',
    fontWeight: 'bold',
  },
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
  formContainer: {
    width: '100%',
    gap: 16,
  },
  fieldContainer: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    fontSize: 16,
    color: '#111827',
  },
  phoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionalLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  phoneInput: {
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
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countryCodeText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginRight: 4,
  },
  phonePrefix: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginHorizontal: 8,
  },
  phoneNumberInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 4,
  },
  passwordContainer: {
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
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 4,
  },
  passwordToggle: {
    padding: 4,
    marginLeft: 8,
  },
  usePhoneButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  usePhoneText: {
    fontSize: 14,
    color: '#A83442',
    fontWeight: '500',
  },
  continueButton: {
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
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Switch & Footer
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