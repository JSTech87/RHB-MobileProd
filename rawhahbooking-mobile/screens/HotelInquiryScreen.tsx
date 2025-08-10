import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import DateTimePicker from 'react-native-ui-datepicker';

const { width, height } = Dimensions.get('window');

interface HotelInquiryScreenProps {
  navigation?: any;
}

interface HotelInquiryData {
  stays: {
    destination: string;
    checkIn: string;
    checkOut: string;
    rooms: number;
  }[];
  adults: number;
  children: number;
  hotelPreference: 'any' | '3star' | '4star' | '5star';
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

export const HotelInquiryScreen: React.FC<HotelInquiryScreenProps> = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [editingStayIndex, setEditingStayIndex] = useState(0);
  const [editingDateType, setEditingDateType] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [formData, setFormData] = useState<HotelInquiryData>({
    stays: [{
      destination: '',
      checkIn: '',
      checkOut: '',
      rooms: 1,
    }],
    adults: 2,
    children: 0,
    hotelPreference: 'any',
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const updateFormData = (field: keyof HotelInquiryData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const incrementValue = (field: 'adults' | 'children' | 'rooms') => {
    if (field === 'rooms') {
      const newStays = [...formData.stays];
      newStays[editingStayIndex].rooms = Math.min(newStays[editingStayIndex].rooms + 1, 5);
      setFormData(prev => ({ ...prev, stays: newStays }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [field]: field === 'adults' ? Math.min(prev[field] + 1, 10) : Math.min(prev[field] + 1, 8)
      }));
    }
  };

  const decrementValue = (field: 'adults' | 'children' | 'rooms') => {
    if (field === 'rooms') {
      const newStays = [...formData.stays];
      newStays[editingStayIndex].rooms = Math.max(newStays[editingStayIndex].rooms - 1, 1);
      setFormData(prev => ({ ...prev, stays: newStays }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [field]: field === 'adults' ? Math.max(prev[field] - 1, 1) : Math.max(prev[field] - 1, 0)
      }));
    }
  };

  const addStay = () => {
    if (formData.stays.length < 6) {
      setFormData(prev => ({
        ...prev,
        stays: [...prev.stays, {
          destination: '',
          checkIn: '',
          checkOut: '',
          rooms: 1,
        }]
      }));
    } else {
      Alert.alert('Maximum Stays', 'You can add up to 6 stays for your inquiry.');
    }
  };

  const removeStay = (index: number) => {
    if (formData.stays.length > 1) {
      setFormData(prev => ({
        ...prev,
        stays: prev.stays.filter((_, i) => i !== index)
      }));
      if (editingStayIndex >= formData.stays.length - 1) {
        setEditingStayIndex(0);
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    const newStays = [...formData.stays];
    const dateString = date.toISOString().split('T')[0];
    newStays[editingStayIndex][editingDateType] = dateString;
    setFormData(prev => ({ ...prev, stays: newStays }));
    setShowDateModal(false);
  };

  const openDatePicker = (stayIndex: number, dateType: 'checkIn' | 'checkOut') => {
    setEditingStayIndex(stayIndex);
    setEditingDateType(dateType);
    setShowDateModal(true);
  };

  const validateForm = (): boolean => {
    if (!formData.stays.every(stay => stay.destination.trim() && stay.checkIn && stay.checkOut)) {
      Alert.alert('Missing Information', 'Please complete all stay details.');
      return false;
    }
    if (!formData.fullName.trim()) {
      Alert.alert('Missing Information', 'Please enter your full name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Missing Information', 'Please enter your email address');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Missing Information', 'Please enter your phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Inquiry Submitted!',
        'Thank you for your hotel inquiry. We will get back to you within 24 hours with available options and pricing.',
        [
          {
            text: 'OK',
            onPress: () => navigation?.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    if (!validateForm()) return;

    const message = `Hotel Inquiry:
Destination: ${formData.stays.map(stay => `${stay.destination} (${stay.checkIn} - ${stay.checkOut})`).join('\n')}\n\nGuests: ${formData.adults} adults, ${formData.children} children\nPreference: ${formData.hotelPreference === 'any' ? 'Any hotel' : `${formData.hotelPreference.replace('star', ' star')}`}\nContact: ${formData.fullName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n${formData.specialRequests ? `Special Requests: ${formData.specialRequests}` : ''}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/+1234567890?text=${encodedMessage}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp');
    });
  };

  const hotelPreferences = [
    { key: 'any', label: 'Any Hotel', description: 'Best available options', icon: 'business-outline' },
    { key: '3star', label: '3 Star Hotels', description: 'Comfortable accommodation', icon: 'star-outline' },
    { key: '4star', label: '4 Star Hotels', description: 'Superior comfort & service', icon: 'star-half-outline' },
    { key: '5star', label: '5 Star Hotels', description: 'Luxury accommodation', icon: 'star' },
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
        <Text style={styles.headerTitle}>Hotel Inquiry</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main Card */}
        <View style={styles.mainCard}>
          {/* Header Section */}
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="bed" size={32} color="#A83442" />
            </View>
            <Text style={styles.cardTitle}>Professional Hotel Accommodations</Text>
            <Text style={styles.cardSubtitle}>
              Tell us your preferences and we'll find the perfect hotel for your stay
            </Text>
          </View>

          {/* Multiple Stays Section */}
          <View style={styles.section}>
            <View style={styles.staysHeader}>
              <Text style={styles.sectionTitle}>Your Stays ({formData.stays.length}/6)</Text>
              {formData.stays.length < 6 && (
                <TouchableOpacity style={styles.addStayButton} onPress={addStay}>
                  <Ionicons name="add-circle-outline" size={16} color="#A83442" />
                  <Text style={styles.addStayButtonText}>Add Stay</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {formData.stays.map((stay, index) => (
              <View key={index} style={styles.stayCard}>
                <View style={styles.stayHeader}>
                  <Text style={styles.stayTitle}>Stay {index + 1}</Text>
                  {formData.stays.length > 1 && (
                    <TouchableOpacity 
                      style={styles.removeStayButton}
                      onPress={() => removeStay(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* Destination for this stay */}
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#A83442" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Where would you like to stay?"
                    placeholderTextColor="#9CA3AF"
                    value={stay.destination}
                    onChangeText={(value) => {
                      const newStays = [...formData.stays];
                      newStays[index].destination = value;
                      setFormData(prev => ({ ...prev, stays: newStays }));
                    }}
                  />
                </View>

                {/* Dates for this stay */}
                <View style={styles.dateRow}>
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateLabel}>Check-in</Text>
                    <TouchableOpacity 
                      style={styles.dateButton} 
                      onPress={() => openDatePicker(index, 'checkIn')}
                    >
                      <Ionicons name="calendar-outline" size={18} color="#A83442" />
                      <Text style={styles.dateText}>
                        {stay.checkIn || 'Select date'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateLabel}>Check-out</Text>
                    <TouchableOpacity 
                      style={styles.dateButton} 
                      onPress={() => openDatePicker(index, 'checkOut')}
                    >
                      <Ionicons name="calendar-outline" size={18} color="#A83442" />
                      <Text style={styles.dateText}>
                        {stay.checkOut || 'Select date'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Rooms for this stay */}
                <View style={styles.counterRow}>
                  <View style={styles.counterItem}>
                    <Text style={styles.counterLabel}>Rooms</Text>
                    <View style={styles.counter}>
                      <TouchableOpacity 
                        style={styles.counterButton}
                        onPress={() => {
                          const newStays = [...formData.stays];
                          newStays[index].rooms = Math.max(newStays[index].rooms - 1, 1);
                          setFormData(prev => ({ ...prev, stays: newStays }));
                        }}
                      >
                        <Ionicons name="remove" size={18} color="#A83442" />
                      </TouchableOpacity>
                      <Text style={styles.counterValue}>{stay.rooms}</Text>
                      <TouchableOpacity 
                        style={styles.counterButton}
                        onPress={() => {
                          const newStays = [...formData.stays];
                          newStays[index].rooms = Math.min(newStays[index].rooms + 1, 5);
                          setFormData(prev => ({ ...prev, stays: newStays }));
                        }}
                      >
                        <Ionicons name="add" size={18} color="#A83442" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Global Guests Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guests (for all stays)</Text>
            <View style={styles.counterRow}>
              <View style={styles.counterItem}>
                <Text style={styles.counterLabel}>Adults</Text>
                <View style={styles.counter}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => decrementValue('adults')}
                  >
                    <Ionicons name="remove" size={18} color="#A83442" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{formData.adults}</Text>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => incrementValue('adults')}
                  >
                    <Ionicons name="add" size={18} color="#A83442" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.counterItem}>
                <Text style={styles.counterLabel}>Children</Text>
                <View style={styles.counter}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => decrementValue('children')}
                  >
                    <Ionicons name="remove" size={18} color="#A83442" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{formData.children}</Text>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => incrementValue('children')}
                  >
                    <Ionicons name="add" size={18} color="#A83442" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Hotel Preference */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hotel Preference</Text>
            <TouchableOpacity 
              style={styles.preferenceButton}
              onPress={() => setShowPreferenceModal(true)}
            >
              <View style={styles.preferenceContent}>
                <Ionicons 
                  name={hotelPreferences.find(p => p.key === formData.hotelPreference)?.icon as any || 'business-outline'} 
                  size={20} 
                  color="#A83442" 
                />
                <Text style={styles.preferenceText}>
                  {hotelPreferences.find(p => p.key === formData.hotelPreference)?.label || 'Any Hotel'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#A83442" />
              <TextInput
                style={styles.textInput}
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                value={formData.fullName}
                onChangeText={(value) => updateFormData('fullName', value)}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#A83442" />
              <TextInput
                style={styles.textInput}
                placeholder="Email Address"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#A83442" />
              <TextInput
                style={styles.textInput}
                placeholder="Phone Number"
                placeholderTextColor="#9CA3AF"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Special Requests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Any special requirements or preferences..."
                placeholderTextColor="#9CA3AF"
                value={formData.specialRequests}
                onChangeText={(value) => updateFormData('specialRequests', value)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Hotel Preference Modal */}
      <Modal
        visible={showPreferenceModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.compactModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPreferenceModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Hotel Preference</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            {hotelPreferences.map((preference) => (
              <TouchableOpacity
                key={preference.key}
                style={[
                  styles.preferenceOption,
                  formData.hotelPreference === preference.key && styles.preferenceOptionSelected
                ]}
                onPress={() => {
                  updateFormData('hotelPreference', preference.key);
                  setShowPreferenceModal(false);
                }}
              >
                <View style={styles.preferenceOptionContent}>
                  <View style={styles.preferenceOptionLeft}>
                    <Ionicons 
                      name={preference.icon as any} 
                      size={24} 
                      color={formData.hotelPreference === preference.key ? '#A83442' : '#6B7280'} 
                    />
                    <View style={styles.preferenceOptionText}>
                      <Text style={[
                        styles.preferenceOptionLabel,
                        formData.hotelPreference === preference.key && styles.preferenceOptionLabelSelected
                      ]}>
                        {preference.label}
                      </Text>
                      <Text style={styles.preferenceOptionDescription}>
                        {preference.description}
                      </Text>
                    </View>
                  </View>
                  {formData.hotelPreference === preference.key && (
                    <Ionicons name="checkmark-circle" size={24} color="#A83442" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.compactModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDateModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Date</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerLabel}>
              {editingDateType === 'checkIn' ? 'Check-in Date' : 'Check-out Date'}
            </Text>
            <DateTimePicker
              mode="single"
              date={new Date()}
              onChange={(params: any) => {
                if (params.date) {
                  handleDateSelect(params.date);
                }
              }}
              minDate={new Date()}
              firstDayOfWeek={1}
              styles={{
                selected: { backgroundColor: '#A83442' },
                selected_label: { color: '#FFFFFF' },
                today: { borderColor: '#A83442' },
                today_label: { color: '#A83442' },
              }}
            />
          </View>
        </View>
      </Modal>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    padding: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 10,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  counterItem: {
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  counterButton: {
    padding: 5,
  },
  counterValue: {
    fontSize: 16,
    color: '#111827',
    marginHorizontal: 15,
  },
  preferenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 10,
  },
  preferenceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  preferenceOptionSelected: {
    backgroundColor: '#FEE2E2',
    borderBottomColor: '#FEE2E2',
  },
  preferenceOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  preferenceOptionText: {
    flex: 1,
  },
  preferenceOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  preferenceOptionLabelSelected: {
    color: '#A83442',
  },
  preferenceOptionDescription: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  textAreaContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  textArea: {
    fontSize: 16,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#A83442',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  compactModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A83442',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modalContent: {
    flex: 1,
  },
  datePickerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  datePickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 15,
  },
  staysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addStayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addStayButtonText: {
    fontSize: 14,
    color: '#A83442',
    marginLeft: 5,
  },
  stayCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  stayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stayTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  removeStayButton: {
    padding: 5,
  },
});

export default HotelInquiryScreen; 