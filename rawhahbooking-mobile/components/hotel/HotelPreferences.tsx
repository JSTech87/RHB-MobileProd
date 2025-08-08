import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Typography } from '../../constants/Typography';

interface HotelPreferencesProps {
  value: {
    type: 'preferences';
    rating?: 3 | 4 | 5;
    distanceMeters?: number;
    mealPlan?: 'RO' | 'BB' | 'HB' | 'FB' | 'AI';
    budget?: { min?: number; max?: number };
    brands?: string[];
    facilities?: string[];
  };
  onValueChange: (value: {
    type: 'preferences';
    rating?: 3 | 4 | 5;
    distanceMeters?: number;
    mealPlan?: 'RO' | 'BB' | 'HB' | 'FB' | 'AI';
    budget?: { min?: number; max?: number };
    brands?: string[];
    facilities?: string[];
  }) => void;
  error?: string;
}

const HotelPreferences: React.FC<HotelPreferencesProps> = ({ 
  value, 
  onValueChange, 
  error 
}) => {
  const updatePreference = (field: string, newValue: any) => {
    onValueChange({ ...value, [field]: newValue });
  };

  const toggleFacility = (facility: string) => {
    const facilities = value.facilities || [];
    const updated = facilities.includes(facility)
      ? facilities.filter(f => f !== facility)
      : [...facilities, facility];
    updatePreference('facilities', updated);
  };

  const ratingOptions = [
    { value: 3, label: '3 Stars' },
    { value: 4, label: '4 Stars' },
    { value: 5, label: '5 Stars' },
  ];

  const mealPlanOptions = [
    { value: 'RO', label: 'Room Only' },
    { value: 'BB', label: 'Bed & Breakfast' },
    { value: 'HB', label: 'Half Board' },
    { value: 'FB', label: 'Full Board' },
    { value: 'AI', label: 'All Inclusive' },
  ];

  const facilityOptions = [
    'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 
    'Room Service', 'Parking', 'Airport Shuttle', 'Business Center',
    'Conference Rooms', 'Pet Friendly', 'Family Rooms', 'Non-Smoking'
  ];

  return (
    <View style={styles.container}>
      {/* Minimum Rating */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Minimum Rating</Text>
        <View style={styles.optionRow}>
          {ratingOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.ratingOption,
                value.rating === option.value && styles.optionSelected
              ]}
              onPress={() => updatePreference('rating', 
                value.rating === option.value ? undefined : option.value
              )}
            >
              <Text style={[
                styles.optionText,
                value.rating === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Budget Range */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Budget per night (USD)</Text>
        <View style={styles.budgetRow}>
          <View style={styles.budgetField}>
            <Text style={styles.budgetLabel}>Min</Text>
            <TextInput
              style={styles.budgetInput}
              placeholder="0"
              placeholderTextColor="#6c757d"
              value={value.budget?.min?.toString() || ''}
              onChangeText={(text) => {
                const min = parseInt(text) || undefined;
                updatePreference('budget', { ...value.budget, min });
              }}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.budgetSeparator}>—</Text>
          <View style={styles.budgetField}>
            <Text style={styles.budgetLabel}>Max</Text>
            <TextInput
              style={styles.budgetInput}
              placeholder="∞"
              placeholderTextColor="#6c757d"
              value={value.budget?.max?.toString() || ''}
              onChangeText={(text) => {
                const max = parseInt(text) || undefined;
                updatePreference('budget', { ...value.budget, max });
              }}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Meal Plan */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Meal Plan (optional)</Text>
        <View style={styles.optionGrid}>
          {mealPlanOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.mealOption,
                value.mealPlan === option.value && styles.optionSelected
              ]}
              onPress={() => updatePreference('mealPlan', 
                value.mealPlan === option.value ? undefined : option.value
              )}
            >
              <Text style={[
                styles.optionText,
                value.mealPlan === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Must-Have Facilities */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Must-Have Facilities</Text>
        <View style={styles.facilityGrid}>
          {facilityOptions.map((facility) => (
            <TouchableOpacity
              key={facility}
              style={[
                styles.facilityOption,
                value.facilities?.includes(facility) && styles.optionSelected
              ]}
              onPress={() => toggleFacility(facility)}
            >
              <Text style={[
                styles.facilityText,
                value.facilities?.includes(facility) && styles.optionTextSelected
              ]}>
                {facility}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Remove maxHeight to prevent internal scrolling
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    ...Typography.styles.caption,
    color: '#000000',
    marginBottom: 12,
    fontWeight: '500',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  mealOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  facilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  optionSelected: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  optionText: {
    ...Typography.styles.caption,
    color: '#000000',
    fontWeight: '500',
  },
  facilityText: {
    ...Typography.styles.caption,
    color: '#000000',
    fontSize: 12,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  budgetField: {
    flex: 1,
  },
  budgetLabel: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginBottom: 6,
  },
  budgetInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    ...Typography.styles.bodyMedium,
    color: '#000000',
    textAlign: 'center',
  },
  budgetSeparator: {
    ...Typography.styles.bodyMedium,
    color: '#6c757d',
    paddingBottom: 10,
  },
  errorText: {
    ...Typography.styles.caption,
    color: '#dc3545',
    marginTop: 4,
  },
});

export default HotelPreferences; 