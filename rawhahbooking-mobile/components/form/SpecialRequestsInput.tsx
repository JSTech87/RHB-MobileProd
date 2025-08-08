import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Typography } from '../../constants/Typography';

interface SpecialRequestsInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

const SpecialRequestsInput: React.FC<SpecialRequestsInputProps> = ({ 
  value, 
  onValueChange, 
  placeholder = "Any special requests, dietary requirements, or additional notes...",
  error 
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.textArea, error && styles.textAreaError]}
        value={value}
        onChangeText={onValueChange}
        placeholder={placeholder}
        placeholderTextColor="#6c757d"
        multiline={true}
        numberOfLines={4}
        textAlignVertical="top"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  textArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minHeight: 100,
    maxHeight: 150,
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
  textAreaError: {
    borderColor: '#dc3545',
  },
  errorText: {
    ...Typography.styles.caption,
    color: '#dc3545',
    marginTop: 4,
  },
});

export default SpecialRequestsInput; 