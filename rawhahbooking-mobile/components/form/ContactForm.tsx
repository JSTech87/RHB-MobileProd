import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Typography } from '../../constants/Typography';

interface ContactFormProps {
  value: { fullName: string; email: string; phone: string };
  onValueChange: (value: { fullName: string; email: string; phone: string }) => void;
  errors: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
}

const ContactForm: React.FC<ContactFormProps> = ({
  value,
  onValueChange,
  errors,
}) => {
  const handleChange = (field: keyof typeof value, text: string) => {
    onValueChange({ ...value, [field]: text });
  };

  return (
    <View style={styles.container}>
      {/* Full Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={[styles.input, errors.fullName && styles.inputError]}
          value={value.fullName}
          onChangeText={(text) => handleChange('fullName', text)}
          placeholder="Enter your full name"
          placeholderTextColor="#6c757d"
          autoCapitalize="words"
          autoComplete="name"
        />
        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
      </View>

      {/* Email Address */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={value.email}
          onChangeText={(text) => handleChange('email', text)}
          placeholder="your@email.com"
          placeholderTextColor="#6c757d"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Phone Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          value={value.phone}
          onChangeText={(text) => handleChange('phone', text)}
          placeholder="+1 (555) 123-4567"
          placeholderTextColor="#6c757d"
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  inputGroup: {},
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
  errorText: {
    ...Typography.styles.caption,
    color: '#dc3545',
    marginTop: 4,
  },
});

export default ContactForm; 