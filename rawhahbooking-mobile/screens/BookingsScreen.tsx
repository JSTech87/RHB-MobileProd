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
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface BookingItem {
  id: string;
  type: 'flight' | 'hotel' | 'inquiry';
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'upcoming';
  title: string;
  subtitle: string;
  date: string;
  bookingDate: string;
  price?: string;
  metadata: {
    bookingReference?: string;
    passengers?: number;
    rooms?: number;
    duration?: string;
    destination?: string;
    airline?: string;
    hotelName?: string;
    inquiryType?: string;
    groupBooking?: boolean;
    totalTravelers?: number;
  };
}

interface BookingsScreenProps {
  navigation?: any;
}

export const BookingsScreen: React.FC<BookingsScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'flights' | 'hotels' | 'inquiries'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Mock booking data with comprehensive metadata
  const mockBookings: BookingItem[] = [
    {
      id: '1',
      type: 'flight',
      status: 'upcoming',
      title: 'Dubai → London',
      subtitle: 'Emirates EK001',
      date: 'Dec 15, 2024',
      bookingDate: 'Nov 20, 2024',
      price: '$1,250',
      metadata: {
        bookingReference: 'EK001DXB',
        passengers: 2,
        duration: '7h 30m',
        destination: 'London Heathrow',
        airline: 'Emirates',
      },
    },
    {
      id: '2',
      type: 'hotel',
      status: 'confirmed',
      title: 'Burj Al Arab',
      subtitle: 'Dubai, UAE',
      date: 'Dec 12-16, 2024',
      bookingDate: 'Nov 18, 2024',
      price: '$2,800',
      metadata: {
        bookingReference: 'BAA2024001',
        rooms: 1,
        duration: '4 nights',
        destination: 'Dubai',
        hotelName: 'Burj Al Arab Jumeirah',
      },
    },
    {
      id: '3',
      type: 'inquiry',
      status: 'pending',
      title: 'Group Hotel Inquiry',
      subtitle: 'Corporate Event - Paris',
      date: 'Jan 15-20, 2025',
      bookingDate: 'Nov 25, 2024',
      metadata: {
        inquiryType: 'Group Hotel Booking',
        groupBooking: true,
        totalTravelers: 45,
        destination: 'Paris, France',
        rooms: 22,
        duration: '5 nights',
      },
    },
    {
      id: '4',
      type: 'flight',
      status: 'completed',
      title: 'New York → Paris',
      subtitle: 'Air France AF007',
      date: 'Nov 28, 2024',
      bookingDate: 'Oct 15, 2024',
      price: '$890',
      metadata: {
        bookingReference: 'AF007NYC',
        passengers: 1,
        duration: '8h 15m',
        destination: 'Charles de Gaulle',
        airline: 'Air France',
      },
    },
    {
      id: '5',
      type: 'hotel',
      status: 'cancelled',
      title: 'Hotel Inquiry',
      subtitle: 'Tokyo, Japan',
      date: 'Dec 1-5, 2024',
      bookingDate: 'Nov 10, 2024',
      metadata: {
        inquiryType: 'Hotel Accommodation',
        rooms: 2,
        duration: '4 nights',
        destination: 'Tokyo, Japan',
      },
    },
    {
      id: '6',
      type: 'inquiry',
      status: 'confirmed',
      title: 'Multi-Stay Hotel Inquiry',
      subtitle: 'European Tour',
      date: 'Mar 10-25, 2025',
      bookingDate: 'Nov 22, 2024',
      metadata: {
        inquiryType: 'Multi-Stay Hotel',
        destination: 'London, Paris, Rome',
        rooms: 3,
        duration: '15 nights',
      },
    },
  ];

  const getFilteredBookings = () => {
    if (activeTab === 'all') return mockBookings;
    if (activeTab === 'inquiries') return mockBookings.filter(b => b.type === 'inquiry');
    return mockBookings.filter(b => b.type === activeTab.slice(0, -1) as 'flight' | 'hotel');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#059669';
      case 'upcoming': return '#6366F1';
      case 'pending': return '#D97706';
      case 'cancelled': return '#DC2626';
      case 'completed': return '#64748B';
      default: return '#64748B';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight': return 'airplane';
      case 'hotel': return 'bed';
      case 'inquiry': return 'document-text';
      default: return 'document';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flight': return '#64748B';
      case 'hotel': return '#6366F1';
      case 'inquiry': return '#D97706';
      default: return '#64748B';
    }
  };

  const BookingCard: React.FC<{ booking: BookingItem }> = ({ booking }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.bookingHeader}>
        <View style={[styles.typeIcon, { backgroundColor: getTypeColor(booking.type) }]}>
          <Ionicons name={getTypeIcon(booking.type) as any} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingTitle}>{booking.title}</Text>
          <Text style={styles.bookingSubtitle}>{booking.subtitle}</Text>
          <Text style={styles.bookingDate}>{booking.date}</Text>
        </View>
        <View style={styles.bookingMeta}>
          {booking.price && (
            <Text style={styles.bookingPrice}>{booking.price}</Text>
          )}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Text style={styles.statusText}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.bookingMetadata}>
        {booking.metadata.bookingReference && (
          <View style={styles.metaItem}>
            <Ionicons name="document-text-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>Ref: {booking.metadata.bookingReference}</Text>
          </View>
        )}
        {booking.metadata.passengers && (
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{booking.metadata.passengers} passenger(s)</Text>
          </View>
        )}
        {booking.metadata.rooms && (
          <View style={styles.metaItem}>
            <Ionicons name="bed-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{booking.metadata.rooms} room(s)</Text>
          </View>
        )}
        {booking.metadata.duration && (
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{booking.metadata.duration}</Text>
          </View>
        )}
        {booking.metadata.groupBooking && (
          <View style={styles.metaItem}>
            <Ionicons name="business-outline" size={14} color="#8B5CF6" />
            <Text style={[styles.metaText, { color: '#8B5CF6' }]}>
              Group ({booking.metadata.totalTravelers} travelers)
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const BookingDetailModal: React.FC = () => {
    if (!selectedBooking) return null;

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Booking Details</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <View style={[styles.detailIcon, { backgroundColor: getTypeColor(selectedBooking.type) }]}>
                  <Ionicons name={getTypeIcon(selectedBooking.type) as any} size={32} color="#FFFFFF" />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailTitle}>{selectedBooking.title}</Text>
                  <Text style={styles.detailSubtitle}>{selectedBooking.subtitle}</Text>
                  <View style={[styles.detailStatusBadge, { backgroundColor: getStatusColor(selectedBooking.status) }]}>
                    <Text style={styles.detailStatusText}>
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>

              {selectedBooking.price && (
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Total Price</Text>
                  <Text style={styles.priceValue}>{selectedBooking.price}</Text>
                </View>
              )}
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Booking Information</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Travel Date</Text>
                  <Text style={styles.infoValue}>{selectedBooking.date}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Booking Date</Text>
                  <Text style={styles.infoValue}>{selectedBooking.bookingDate}</Text>
                </View>
                {selectedBooking.metadata.destination && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Destination</Text>
                    <Text style={styles.infoValue}>{selectedBooking.metadata.destination}</Text>
                  </View>
                )}
                {selectedBooking.metadata.duration && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Duration</Text>
                    <Text style={styles.infoValue}>{selectedBooking.metadata.duration}</Text>
                  </View>
                )}
              </View>
            </View>

            {selectedBooking.metadata.bookingReference && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Reference Details</Text>
                <View style={styles.referenceContainer}>
                  <Text style={styles.referenceText}>{selectedBooking.metadata.bookingReference}</Text>
                  <TouchableOpacity style={styles.copyButton}>
                    <Ionicons name="copy-outline" size={16} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Additional Details</Text>
              <View style={styles.additionalDetails}>
                {Object.entries(selectedBooking.metadata).map(([key, value]) => {
                  if (!value || key === 'bookingReference' || key === 'destination' || key === 'duration') return null;
                  return (
                    <View key={key} style={styles.additionalItem}>
                      <Text style={styles.additionalLabel}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
                      </Text>
                      <Text style={styles.additionalValue}>{value.toString()}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const filteredBookings = getFilteredBookings();
  const tabs = [
    { key: 'all', label: 'All', count: mockBookings.length },
    { key: 'flights', label: 'Flights', count: mockBookings.filter(b => b.type === 'flight').length },
    { key: 'hotels', label: 'Hotels', count: mockBookings.filter(b => b.type === 'hotel').length },
    { key: 'inquiries', label: 'Inquiries', count: mockBookings.filter(b => b.type === 'inquiry').length },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
              <View style={[
                styles.tabBadge,
                activeTab === tab.key && styles.activeTabBadge
              ]}>
                <Text style={[
                  styles.tabBadgeText,
                  activeTab === tab.key && styles.activeTabBadgeText
                ]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bookings List */}
      <ScrollView 
        style={styles.bookingsList}
        contentContainerStyle={styles.bookingsContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>
              Your {activeTab === 'all' ? '' : activeTab} bookings will appear here
            </Text>
          </View>
        )}
      </ScrollView>

      <BookingDetailModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  tabScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabBadgeText: {
    color: '#FFFFFF',
  },
  bookingsList: {
    flex: 1,
  },
  bookingsContent: {
    padding: 20,
    paddingBottom: 100,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 3,
  },
  bookingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 3,
  },
  bookingDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  bookingMeta: {
    alignItems: 'flex-end',
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  bookingMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  detailInfo: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 10,
  },
  detailStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  detailStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6366F1',
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
  },
  referenceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EBF4FF',
  },
  additionalDetails: {
    gap: 12,
  },
  additionalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  additionalLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  additionalValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
}); 