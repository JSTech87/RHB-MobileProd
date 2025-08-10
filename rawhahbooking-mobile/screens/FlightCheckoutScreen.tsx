import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  Switch,
  Modal,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Interfaces
interface FlightDetails {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  aircraft: string;
  class: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  price: number;
  currency: string;
}

interface PassengerInfo {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title: 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Prof';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  passportIssueCountry: string;
  specialRequests: string[];
  seatPreference: 'Window' | 'Aisle' | 'Middle' | 'Any';
  mealPreference: string;
  profileImage?: string;
  isFromFamily?: boolean;
  familyMemberId?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  dateOfBirth: string;
  passportStatus: 'valid' | 'expiring' | 'expired';
  passportNumber: string;
  passportExpiry: string;
  visaStatus: 'valid' | 'expiring' | 'expired' | 'none';
  visaExpiry?: string;
  specialNeeds?: string[];
  profileImage?: string;
  phone?: string;
  email?: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  countryCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

interface PaymentInfo {
  method: 'card' | 'paypal' | 'applepay' | 'googlepay';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  saveCard: boolean;
}

export const FlightCheckoutScreen: React.FC<{ 
  onBack?: () => void;
  flightDetails?: FlightDetails;
  familyMembers?: FamilyMember[];
}> = ({ onBack, flightDetails, familyMembers = [] }) => {
  
  // State Management
  const [currentStep, setCurrentStep] = useState(1);
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'irvan.moses@gmail.com',
    phone: '+1 555-123-4567',
    countryCode: '+1',
    emergencyContactName: 'Sarah Moses',
    emergencyContactPhone: '+1 555-987-6543',
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: 'Irvan Moses',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
    saveCard: false,
  });
  
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [selectedFamilyMembers, setSelectedFamilyMembers] = useState<string[]>([]);
  const [showAddPassengerModal, setShowAddPassengerModal] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<PassengerInfo | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(true);

  // Mock flight data
  const mockFlight: FlightDetails = flightDetails || {
    id: 'FL001',
    airline: 'Emirates',
    flightNumber: 'EK 123',
    departure: {
      airport: 'JFK',
      city: 'New York',
      time: '14:30',
      date: '2024-08-15',
    },
    arrival: {
      airport: 'DXB',
      city: 'Dubai',
      time: '09:15+1',
      date: '2024-08-16',
    },
    duration: '12h 45m',
    aircraft: 'Boeing 777-300ER',
    class: 'Economy',
    price: 899,
    currency: 'USD',
  };

  // Initialize with one adult passenger
  useEffect(() => {
    if (passengers.length === 0) {
      const initialPassenger: PassengerInfo = {
        id: 'passenger-1',
        type: 'adult',
        title: 'Mr',
        firstName: 'Irvan',
        lastName: 'Moses',
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        nationality: 'United States',
        passportNumber: '',
        passportExpiry: '',
        passportIssueCountry: 'United States',
        specialRequests: [],
        seatPreference: 'Window',
        mealPreference: 'Halal',
      };
      setPassengers([initialPassenger]);
    }
  }, []);

  // Utility Functions
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getPassengerType = (age: number): 'adult' | 'child' | 'infant' => {
    if (age < 2) return 'infant';
    if (age < 12) return 'child';
    return 'adult';
  };

  const calculateTotalPrice = (): number => {
    let total = 0;
    passengers.forEach(passenger => {
      switch (passenger.type) {
        case 'adult':
          total += mockFlight.price;
          break;
        case 'child':
          total += mockFlight.price * 0.75; // 25% discount for children
          break;
        case 'infant':
          total += mockFlight.price * 0.1; // 90% discount for infants
          break;
      }
    });
    return total;
  };

  const getTaxesAndFees = (): number => {
    return calculateTotalPrice() * 0.15; // 15% taxes and fees
  };

  // Family Integration Functions
  const handleAddFamilyMembers = () => {
    setShowFamilyModal(true);
  };

  const addFamilyMembersAsPassengers = () => {
    const newPassengers: PassengerInfo[] = selectedFamilyMembers.map(memberId => {
      const familyMember = familyMembers.find(m => m.id === memberId);
      if (!familyMember) return null;

      const age = calculateAge(familyMember.dateOfBirth);
      const passengerType = getPassengerType(age);

      return {
        id: `family-${familyMember.id}`,
        type: passengerType,
        title: age >= 18 ? 'Mr' : 'Master', // Default titles
        firstName: familyMember.name.split(' ')[0],
        lastName: familyMember.name.split(' ').slice(1).join(' '),
        dateOfBirth: familyMember.dateOfBirth,
        gender: 'Male', // Default, should be updated
        nationality: 'United States', // Default
        passportNumber: familyMember.passportNumber,
        passportExpiry: familyMember.passportExpiry,
        passportIssueCountry: 'United States',
        specialRequests: familyMember.specialNeeds || [],
        seatPreference: 'Any',
        mealPreference: familyMember.specialNeeds?.includes('Halal meals') ? 'Halal' : 'Standard',
        profileImage: familyMember.profileImage,
        isFromFamily: true,
        familyMemberId: familyMember.id,
      };
    }).filter(Boolean) as PassengerInfo[];

    setPassengers(prev => [...prev, ...newPassengers]);
    setSelectedFamilyMembers([]);
    setShowFamilyModal(false);
    Alert.alert('Success', `${newPassengers.length} family member(s) added to booking`);
  };

  // Passenger Management Functions
  const handleAddPassenger = () => {
    setEditingPassenger(null);
    setShowAddPassengerModal(true);
  };

  const handleEditPassenger = (passenger: PassengerInfo) => {
    setEditingPassenger(passenger);
    setShowAddPassengerModal(true);
  };

  const handleDeletePassenger = (passengerId: string) => {
    Alert.alert(
      'Remove Passenger',
      'Are you sure you want to remove this passenger?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setPassengers(prev => prev.filter(p => p.id !== passengerId));
          }
        },
      ]
    );
  };

  const savePassenger = (passengerData: PassengerInfo) => {
    if (editingPassenger) {
      // Update existing passenger
      setPassengers(prev => 
        prev.map(p => p.id === editingPassenger.id ? passengerData : p)
      );
    } else {
      // Add new passenger
      const newPassenger = {
        ...passengerData,
        id: `passenger-${Date.now()}`,
      };
      setPassengers(prev => [...prev, newPassenger]);
    }
    setShowAddPassengerModal(false);
    setEditingPassenger(null);
  };

  // Image picker for passenger photos
  const handlePassengerImagePicker = async (passengerId: string) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      Alert.alert(
        'Add Photo',
        'Choose an option',
        [
          { text: 'Take Photo', onPress: () => openCameraForPassenger(passengerId) },
          { text: 'Choose from Gallery', onPress: () => openGalleryForPassenger(passengerId) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.log('Error requesting permission:', error);
    }
  };

  const openCameraForPassenger = async (passengerId: string) => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraPermission.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPassengers(prev => 
          prev.map(p => 
            p.id === passengerId 
              ? { ...p, profileImage: result.assets[0].uri }
              : p
          )
        );
      }
    } catch (error) {
      console.log('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openGalleryForPassenger = async (passengerId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPassengers(prev => 
          prev.map(p => 
            p.id === passengerId 
              ? { ...p, profileImage: result.assets[0].uri }
              : p
          )
        );
      }
    } catch (error) {
      console.log('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  // Navigation Functions
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleCompleteBooking();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: // Passengers
        if (passengers.length === 0) {
          Alert.alert('Error', 'At least one passenger is required');
          return false;
        }
        for (const passenger of passengers) {
          if (!passenger.firstName || !passenger.lastName || !passenger.passportNumber) {
            Alert.alert('Error', 'All passenger information must be completed');
            return false;
          }
        }
        return true;
      case 2: // Contact Info
        if (!contactInfo.email || !contactInfo.phone) {
          Alert.alert('Error', 'Contact information is required');
          return false;
        }
        return true;
      case 3: // Payment
        if (paymentInfo.method === 'card') {
          if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv) {
            Alert.alert('Error', 'Payment information is incomplete');
            return false;
          }
        }
        return true;
      case 4: // Review
        if (!agreedToTerms) {
          Alert.alert('Error', 'You must agree to the terms and conditions');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleCompleteBooking = () => {
    Alert.alert(
      'Complete Booking',
      `Total: ${mockFlight.currency} ${(calculateTotalPrice() + getTaxesAndFees()).toFixed(2)}\n\nProceed with payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Now', 
          onPress: () => {
            // Simulate payment processing
            Alert.alert(
              'Booking Confirmed!',
              'Your booking has been confirmed. Confirmation details have been sent to your email.',
              [{ text: 'OK', onPress: onBack }]
            );
          }
        },
      ]
    );
  };

  // Render Functions
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle, 
            currentStep >= step ? styles.stepActive : styles.stepInactive
          ]}>
            <Text style={[
              styles.stepNumber,
              currentStep >= step ? styles.stepNumberActive : styles.stepNumberInactive
            ]}>
              {step}
            </Text>
          </View>
          {step < 4 && (
            <View style={[
              styles.stepLine,
              currentStep > step ? styles.stepLineActive : styles.stepLineInactive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderFlightSummary = () => (
    <View style={styles.flightSummaryCard}>
      <View style={styles.flightHeader}>
        <Text style={styles.flightRoute}>
          {mockFlight.departure.city} → {mockFlight.arrival.city}
        </Text>
        <Text style={styles.flightPrice}>
          {mockFlight.currency} {mockFlight.price}
        </Text>
      </View>
      <View style={styles.flightDetails}>
        <View style={styles.flightTime}>
          <Text style={styles.timeText}>{mockFlight.departure.time}</Text>
          <Text style={styles.airportText}>{mockFlight.departure.airport}</Text>
        </View>
        <View style={styles.flightDuration}>
          <Ionicons name="airplane" size={20} color="#A83442" />
          <Text style={styles.durationText}>{mockFlight.duration}</Text>
        </View>
        <View style={styles.flightTime}>
          <Text style={styles.timeText}>{mockFlight.arrival.time}</Text>
          <Text style={styles.airportText}>{mockFlight.arrival.airport}</Text>
        </View>
      </View>
      <View style={styles.flightInfo}>
        <Text style={styles.flightInfoText}>
          {mockFlight.airline} • {mockFlight.flightNumber} • {mockFlight.aircraft}
        </Text>
        <Text style={styles.classText}>{mockFlight.class}</Text>
      </View>
    </View>
  );

  // Continue with more render functions...
  const renderPassengerCard = (passenger: PassengerInfo, index: number) => (
    <View key={passenger.id} style={styles.passengerCard}>
      <View style={styles.passengerHeader}>
        <TouchableOpacity 
          style={styles.passengerAvatarContainer}
          onPress={() => handlePassengerImagePicker(passenger.id)}
        >
          {passenger.profileImage ? (
            <Image source={{ uri: passenger.profileImage }} style={styles.passengerImage} />
          ) : (
            <View style={styles.passengerAvatar}>
              <Text style={styles.passengerInitials}>
                {passenger.firstName[0]}{passenger.lastName[0]}
              </Text>
            </View>
          )}
          <View style={styles.cameraIconSmall}>
            <Ionicons name="camera" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.passengerInfo}>
          <View style={styles.passengerTitleRow}>
            <Text style={styles.passengerName}>
              {passenger.firstName} {passenger.lastName}
            </Text>
            <View style={[styles.passengerTypeBadge, 
              { backgroundColor: passenger.type === 'adult' ? '#10B981' : passenger.type === 'child' ? '#F59E0B' : '#6366F1' }
            ]}>
              <Text style={styles.passengerTypeText}>
                {passenger.type.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.passengerDetails}>
            {passenger.title} • {passenger.gender} • Age {calculateAge(passenger.dateOfBirth)}
          </Text>
          {passenger.isFromFamily && (
            <View style={styles.familyIndicator}>
              <Ionicons name="people" size={14} color="#A83442" />
              <Text style={styles.familyText}>Family Member</Text>
            </View>
          )}
        </View>

        <View style={styles.passengerActions}>
          <TouchableOpacity 
            style={styles.actionButtonSmall}
            onPress={() => handleEditPassenger(passenger)}
          >
            <Ionicons name="create-outline" size={18} color="#A83442" />
          </TouchableOpacity>
          {passengers.length > 1 && (
            <TouchableOpacity 
              style={styles.actionButtonSmall}
              onPress={() => handleDeletePassenger(passenger.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.passengerDocuments}>
        <View style={styles.documentRow}>
          <Text style={styles.documentLabel}>Passport:</Text>
          <Text style={styles.documentValue}>
            {passenger.passportNumber ? `••••${passenger.passportNumber.slice(-4)}` : 'Not provided'}
          </Text>
        </View>
        <View style={styles.documentRow}>
          <Text style={styles.documentLabel}>Expires:</Text>
          <Text style={styles.documentValue}>
            {passenger.passportExpiry ? new Date(passenger.passportExpiry).toLocaleDateString() : 'Not provided'}
          </Text>
        </View>
      </View>

      {passenger.specialRequests.length > 0 && (
        <View style={styles.specialRequests}>
          <Text style={styles.specialRequestsLabel}>Special Requests:</Text>
          <View style={styles.requestTags}>
            {passenger.specialRequests.map((request, idx) => (
              <View key={idx} style={styles.requestTag}>
                <Text style={styles.requestTagText}>{request}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  // Step 1: Passengers
  const renderPassengersStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Passenger Information</Text>
      <Text style={styles.stepSubtitle}>Add all travelers for this booking</Text>

      {/* Quick Add Family Members */}
      {familyMembers.length > 0 && (
        <View style={styles.quickAddSection}>
          <TouchableOpacity 
            style={styles.familyQuickAdd}
            onPress={handleAddFamilyMembers}
          >
            <MaterialIcons name="family-restroom" size={24} color="#A83442" />
            <View style={styles.familyQuickAddText}>
              <Text style={styles.familyQuickAddTitle}>Add Family Members</Text>
              <Text style={styles.familyQuickAddSubtitle}>
                {familyMembers.length} member(s) available
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A83442" />
          </TouchableOpacity>
        </View>
      )}

      {/* Passengers List */}
      <View style={styles.passengersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Travelers ({passengers.length})</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPassenger}>
            <Ionicons name="add" size={20} color="#A83442" />
            <Text style={styles.addButtonText}>Add Passenger</Text>
          </TouchableOpacity>
        </View>

        {passengers.map((passenger, index) => renderPassengerCard(passenger, index))}
      </View>

      {/* Passenger Summary */}
      <View style={styles.passengerSummary}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Adults:</Text>
            <Text style={styles.summaryValue}>
              {passengers.filter(p => p.type === 'adult').length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Children:</Text>
            <Text style={styles.summaryValue}>
              {passengers.filter(p => p.type === 'child').length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Infants:</Text>
            <Text style={styles.summaryValue}>
              {passengers.filter(p => p.type === 'infant').length}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Step 2: Contact Information
  const renderContactStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Contact Information</Text>
      <Text style={styles.stepSubtitle}>We'll send booking confirmations here</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address *</Text>
        <TextInput
          style={styles.textInput}
          value={contactInfo.email}
          onChangeText={(value) => setContactInfo(prev => ({ ...prev, email: value }))}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <View style={styles.phoneInputContainer}>
          <TextInput
            style={styles.countryCodeInput}
            value={contactInfo.countryCode}
            onChangeText={(value) => setContactInfo(prev => ({ ...prev, countryCode: value }))}
            placeholder="+1"
          />
          <TextInput
            style={[styles.textInput, styles.phoneInput]}
            value={contactInfo.phone}
            onChangeText={(value) => setContactInfo(prev => ({ ...prev, phone: value }))}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Emergency Contact Name</Text>
        <TextInput
          style={styles.textInput}
          value={contactInfo.emergencyContactName}
          onChangeText={(value) => setContactInfo(prev => ({ ...prev, emergencyContactName: value }))}
          placeholder="Enter emergency contact name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Emergency Contact Phone</Text>
        <TextInput
          style={styles.textInput}
          value={contactInfo.emergencyContactPhone}
          onChangeText={(value) => setContactInfo(prev => ({ ...prev, emergencyContactPhone: value }))}
          placeholder="Enter emergency contact phone"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.checkboxContainer}>
        <Switch
          value={subscribeToUpdates}
          onValueChange={setSubscribeToUpdates}
          trackColor={{ false: '#E5E7EB', true: '#A8344280' }}
          thumbColor={subscribeToUpdates ? '#A83442' : '#9CA3AF'}
        />
        <View style={styles.checkboxText}>
          <Text style={styles.checkboxLabel}>Subscribe to flight updates</Text>
          <Text style={styles.checkboxSubtitle}>
            Get notifications about flight changes, delays, and travel tips
          </Text>
        </View>
      </View>
    </View>
  );

  // Step 3: Payment
  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Payment Information</Text>
      <Text style={styles.stepSubtitle}>Secure payment processing</Text>

      {/* Payment Methods */}
      <View style={styles.paymentMethods}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentOptions}>
          {[
            { key: 'card', icon: 'card', label: 'Credit/Debit Card' },
            { key: 'paypal', icon: 'logo-paypal', label: 'PayPal' },
            { key: 'applepay', icon: 'logo-apple', label: 'Apple Pay' },
            { key: 'googlepay', icon: 'logo-google', label: 'Google Pay' },
          ].map((method) => (
            <TouchableOpacity
              key={method.key}
              style={[
                styles.paymentOption,
                paymentInfo.method === method.key && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentInfo(prev => ({ ...prev, method: method.key as any }))}
            >
              <Ionicons name={method.icon as any} size={24} color={
                paymentInfo.method === method.key ? '#A83442' : '#6B7280'
              } />
              <Text style={[
                styles.paymentOptionText,
                paymentInfo.method === method.key && styles.paymentOptionTextSelected
              ]}>
                {method.label}
              </Text>
              {paymentInfo.method === method.key && (
                <Ionicons name="checkmark-circle" size={20} color="#A83442" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Card Details */}
      {paymentInfo.method === 'card' && (
        <View style={styles.cardDetails}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cardholder Name *</Text>
            <TextInput
              style={styles.textInput}
              value={paymentInfo.cardholderName}
              onChangeText={(value) => setPaymentInfo(prev => ({ ...prev, cardholderName: value }))}
              placeholder="Enter cardholder name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number *</Text>
            <TextInput
              style={styles.textInput}
              value={paymentInfo.cardNumber}
              onChangeText={(value) => setPaymentInfo(prev => ({ ...prev, cardNumber: value }))}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          <View style={styles.cardRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.inputLabel}>Expiry Date *</Text>
              <TextInput
                style={styles.textInput}
                value={paymentInfo.expiryDate}
                onChangeText={(value) => setPaymentInfo(prev => ({ ...prev, expiryDate: value }))}
                placeholder="MM/YY"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV *</Text>
              <TextInput
                style={styles.textInput}
                value={paymentInfo.cvv}
                onChangeText={(value) => setPaymentInfo(prev => ({ ...prev, cvv: value }))}
                placeholder="123"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <Switch
              value={paymentInfo.saveCard}
              onValueChange={(value) => setPaymentInfo(prev => ({ ...prev, saveCard: value }))}
              trackColor={{ false: '#E5E7EB', true: '#A8344280' }}
              thumbColor={paymentInfo.saveCard ? '#A83442' : '#9CA3AF'}
            />
            <View style={styles.checkboxText}>
              <Text style={styles.checkboxLabel}>Save card for future bookings</Text>
              <Text style={styles.checkboxSubtitle}>
                Your card details will be securely stored for faster checkout
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Ionicons name="shield-checkmark" size={20} color="#10B981" />
        <Text style={styles.securityText}>
          Your payment information is encrypted and secure. We never store your full card details.
        </Text>
      </View>
    </View>
  );

  // Step 4: Review & Confirm
  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review & Confirm</Text>
      <Text style={styles.stepSubtitle}>Please review your booking details</Text>

      {/* Price Breakdown */}
      <View style={styles.priceBreakdown}>
        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        
        {passengers.map((passenger, index) => (
          <View key={passenger.id} style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {passenger.firstName} {passenger.lastName} ({passenger.type})
            </Text>
            <Text style={styles.priceValue}>
              {mockFlight.currency} {(
                passenger.type === 'adult' ? mockFlight.price :
                passenger.type === 'child' ? mockFlight.price * 0.75 :
                mockFlight.price * 0.1
              ).toFixed(2)}
            </Text>
          </View>
        ))}
        
        <View style={styles.priceDivider} />
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>
            {mockFlight.currency} {calculateTotalPrice().toFixed(2)}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Taxes & Fees</Text>
          <Text style={styles.priceValue}>
            {mockFlight.currency} {getTaxesAndFees().toFixed(2)}
          </Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {mockFlight.currency} {(calculateTotalPrice() + getTaxesAndFees()).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Terms and Conditions */}
      <View style={styles.termsSection}>
        <View style={styles.checkboxContainer}>
          <Switch
            value={agreedToTerms}
            onValueChange={setAgreedToTerms}
            trackColor={{ false: '#E5E7EB', true: '#A8344280' }}
            thumbColor={agreedToTerms ? '#A83442' : '#9CA3AF'}
          />
          <View style={styles.checkboxText}>
            <Text style={styles.checkboxLabel}>
              I agree to the <Text style={styles.linkText}>Terms & Conditions</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
            <Text style={styles.checkboxSubtitle}>
              By booking, you agree to our booking terms and privacy policy
            </Text>
          </View>
        </View>
      </View>

      {/* Important Notes */}
      <View style={styles.importantNotes}>
        <View style={styles.noteItem}>
          <Ionicons name="information-circle" size={16} color="#F59E0B" />
          <Text style={styles.noteText}>
            Please arrive at the airport at least 3 hours before international flights
          </Text>
        </View>
        <View style={styles.noteItem}>
          <Ionicons name="document-text" size={16} color="#F59E0B" />
          <Text style={styles.noteText}>
            Ensure all passport and visa requirements are met for your destination
          </Text>
        </View>
        <View style={styles.noteItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.noteText}>
            Free cancellation within 24 hours of booking
          </Text>
        </View>
      </View>
    </View>
  );

  // Family Members Selection Modal
  const renderFamilyModal = () => (
    <Modal
      visible={showFamilyModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFamilyModal(false)}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Family Members</Text>
          <TouchableOpacity 
            onPress={addFamilyMembersAsPassengers}
            disabled={selectedFamilyMembers.length === 0}
          >
            <Text style={[
              styles.modalSave,
              selectedFamilyMembers.length === 0 && styles.modalSaveDisabled
            ]}>
              Add ({selectedFamilyMembers.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalSubtitle}>
            Select family members to add to this booking
          </Text>
          
          {familyMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={[
                styles.familyMemberOption,
                selectedFamilyMembers.includes(member.id) && styles.familyMemberOptionSelected
              ]}
              onPress={() => {
                setSelectedFamilyMembers(prev => 
                  prev.includes(member.id)
                    ? prev.filter(id => id !== member.id)
                    : [...prev, member.id]
                );
              }}
            >
              <View style={styles.familyMemberInfo}>
                <View style={styles.familyMemberAvatar}>
                  <Text style={styles.familyMemberInitials}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.familyMemberDetails}>
                  <Text style={styles.familyMemberName}>{member.name}</Text>
                  <Text style={styles.familyMemberRelation}>
                    {member.relationship} • {member.age} years old
                  </Text>
                  <Text style={styles.familyMemberPassport}>
                    Passport: ••••{member.passportNumber.slice(-4)}
                  </Text>
                </View>
              </View>
              {selectedFamilyMembers.includes(member.id) && (
                <Ionicons name="checkmark-circle" size={24} color="#A83442" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Add/Edit Passenger Modal
  const renderAddPassengerModal = () => {
    const [tempPassenger, setTempPassenger] = useState<PassengerInfo>(
      editingPassenger || {
        id: '',
        type: 'adult',
        title: 'Mr',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'Male',
        nationality: 'United States',
        passportNumber: '',
        passportExpiry: '',
        passportIssueCountry: 'United States',
        specialRequests: [],
        seatPreference: 'Any',
        mealPreference: 'Standard',
      }
    );

    const handleSave = () => {
      if (!tempPassenger.firstName || !tempPassenger.lastName) {
        Alert.alert('Error', 'First name and last name are required');
        return;
      }
      
      // Auto-determine passenger type based on age
      if (tempPassenger.dateOfBirth) {
        const age = calculateAge(tempPassenger.dateOfBirth);
        tempPassenger.type = getPassengerType(age);
      }

      savePassenger(tempPassenger);
    };

    return (
      <Modal
        visible={showAddPassengerModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddPassengerModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingPassenger ? 'Edit Passenger' : 'Add Passenger'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Basic Info */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Basic Information</Text>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 0.3, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>Title</Text>
                  <View style={styles.pickerContainer}>
                    {['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'].map((title) => (
                      <TouchableOpacity
                        key={title}
                        style={[
                          styles.pickerOption,
                          tempPassenger.title === title && styles.pickerOptionSelected
                        ]}
                        onPress={() => setTempPassenger(prev => ({ ...prev, title: title as any }))}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          tempPassenger.title === title && styles.pickerOptionTextSelected
                        ]}>
                          {title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={[styles.inputGroup, { flex: 0.7 }]}>
                  <Text style={styles.inputLabel}>First Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={tempPassenger.firstName}
                    onChangeText={(value) => setTempPassenger(prev => ({ ...prev, firstName: value }))}
                    placeholder="Enter first name"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempPassenger.lastName}
                  onChangeText={(value) => setTempPassenger(prev => ({ ...prev, lastName: value }))}
                  placeholder="Enter last name"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>Date of Birth *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={tempPassenger.dateOfBirth}
                    onChangeText={(value) => setTempPassenger(prev => ({ ...prev, dateOfBirth: value }))}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <View style={styles.genderContainer}>
                    {['Male', 'Female'].map((gender) => (
                      <TouchableOpacity
                        key={gender}
                        style={[
                          styles.genderOption,
                          tempPassenger.gender === gender && styles.genderOptionSelected
                        ]}
                        onPress={() => setTempPassenger(prev => ({ ...prev, gender: gender as any }))}
                      >
                        <Text style={[
                          styles.genderOptionText,
                          tempPassenger.gender === gender && styles.genderOptionTextSelected
                        ]}>
                          {gender}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Travel Documents */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Travel Documents</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Passport Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempPassenger.passportNumber}
                  onChangeText={(value) => setTempPassenger(prev => ({ ...prev, passportNumber: value }))}
                  placeholder="Enter passport number"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>Expiry Date *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={tempPassenger.passportExpiry}
                    onChangeText={(value) => setTempPassenger(prev => ({ ...prev, passportExpiry: value }))}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Issue Country</Text>
                  <TextInput
                    style={styles.textInput}
                    value={tempPassenger.passportIssueCountry}
                    onChangeText={(value) => setTempPassenger(prev => ({ ...prev, passportIssueCountry: value }))}
                    placeholder="Issue country"
                  />
                </View>
              </View>
            </View>

            {/* Preferences */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Travel Preferences</Text>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>Seat Preference</Text>
                  <View style={styles.seatOptions}>
                    {['Window', 'Aisle', 'Middle', 'Any'].map((seat) => (
                      <TouchableOpacity
                        key={seat}
                        style={[
                          styles.seatOption,
                          tempPassenger.seatPreference === seat && styles.seatOptionSelected
                        ]}
                        onPress={() => setTempPassenger(prev => ({ ...prev, seatPreference: seat as any }))}
                      >
                        <Text style={[
                          styles.seatOptionText,
                          tempPassenger.seatPreference === seat && styles.seatOptionTextSelected
                        ]}>
                          {seat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Meal Preference</Text>
                  <View style={styles.mealOptions}>
                    {['Standard', 'Halal', 'Vegetarian', 'Kosher', 'Gluten-Free'].map((meal) => (
                      <TouchableOpacity
                        key={meal}
                        style={[
                          styles.mealOption,
                          tempPassenger.mealPreference === meal && styles.mealOptionSelected
                        ]}
                        onPress={() => setTempPassenger(prev => ({ ...prev, mealPreference: meal }))}
                      >
                        <Text style={[
                          styles.mealOptionText,
                          tempPassenger.mealPreference === meal && styles.mealOptionTextSelected
                        ]}>
                          {meal}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Special Requests</Text>
                <View style={styles.specialRequestsOptions}>
                  {['Extra legroom', 'Wheelchair assistance', 'Infant bassinet', 'Special assistance', 'Medical equipment'].map((request) => (
                    <TouchableOpacity
                      key={request}
                      style={[
                        styles.specialRequestOption,
                        tempPassenger.specialRequests.includes(request) && styles.specialRequestOptionSelected
                      ]}
                      onPress={() => {
                        setTempPassenger(prev => ({
                          ...prev,
                          specialRequests: prev.specialRequests.includes(request)
                            ? prev.specialRequests.filter(r => r !== request)
                            : [...prev.specialRequests, request]
                        }));
                      }}
                    >
                      <Text style={[
                        styles.specialRequestOptionText,
                        tempPassenger.specialRequests.includes(request) && styles.specialRequestOptionTextSelected
                      ]}>
                        {request}
                      </Text>
                      {tempPassenger.specialRequests.includes(request) && (
                        <Ionicons name="checkmark" size={16} color="#A83442" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // Main render function
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderPassengersStep();
      case 2: return renderContactStep();
      case 3: return renderPaymentStep();
      case 4: return renderReviewStep();
      default: return renderPassengersStep();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Passengers';
      case 2: return 'Contact';
      case 3: return 'Payment';
      case 4: return 'Review';
      default: return 'Checkout';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flight Checkout</Text>
        <Text style={styles.stepLabel}>{getStepTitle()}</Text>
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Flight Summary */}
      {renderFlightSummary()}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.nextButton, currentStep === 1 && styles.nextButtonFull]} 
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 4 ? `Pay ${mockFlight.currency} ${(calculateTotalPrice() + getTaxesAndFees()).toFixed(2)}` : 'Continue'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Modals */}
      {renderFamilyModal()}
      {renderAddPassengerModal()}
    </SafeAreaView>
  );
};

// Styles (Part 1)
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
  stepLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A83442',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: '#A83442',
  },
  stepInactive: {
    backgroundColor: '#E5E7EB',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepNumberInactive: {
    color: '#9CA3AF',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#A83442',
  },
  stepLineInactive: {
    backgroundColor: '#E5E7EB',
  },
  flightSummaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flightRoute: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  flightPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A83442',
  },
  flightDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  flightTime: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  airportText: {
    fontSize: 14,
    color: '#6B7280',
  },
  flightDuration: {
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  flightInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flightInfoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  classText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A83442',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  quickAddSection: {
    marginBottom: 24,
  },
  familyQuickAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    gap: 12,
  },
  familyQuickAddText: {
    flex: 1,
  },
  familyQuickAddTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  familyQuickAddSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  passengersSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A83442',
  },
  passengerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  passengerAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  passengerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  passengerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerInitials: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cameraIconSmall: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerInfo: {
    flex: 1,
  },
  passengerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  passengerTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  passengerTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  passengerDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  familyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  familyText: {
    fontSize: 12,
    color: '#A83442',
    fontWeight: '500',
  },
  passengerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerDocuments: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  documentLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  documentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'monospace',
  },
  specialRequests: {
    marginTop: 8,
  },
  specialRequestsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  requestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  requestTag: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  requestTagText: {
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '500',
  },
  passengerSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  summaryContent: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  countryCodeInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    width: 80,
  },
  phoneInput: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 16,
  },
  checkboxText: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  checkboxSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentMethods: {
    marginBottom: 24,
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  paymentOptionSelected: {
    borderColor: '#A83442',
    backgroundColor: '#FEF2F2',
  },
  paymentOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  paymentOptionTextSelected: {
    color: '#A83442',
    fontWeight: '500',
  },
  cardDetails: {
    marginBottom: 24,
  },
  cardRow: {
    flexDirection: 'row',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: '#065F46',
  },
  priceBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalRow: {
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A83442',
  },
  termsSection: {
    marginBottom: 24,
  },
  linkText: {
    color: '#A83442',
    fontWeight: '500',
  },
  importantNotes: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  previousButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    gap: 8,
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#A83442',
    borderRadius: 8,
    gap: 8,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A83442',
  },
  modalSaveDisabled: {
    color: '#9CA3AF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  familyMemberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  familyMemberOptionSelected: {
    borderColor: '#A83442',
    backgroundColor: '#FEF2F2',
  },
  familyMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  familyMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  familyMemberInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  familyMemberDetails: {
    flex: 1,
  },
  familyMemberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  familyMemberRelation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  familyMemberPassport: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  // Add Passenger Modal Styles
  formSection: {
    marginBottom: 24,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerOptionSelected: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  pickerOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  genderOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  genderOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  seatOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  seatOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  seatOptionSelected: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  seatOptionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  seatOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  mealOptions: {
    gap: 6,
  },
  mealOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  mealOptionSelected: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  mealOptionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  mealOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  specialRequestsOptions: {
    gap: 8,
  },
  specialRequestOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  specialRequestOptionSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#A83442',
  },
  specialRequestOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  specialRequestOptionTextSelected: {
    color: '#A83442',
    fontWeight: '500',
  },
}); 