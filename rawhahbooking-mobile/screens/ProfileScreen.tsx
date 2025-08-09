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

export const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header with Black Background */}
      <LinearGradient
        colors={['#000000', '#000000']}
        style={styles.header}
      >
        {/* Header Navigation */}
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarContainer}>
            <LinearGradient
              colors={['#A83442', '#d63447', '#A83442']}
              style={styles.profileAvatar}
            >
              <Text style={styles.profileInitials}>IM</Text>
            </LinearGradient>
            <TouchableOpacity style={styles.editAvatar}>
              <MaterialIcons name="edit" size={12} color="#A83442" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>Irvan Moses</Text>
          <Text style={styles.profileEmail}>irvan.moses@gmail.com</Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Family Management Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <Ionicons name="people" size={24} color="#A83442" />
              <Text style={styles.sectionTitleText}>Family Management</Text>
            </View>
            <TouchableOpacity style={styles.sectionAction}>
              <Text style={styles.sectionActionText}>Manage</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.familyStats}>
            <StatItem number="5" label="Members" />
            <StatItem number="3" label="Adults" />
            <StatItem number="2" label="Children" />
          </View>

          <View style={styles.familyActions}>
            <TouchableOpacity style={styles.familyActionBtn}>
              <Text style={styles.familyActionBtnText}>Add Member</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.familyActionBtn, styles.familyActionBtnSecondary]}>
              <Text style={[styles.familyActionBtnText, styles.familyActionBtnSecondaryText]}>Bulk Book</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.familyActionBtn, styles.familyActionBtnSecondary]}>
              <Text style={[styles.familyActionBtnText, styles.familyActionBtnSecondaryText]}>Coordinate</Text>
            </TouchableOpacity>
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
              text="Documents"
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pageTitle: {
    ...Typography.styles.headerMedium,
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 20,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileHeader: {
    alignItems: 'center',
    gap: 12,
  },
  profileAvatarContainer: {
    position: 'relative',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 8,
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profileName: {
    ...Typography.styles.headerLarge,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    ...Typography.styles.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
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
  familyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
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
  familyActions: {
    flexDirection: 'row',
    gap: 8,
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
  quickStats: {
    flexDirection: 'row',
    gap: 12,
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
  quickStatNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#A83442',
    marginBottom: 4,
  },
  quickStatLabel: {
    ...Typography.styles.caption,
    color: '#6c757d',
    fontWeight: '500',
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
}); 