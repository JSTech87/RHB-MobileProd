import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Typography } from '../../constants/Typography';

interface DateRangeFieldProps {
  value: { checkIn: string; checkOut: string };
  onValueChange: (dates: { checkIn: string; checkOut: string }) => void;
  error?: string;
}

const DateRangeField: React.FC<DateRangeFieldProps> = ({ value, onValueChange, error }) => {
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleCheckInChange = (event: any, selectedDate?: Date) => {
    setShowCheckInPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      onValueChange({ ...value, checkIn: dateString });
    }
  };

  const handleCheckOutChange = (event: any, selectedDate?: Date) => {
    setShowCheckOutPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      onValueChange({ ...value, checkOut: dateString });
    }
  };

  const getMinDate = () => {
    return new Date(); // Today
  };

  const getCheckOutMinDate = () => {
    if (value.checkIn) {
      const checkInDate = new Date(value.checkIn);
      checkInDate.setDate(checkInDate.getDate() + 1); // Next day after check-in
      return checkInDate;
    }
    return new Date();
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
        {/* Check-in Date */}
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>Check-in</Text>
          <TouchableOpacity
            style={[styles.dateButton, error && styles.dateButtonError]}
            onPress={() => setShowCheckInPicker(true)}
          >
            <Text style={[
              styles.dateButtonText,
              !value.checkIn && styles.dateButtonPlaceholder
            ]}>
              {formatDate(value.checkIn)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Check-out Date */}
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>Check-out</Text>
          <TouchableOpacity
            style={[styles.dateButton, error && styles.dateButtonError]}
            onPress={() => setShowCheckOutPicker(true)}
          >
            <Text style={[
              styles.dateButtonText,
              !value.checkOut && styles.dateButtonPlaceholder
            ]}>
              {formatDate(value.checkOut)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Duration Display */}
      {value.checkIn && value.checkOut && (
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>
            {(() => {
              const checkIn = new Date(value.checkIn);
              const checkOut = new Date(value.checkOut);
              const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return `${diffDays} night${diffDays > 1 ? 's' : ''}`;
            })()}
          </Text>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Check-in Date Picker */}
      {showCheckInPicker && (
        <DateTimePicker
          value={value.checkIn ? new Date(value.checkIn) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleCheckInChange}
          minimumDate={getMinDate()}
        />
      )}

      {/* Check-out Date Picker */}
      {showCheckOutPicker && (
        <DateTimePicker
          value={value.checkOut ? new Date(value.checkOut) : getCheckOutMinDate()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleCheckOutChange}
          minimumDate={getCheckOutMinDate()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginBottom: 6,
  },
  dateButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  dateButtonError: {
    borderColor: '#dc3545',
  },
  dateButtonText: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
  dateButtonPlaceholder: {
    color: '#6c757d',
  },
  durationContainer: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e8f5e8',
    borderRadius: 20,
    alignSelf: 'center',
  },
  durationText: {
    ...Typography.styles.caption,
    color: '#28a745',
    fontWeight: '600',
  },
  errorText: {
    ...Typography.styles.caption,
    color: '#dc3545',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default DateRangeField; 