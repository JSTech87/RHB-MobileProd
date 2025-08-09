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

interface NotificationSetting {
  id: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  category: 'bookings' | 'travel' | 'promotions' | 'account';
}

export const NotificationsScreen: React.FC = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    // Booking Notifications
    {
      id: 'booking-confirmation',
      title: 'Booking Confirmations',
      subtitle: 'Get notified when your booking is confirmed',
      enabled: true,
      category: 'bookings',
    },
    {
      id: 'booking-changes',
      title: 'Booking Changes',
      subtitle: 'Flight delays, gate changes, and cancellations',
      enabled: true,
      category: 'bookings',
    },
    {
      id: 'check-in-reminder',
      title: 'Check-in Reminders',
      subtitle: 'Reminders to check in 24 hours before departure',
      enabled: true,
      category: 'bookings',
    },
    {
      id: 'boarding-time',
      title: 'Boarding Notifications',
      subtitle: 'Boarding time and gate information',
      enabled: true,
      category: 'bookings',
    },

    // Travel Notifications
    {
      id: 'document-expiry',
      title: 'Document Expiry Alerts',
      subtitle: 'Passport and visa expiration warnings',
      enabled: true,
      category: 'travel',
    },
    {
      id: 'weather-updates',
      title: 'Weather Updates',
      subtitle: 'Weather conditions at your destination',
      enabled: false,
      category: 'travel',
    },
    {
      id: 'travel-tips',
      title: 'Travel Tips',
      subtitle: 'Destination guides and travel advice',
      enabled: false,
      category: 'travel',
    },
    {
      id: 'prayer-times',
      title: 'Prayer Times',
      subtitle: 'Prayer time notifications for your location',
      enabled: true,
      category: 'travel',
    },

    // Promotional Notifications
    {
      id: 'special-offers',
      title: 'Special Offers',
      subtitle: 'Exclusive deals and discounts',
      enabled: false,
      category: 'promotions',
    },
    {
      id: 'price-alerts',
      title: 'Price Alerts',
      subtitle: 'Price drops for your saved searches',
      enabled: true,
      category: 'promotions',
    },
    {
      id: 'umrah-packages',
      title: 'Umrah Package Deals',
      subtitle: 'Special Umrah and Hajj package offers',
      enabled: true,
      category: 'promotions',
    },

    // Account Notifications
    {
      id: 'security-alerts',
      title: 'Security Alerts',
      subtitle: 'Account security and login notifications',
      enabled: true,
      category: 'account',
    },
    {
      id: 'family-updates',
      title: 'Family Member Updates',
      subtitle: 'Changes to family member profiles',
      enabled: true,
      category: 'account',
    },
    {
      id: 'app-updates',
      title: 'App Updates',
      subtitle: 'New features and app improvements',
      enabled: false,
      category: 'account',
    },
  ]);

  const toggleNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    );
  };

  const handleTestNotification = () => {
    Alert.alert(
      'Test Notification',
      'A test notification has been sent to your device.',
      [{ text: 'OK' }]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bookings': return 'airplane';
      case 'travel': return 'location';
      case 'promotions': return 'pricetag';
      case 'account': return 'person';
      default: return 'notifications';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bookings': return '#A83442';
      case 'travel': return '#10B981';
      case 'promotions': return '#F59E0B';
      case 'account': return '#6366F1';
      default: return '#6B7280';
    }
  };

  const NotificationItem: React.FC<{ notification: NotificationSetting }> = ({ notification }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationLeft}>
        <View style={[styles.notificationIcon, { backgroundColor: `${getCategoryColor(notification.category)}20` }]}>
          <Ionicons 
            name={getCategoryIcon(notification.category) as any} 
            size={20} 
            color={getCategoryColor(notification.category)} 
          />
        </View>
        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationSubtitle}>{notification.subtitle}</Text>
        </View>
      </View>
      <Switch
        value={notification.enabled}
        onValueChange={() => toggleNotification(notification.id)}
        trackColor={{ false: '#E5E7EB', true: '#A8344280' }}
        thumbColor={notification.enabled ? '#A83442' : '#9CA3AF'}
      />
    </View>
  );

  const renderNotificationsByCategory = (category: string, title: string) => {
    const categoryNotifications = notifications.filter(n => n.category === category);
    
    return (
      <View style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: `${getCategoryColor(category)}20` }]}>
            <Ionicons 
              name={getCategoryIcon(category) as any} 
              size={24} 
              color={getCategoryColor(category)} 
            />
          </View>
          <Text style={styles.categoryTitle}>{title}</Text>
        </View>
        <View style={styles.notificationsList}>
          {categoryNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
          <Text style={styles.testButtonText}>Test</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Delivery Methods */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Methods</Text>
          <Text style={styles.sectionSubtitle}>Choose how you want to receive notifications</Text>
          
          <View style={styles.deliveryMethods}>
            <View style={styles.deliveryMethod}>
              <View style={styles.methodLeft}>
                <View style={styles.methodIcon}>
                  <Ionicons name="phone-portrait" size={20} color="#A83442" />
                </View>
                <View>
                  <Text style={styles.methodTitle}>Push Notifications</Text>
                  <Text style={styles.methodSubtitle}>On your device</Text>
                </View>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: '#E5E7EB', true: '#A8344280' }}
                thumbColor={pushEnabled ? '#A83442' : '#9CA3AF'}
              />
            </View>

            <View style={styles.deliveryMethod}>
              <View style={styles.methodLeft}>
                <View style={styles.methodIcon}>
                  <Ionicons name="mail" size={20} color="#A83442" />
                </View>
                <View>
                  <Text style={styles.methodTitle}>Email</Text>
                  <Text style={styles.methodSubtitle}>irvan.moses@gmail.com</Text>
                </View>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: '#E5E7EB', true: '#A8344280' }}
                thumbColor={emailEnabled ? '#A83442' : '#9CA3AF'}
              />
            </View>

            <View style={styles.deliveryMethod}>
              <View style={styles.methodLeft}>
                <View style={styles.methodIcon}>
                  <Ionicons name="chatbubble" size={20} color="#A83442" />
                </View>
                <View>
                  <Text style={styles.methodTitle}>SMS</Text>
                  <Text style={styles.methodSubtitle}>+1 (555) 123-4567</Text>
                </View>
              </View>
              <Switch
                value={smsEnabled}
                onValueChange={setSmsEnabled}
                trackColor={{ false: '#E5E7EB', true: '#A8344280' }}
                thumbColor={smsEnabled ? '#A83442' : '#9CA3AF'}
              />
            </View>
          </View>
        </View>

        {/* Notification Categories */}
        {renderNotificationsByCategory('bookings', 'Booking & Travel')}
        {renderNotificationsByCategory('travel', 'Travel Information')}
        {renderNotificationsByCategory('promotions', 'Deals & Offers')}
        {renderNotificationsByCategory('account', 'Account & Security')}

        {/* Quiet Hours */}
        <View style={styles.sectionCard}>
          <View style={styles.quietHoursHeader}>
            <Ionicons name="moon" size={24} color="#A83442" />
            <View style={styles.quietHoursText}>
              <Text style={styles.sectionTitle}>Quiet Hours</Text>
              <Text style={styles.sectionSubtitle}>Pause non-urgent notifications</Text>
            </View>
          </View>
          
          <View style={styles.quietHoursSettings}>
            <TouchableOpacity style={styles.quietHoursSetting}>
              <Text style={styles.quietHoursLabel}>Start Time</Text>
              <Text style={styles.quietHoursValue}>10:00 PM</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quietHoursSetting}>
              <Text style={styles.quietHoursLabel}>End Time</Text>
              <Text style={styles.quietHoursValue}>7:00 AM</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.quietHoursNote}>
            Emergency notifications (flight cancellations, security alerts) will still be delivered during quiet hours.
          </Text>
        </View>

        {/* Notification History */}
        <View style={styles.sectionCard}>
          <View style={styles.historyHeader}>
            <Ionicons name="time" size={24} color="#A83442" />
            <View style={styles.historyText}>
              <Text style={styles.sectionTitle}>Recent Notifications</Text>
              <Text style={styles.sectionSubtitle}>Your notification history</Text>
            </View>
          </View>
          
          <View style={styles.historyList}>
            <View style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Ionicons name="airplane" size={16} color="#10B981" />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>Booking Confirmed</Text>
                <Text style={styles.historySubtitle}>Flight to Jeddah - JED123</Text>
                <Text style={styles.historyTime}>2 hours ago</Text>
              </View>
            </View>
            
            <View style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Ionicons name="document-text" size={16} color="#F59E0B" />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>Document Expiry Warning</Text>
                <Text style={styles.historySubtitle}>Ahmed's passport expires in 6 months</Text>
                <Text style={styles.historyTime}>1 day ago</Text>
              </View>
            </View>
            
            <View style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Ionicons name="pricetag" size={16} color="#A83442" />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>Special Offer</Text>
                <Text style={styles.historySubtitle}>30% off Umrah packages</Text>
                <Text style={styles.historyTime}>3 days ago</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Notifications</Text>
            <Ionicons name="chevron-forward" size={16} color="#A83442" />
          </TouchableOpacity>
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
  testButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A83442',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 16,
  },
  deliveryMethods: {
    gap: 16,
  },
  deliveryMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  categorySection: {
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
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  notificationsList: {
    gap: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  quietHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  quietHoursText: {
    flex: 1,
  },
  quietHoursSettings: {
    gap: 12,
    marginBottom: 16,
  },
  quietHoursSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  quietHoursLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  quietHoursValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  quietHoursNote: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  historyText: {
    flex: 1,
  },
  historyList: {
    gap: 12,
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  historySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  historyTime: {
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
}); 