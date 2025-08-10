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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export const AdminLoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requireTwoFactor, setRequireTwoFactor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    
    // Simulate authentication process
    setTimeout(() => {
      if (email.includes('admin')) {
        if (!requireTwoFactor) {
          setRequireTwoFactor(true);
          setIsLoading(false);
          Alert.alert('2FA Required', 'Please enter your 2FA code to continue');
        } else {
          if (twoFactorCode.length === 6) {
            console.log('Admin login successful');
            // Navigate to admin dashboard
            setIsLoading(false);
          } else {
            Alert.alert('Error', 'Please enter a valid 6-digit 2FA code');
            setIsLoading(false);
          }
        }
      } else {
        Alert.alert('Error', 'Invalid admin credentials');
        setIsLoading(false);
      }
    }, 1500);
  };

  const resetForm = () => {
    setRequireTwoFactor(false);
    setTwoFactorCode('');
    setEmail('');
    setPassword('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/rawhah-adaptive-icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Admin Portal</Text>
            <Text style={styles.subtitle}>
              {requireTwoFactor 
                ? 'Enter your 2FA authentication code'
                : 'Secure access to RawhahBooking administration'
              }
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <MaterialIcons 
                  name={requireTwoFactor ? "security" : "admin-panel-settings"} 
                  size={32} 
                  color="#DC2626" 
                />
              </View>
              <Text style={styles.cardTitle}>
                {requireTwoFactor ? 'Two-Factor Authentication' : 'Administrator Login'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {requireTwoFactor 
                  ? 'Check your authenticator app for the 6-digit code'
                  : 'Enter your administrator credentials'
                }
              </Text>
            </View>

            <View style={styles.formContainer}>
              {!requireTwoFactor ? (
                <>
                  {/* Email Field */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Admin Email</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="admin@rawhahbooking.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>

                  {/* Password Field */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Password</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
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
                </>
              ) : (
                <>
                  {/* 2FA Code Field */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Authentication Code</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="shield-checkmark-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="000000"
                        value={twoFactorCode}
                        onChangeText={setTwoFactorCode}
                        keyboardType="number-pad"
                        maxLength={6}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>

                  {/* Back Button */}
                  <TouchableOpacity style={styles.backButton} onPress={resetForm}>
                    <Ionicons name="arrow-back" size={16} color="#6B7280" />
                    <Text style={styles.backButtonText}>Back to Login</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Login Button */}
              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonLoading]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <View style={styles.loadingSpinner} />
                    <Text style={styles.loginButtonText}>Authenticating...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>
                      {requireTwoFactor ? 'Verify & Login' : 'Login to Admin Portal'}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.securityText}>
                This is a secure admin portal. All access is monitored and logged.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Need help? Contact IT Support
            </Text>
            <TouchableOpacity style={styles.supportButton}>
              <Text style={styles.supportButtonText}>support@rawhahbooking.com</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 10,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  
  // Login Card
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
    marginBottom: 32,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#FECACA',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  
  // Form
  formContainer: {
    width: '100%',
    gap: 20,
  },
  fieldContainer: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 60,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  passwordToggle: {
    padding: 4,
    marginLeft: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Login Button
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 18,
    marginTop: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    gap: 8,
  },
  loginButtonLoading: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderRadius: 10,
  },
  
  // Security Notice
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    marginTop: 24,
    gap: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    lineHeight: 16,
  },
  
  // Footer
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  supportButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  supportButtonText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
}); 