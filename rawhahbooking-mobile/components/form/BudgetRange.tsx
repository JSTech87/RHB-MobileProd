import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Typography } from '../../constants/Typography';

interface BudgetRangeProps {
  value?: { min?: number; max?: number };
  onValueChange: (value: { min?: number; max?: number }) => void;
  error?: string;
}

const BudgetRange: React.FC<BudgetRangeProps> = ({
  value = {},
  onValueChange,
  error,
}) => {
  const handleMinChange = (text: string) => {
    const min = text ? parseInt(text) || undefined : undefined;
    onValueChange({ ...value, min });
  };

  const handleMaxChange = (text: string) => {
    const max = text ? parseInt(text) || undefined : undefined;
    onValueChange({ ...value, max });
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>From ($)</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value.min?.toString() || ''}
            onChangeText={handleMinChange}
            placeholder="Min budget"
            placeholderTextColor="#6c757d"
            keyboardType="numeric"
          />
        </View>
        
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>To ($)</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value.max?.toString() || ''}
            onChangeText={handleMaxChange}
            placeholder="Max budget"
            placeholderTextColor="#6c757d"
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <Text style={styles.helperText}>Leave blank if no budget limit</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {},
  inputLabel: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginBottom: 4,
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
  inputError: {
    borderColor: '#dc3545',
  },
  helperText: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorText: {
    ...Typography.styles.caption,
    color: '#dc3545',
    marginTop: 4,
  },
});

export default BudgetRange; 