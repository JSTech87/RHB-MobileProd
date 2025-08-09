import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { Typography } from '../constants/Typography';

// Import the new screens
import { TravelDocumentsScreen } from './TravelDocumentsScreen';
import { LanguageRegionScreen } from './LanguageRegionScreen';
import { NotificationsScreen } from './NotificationsScreen';
import { PrivacySecurityScreen } from './PrivacySecurityScreen';
import { HelpSupportScreen } from './HelpSupportScreen';
import { FamilyManagementScreen } from './FamilyManagementScreen';
import { AddMemberScreen } from './AddMemberScreen';

const { width } = Dimensions.get('window');

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  dateOfBirth: string;
  passportStatus: 'valid' | 'expiring' | 'expired';
  passportExpiry: string;
  visaStatus: 'valid' | 'expiring' | 'expired' | 'none';
  visaExpiry?: string;
  specialNeeds?: string[];
  profileImage?: string;
  passportNumber: string;
}

interface TravelStats {
  totalTrips: number;
  countries: number;
  upcomingTrips: number;
  documentsExpiring: number;
}

const ProfileScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [currentScreen, setCurrentScreen] = useState<string>('profile');

  // Mock data - in production, this would come from API/Redux
  const userProfile = {
    firstName: 'Irvan',
    lastName: 'Moses',
    email: 'irvan.moses@gmail.com',
    phone: '+1 (555) 123-4567',
    profileImage: null,
    memberSince: '2022-03-15',
  };

  const familyMembers: FamilyMember[] = [
    {
      id: '1',
      name: 'Fatima Moses',
      relationship: 'Spouse',
      age: 32,
      dateOfBirth: '1992-03-15',
      passportStatus: 'valid',
      passportNumber: 'A12345678',
      passportExpiry: '2028-05-20',
      visaStatus: 'valid',
      visaExpiry: '2025-12-31',
      specialNeeds: ['Halal meals', 'Aisle seat'],
    },
    {
      id: '2',
      name: 'Ahmed Moses',
      relationship: 'Son',
      age: 8,
      dateOfBirth: '2016-07-10',
      passportStatus: 'valid',
      passportNumber: 'B87654321',
      passportExpiry: '2027-01-15',
      visaStatus: 'expiring',
      visaExpiry: '2024-03-20',
      specialNeeds: ['Child meal', 'Window seat'],
    },
    {
      id: '3',
      name: 'Aisha Moses',
      relationship: 'Daughter',
      age: 5,
      dateOfBirth: '2019-11-22',
      passportStatus: 'expiring',
      passportNumber: 'C11223344',
      passportExpiry: '2024-04-10',
      visaStatus: 'valid',
      visaExpiry: '2026-08-15',
      specialNeeds: ['Child meal'],
    },
    {
      id: '4',
      name: 'Omar Moses',
      relationship: 'Son',
      age: 2,
      dateOfBirth: '2022-01-05',
      passportStatus: 'valid',
      passportNumber: 'D99887766',
      passportExpiry: '2027-06-30',
      visaStatus: 'none',
      specialNeeds: ['Infant seat', 'Infant meal'],
    },
  ];

  const travelStats: TravelStats = {
    totalTrips: 12,
    countries: 8,
    upcomingTrips: 2,
    documentsExpiring: 3,
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleBookForFamily = () => {
    Alert.alert(
      'Book for Family',
      'Select family members to include in this booking',
      [
        { text: 'All Family (5)', onPress: () => bookWithMembers('all') },
        { text: 'Adults Only (3)', onPress: () => bookWithMembers('adults') },
        { text: 'Custom Selection', onPress: () => showMemberSelection() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const bookWithMembers = (type: 'all' | 'adults' | 'custom') => {
    let members: string[] = [];
    switch (type) {
      case 'all':
        members = ['user', ...familyMembers.map(m => m.id)];
        break;
      case 'adults':
        members = ['user', ...familyMembers.filter(m => m.age >= 18).map(m => m.id)];
        break;
      case 'custom':
        members = selectedMembers;
        break;
    }
    
    Alert.alert('Booking Initiated', `Proceeding with ${members.length} travelers`);
    // Navigate to booking flow with selected members
  };

  const showMemberSelection = () => {
    // In production, this would open a modal or navigate to selection screen
    Alert.alert('Custom Selection', 'Member selection screen would open here');
  };

  const handleAddMember = () => {
    setCurrentScreen('addMember');
  };

  const handleManageFamily = () => {
    setCurrentScreen('familyManagement');
  };

  const handleDocumentAlert = () => {
    const expiringDocs = familyMembers.filter(
      m => m.passportStatus === 'expiring' || m.visaStatus === 'expiring'
    );
    
    Alert.alert(
      'Documents Expiring',
      `${expiringDocs.length} documents need attention:\n${expiringDocs.map(m => `• ${m.name}`).join('\n')}`,
      [
        { text: 'View Details', onPress: () => setCurrentScreen('documents') },
        { text: 'Later', style: 'cancel' },
      ]
    );
  };

  // Navigation handlers for settings screens
  const handleNavigateToDocuments = () => setCurrentScreen('documents');
  const handleNavigateToLanguage = () => setCurrentScreen('language');
  const handleNavigateToNotifications = () => setCurrentScreen('notifications');
  const handleNavigateToPrivacy = () => setCurrentScreen('privacy');
  const handleNavigateToHelp = () => setCurrentScreen('help');
  const handleNavigateToFamilyManagement = () => setCurrentScreen('familyManagement');
  const handleNavigateToAddMember = () => setCurrentScreen('addMember');

  const handleBackToProfile = () => setCurrentScreen('profile');

  // Render different screens based on currentScreen state
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'documents':
        return <TravelDocumentsScreen onBack={handleBackToProfile} />;
      case 'language':
        return <LanguageRegionScreen onBack={handleBackToProfile} />;
      case 'notifications':
        return <NotificationsScreen onBack={handleBackToProfile} />;
      case 'privacy':
        return <PrivacySecurityScreen onBack={handleBackToProfile} />;
      case 'help':
        return <HelpSupportScreen onBack={handleBackToProfile} />;
      case 'familyManagement':
        return <FamilyManagementScreen 
          onBack={handleBackToProfile} 
          onAddMember={handleNavigateToAddMember}
          familyMembers={familyMembers}
        />;
      case 'addMember':
        return <AddMemberScreen onBack={handleBackToProfile} />;
      default:
        return renderProfileScreen();
    }
  };

  const StatusBadge: React.FC<{ status: string; expiry?: string }> = ({ status, expiry }) => {
    const getStatusConfig = () => {
      switch (status) {
        case 'valid':
          return { color: '#10B981', text: 'VALID', bgColor: '#ECFDF5' };
        case 'expiring':
          return { color: '#F59E0B', text: 'EXPIRING', bgColor: '#FFFBEB' };
        case 'expired':
          return { color: '#EF4444', text: 'EXPIRED', bgColor: '#FEF2F2' };
        case 'none':
          return { color: '#6B7280', text: 'N/A', bgColor: '#F9FAFB' };
        default:
          return { color: '#6B7280', text: 'UNKNOWN', bgColor: '#F9FAFB' };
      }
    };

    const config = getStatusConfig();

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.text}
        </Text>
        {expiry && status !== 'none' && (
          <Text style={[styles.expiryText, { color: config.color }]}>
            {expiry}
          </Text>
        )}
      </View>
    );
  };

  const FamilyMemberCard: React.FC<{ member: FamilyMember }> = ({ member }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberInitials}>
            {member.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberDetails}>
            {member.relationship} • {member.age} years old
          </Text>
          <Text style={styles.memberBirth}>
            Born: {new Date(member.dateOfBirth).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.documentStatus}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Passport:</Text>
          <StatusBadge 
            status={member.passportStatus} 
            expiry={member.passportExpiry ? `Exp: ${new Date(member.passportExpiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : undefined}
          />
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Visa:</Text>
          <StatusBadge 
            status={member.visaStatus} 
            expiry={member.visaExpiry ? `Exp: ${new Date(member.visaExpiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : undefined}
          />
        </View>
      </View>

      {member.specialNeeds && member.specialNeeds.length > 0 && (
        <View style={styles.specialNeeds}>
          <Text style={styles.specialNeedsLabel}>Special Requirements:</Text>
          <View style={styles.needsTags}>
            {member.specialNeeds.map((need, index) => (
              <View key={index} style={styles.needTag}>
                <Text style={styles.needTagText}>{need}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const QuickStatCard: React.FC<{ 
    icon: string; 
    value: string | number; 
    label: string; 
    iconLibrary?: 'Ionicons' | 'MaterialIcons';
    color?: string;
    onPress?: () => void;
  }> = ({ icon, value, label, iconLibrary = 'Ionicons', color = '#A83442', onPress }) => {
    const IconComponent = iconLibrary === 'MaterialIcons' ? MaterialIcons : Ionicons;
    
    return (
      <TouchableOpacity 
        style={styles.quickStatCard} 
        onPress={onPress}
        disabled={!onPress}
      >
        <IconComponent name={icon as any} size={24} color={color} />
        <Text style={[styles.quickStatValue, { color }]}>{value}</Text>
        <Text style={styles.quickStatLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderProfileScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileCard}>
            <View style={styles.profileSection}>
              <LinearGradient
                colors={['#A83442', '#d63447']}
                style={styles.profileAvatar}
              >
                <Text style={styles.profileInitials}>
                  {userProfile.firstName[0]}{userProfile.lastName[0]}
                </Text>
              </LinearGradient>
              <View style={styles.profileInfo}>
                <Text style={styles.greeting}>Good morning,</Text>
                <Text style={styles.profileName}>
                  {userProfile.firstName} {userProfile.lastName}
                </Text>
                <Text style={styles.profileEmail}>{userProfile.email}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#6B7280" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <QuickStatCard
            icon="airplane"
            value={travelStats.totalTrips}
            label="Total Trips"
            onPress={() => Alert.alert('Travel History', 'View all trips')}
          />
          <QuickStatCard
            icon="location-outline"
            value={travelStats.countries}
            label="Countries"
            onPress={() => Alert.alert('Countries Visited', 'View travel map')}
          />
          <QuickStatCard
            icon="calendar-outline"
            value={travelStats.upcomingTrips}
            label="Upcoming"
            color="#10B981"
            onPress={() => Alert.alert('Upcoming Trips', 'View itinerary')}
          />
          <QuickStatCard
            icon="warning"
            iconLibrary="MaterialIcons"
            value={travelStats.documentsExpiring}
            label="Expiring"
            color="#F59E0B"
            onPress={handleDocumentAlert}
          />
        </View>

        {/* Family Management */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="people" size={24} color="#A83442" />
              <View>
                <Text style={styles.sectionTitle}>RawhahBooking Family</Text>
                <Text style={styles.sectionSubtitle}>Ahmed's Family • {familyMembers.length + 1} members</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.manageButton} onPress={handleManageFamily}>
              <Text style={styles.manageButtonText}>Manage</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.familyActions}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleBookForFamily}>
              <Ionicons name="airplane" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Book for Family</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleAddMember}>
              <Ionicons name="person-add" size={20} color="#A83442" />
              <Text style={styles.secondaryButtonText}>Add Member</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Family Members */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="family-restroom" size={24} color="#A83442" />
              <View>
                <Text style={styles.sectionTitle}>Family Members</Text>
                <Text style={styles.sectionSubtitle}>
                  {familyMembers.filter(m => m.passportStatus === 'expiring' || m.visaStatus === 'expiring').length} documents need attention
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.membersContainer}>
            {familyMembers.map((member) => (
              <FamilyMemberCard key={member.id} member={member} />
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="settings" size={24} color="#A83442" />
              <Text style={styles.sectionTitle}>Settings & Support</Text>
            </View>
          </View>

          <View style={styles.settingsList}>
            {[
              { 
                icon: 'document-text', 
                title: 'Travel Documents', 
                subtitle: 'Manage passports and visas',
                onPress: handleNavigateToDocuments
              },
              { 
                icon: 'language', 
                title: 'Language & Region', 
                subtitle: 'English (US)',
                onPress: handleNavigateToLanguage
              },
              { 
                icon: 'notifications', 
                title: 'Notifications', 
                subtitle: 'Push, email, SMS preferences',
                onPress: handleNavigateToNotifications
              },
              { 
                icon: 'shield-checkmark', 
                title: 'Privacy & Security', 
                subtitle: 'Account security settings',
                onPress: handleNavigateToPrivacy
              },
              { 
                icon: 'help-circle', 
                title: 'Help & Support', 
                subtitle: '24/7 customer support',
                onPress: handleNavigateToHelp
              },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.settingItem} onPress={item.onPress}>
                <View style={styles.settingItemLeft}>
                  <Ionicons name={item.icon as any} size={20} color="#6B7280" />
                  <View style={styles.settingItemText}>
                    <Text style={styles.settingItemTitle}>{item.title}</Text>
                    <Text style={styles.settingItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.dangerButton}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.dangerButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );

  return renderCurrentScreen();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    padding: 20,
    paddingBottom: 10,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  manageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A83442',
  },
  familyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A83442',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A83442',
    textAlign: 'center',
    flexShrink: 1,
  },
  membersContainer: {
    gap: 16,
  },
  memberCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  memberDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  memberBirth: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  documentStatus: {
    gap: 8,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expiryText: {
    fontSize: 10,
    marginTop: 2,
    opacity: 0.8,
  },
  specialNeeds: {
    marginTop: 8,
  },
  specialNeedsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  needsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  needTag: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  needTagText: {
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '500',
  },
  settingsList: {
    gap: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingItemText: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export { ProfileScreen }; 