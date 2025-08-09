import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { Typography } from '../constants/Typography';

const { width } = Dimensions.get('window');

interface StatItemProps {
  number: string;
  label: string;
}

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialIcons.glyphMap | keyof typeof Feather.glyphMap;
  text: string;
  onPress: () => void;
  iconLibrary?: 'Ionicons' | 'MaterialIcons' | 'Feather';
  showAlert?: boolean;
}

interface FamilyMemberProps {
  name: string;
  relationship: string;
  age: number;
  passportStatus: 'valid' | 'expiring' | 'expired';
  visaStatus: 'valid' | 'expiring' | 'expired' | 'none';
  specialNeeds?: string;
}

const StatItem: React.FC<StatItemProps> = ({ number, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SettingsItem: React.FC<SettingsItemProps> = ({ 
  icon, 
  text, 
  onPress, 
  iconLibrary = 'MaterialIcons',
  showAlert = false 
}) => {
  const IconComponent = iconLibrary === 'Ionicons' ? Ionicons : 
                       iconLibrary === 'Feather' ? Feather : MaterialIcons;
  
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <IconComponent name={icon as any} size={20} color="#6c757d" />
        <Text style={styles.settingsItemText}>{text}</Text>
      </View>
      <View style={styles.settingsItemRight}>
        {showAlert && <View style={styles.alertBadge}><Text style={styles.alertText}>2</Text></View>}
        <MaterialIcons name="keyboard-arrow-right" size={16} color="#6c757d" />
      </View>
    </TouchableOpacity>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'valid': return '#28a745';
      case 'expiring': return '#ffc107';
      case 'expired': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.statusText}>{status.toUpperCase()}</Text>
    </View>
  );
};

const FamilyMemberRow: React.FC<FamilyMemberProps> = ({ 
  name, 
  relationship, 
  age, 
  passportStatus, 
  visaStatus, 
  specialNeeds 
}) => (
  <View style={styles.memberRow}>
    <View style={styles.memberInfo}>
      <Text style={styles.memberName}>{name}</Text>
      <Text style={styles.memberRelationship}>{relationship} • {age} years</Text>
    </View>
    <View style={styles.memberStatus}>
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Passport:</Text>
        <StatusBadge status={passportStatus} />
      </View>
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Visa:</Text>
        <StatusBadge status={visaStatus} />
      </View>
      {specialNeeds && (
        <Text style={styles.specialNeeds}>Special: {specialNeeds}</Text>
      )}
    </View>
  </View>
);

export const ProfileScreen: React.FC = () => {
  // Mock family data
  const familyMembers: FamilyMemberProps[] = [
    {
      name: 'Fatima Moses',
      relationship: 'Spouse',
      age: 32,
      passportStatus: 'valid',
      visaStatus: 'valid',
      specialNeeds: 'Halal meals'
    },
    {
      name: 'Ahmed Moses',
      relationship: 'Son',
      age: 8,
      passportStatus: 'valid',
      visaStatus: 'expiring',
      specialNeeds: 'Child meal'
    },
    {
      name: 'Aisha Moses',
      relationship: 'Daughter',
      age: 5,
      passportStatus: 'expiring',
      visaStatus: 'valid',
    },
    {
      name: 'Omar Moses',
      relationship: 'Son',
      age: 2,
      passportStatus: 'valid',
      visaStatus: 'none',
      specialNeeds: 'Infant seat'
    }
  ];

  const upcomingTrips = 2;
  const documentsExpiring = 3;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D6D5C9" />
      
      {/* Header with Profile and Notification */}
      <View style={styles.header}>
        <View style={styles.profileHeaderCard}>
          <View style={styles.profileSection}>
            <LinearGradient
              colors={['#A83442', '#d63447', '#A83442']}
              style={styles.profileAvatar}
            >
              <Text style={styles.profileInitials}>IM</Text>
            </LinearGradient>
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.profileName}>Irvan Moses</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <View style={styles.notificationIcon}>
              <Ionicons name="notifications" size={20} color="#FFD700" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Family Management Section - Enhanced */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <Ionicons name="people" size={24} color="#A83442" />
              <Text style={styles.sectionTitleText}>RawhahBooking Family</Text>
            </View>
            <TouchableOpacity style={styles.sectionAction}>
              <Text style={styles.sectionActionText}>Manage</Text>
            </TouchableOpacity>
          </View>

          {/* Family Overview Stats */}
          <View style={styles.familyOverview}>
            <Text style={styles.familyTitle}>Ahmed's Family</Text>
            <View style={styles.familyStats}>
              <StatItem number="5" label="Members" />
              <StatItem number="3" label="Adults" />
              <StatItem number="2" label="Children" />
            </View>
          </View>

          {/* Quick Family Stats */}
          <View style={styles.quickFamilyStats}>
            <View style={styles.quickStat}>
              <View style={styles.quickStatHeader}>
                <Text style={styles.quickStatLabel}>Upcoming Trips</Text>
                <Text style={styles.quickStatNumber}>{upcomingTrips}</Text>
              </View>
            </View>
            <View style={styles.quickStat}>
              <View style={styles.quickStatHeader}>
                <Text style={styles.quickStatLabel}>Documents</Text>
                <Text style={[styles.quickStatNumber, styles.warningText]}>{documentsExpiring} expiring</Text>
              </View>
            </View>
          </View>

          {/* Family Actions */}
          <View style={styles.familyActions}>
            <TouchableOpacity style={styles.familyActionBtn}>
              <Text style={styles.familyActionBtnText}>Book for Family</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.familyActionBtn, styles.familyActionBtnSecondary]}>
              <Text style={[styles.familyActionBtnText, styles.familyActionBtnSecondaryText]}>Add Member</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Booking Presets */}
          <View style={styles.bookingPresets}>
            <Text style={styles.presetTitle}>Quick Booking Options:</Text>
            <View style={styles.presetButtons}>
              <TouchableOpacity style={styles.presetBtn}>
                <Text style={styles.presetBtnText}>All Family (5)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presetBtn}>
                <Text style={styles.presetBtnText}>Adults Only (3)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presetBtn}>
                <Text style={styles.presetBtnText}>Custom</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Family Members Status */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <MaterialIcons name="family-restroom" size={24} color="#A83442" />
              <Text style={styles.sectionTitleText}>Family Members</Text>
            </View>
            <TouchableOpacity style={styles.sectionAction}>
              <Text style={styles.sectionActionText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.membersList}>
            {familyMembers.map((member, index) => (
              <FamilyMemberRow key={index} {...member} />
            ))}
          </View>
        </View>

        {/* Travel History Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <MaterialIcons name="flight" size={24} color="#A83442" />
              <Text style={styles.sectionTitleText}>Travel History</Text>
            </View>
            <TouchableOpacity style={styles.sectionAction}>
              <Text style={styles.sectionActionText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>12</Text>
              <Text style={styles.quickStatLabel}>Total Trips</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>8</Text>
              <Text style={styles.quickStatLabel}>Countries</Text>
            </View>
          </View>
        </View>

        {/* Documents & Settings Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <MaterialIcons name="description" size={24} color="#A83442" />
              <Text style={styles.sectionTitleText}>Documents & Settings</Text>
            </View>
            <View style={styles.alertBadge}>
              <Text style={styles.alertText}>2</Text>
            </View>
          </View>

          <View style={styles.settingsList}>
            <SettingsItem
              icon="description"
              text="Travel Documents"
              onPress={() => console.log('Documents pressed')}
            />
            <SettingsItem
              icon="translate"
              text="Language & Region"
              onPress={() => console.log('Language pressed')}
            />
            <SettingsItem
              icon="notifications"
              text="Notifications"
              onPress={() => console.log('Notifications pressed')}
              iconLibrary="Ionicons"
            />
            <SettingsItem
              icon="shield-checkmark"
              text="Privacy & Security"
              onPress={() => console.log('Privacy pressed')}
              iconLibrary="Ionicons"
            />
            <SettingsItem
              icon="help-circle"
              text="Help & Support"
              onPress={() => console.log('Help pressed')}
              iconLibrary="Ionicons"
            />
          </View>
        </View>

        {/* Add bottom padding for tab navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D6D5C9',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(31, 38, 135, 0.25)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 8,
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    ...Typography.styles.bodySmall,
    color: '#6c757d',
    marginBottom: 4,
  },
  profileName: {
    ...Typography.styles.headerMedium,
    color: '#000000',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(31, 38, 135, 0.25)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitleText: {
    ...Typography.styles.headerSmall,
    color: '#000000',
  },
  sectionAction: {
    backgroundColor: 'rgba(168, 52, 66, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sectionActionText: {
    ...Typography.styles.captionSmall,
    color: '#A83442',
    fontWeight: '600',
  },
  familyOverview: {
    marginBottom: 16,
  },
  familyTitle: {
    ...Typography.styles.headerSmall,
    color: '#000000',
    marginBottom: 12,
  },
  familyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#A83442',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6c757d',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  quickFamilyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  quickStat: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
  },
  quickStatHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickStatLabel: {
    ...Typography.styles.caption,
    color: '#6c757d',
    fontWeight: '500',
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#A83442',
  },
  warningText: {
    color: '#dc3545',
  },
  familyActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  familyActionBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#A83442',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  familyActionBtnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'transparent',
  },
  familyActionBtnText: {
    ...Typography.styles.captionSmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  familyActionBtnSecondaryText: {
    color: '#000000',
  },
  bookingPresets: {
    marginTop: 16,
  },
  presetTitle: {
    ...Typography.styles.headerSmall,
    color: '#000000',
    marginBottom: 12,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#A83442',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  presetBtnText: {
    ...Typography.styles.captionSmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  membersList: {
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    fontWeight: '600',
  },
  memberRelationship: {
    ...Typography.styles.captionSmall,
    color: '#6c757d',
    marginTop: 2,
  },
  memberStatus: {
    alignItems: 'flex-end',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    ...Typography.styles.captionSmall,
    color: '#6c757d',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  specialNeeds: {
    ...Typography.styles.captionSmall,
    color: '#6c757d',
    marginTop: 4,
  },
  settingsList: {
    gap: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemText: {
    ...Typography.styles.bodySmall,
    color: '#000000',
    fontWeight: '500',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertBadge: {
    backgroundColor: '#dc3545',
    minWidth: 18,
    height: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  alertText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
  },
}); 