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
  Image,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  profileImage?: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  marketingEmails: boolean;
  pushNotifications: boolean;
  twoFactorAuth: boolean;
}

export const ProfileSettingsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'Irvan',
    lastName: 'Moses',
    username: 'irvanmoses',
    email: 'irvan.moses@gmail.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    gender: 'Male',
    nationality: 'United States',
    emergencyContactName: 'Sarah Moses',
    emergencyContactPhone: '+1 (555) 987-6543',
    marketingEmails: true,
    pushNotifications: true,
    twoFactorAuth: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleInputChange = (field: keyof UserProfile, value: string | boolean) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleImagePicker = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      Alert.alert(
        'Change Profile Picture',
        'Choose an option',
        [
          { text: 'Take Photo', onPress: () => openCamera() },
          { text: 'Choose from Gallery', onPress: () => openGallery() },
          { text: 'Remove Photo', style: 'destructive', onPress: () => removePhoto() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.log('Error requesting permission:', error);
    }
  };

  const openCamera = async () => {
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
        handleInputChange('profileImage', result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        handleInputChange('profileImage', result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const removePhoto = () => {
    handleInputChange('profileImage', '');
  };

  const handleSave = () => {
    Alert.alert(
      'Save Changes',
      'Are you sure you want to save these changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: () => {
            console.log('Saving profile:', profile);
            setIsEditing(false);
            setHasUnsavedChanges(false);
            Alert.alert('Success', 'Profile updated successfully!');
          }
        },
      ]
    );
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to cancel?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard Changes', 
            style: 'destructive',
            onPress: () => {
              setIsEditing(false);
              setHasUnsavedChanges(false);
              // Reset profile to original state here if needed
            }
          },
        ]
      );
    } else {
      setIsEditing(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Save before leaving?',
        [
          { text: 'Discard', style: 'destructive', onPress: onBack },
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: handleSave },
        ]
      );
    } else {
      onBack?.();
    }
  };

  const renderProfilePicture = () => (
    <View style={styles.profilePictureContainer}>
      <TouchableOpacity 
        style={styles.profilePictureButton}
        onPress={handleImagePicker}
      >
        {profile.profileImage ? (
          <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.defaultAvatar}>
            <Text style={styles.avatarInitials}>
              {profile.firstName[0]}{profile.lastName[0]}
            </Text>
          </View>
        )}
        <View style={styles.cameraOverlay}>
          <Ionicons name="camera" size={20} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
      <Text style={styles.profilePictureText}>Tap to change photo</Text>
    </View>
  );

  const renderEditableField = (
    label: string,
    field: keyof UserProfile,
    placeholder: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default'
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.textInput}
          value={profile[field] as string}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={placeholder}
          keyboardType={keyboardType}
        />
      ) : (
        <View style={styles.readOnlyField}>
          <Text style={styles.fieldValue}>{profile[field] as string}</Text>
        </View>
      )}
    </View>
  );

  const renderSwitchField = (
    label: string,
    field: keyof UserProfile,
    subtitle?: string
  ) => (
    <View style={styles.switchContainer}>
      <View style={styles.switchText}>
        <Text style={styles.switchLabel}>{label}</Text>
        {subtitle && <Text style={styles.switchSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={profile[field] as boolean}
        onValueChange={(value) => handleInputChange(field, value)}
        trackColor={{ false: '#E5E7EB', true: '#A8344280' }}
        thumbColor={profile[field] ? '#A83442' : '#9CA3AF'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={isEditing ? handleCancel : () => setIsEditing(true)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.sectionCard}>
          {renderProfilePicture()}
        </View>

        {/* Basic Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          {renderEditableField('First Name', 'firstName', 'Enter first name')}
          {renderEditableField('Last Name', 'lastName', 'Enter last name')}
          {renderEditableField('Username', 'username', 'Enter username')}
          {renderEditableField('Email Address', 'email', 'Enter email address', 'email-address')}
          {renderEditableField('Phone Number', 'phone', 'Enter phone number', 'phone-pad')}
        </View>

        {/* Personal Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          
          {renderEditableField('Date of Birth', 'dateOfBirth', 'MM/DD/YYYY')}
          {renderEditableField('Gender', 'gender', 'Enter gender')}
          {renderEditableField('Nationality', 'nationality', 'Enter nationality')}
        </View>

        {/* Emergency Contact */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          
          {renderEditableField('Contact Name', 'emergencyContactName', 'Enter emergency contact name')}
          {renderEditableField('Contact Phone', 'emergencyContactPhone', 'Enter emergency contact phone', 'phone-pad')}
        </View>

        {/* Preferences */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          {renderSwitchField(
            'Marketing Emails',
            'marketingEmails',
            'Receive promotional emails and offers'
          )}
          {renderSwitchField(
            'Push Notifications',
            'pushNotifications',
            'Get notified about bookings and updates'
          )}
          {renderSwitchField(
            'Two-Factor Authentication',
            'twoFactorAuth',
            'Add extra security to your account'
          )}
        </View>

        {/* Account Actions */}
        {isEditing && (
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Danger Zone */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Change Password', 'Redirect to change password screen')}
          >
            <Ionicons name="key" size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Export Data', 'Your data export will be emailed to you within 24 hours')}
          >
            <Ionicons name="download" size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Export My Data</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]}
            onPress={() => Alert.alert(
              'Delete Account',
              'This action cannot be undone. All your data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete account') },
              ]
            )}
          >
            <Ionicons name="trash" size={20} color="#EF4444" />
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={16} color="#EF4444" />
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
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  editButtonText: {
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
    marginBottom: 16,
  },
  profilePictureContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profilePictureButton: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  defaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profilePictureText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
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
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  readOnlyField: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  fieldValue: {
    fontSize: 16,
    color: '#111827',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchText: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  switchSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A83442',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dangerButtonText: {
    color: '#EF4444',
  },
}); 