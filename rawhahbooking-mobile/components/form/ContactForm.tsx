import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Typography } from '../../constants/Typography';

interface ContactFormProps {
  value: {
    fullName: string;
    email: string;
    phone: string;
  };
  onValueChange: (value: {
    fullName: string;
    email: string;
    phone: string;
  }) => void;
  errors?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
}

const ContactForm: React.FC<ContactFormProps> = ({ value, onValueChange, errors }) => {
  const handleChange = (field: keyof typeof value, text: string) => {
    onValueChange({ ...value, [field]: text });
  };

  return (
    <View style={styles.container}>
      {/* Full Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={[styles.input, errors?.fullName && styles.inputError]}
          placeholder="Enter your full name"
          placeholderTextColor="#6c757d"
          value={value.fullName}
          onChangeText={(text) => handleChange('fullName', text)}
          autoCapitalize="words"
        />
        {errors?.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
      </View>

      {/* Email */}
      <View style={styles.field}>
        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          style={[styles.input, errors?.email && styles.inputError]}
          placeholder="Enter your email address"
          placeholderTextColor="#6c757d"
          value={value.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errors?.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Phone */}
      <View style={styles.field}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={[styles.input, errors?.phone && styles.inputError]}
          placeholder="Enter your phone number"
          placeholderTextColor="#6c757d"
          value={value.phone}
          onChangeText={(text) => handleChange('phone', text)}
          keyboardType="phone-pad"
        />
        {errors?.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  field: {},
  label: {
    ...Typography.styles.caption,
    color: '#000000',
    marginBottom: 6,
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
  errorText: {
    ...Typography.styles.caption,
    color: '#dc3545',
    marginTop: 4,
  },
});

export default ContactForm; 