import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Typography } from '../../constants/Typography';

interface SpecialRequestsInputProps {
  value: string;
  onValueChange: (value: string) => void;
}

const SpecialRequestsInput: React.FC<SpecialRequestsInputProps> = ({
  value,
  onValueChange,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textArea}
        value={value}
        onChangeText={onValueChange}
        placeholder="Any special requests or preferences..."
        placeholderTextColor="#6c757d"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        autoCapitalize="sentences"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  textArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    ...Typography.styles.bodyMedium,
    color: '#000000',
    minHeight: 100,
  },
});

export default SpecialRequestsInput; 