import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Typography } from '../../constants/Typography';

interface GroupSectionProps {
  value?: {
    totalTravelers: number;
    roomingPreference?: 'twin' | 'triple' | 'quad' | 'mixed';
    subGroups?: { label: string; travelers: number }[];
    coordinator?: { name?: string; email?: string; phone?: string };
  };
  onValueChange: (value: {
    totalTravelers: number;
    roomingPreference?: 'twin' | 'triple' | 'quad' | 'mixed';
    subGroups?: { label: string; travelers: number }[];
    coordinator?: { name?: string; email?: string; phone?: string };
  }) => void;
  contactInfo?: { fullName: string; email: string; phone: string };
  errors?: {
    totalTravelers?: string;
    subGroups?: string;
  };
}

const GroupSection: React.FC<GroupSectionProps> = ({ 
  value, 
  onValueChange, 
  contactInfo, 
  errors 
}) => {
  const handleChange = (field: string, newValue: any) => {
    onValueChange({ ...value, [field]: newValue } as any);
  };

  const updateTravelers = (increment: boolean) => {
    const current = value?.totalTravelers || 1;
    const newValue = Math.max(1, increment ? current + 1 : current - 1);
    handleChange('totalTravelers', newValue);
  };

  const roomingOptions = [
    { key: 'twin', label: 'Twin Beds' },
    { key: 'triple', label: 'Triple Rooms' },
    { key: 'quad', label: 'Quad Rooms' },
    { key: 'mixed', label: 'Mixed' },
  ];

  // Default coordinator to contact info if available
  const coordinator = value?.coordinator || {
    name: contactInfo?.fullName || '',
    email: contactInfo?.email || '',
    phone: contactInfo?.phone || '',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Group Booking Details</Text>

      {/* Total Travelers */}
      <View style={styles.field}>
        <Text style={styles.label}>Total Travelers *</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={[styles.counterButton, (value?.totalTravelers || 1) <= 1 && styles.counterButtonDisabled]}
            onPress={() => updateTravelers(false)}
            disabled={(value?.totalTravelers || 1) <= 1}
          >
            <Text style={styles.counterButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{value?.totalTravelers || 1}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => updateTravelers(true)}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        {errors?.totalTravelers && <Text style={styles.errorText}>{errors.totalTravelers}</Text>}
      </View>

      {/* Rooming Preference */}
      <View style={styles.field}>
        <Text style={styles.label}>Rooming Preference (optional)</Text>
        <View style={styles.roomingOptions}>
          {roomingOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.roomingOption,
                value?.roomingPreference === option.key && styles.roomingOptionSelected
              ]}
              onPress={() => handleChange('roomingPreference', 
                value?.roomingPreference === option.key ? undefined : option.key
              )}
            >
              <Text style={[
                styles.roomingOptionText,
                value?.roomingPreference === option.key && styles.roomingOptionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Group Coordinator */}
      <View style={styles.field}>
        <Text style={styles.label}>Group Coordinator</Text>
        <Text style={styles.coordinatorNote}>
          Defaults to your contact information. Edit if needed.
        </Text>
        
        <View style={styles.coordinatorFields}>
          <TextInput
            style={styles.coordinatorInput}
            placeholder="Coordinator name"
            placeholderTextColor="#6c757d"
            value={coordinator.name}
            onChangeText={(text) => handleChange('coordinator', { ...coordinator, name: text })}
          />
          <TextInput
            style={styles.coordinatorInput}
            placeholder="Coordinator email"
            placeholderTextColor="#6c757d"
            value={coordinator.email}
            onChangeText={(text) => handleChange('coordinator', { ...coordinator, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.coordinatorInput}
            placeholder="Coordinator phone"
            placeholderTextColor="#6c757d"
            value={coordinator.phone}
            onChangeText={(text) => handleChange('coordinator', { ...coordinator, phone: text })}
            keyboardType="phone-pad"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  sectionTitle: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    ...Typography.styles.caption,
    color: '#000000',
    marginBottom: 8,
    fontWeight: '500',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonDisabled: {
    opacity: 0.5,
  },
  counterButtonText: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    fontWeight: '600',
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
    backgroundColor: '#FFFFFF',
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
  coordinatorNote: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  coordinatorFields: {
    gap: 12,
  },
  coordinatorInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
  errorText: {
    ...Typography.styles.caption,
    color: '#dc3545',
    marginTop: 4,
  },
});

export default GroupSection; 