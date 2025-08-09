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
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface FormData {
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  passportNumber: string;
  passportExpiry: string;
  visaNumber: string;
  visaExpiry: string;
  specialNeeds: string[];
  emergencyContact: string;
  emergencyPhone: string;
  profileImage?: string;
}

export const AddMemberScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    relationship: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    passportNumber: '',
    passportExpiry: '',
    visaNumber: '',
    visaExpiry: '',
    specialNeeds: [],
    emergencyContact: '',
    emergencyPhone: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [hasProfileImage, setHasProfileImage] = useState(false);
  const [isMinor, setIsMinor] = useState(false);

  const relationships = [
    'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 
    'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other'
  ];

  const specialNeedsOptions = [
    'Halal meals', 'Vegetarian meals', 'Kosher meals', 'Gluten-free meals',
    'Aisle seat', 'Window seat', 'Extra legroom', 
    'Wheelchair assistance', 'Special assistance', 'Infant care'
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSpecialNeed = (need: string) => {
    setFormData(prev => ({
      ...prev,
      specialNeeds: prev.specialNeeds.includes(need)
        ? prev.specialNeeds.filter(n => n !== need)
        : [...prev.specialNeeds, need]
    }));
  };

  const handleAddProfilePicture = () => {
    Alert.alert(
      'Add Profile Picture',
      'Choose how to add a profile picture',
      [
        { text: 'Take Photo', onPress: () => {
          console.log('Take photo');
          setHasProfileImage(true);
        }},
        { text: 'Choose from Gallery', onPress: () => {
          console.log('Choose from gallery');
          setHasProfileImage(true);
        }},
        { text: 'Skip for Now', style: 'cancel' },
      ]
    );
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.firstName.trim() !== '' && 
               formData.lastName.trim() !== '' && 
               formData.relationship.trim() !== '' &&
               formData.dateOfBirth.trim() !== '';
      case 2:
        return true; // Contact info is optional
      case 3:
        return formData.passportNumber.trim() !== '' && 
               formData.passportExpiry.trim() !== '';
      case 4:
        return true; // Preferences are optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      Alert.alert('Incomplete Information', 'Please fill in all required fields before continuing.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Add Family Member',
      `Add ${formData.firstName} ${formData.lastName} to your family?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add Member', 
          onPress: () => {
            console.log('Adding member:', formData);
            Alert.alert(
              'Member Added!', 
              `${formData.firstName} ${formData.lastName} has been added to your family.`,
              [{ text: 'OK', onPress: onBack }]
            );
          }
        },
      ]
    );
  };

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

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Basic details about the family member</Text>

      {/* Profile Picture */}
      <View style={styles.profilePictureContainer}>
        <TouchableOpacity 
          style={styles.profilePictureButton}
          onPress={handleAddProfilePicture}
        >
          {hasProfileImage ? (
            <View style={styles.profilePicture}>
              <Text style={styles.profileInitials}>
                {formData.firstName[0]}{formData.lastName[0]}
              </Text>
            </View>
          ) : (
            <View style={styles.addPictureButton}>
              <Ionicons name="camera" size={24} color="#A83442" />
              <Text style={styles.addPictureText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>First Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.firstName}
          onChangeText={(value) => handleInputChange('firstName', value)}
          placeholder="Enter first name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Last Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.lastName}
          onChangeText={(value) => handleInputChange('lastName', value)}
          placeholder="Enter last name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Relationship *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relationshipScroll}>
          <View style={styles.relationshipOptions}>
            {relationships.map((rel) => (
              <TouchableOpacity
                key={rel}
                style={[
                  styles.relationshipChip,
                  formData.relationship === rel && styles.relationshipChipSelected
                ]}
                onPress={() => handleInputChange('relationship', rel)}
              >
                <Text style={[
                  styles.relationshipText,
                  formData.relationship === rel && styles.relationshipTextSelected
                ]}>
                  {rel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Date of Birth *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.dateOfBirth}
          onChangeText={(value) => handleInputChange('dateOfBirth', value)}
          placeholder="MM/DD/YYYY"
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Is this person under 18?</Text>
        <Switch
          value={isMinor}
          onValueChange={setIsMinor}
          trackColor={{ false: '#E5E7EB', true: '#A8344280' }}
          thumbColor={isMinor ? '#A83442' : '#9CA3AF'}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Contact Information</Text>
      <Text style={styles.stepSubtitle}>How to reach this family member</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.textInput}
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          placeholder="+1 (555) 123-4567"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.textInput}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="email@example.com"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Emergency Contact Name</Text>
        <TextInput
          style={styles.textInput}
          value={formData.emergencyContact}
          onChangeText={(value) => handleInputChange('emergencyContact', value)}
          placeholder="Emergency contact name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Emergency Contact Phone</Text>
        <TextInput
          style={styles.textInput}
          value={formData.emergencyPhone}
          onChangeText={(value) => handleInputChange('emergencyPhone', value)}
          placeholder="+1 (555) 123-4567"
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Travel Documents</Text>
      <Text style={styles.stepSubtitle}>Passport and visa information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Passport Number *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.passportNumber}
          onChangeText={(value) => handleInputChange('passportNumber', value)}
          placeholder="Enter passport number"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Passport Expiry Date *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.passportExpiry}
          onChangeText={(value) => handleInputChange('passportExpiry', value)}
          placeholder="MM/DD/YYYY"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Visa Number (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.visaNumber}
          onChangeText={(value) => handleInputChange('visaNumber', value)}
          placeholder="Enter visa number"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Visa Expiry Date</Text>
        <TextInput
          style={styles.textInput}
          value={formData.visaExpiry}
          onChangeText={(value) => handleInputChange('visaExpiry', value)}
          placeholder="MM/DD/YYYY"
        />
      </View>

      <View style={styles.documentTip}>
        <Ionicons name="information-circle" size={20} color="#F59E0B" />
        <Text style={styles.documentTipText}>
          Make sure your passport is valid for at least 6 months from your travel date
        </Text>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Travel Preferences</Text>
      <Text style={styles.stepSubtitle}>Special requirements and preferences</Text>

      <Text style={styles.preferencesLabel}>Special Requirements</Text>
      <View style={styles.preferencesGrid}>
        {specialNeedsOptions.map((need) => (
          <TouchableOpacity
            key={need}
            style={styles.preferenceItem}
            onPress={() => toggleSpecialNeed(need)}
          >
            <View style={[
              styles.checkbox,
              formData.specialNeeds.includes(need) && styles.checkboxSelected
            ]}>
              {formData.specialNeeds.includes(need) && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.preferenceText}>{need}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Name: </Text>
            {formData.firstName} {formData.lastName}
          </Text>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Relationship: </Text>
            {formData.relationship}
          </Text>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Date of Birth: </Text>
            {formData.dateOfBirth}
          </Text>
          {formData.specialNeeds.length > 0 && (
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Special Needs: </Text>
              {formData.specialNeeds.join(', ')}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
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
        <Text style={styles.headerTitle}>Add Family Member</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.nextButton, currentStep === 1 && styles.nextButtonFull]} 
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 4 ? 'Add Member' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
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
  placeholder: {
    width: 40,
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
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePictureButton: {
    alignItems: 'center',
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addPictureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addPictureText: {
    fontSize: 12,
    color: '#A83442',
    marginTop: 4,
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
  relationshipScroll: {
    marginTop: 8,
  },
  relationshipOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  relationshipChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  relationshipChipSelected: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  relationshipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  relationshipTextSelected: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
  },
  documentTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginTop: 16,
    gap: 8,
  },
  documentTipText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  preferencesLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
  },
  preferencesGrid: {
    gap: 12,
    marginBottom: 24,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  preferenceText: {
    fontSize: 14,
    color: '#374151',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  summaryContent: {
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
  },
  summaryLabel: {
    fontWeight: '500',
    color: '#111827',
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
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    backgroundColor: '#A83442',
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 