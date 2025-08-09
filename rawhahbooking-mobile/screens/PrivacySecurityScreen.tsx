import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const PrivacySecurityScreen: React.FC = () => {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'You will be redirected to change your password securely.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => console.log('Navigate to change password') },
      ]
    );
  };

  const handleSetupTwoFactor = () => {
    Alert.alert(
      'Two-Factor Authentication',
      'Set up 2FA to add an extra layer of security to your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Set Up', onPress: () => console.log('Navigate to 2FA setup') },
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Download Your Data',
      'We will prepare a file with all your data and email it to you within 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request Download', onPress: () => console.log('Request data download') },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'Type "DELETE" to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', style: 'destructive', onPress: () => console.log('Delete account') },
              ]
            );
          }
        },
      ]
    );
  };

  const SecurityItem: React.FC<{
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }> = ({ icon, title, subtitle, onPress, showArrow = true, rightComponent }) => (
    <TouchableOpacity style={styles.securityItem} onPress={onPress}>
      <View style={styles.securityItemLeft}>
        <View style={styles.securityIcon}>
          <Ionicons name={icon as any} size={20} color="#A83442" />
        </View>
        <View style={styles.securityText}>
          <Text style={styles.securityTitle}>{title}</Text>
          <Text style={styles.securitySubtitle}>{subtitle}</Text>
        </View>
      </View>
      {rightComponent || (showArrow && (
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Security */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#A83442" />
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Account Security</Text>
              <Text style={styles.sectionSubtitle}>Protect your account with strong security</Text>
            </View>
          </View>
          
          <View style={styles.securityList}>
            <SecurityItem
              icon="key"
              title="Change Password"
              subtitle="Last changed 3 months ago"
              onPress={handleChangePassword}
            />
            
            <SecurityItem
              icon="phone-portrait"
              title="Two-Factor Authentication"
              subtitle={twoFactorEnabled ? "Enabled via SMS" : "Add extra security to your account"}
              onPress={handleSetupTwoFactor}
              rightComponent={
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={setTwoFactorEnabled}
                  trackColor={{ false: '#E5E7EB', true: '#A8344280' }}
                  thumbColor={twoFactorEnabled ? '#A83442' : '#9CA3AF'}
                />
              }
            />
            
            <SecurityItem
              icon="finger-print"
              title="Biometric Login"
              subtitle="Use Face ID or fingerprint to unlock"
              onPress={() => setBiometricEnabled(!biometricEnabled)}
              rightComponent={
                <Switch
                  value={biometricEnabled}
                  onValueChange={setBiometricEnabled}
                  trackColor={{ false: '#E5E7EB', true: '#A8344280' }}
                  thumbColor={biometricEnabled ? '#A83442' : '#9CA3AF'}
                />
              }
            />
          </View>
        </View>

        {/* Login Activity */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={24} color="#A83442" />
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Login Activity</Text>
              <Text style={styles.sectionSubtitle}>Recent account access</Text>
            </View>
          </View>
          
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="phone-portrait" size={16} color="#10B981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>iPhone 14 Pro</Text>
                <Text style={styles.activitySubtitle}>Chicago, IL • Current session</Text>
                <Text style={styles.activityTime}>Active now</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="desktop" size={16} color="#6B7280" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Chrome on macOS</Text>
                <Text style={styles.activitySubtitle}>Chicago, IL</Text>
                <Text style={styles.activityTime}>2 days ago</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Login Activity</Text>
            <Ionicons name="chevron-forward" size={16} color="#A83442" />
          </TouchableOpacity>
        </View>

        {/* Privacy Settings */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye-off" size={24} color="#A83442" />
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Privacy Settings</Text>
              <Text style={styles.sectionSubtitle}>Control your data and privacy</Text>
            </View>
          </View>
          
          <View style={styles.privacyList}>
            <SecurityItem
              icon="location"
              title="Location Services"
              subtitle="Allow app to access your location for better recommendations"
              onPress={() => setLocationTracking(!locationTracking)}
              rightComponent={
                <Switch
                  value={locationTracking}
                  onValueChange={setLocationTracking}
                  trackColor={{ false: '#E5E7EB', true: '#A8344280' }}
                  thumbColor={locationTracking ? '#A83442' : '#9CA3AF'}
                />
              }
            />
            
            <SecurityItem
              icon="analytics"
              title="Analytics & Crash Reports"
              subtitle="Help improve the app by sharing usage data"
              onPress={() => setAnalyticsEnabled(!analyticsEnabled)}
              rightComponent={
                <Switch
                  value={analyticsEnabled}
                  onValueChange={setAnalyticsEnabled}
                  trackColor={{ false: '#E5E7EB', true: '#A8344280' }}
                  thumbColor={analyticsEnabled ? '#A83442' : '#9CA3AF'}
                />
              }
            />
            
            <SecurityItem
              icon="people"
              title="Data Sharing with Partners"
              subtitle="Share anonymized data with travel partners"
              onPress={() => setDataSharing(!dataSharing)}
              rightComponent={
                <Switch
                  value={dataSharing}
                  onValueChange={setDataSharing}
                  trackColor={{ false: '#E5E7EB', true: '#A8344280' }}
                  thumbColor={dataSharing ? '#A83442' : '#9CA3AF'}
                />
              }
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="folder" size={24} color="#A83442" />
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Data Management</Text>
              <Text style={styles.sectionSubtitle}>Manage your personal data</Text>
            </View>
          </View>
          
          <View style={styles.dataList}>
            <SecurityItem
              icon="download"
              title="Download Your Data"
              subtitle="Get a copy of all your data in JSON format"
              onPress={handleDownloadData}
            />
            
            <SecurityItem
              icon="trash"
              title="Delete Account"
              subtitle="Permanently delete your account and all data"
              onPress={handleDeleteAccount}
            />
          </View>
        </View>

        {/* Legal & Compliance */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={24} color="#A83442" />
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Legal & Compliance</Text>
              <Text style={styles.sectionSubtitle}>Terms, policies, and compliance information</Text>
            </View>
          </View>
          
          <View style={styles.legalList}>
            <SecurityItem
              icon="document"
              title="Privacy Policy"
              subtitle="How we collect and use your data"
              onPress={() => console.log('Open privacy policy')}
            />
            
            <SecurityItem
              icon="document"
              title="Terms of Service"
              subtitle="Terms and conditions for using RawhahBooking"
              onPress={() => console.log('Open terms of service')}
            />
            
            <SecurityItem
              icon="shield"
              title="GDPR Compliance"
              subtitle="Your rights under GDPR"
              onPress={() => console.log('Open GDPR info')}
            />
          </View>
        </View>

        {/* Security Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Security Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={styles.tipText}>• Use a strong, unique password for your account</Text>
            <Text style={styles.tipText}>• Enable two-factor authentication for extra security</Text>
            <Text style={styles.tipText}>• Regularly review your login activity</Text>
            <Text style={styles.tipText}>• Keep your app updated to the latest version</Text>
            <Text style={styles.tipText}>• Never share your login credentials with others</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  securityList: {
    gap: 16,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  securitySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  activityList: {
    gap: 12,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A83442',
  },
  privacyList: {
    gap: 16,
  },
  dataList: {
    gap: 16,
  },
  legalList: {
    gap: 16,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  tipsList: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
}); 