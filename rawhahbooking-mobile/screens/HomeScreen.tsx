import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ScrollView,
  StatusBar,
  Dimensions,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface QuickActionProps {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

interface RecentActivityProps {
  type: 'flight' | 'hotel';
  title: string;
  subtitle: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

// Hijri date conversion utility
const getHijriDate = () => {
  const today = new Date();
  const hijriMonths = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhu al-Qidah', 'Dhu al-Hijjah'
  ];
  
  // More accurate Hijri conversion (still approximate)
  const hijriYear = Math.floor((today.getFullYear() - 622) * 1.030684) + 1;
  const hijriMonth = hijriMonths[today.getMonth() % 12];
  const hijriDay = today.getDate();
  
  return {
    day: hijriDay,
    month: hijriMonth,
    year: hijriYear,
    formatted: `${hijriDay} ${hijriMonth} ${hijriYear} AH`
  };
};

const getGregorianDate = () => {
  const today = new Date();
  return {
    weekday: today.toLocaleDateString('en-US', { weekday: 'long' }),
    month: today.toLocaleDateString('en-US', { month: 'long' }),
    day: today.getDate(),
    year: today.getFullYear(),
    formatted: today.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const HomeScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const QuickAction: React.FC<QuickActionProps> = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => (
    <View style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <View style={[styles.statsIcon, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={18} color="#FFFFFF" />
        </View>
        <Text style={styles.statsValue}>{value}</Text>
      </View>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );

  const RecentActivity: React.FC<RecentActivityProps> = ({ type, title, subtitle, date, status }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: type === 'flight' ? '#64748B' : '#6366F1' }]}>
        <Ionicons name={type === 'flight' ? 'airplane' : 'bed'} size={14} color="#FFFFFF" />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activitySubtitle}>{subtitle}</Text>
        <Text style={styles.activityDate}>{date}</Text>
      </View>
      <View style={[styles.statusBadge, { 
        backgroundColor: status === 'confirmed' ? '#059669' : 
                       status === 'pending' ? '#D97706' : '#DC2626' 
      }]}>
        <Text style={styles.statusText}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    </View>
  );

  const mockStats = [
    { title: 'Total Trips', value: '24', icon: 'airplane-outline', color: '#64748B' },
    { title: 'This Year', value: '8', icon: 'calendar-outline', color: '#059669' },
    { title: 'Saved', value: '$2.4K', icon: 'card-outline', color: '#D97706' },
    { title: 'Countries', value: '12', icon: 'earth-outline', color: '#6366F1' },
  ];

  const mockActivities = [
    { type: 'flight' as const, title: 'Dubai - London', subtitle: 'Emirates EK001', date: 'Dec 15, 2024', status: 'confirmed' as const },
    { type: 'hotel' as const, title: 'Burj Al Arab', subtitle: 'Dubai, UAE', date: 'Dec 12, 2024', status: 'confirmed' as const },
    { type: 'flight' as const, title: 'New York - Paris', subtitle: 'Air France AF007', date: 'Nov 28, 2024', status: 'pending' as const },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Professional Header */}
        <View style={styles.professionalHeader}>
          <View style={styles.headerContent}>
            {/* Brand Section */}
            <View style={styles.brandSection}>
              <Image
                source={require('../assets/Transparent Logo.png')}
                style={styles.brandLogo}
                resizeMode="contain"
              />
              <View style={styles.brandInfo}>
                <Text style={styles.brandName}>RawhahBooking</Text>
                <Text style={styles.brandTagline}>Travel Solutions</Text>
              </View>
            </View>
            
            {/* User Actions */}
            <View style={styles.userActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="search-outline" size={22} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="notifications-outline" size={22} color="#64748B" />
                <View style={styles.notificationDot}>
                  <Text style={styles.notificationCount}>3</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButton}>
                <Text style={styles.profileInitial}>
                  {user?.name?.charAt(0).toUpperCase() || user?.id?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Status Bar */}
          <View style={styles.statusBar}>
            <View style={styles.statusItem}>
              <Ionicons name="calendar-clear-outline" size={16} color="#6B7280" />
              <Text style={styles.statusText}>
                {getGregorianDate().formatted}
              </Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <Ionicons name="moon-outline" size={16} color="#6B7280" />
              <Text style={styles.statusText}>
                {getHijriDate().formatted}
              </Text>
            </View>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeMessage}>
            Welcome back, {user?.name || user?.id || 'Traveler'}
          </Text>
          <Text style={styles.welcomeSubtext}>
            Let's plan your next journey
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              icon="search-outline"
              title="Search Flights"
              subtitle="Find your next trip"
              color="#64748B"
              onPress={() => navigation?.navigate('Search')}
            />
            <QuickAction
              icon="bed-outline"
              title="Hotel Inquiry"
              subtitle="Book accommodations"
              color="#6366F1"
              onPress={() => navigation?.navigate('HotelInquiry')}
            />
            <QuickAction
              icon="calendar-outline"
              title="My Bookings"
              subtitle="View all trips"
              color="#059669"
              onPress={() => navigation?.navigate('Bookings')}
            />
            <QuickAction
              icon="person-outline"
              title="Profile"
              subtitle="Manage account"
              color="#D97706"
              onPress={() => navigation?.navigate('Profile')}
            />
          </View>
        </View>

        {/* Travel Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Overview</Text>
          <View style={styles.statsGrid}>
            {mockStats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation?.navigate('Bookings')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {mockActivities.map((activity, index) => (
              <RecentActivity
                key={index}
                type={activity.type}
                title={activity.title}
                subtitle={activity.subtitle}
                date={activity.date}
                status={activity.status}
              />
            ))}
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  professionalHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  brandInfo: {
    flexDirection: 'column',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  brandTagline: {
    fontSize: 12,
    color: '#6B7280',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileInitial: {
    color: '#64748B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  statusDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  welcomeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeMessage: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 60) / 2, // Account for padding and gap
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statsCard: {
    width: (width - 60) / 2, // Account for padding and gap
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statsTitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  signOutSection: {
    marginTop: 32,
    marginBottom: 20,
    alignItems: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  signOutButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
}); 