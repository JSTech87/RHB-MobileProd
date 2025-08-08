import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Typography } from '../../constants/Typography';

interface HotelPickerProps {
  value: {
    type: 'specific';
    hotelId?: string;
    hotelName?: string;
  };
  onValueChange: (value: { type: 'specific'; hotelId: string; hotelName: string }) => void;
  destination: { city: string; country?: string };
  error?: string;
}

const HotelPicker: React.FC<HotelPickerProps> = ({ value, onValueChange, destination, error }) => {
  const [hotelName, setHotelName] = useState(value.hotelName || '');

  const handleHotelSelect = (name: string, id: string) => {
    setHotelName(name);
    onValueChange({ type: 'specific', hotelId: id, hotelName: name });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Hotel in {destination.city}</Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholder="Search for a specific hotel..."
          placeholderTextColor="#6c757d"
          value={hotelName}
          onChangeText={(text) => {
            setHotelName(text);
            // For now, just use the text as both name and ID
            // In a real implementation, this would search a hotel database
            onValueChange({ type: 'specific', hotelId: text, hotelName: text });
          }}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {/* Placeholder for hotel search results */}
      <Text style={styles.helpText}>
        🏨 Start typing to search for hotels in {destination.city}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  input: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    padding: 0,
    margin: 0,
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
    fontStyle: 'italic',
  },
});

export default HotelPicker; 