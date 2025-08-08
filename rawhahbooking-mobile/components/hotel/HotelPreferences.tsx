import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Typography } from '../../constants/Typography';

interface HotelPreferencesProps {
  value: {
    type: 'preferences';
    rating?: number;
    distanceMeters?: number;
    mealPlan?: string;
    budget?: { min?: number; max?: number };
    brands?: string[];
    facilities?: string[];
  };
  onValueChange: (value: {
    type: 'preferences';
    rating?: number;
    distanceMeters?: number;
    mealPlan?: string;
    budget?: { min?: number; max?: number };
    brands?: string[];
    facilities?: string[];
  }) => void;
  error?: string;
}

const HotelPreferences: React.FC<HotelPreferencesProps> = ({ value, onValueChange, error }) => {
  const updatePreference = (field: string, newValue: any) => {
    onValueChange({ ...value, [field]: newValue });
  };

  const ratings = [3, 4, 5];
  const mealPlans = [
    { key: 'RO', label: 'Room Only' },
    { key: 'BB', label: 'Bed & Breakfast' },
    { key: 'HB', label: 'Half Board' },
    { key: 'FB', label: 'Full Board' },
    { key: 'AI', label: 'All Inclusive' },
  ];

  const facilities = ['WiFi', 'Pool', 'Gym', 'Spa', 'Shuttle', 'Parking', 'Restaurant', 'Bar'];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Hotel Preferences</Text>

      {/* Rating */}
      <View style={styles.section}>
        <Text style={styles.label}>Minimum Rating</Text>
        <View style={styles.ratingRow}>
          {ratings.map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                value.rating === rating && styles.ratingButtonSelected
              ]}
              onPress={() => updatePreference('rating', rating)}
            >
              <Text style={[
                styles.ratingButtonText,
                value.rating === rating && styles.ratingButtonTextSelected
              ]}>
                {rating}★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Budget */}
      <View style={styles.section}>
        <Text style={styles.label}>Budget per night (USD)</Text>
        <View style={styles.budgetRow}>
          <View style={styles.budgetInput}>
            <Text style={styles.budgetLabel}>Min</Text>
            <TextInput
              style={styles.budgetField}
              placeholder="0"
              placeholderTextColor="#6c757d"
              keyboardType="numeric"
              value={value.budget?.min?.toString() || ''}
              onChangeText={(text) => {
                const min = text ? parseInt(text) || undefined : undefined;
                updatePreference('budget', { ...value.budget, min });
              }}
            />
          </View>
          <View style={styles.budgetInput}>
            <Text style={styles.budgetLabel}>Max</Text>
            <TextInput
              style={styles.budgetField}
              placeholder="∞"
              placeholderTextColor="#6c757d"
              keyboardType="numeric"
              value={value.budget?.max?.toString() || ''}
              onChangeText={(text) => {
                const max = text ? parseInt(text) || undefined : undefined;
                updatePreference('budget', { ...value.budget, max });
              }}
            />
          </View>
        </View>
      </View>

      {/* Meal Plan */}
      <View style={styles.section}>
        <Text style={styles.label}>Meal Plan (optional)</Text>
        <View style={styles.mealPlanRow}>
          {mealPlans.map((plan) => (
            <TouchableOpacity
              key={plan.key}
              style={[
                styles.mealPlanButton,
                value.mealPlan === plan.key && styles.mealPlanButtonSelected
              ]}
              onPress={() => updatePreference('mealPlan', value.mealPlan === plan.key ? undefined : plan.key)}
            >
              <Text style={[
                styles.mealPlanButtonText,
                value.mealPlan === plan.key && styles.mealPlanButtonTextSelected
              ]}>
                {plan.key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Facilities */}
      <View style={styles.section}>
        <Text style={styles.label}>Must-have facilities (optional)</Text>
        <View style={styles.facilitiesGrid}>
          {facilities.map((facility) => (
            <TouchableOpacity
              key={facility}
              style={[
                styles.facilityChip,
                value.facilities?.includes(facility) && styles.facilityChipSelected
              ]}
              onPress={() => {
                const currentFacilities = value.facilities || [];
                const newFacilities = currentFacilities.includes(facility)
                  ? currentFacilities.filter(f => f !== facility)
                  : [...currentFacilities, facility];
                updatePreference('facilities', newFacilities);
              }}
            >
              <Text style={[
                styles.facilityChipText,
                value.facilities?.includes(facility) && styles.facilityChipTextSelected
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
  container: {},
  sectionTitle: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    marginBottom: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  ratingButtonSelected: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  ratingButtonText: {
    ...Typography.styles.caption,
    color: '#6c757d',
  },
  ratingButtonTextSelected: {
    color: '#FFFFFF',
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  budgetInput: {
    flex: 1,
  },
  budgetLabel: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginBottom: 4,
  },
  budgetField: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
  mealPlanRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealPlanButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  mealPlanButtonSelected: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  mealPlanButtonText: {
    ...Typography.styles.caption,
    color: '#6c757d',
    fontSize: 12,
  },
  mealPlanButtonTextSelected: {
    color: '#FFFFFF',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  facilityChipSelected: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  facilityChipText: {
    ...Typography.styles.caption,
    color: '#6c757d',
    fontSize: 12,
  },
  facilityChipTextSelected: {
    color: '#FFFFFF',
  },
  errorText: {
    ...Typography.styles.caption,
    color: '#dc3545',
    marginTop: 8,
  },
});

export default HotelPreferences; 