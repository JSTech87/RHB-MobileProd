import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Typography } from '../../constants/Typography';

interface GroupSectionProps {
  value?: {
    groupName?: string;
    totalTravelers: number;
    roomingPreference?: 'twin' | 'triple' | 'quad' | 'mixed';
    coordinator?: { fullName: string; phone: string; email: string };
  };
  onValueChange: (value: {
    groupName?: string;
    totalTravelers: number;
    roomingPreference?: 'twin' | 'triple' | 'quad' | 'mixed';
    coordinator?: { fullName: string; phone: string; email: string };
  }) => void;
  contactInfo?: { fullName: string; phone: string; email: string };
  errors: {
    totalTravelers?: string;
    subGroups?: string;
  };
}

const GroupSection: React.FC<GroupSectionProps> = ({
  value = { totalTravelers: 5 },
  onValueChange,
  contactInfo,
  errors,
}) => {
  const roomingOptions = [
    { key: 'twin', label: 'Twin' },
    { key: 'triple', label: 'Triple' },
    { key: 'quad', label: 'Quad' },
    { key: 'mixed', label: 'Mixed' },
  ];

  const handleChange = (field: string, newValue: any) => {
    onValueChange({ ...value, [field]: newValue });
  };

  const updateTravelers = (increment: boolean) => {
    const newCount = Math.max(1, increment ? value.totalTravelers + 1 : value.totalTravelers - 1);
    handleChange('totalTravelers', newCount);
  };

  // Use contact info as default coordinator if not set
  const coordinator = value.coordinator || (contactInfo ? {
    fullName: contactInfo.fullName,
    phone: contactInfo.phone,
    email: contactInfo.email,
  } : { fullName: '', phone: '', email: '' });

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Group Booking Details</Text>

      {/* Group Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Group Name (Optional)</Text>
        <TextInput
          style={styles.input}
          value={value.groupName || ''}
          onChangeText={(text) => handleChange('groupName', text)}
          placeholder="e.g., Family & Friends"
          placeholderTextColor="#6c757d"
        />
      </View>

      {/* Total Travelers */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Total Travelers</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => updateTravelers(false)}
          >
            <Text style={styles.counterButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{value.totalTravelers}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => updateTravelers(true)}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        {errors.totalTravelers && <Text style={styles.errorText}>{errors.totalTravelers}</Text>}
      </View>

      {/* Rooming Preference */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Rooming Preference (Optional)</Text>
        <View style={styles.roomingOptions}>
          {roomingOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.roomingOption,
                value.roomingPreference === option.key && styles.roomingOptionSelected
              ]}
              onPress={() => handleChange('roomingPreference', option.key)}
            >
              <Text style={[
                styles.roomingOptionText,
                value.roomingPreference === option.key && styles.roomingOptionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Group Coordinator */}
      <View style={styles.coordinatorSection}>
        <Text style={styles.sectionTitle}>Group Coordinator</Text>
        <Text style={styles.coordinatorNote}>
          {contactInfo ? 'Using your contact information as coordinator' : 'Please provide coordinator details'}
        </Text>
        
        <View style={styles.coordinatorInfo}>
          <Text style={styles.coordinatorText}>Name: {coordinator.fullName || 'Not provided'}</Text>
          <Text style={styles.coordinatorText}>Phone: {coordinator.phone || 'Not provided'}</Text>
          <Text style={styles.coordinatorText}>Email: {coordinator.email || 'Not provided'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  sectionTitle: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    ...Typography.styles.caption,
    color: '#6c757d',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignSelf: 'flex-start',
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
  roomingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roomingOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  roomingOptionSelected: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  roomingOptionText: {
    ...Typography.styles.caption,
    color: '#6c757d',
  },
  roomingOptionTextSelected: {
    color: '#FFFFFF',
  },
  coordinatorSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  coordinatorNote: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  coordinatorInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  coordinatorText: {
    ...Typography.styles.bodySmall,
    color: '#000000',
  },
  errorText: {
    ...Typography.styles.caption,
    color: '#dc3545',
    marginTop: 4,
  },
});

export default GroupSection; 