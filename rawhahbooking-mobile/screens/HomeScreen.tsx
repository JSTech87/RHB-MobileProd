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
  RefreshControl
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

export const HomeScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
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
        <Ionicons name={icon as any} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => (
    <View style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <View style={[styles.statsIcon, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.statsValue}>{value}</Text>
      </View>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );

  const RecentActivity: React.FC<RecentActivityProps> = ({ type, title, subtitle, date, status }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: type === 'flight' ? '#3B82F6' : '#A83442' }]}>
        <Ionicons name={type === 'flight' ? 'airplane' : 'bed'} size={16} color="#FFFFFF" />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activitySubtitle}>{subtitle}</Text>
        <Text style={styles.activityDate}>{date}</Text>
      </View>
      <View style={[styles.statusBadge, { 
        backgroundColor: status === 'confirmed' ? '#10B981' : 
                       status === 'pending' ? '#F59E0B' : '#EF4444' 
      }]}>
        <Text style={styles.statusText}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    </View>
  );

  const mockStats = [
    { title: 'Total Trips', value: '24', icon: 'airplane-outline', color: '#3B82F6' },
    { title: 'This Year', value: '8', icon: 'calendar-outline', color: '#10B981' },
    { title: 'Saved', value: '$2.4K', icon: 'card-outline', color: '#F59E0B' },
    { title: 'Countries', value: '12', icon: 'earth-outline', color: '#8B5CF6' },
  ];

  const mockActivities = [
    { type: 'flight' as const, title: 'Dubai - London', subtitle: 'Emirates EK001', date: 'Dec 15, 2024', status: 'confirmed' as const },
    { type: 'hotel' as const, title: 'Burj Al Arab', subtitle: 'Dubai, UAE', date: 'Dec 12, 2024', status: 'confirmed' as const },
    { type: 'flight' as const, title: 'New York - Paris', subtitle: 'Air France AF007', date: 'Nov 28, 2024', status: 'pending' as const },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || user?.id?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>Good morning,</Text>
                <Text style={styles.userName}>
                  {user?.name || user?.id || 'Traveler'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#111827" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Welcome to RawhahBooking</Text>
            <Text style={styles.welcomeSubtitle}>
              Your premium travel companion for seamless bookings
            </Text>
          </View>
          <View style={styles.welcomeIcon}>
            <Ionicons name="airplane" size={32} color="#A83442" />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              icon="search-outline"
              title="Search Flights"
              subtitle="Find your next trip"
              color="#3B82F6"
              onPress={() => navigation?.navigate('Search')}
            />
            <QuickAction
              icon="bed-outline"
              title="Hotel Inquiry"
              subtitle="Book accommodations"
              color="#A83442"
              onPress={() => navigation?.navigate('HotelInquiry')}
            />
            <QuickAction
              icon="calendar-outline"
              title="My Bookings"
              subtitle="View all trips"
              color="#10B981"
              onPress={() => navigation?.navigate('Bookings')}
            />
            <QuickAction
              icon="person-outline"
              title="Profile"
              subtitle="Manage account"
              color="#8B5CF6"
              onPress={() => navigation?.navigate('Profile')}
            />
          </View>
        </View>

        {/* Travel Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Stats</Text>
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
              <Text style={styles.seeAllText}>See All</Text>
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
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
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
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 10,
  },
  welcomeIcon: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 10,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%', // Two columns
    aspectRatio: 1.2,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 5,
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
  },
  statsCard: {
    width: '48%', // Two columns
    aspectRatio: 1.1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsTitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  activityList: {
    marginTop: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 14,
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
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 