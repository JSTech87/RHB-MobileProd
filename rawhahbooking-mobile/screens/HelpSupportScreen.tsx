import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'booking' | 'account' | 'payment' | 'travel';
}

export const HelpSupportScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I cancel my booking?',
      answer: 'You can cancel your booking by going to "My Bookings" and selecting the booking you want to cancel. Cancellation policies vary by airline and fare type.',
      category: 'booking',
    },
    {
      id: '2',
      question: 'Can I change my flight dates?',
      answer: 'Yes, you can modify your booking dates subject to airline policies and fare rules. Additional charges may apply for date changes.',
      category: 'booking',
    },
    {
      id: '3',
      question: 'How do I add family members to my account?',
      answer: 'Go to your Profile > Family Management and tap "Add Member". You can add up to 10 family members to your account for easier booking.',
      category: 'account',
    },
    {
      id: '4',
      question: 'What payment methods do you accept?',
      answer: 'We accept major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. All payments are processed securely.',
      category: 'payment',
    },
    {
      id: '5',
      question: 'Do I need a visa for my destination?',
      answer: 'Visa requirements depend on your nationality and destination. We recommend checking with the embassy or consulate of your destination country.',
      category: 'travel',
    },
    {
      id: '6',
      question: 'How early should I arrive at the airport?',
      answer: 'We recommend arriving 2-3 hours early for international flights and 1-2 hours for domestic flights. Check with your airline for specific requirements.',
      category: 'travel',
    },
  ];

  const handleContactSupport = (method: 'phone' | 'email' | 'chat') => {
    switch (method) {
      case 'phone':
        Linking.openURL('tel:+1-800-RAWHAH-1');
        break;
      case 'email':
        Linking.openURL('mailto:support@rawhahbooking.com');
        break;
      case 'chat':
        Alert.alert('Live Chat', 'Opening live chat support...');
        break;
    }
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report an Issue',
      'What type of issue would you like to report?',
      [
        { text: 'Booking Problem', onPress: () => console.log('Report booking issue') },
        { text: 'Payment Issue', onPress: () => console.log('Report payment issue') },
        { text: 'App Bug', onPress: () => console.log('Report app bug') },
        { text: 'Other', onPress: () => console.log('Report other issue') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleFeedback = () => {
    Alert.alert(
      'Send Feedback',
      'We value your feedback! How would you like to share it?',
      [
        { text: 'Rate App', onPress: () => console.log('Open app store rating') },
        { text: 'Send Feedback', onPress: () => console.log('Open feedback form') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const SupportOption: React.FC<{
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    color?: string;
  }> = ({ icon, title, subtitle, onPress, color = '#A83442' }) => (
    <TouchableOpacity style={styles.supportOption} onPress={onPress}>
      <View style={[styles.supportIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.supportText}>
        <Text style={styles.supportTitle}>{title}</Text>
        <Text style={styles.supportSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const FAQItem: React.FC<{ faq: FAQItem }> = ({ faq }) => {
    const isExpanded = expandedFAQ === faq.id;
    
    return (
      <View style={styles.faqItem}>
        <TouchableOpacity 
          style={styles.faqQuestion}
          onPress={() => toggleFAQ(faq.id)}
        >
          <Text style={styles.faqQuestionText}>{faq.question}</Text>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#6B7280" 
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{faq.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Contact Support */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="headset" size={24} color="#A83442" />
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Contact Support</Text>
              <Text style={styles.sectionSubtitle}>Get help from our 24/7 support team</Text>
            </View>
          </View>
          
          <View style={styles.contactOptions}>
            <TouchableOpacity 
              style={styles.contactOption}
              onPress={() => handleContactSupport('chat')}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>Live Chat</Text>
                <Text style={styles.contactSubtitle}>Usually responds in 2 minutes</Text>
              </View>
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>Available</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactOption}
              onPress={() => handleContactSupport('phone')}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#10B981' }]}>
                <Ionicons name="call" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>Phone Support</Text>
                <Text style={styles.contactSubtitle}>+1-800-RAWHAH-1</Text>
              </View>
              <View style={styles.hoursBadge}>
                <Text style={styles.hoursText}>24/7</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactOption}
              onPress={() => handleContactSupport('email')}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="mail" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactSubtitle}>support@rawhahbooking.com</Text>
              </View>
              <View style={styles.responseBadge}>
                <Text style={styles.responseText}>4-6 hours</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <SupportOption
              icon="bug"
              title="Report an Issue"
              subtitle="Report bugs or problems"
              onPress={handleReportIssue}
              color="#EF4444"
            />
            <SupportOption
              icon="star"
              title="Send Feedback"
              subtitle="Help us improve the app"
              onPress={handleFeedback}
              color="#F59E0B"
            />
            <SupportOption
              icon="document-text"
              title="Booking Support"
              subtitle="Help with your bookings"
              onPress={() => console.log('Booking support')}
            />
            <SupportOption
              icon="card"
              title="Payment Help"
              subtitle="Payment and billing issues"
              onPress={() => console.log('Payment help')}
              color="#6366F1"
            />
          </View>
        </View>

        {/* Frequently Asked Questions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={24} color="#A83442" />
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
              <Text style={styles.sectionSubtitle}>Find answers to common questions</Text>
            </View>
          </View>
          
          <View style={styles.faqList}>
            {faqs.map((faq) => (
              <FAQItem key={faq.id} faq={faq} />
            ))}
          </View>
          
          <TouchableOpacity style={styles.viewAllFAQButton}>
            <Text style={styles.viewAllFAQText}>View All FAQs</Text>
            <Ionicons name="chevron-forward" size={16} color="#A83442" />
          </TouchableOpacity>
        </View>

        {/* Self-Service Options */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={24} color="#A83442" />
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Self-Service</Text>
              <Text style={styles.sectionSubtitle}>Manage your account and bookings</Text>
            </View>
          </View>
          
          <View style={styles.selfServiceOptions}>
            <SupportOption
              icon="airplane"
              title="Manage Bookings"
              subtitle="View, modify, or cancel bookings"
              onPress={() => console.log('Manage bookings')}
            />
            <SupportOption
              icon="receipt"
              title="Download Receipts"
              subtitle="Get invoices and receipts"
              onPress={() => console.log('Download receipts')}
            />
            <SupportOption
              icon="refresh"
              title="Refund Status"
              subtitle="Check your refund status"
              onPress={() => console.log('Refund status')}
            />
          </View>
        </View>

        {/* Resources */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="library" size={24} color="#A83442" />
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Resources</Text>
              <Text style={styles.sectionSubtitle}>Guides and helpful information</Text>
            </View>
          </View>
          
          <View style={styles.resourcesList}>
            <SupportOption
              icon="map"
              title="Travel Guides"
              subtitle="Destination information and tips"
              onPress={() => console.log('Travel guides')}
              color="#10B981"
            />
            <SupportOption
              icon="shield-checkmark"
              title="Travel Safety"
              subtitle="Safety tips and guidelines"
              onPress={() => console.log('Travel safety')}
              color="#F59E0B"
            />
            <SupportOption
              icon="book"
              title="User Manual"
              subtitle="How to use RawhahBooking"
              onPress={() => console.log('User manual')}
              color="#6366F1"
            />
          </View>
        </View>

        {/* App Information */}
        <View style={styles.appInfoCard}>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>RawhahBooking</Text>
            <Text style={styles.appVersion}>Version 2.1.0 (Build 2024.1)</Text>
            <Text style={styles.appDescription}>
              Your trusted companion for Muslim-friendly travel booking
            </Text>
          </View>
          
          <View style={styles.appActions}>
            <TouchableOpacity style={styles.appAction}>
              <Text style={styles.appActionText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.appAction}>
              <Text style={styles.appActionText}>Terms of Service</Text>
            </TouchableOpacity>
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
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  contactOptions: {
    gap: 12,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  availableBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availableText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  hoursBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hoursText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  responseBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  responseText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  quickActions: {
    gap: 12,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportText: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingBottom: 16,
    paddingRight: 32,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  viewAllFAQButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
  },
  viewAllFAQText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A83442',
  },
  selfServiceOptions: {
    gap: 12,
  },
  resourcesList: {
    gap: 12,
  },
  appInfoCard: {
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
  appInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  appActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  appAction: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  appActionText: {
    fontSize: 14,
    color: '#A83442',
    fontWeight: '500',
  },
}); 