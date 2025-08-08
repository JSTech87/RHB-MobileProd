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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Typography } from '../constants/Typography';
import { hotelInquirySchema, HotelInquiryFormData } from '../utils/validation';
import { debouncedSaveDraft, draftStorage } from '../utils/storage';
import { apiService, whatsAppService } from '../services/api';

// Form components (to be created)
import DestinationInput from '../components/form/DestinationInput';
import DateRangeField from '../components/form/DateRangeField';
import GuestCount from '../components/form/GuestCount';
import BudgetRange from '../components/form/BudgetRange';
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
  } = useForm<HotelInquiryFormData>({
    resolver: zodResolver(hotelInquirySchema),
    defaultValues: {
      destination: { city: '' },
      dates: { checkIn: '', checkOut: '' },
      rooms: 1,
      guests: { adults: 2, children: 0 },
      contact: { fullName: '', email: '', phone: '' },
      groupBooking: false,
      specialRequests: '',
    },
    mode: 'onChange',
  });

  // Watch form values for draft saving
  const watchedValues = watch();

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Auto-save draft when form changes
  useEffect(() => {
    if (watchedValues.destination?.city || watchedValues.contact?.fullName) {
      debouncedSaveDraft(watchedValues);
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
                // Reset form with draft data
                reset({
                  ...draft,
                  // Ensure required fields have defaults
                  rooms: draft.rooms || 1,
                  guests: draft.guests || { adults: 2, children: 0 },
                  groupBooking: draft.groupBooking || false,
                } as HotelInquiryFormData);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const onSubmit = async (data: HotelInquiryFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting hotel inquiry:', data);
      
      const response = await apiService.submitHotelInquiry(data);
      
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
      console.log('hotel_inquiry_submitted', { id: response.id });
      
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

  const handleWhatsAppPress = async (data?: HotelInquiryFormData) => {
    try {
      // Use current form data if not provided
      const formData = data || watchedValues as HotelInquiryFormData;
      
      // Basic validation for WhatsApp
      if (!formData.destination?.city || !formData.contact?.fullName) {
        Alert.alert(
          'Incomplete Information',
          'Please fill in at least the destination and your name before contacting us via WhatsApp.'
        );
        return;
      }

      const whatsappUrl = whatsAppService.generateWhatsAppLink(formData);
      
      if (!whatsappUrl) {
        Alert.alert(
          'WhatsApp Not Available',
          'WhatsApp contact is not configured. Please submit the form or contact us directly.'
        );
        return;
      }

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        console.log('hotel_inquiry_whatsapp_clicked');
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
        <Text style={styles.headerTitle}>Hotel Inquiry</Text>
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
            <Text style={styles.formTitle}>Hotel Booking Inquiry</Text>
            <Text style={styles.formSubtitle}>
              Professional hotel accommodations with exceptional service and unmatched comfort
            </Text>
          </View>

          {/* Destination */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Destination</Text>
            <Controller
              control={control}
              name="destination"
              render={({ field: { onChange, value } }) => (
                <DestinationInput
                  value={value}
                  onValueChange={onChange}
                  error={errors.destination?.city?.message}
                />
              )}
            />
          </View>

          {/* Travel Dates */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Travel Dates</Text>
            <Controller
              control={control}
              name="dates"
              render={({ field: { onChange, value } }) => (
                <DateRangeField
                  value={value}
                  onValueChange={onChange}
                  error={errors.dates?.checkIn?.message || errors.dates?.checkOut?.message}
                />
              )}
            />
          </View>

          {/* Guests and Rooms */}
          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={styles.sectionLabel}>Guests</Text>
              <Controller
                control={control}
                name="guests"
                render={({ field: { onChange, value } }) => (
                  <GuestCount
                    value={value}
                    onValueChange={onChange}
                    error={errors.guests?.adults?.message || errors.guests?.childAges?.message}
                  />
                )}
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={styles.sectionLabel}>Rooms</Text>
              <Controller
                control={control}
                name="rooms"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.roomsInput}>
                    <TouchableOpacity 
                      style={styles.counterButton}
                      onPress={() => onChange(Math.max(1, (value || 1) - 1))}
                    >
                      <Text style={styles.counterButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{value || 1}</Text>
                    <TouchableOpacity 
                      style={styles.counterButton}
                      onPress={() => onChange((value || 1) + 1)}
                    >
                      <Text style={styles.counterButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          </View>

          {/* Budget Range */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Budget Range (per night)</Text>
            <Controller
              control={control}
              name="budget"
              render={({ field: { onChange, value } }) => (
                <BudgetRange
                  value={value}
                  onValueChange={onChange}
                  error={errors.budget?.max?.message}
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

          {/* Special Requests */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Special Requests</Text>
            <Controller
              control={control}
              name="specialRequests"
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
                {isSubmitting ? 'Submitting...' : 'Submit Hotel Inquiry'}
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

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>👑</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Curated Selection</Text>
              <Text style={styles.featureDescription}>Hand-picked quality hotels</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>💰</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Best Rate Guarantee</Text>
              <Text style={styles.featureDescription}>Competitive pricing assured</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>⚡</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Instant Confirmation</Text>
              <Text style={styles.featureDescription}>Response within 10-15 minutes</Text>
            </View>
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
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  roomsInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  counterButtonText: {
    ...Typography.styles.buttonMedium,
    color: '#000000',
  },
  counterValue: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
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
  featuresSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    marginBottom: 4,
  },
  featureDescription: {
    ...Typography.styles.caption,
    color: '#6c757d',
  },
  bottomPadding: {
    height: 40,
  },
});

export default HotelInquiryScreen; 