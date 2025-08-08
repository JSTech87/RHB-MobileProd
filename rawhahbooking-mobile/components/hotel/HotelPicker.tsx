import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Typography } from '../../constants/Typography';

interface HotelPickerProps {
  value: {
    type: 'specific';
    hotelId?: string;
    hotelName?: string;
  };
  onValueChange: (value: {
    type: 'specific';
    hotelId?: string;
    hotelName?: string;
  }) => void;
  destination: { city: string; country?: string; lat?: number; lng?: number };
  error?: string;
}

const HotelPicker: React.FC<HotelPickerProps> = ({ 
  value, 
  onValueChange, 
  destination, 
  error 
}) => {
  const handleHotelNameChange = (text: string) => {
    onValueChange({
      ...value,
      hotelName: text,
      hotelId: text ? `hotel_${Date.now()}` : undefined,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Hotel Name *</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={`Enter hotel name in ${destination.city}`}
        placeholderTextColor="#6c757d"
        value={value.hotelName || ''}
        onChangeText={handleHotelNameChange}
        autoCapitalize="words"
      />
      {destination.city && (
        <Text style={styles.locationText}>
          Location: {destination.city}{destination.country ? `, ${destination.country}` : ''}
        </Text>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={styles.helpText}>
        Enter the specific hotel name you'd like to stay at. We'll verify availability and provide pricing.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {
    ...Typography.styles.caption,
    color: '#000000',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#dee2e6',
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  locationText: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorText: {
    ...Typography.styles.caption,
    color: '#dc3545',
    marginTop: 4,
  },
  helpText: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginTop: 8,
    lineHeight: 16,
  },
});

export default HotelPicker; 