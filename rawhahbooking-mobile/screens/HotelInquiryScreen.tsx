import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Typography } from '../constants/Typography';
import { multiStayHotelInquirySchema, MultiStayHotelInquiryFormData } from '../utils/validation';
import { debouncedSaveDraft, draftStorage } from '../utils/storage';
import { apiService, whatsAppService } from '../services/api';

// Form components
import StayCard, { StayData } from '../components/hotel/StayCard';
import GuestCount from '../components/form/GuestCount';
import ContactForm from '../components/form/ContactForm';
import GroupSection from '../components/form/GroupSection';
import SpecialRequestsInput from '../components/form/SpecialRequestsInput';

interface HotelInquiryScreenProps {
  navigation?: any;
}

export const HotelInquiryScreen: React.FC<HotelInquiryScreenProps> = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGroupSection, setShowGroupSection] = useState(false);

  // Form setup with react-hook-form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<MultiStayHotelInquiryFormData>({
    resolver: zodResolver(multiStayHotelInquirySchema),
    defaultValues: {
      stays: [{
        destination: { city: '' },
        dates: { checkIn: '', checkOut: '' },
        rooms: 1,
        hotelChoice: { type: 'preferences' },
        notes: '',
      }],
      travelers: { adults: 2, children: 0 },
      contact: { fullName: '', email: '', phone: '' },
      groupBooking: false,
      tripRequests: '',
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'stays',
  });

  // Watch form values for draft saving
  const watchedValues = watch();

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Auto-save draft when form changes
  useEffect(() => {
    if (watchedValues.stays?.[0]?.destination?.city || watchedValues.contact?.fullName) {
      // Convert to compatible format for draft saving
      const draftData = {
        destination: watchedValues.stays[0]?.destination || { city: '' },
        dates: watchedValues.stays[0]?.dates || { checkIn: '', checkOut: '' },
        rooms: watchedValues.stays[0]?.rooms || 1,
        guests: watchedValues.travelers,
        contact: watchedValues.contact,
        groupBooking: watchedValues.groupBooking,
        group: watchedValues.group,
        specialRequests: watchedValues.tripRequests,
      };
      debouncedSaveDraft(draftData);
    }
  }, [watchedValues]);

  // Watch group booking toggle
  useEffect(() => {
    setShowGroupSection(watchedValues.groupBooking || false);
  }, [watchedValues.groupBooking]);

  const loadDraft = async () => {
    try {
      const draft = await draftStorage.loadDraft();
      if (draft) {
        Alert.alert(
          'Draft Found',
          'Would you like to restore your previous hotel inquiry?',
          [
            { text: 'Start Fresh', style: 'cancel' },
            {
              text: 'Restore',
              onPress: () => {
                // Convert old format to new multi-stay format
                const multiStayData: MultiStayHotelInquiryFormData = {
                  stays: [{
                    destination: draft.destination || { city: '' },
                    dates: draft.dates || { checkIn: '', checkOut: '' },
                    rooms: draft.rooms || 1,
                    hotelChoice: { type: 'preferences' },
                    notes: draft.specialRequests || '',
                  }],
                  travelers: draft.guests || { adults: 2, children: 0 },
                  contact: draft.contact || { fullName: '', email: '', phone: '' },
                  groupBooking: draft.groupBooking || false,
                  group: draft.group,
                  tripRequests: draft.specialRequests || '',
                };
                reset(multiStayData);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const addStay = () => {
    if (fields.length < 6) {
      append({
        destination: { city: '' },
        dates: { checkIn: '', checkOut: '' },
        rooms: 1,
        hotelChoice: { type: 'preferences' },
        notes: '',
      });
    }
  };

  const duplicateStay = (index: number) => {
    if (fields.length < 6) {
      const stayToDuplicate = watchedValues.stays[index];
      append({
        ...stayToDuplicate,
        destination: { city: '' }, // Clear destination for new stay
      });
    }
  };

  const removeStay = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: MultiStayHotelInquiryFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting multi-stay hotel inquiry:', data);
      
      // Convert to single-stay format for backward compatibility
      const singleStayData = {
        destination: data.stays[0].destination,
        dates: data.stays[0].dates,
        rooms: data.stays[0].rooms,
        guests: data.travelers,
        contact: data.contact,
        groupBooking: data.groupBooking,
        group: data.group,
        specialRequests: data.tripRequests,
      };
      
      const response = await apiService.submitHotelInquiry(singleStayData);
      
      Alert.alert(
        'Inquiry Submitted',
        `Your hotel inquiry has been received! Reference ID: ${response.id}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear draft and reset form
              draftStorage.clearDraft();
              reset();
              navigation?.goBack();
            },
          },
        ]
      );
      
      // Analytics event
      console.log('multi_stay_hotel_inquiry_submitted', { id: response.id, stays: data.stays.length });
      
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Submission Error',
        'There was an error submitting your inquiry. Please try again or contact us via WhatsApp.',
        [
          { text: 'OK', style: 'default' },
          { text: 'WhatsApp', onPress: () => handleWhatsAppPress(data) },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppPress = async (data?: MultiStayHotelInquiryFormData) => {
    try {
      // Use current form data if not provided
      const formData = data || watchedValues as MultiStayHotelInquiryFormData;
      
      // Basic validation for WhatsApp
      if (!formData.stays?.[0]?.destination?.city || !formData.contact?.fullName) {
        Alert.alert(
          'Incomplete Information',
          'Please fill in at least one destination and your name before contacting us via WhatsApp.'
        );
        return;
      }

      const whatsappUrl = formatMultiStayWhatsAppMessage(formData);
      
      if (!whatsappUrl) {
        Alert.alert(
          'WhatsApp Not Available',
          'WhatsApp contact is not configured. Please submit the form instead.'
        );
        return;
      }

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        console.log('multi_stay_hotel_inquiry_whatsapp_clicked');
      } else {
        Alert.alert(
          'WhatsApp Not Installed',
          'WhatsApp is not installed on your device. Please submit the form instead.'
        );
      }
    } catch (error) {
      console.error('WhatsApp error:', error);
      Alert.alert(
        'Error',
        'Could not open WhatsApp. Please submit the form instead.'
      );
    }
  };

  const formatMultiStayWhatsAppMessage = (data: MultiStayHotelInquiryFormData): string => {
    const wabaNumber = process.env.EXPO_PUBLIC_WABA_NUMBER;
    if (!wabaNumber) return '';

    const { stays, travelers, contact, groupBooking, group, tripRequests } = data;
    
    let message = `Hotel inquiry (multi-stay)\n`;
    message += `Traveler: ${contact.fullName} | ${contact.phone}\n`;
    message += `Guests: ${travelers.adults} adults`;
    if (travelers.children > 0) {
      message += `, ${travelers.children} children`;
    }
    message += `\n\n`;
    
    stays.forEach((stay, index) => {
      message += `Stay ${index + 1}:\n`;
      message += `- Destination: ${stay.destination.city}${stay.destination.country ? `, ${stay.destination.country}` : ''}\n`;
      message += `- Dates: ${stay.dates.checkIn} → ${stay.dates.checkOut}\n`;
      message += `- Rooms: ${stay.rooms}\n`;
      
      if (stay.hotelChoice.type === 'specific') {
        message += `- Hotel: ${stay.hotelChoice.hotelName}\n`;
      } else {
        message += `- Preferences: `;
        const prefs = [];
        if (stay.hotelChoice.rating) prefs.push(`${stay.hotelChoice.rating}★`);
        if (stay.hotelChoice.budget?.min || stay.hotelChoice.budget?.max) {
          prefs.push(`$${stay.hotelChoice.budget.min || 0}-${stay.hotelChoice.budget.max || '∞'}`);
        }
        if (stay.hotelChoice.mealPlan) prefs.push(stay.hotelChoice.mealPlan);
        if (stay.hotelChoice.facilities?.length) prefs.push(stay.hotelChoice.facilities.join(', '));
        message += prefs.length > 0 ? prefs.join(', ') : 'Any hotel';
        message += `\n`;
      }
      
      if (stay.notes) {
        message += `- Notes: ${stay.notes}\n`;
      }
      message += `\n`;
    });
    
    if (groupBooking && group) {
      message += `Group: Yes, total ${group.totalTravelers}\n`;
      if (group.roomingPreference) {
        message += `Rooming: ${group.roomingPreference}\n`;
      }
    }
    
    if (tripRequests) {
      message += `Trip notes: ${tripRequests}\n`;
    }
    
    message += `#HOTEL_INQUIRY_MULTI`;
    
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${wabaNumber}?text=${encodedMessage}`;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#D6D5C9" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Multi-Stay Hotel Inquiry</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main Form Card */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Multi-Stay Hotel Booking</Text>
            <Text style={styles.formSubtitle}>
              Plan your entire trip with multiple destinations and hotels in one inquiry
            </Text>
          </View>

          {/* Stays Section */}
          <View style={styles.section}>
            <View style={styles.staysHeader}>
              <Text style={styles.sectionLabel}>Your Stays ({fields.length}/6)</Text>
              {fields.length < 6 && (
                <TouchableOpacity style={styles.addButton} onPress={addStay}>
                  <Text style={styles.addButtonText}>+ Add Stay</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {fields.map((field, index) => (
              <Controller
                key={field.id}
                control={control}
                name={`stays.${index}`}
                render={({ field: { value, onChange } }) => (
                  <StayCard
                    index={index}
                    stay={value}
                    onUpdate={onChange}
                    onDuplicate={() => duplicateStay(index)}
                    onRemove={() => removeStay(index)}
                    canRemove={fields.length > 1}
                    errors={errors.stays?.[index]}
                  />
                )}
              />
            ))}
          </View>

          {/* Global Travelers Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Travelers (for all stays)</Text>
            <Controller
              control={control}
              name="travelers"
              render={({ field: { onChange, value } }) => (
                <GuestCount
                  value={value}
                  onValueChange={onChange}
                  error={errors.travelers?.adults?.message || errors.travelers?.childAges?.message}
                />
              )}
            />
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Contact Information</Text>
            <Controller
              control={control}
              name="contact"
              render={({ field: { onChange, value } }) => (
                <ContactForm
                  value={value}
                  onValueChange={onChange}
                  errors={{
                    fullName: errors.contact?.fullName?.message,
                    email: errors.contact?.email?.message,
                    phone: errors.contact?.phone?.message,
                  }}
                />
              )}
            />
          </View>

          {/* Group Booking Toggle */}
          <View style={styles.section}>
            <Controller
              control={control}
              name="groupBooking"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity 
                  style={styles.groupToggle}
                  onPress={() => onChange(!value)}
                >
                  <View style={[styles.checkbox, value && styles.checkboxActive]}>
                    {value && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.groupToggleText}>This is a group booking</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Group Section */}
          {showGroupSection && (
            <View style={styles.section}>
              <Controller
                control={control}
                name="group"
                render={({ field: { onChange, value } }) => (
                  <GroupSection
                    value={value}
                    onValueChange={onChange}
                    contactInfo={watchedValues.contact}
                    errors={{
                      totalTravelers: errors.group?.totalTravelers?.message,
                      subGroups: errors.group?.subGroups?.message,
                    }}
                  />
                )}
              />
            </View>
          )}

          {/* Trip-wide Special Requests */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Trip-wide Special Requests</Text>
            <Controller
              control={control}
              name="tripRequests"
              render={({ field: { onChange, value } }) => (
                <SpecialRequestsInput
                  value={value || ''}
                  onValueChange={onChange}
                />
              )}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.submitButton, (!isValid || isSubmitting) && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Multi-Stay Inquiry'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={() => handleWhatsAppPress()}
            >
              <Text style={styles.whatsappButtonText}>Chat on WhatsApp Business</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D6D5C9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#D6D5C9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    ...Typography.styles.headerMedium,
    color: '#000000',
  },
  headerTitle: {
    ...Typography.styles.headerMedium,
    color: '#000000',
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
  formCard: {
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
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  formTitle: {
    ...Typography.styles.headerLarge,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    ...Typography.styles.bodySmall,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    ...Typography.styles.label,
    color: '#000000',
    marginBottom: 8,
    fontWeight: '500',
  },
  staysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#A83442',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    ...Typography.styles.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  groupToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#dee2e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  groupToggleText: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
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
    ...Typography.styles.buttonMedium,
    color: '#FFFFFF',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  whatsappButtonText: {
    ...Typography.styles.buttonMedium,
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 40,
  },
});

export default HotelInquiryScreen; 