import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Typography } from '../../constants/Typography';

interface DateRangeFieldProps {
  value: { checkIn: string; checkOut: string };
  onValueChange: (value: { checkIn: string; checkOut: string }) => void;
  error?: string;
}

const DateRangeField: React.FC<DateRangeFieldProps> = ({
  value,
  onValueChange,
  error,
}) => {
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select dates';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCheckInChange = (event: any, selectedDate?: Date) => {
    setShowCheckInPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      onValueChange({
        ...value,
        checkIn: dateString,
      });
    }
  };

  const handleCheckOutChange = (event: any, selectedDate?: Date) => {
    setShowCheckOutPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      onValueChange({
        ...value,
        checkOut: dateString,
      });
    }
  };

  const today = new Date();
  const checkInDate = value.checkIn ? new Date(value.checkIn) : today;
  const minCheckOutDate = value.checkIn ? new Date(value.checkIn) : today;
  minCheckOutDate.setDate(minCheckOutDate.getDate() + 1);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.dateButton, error && styles.dateButtonError]}
        onPress={() => setShowCheckInPicker(true)}
      >
        <Text style={styles.dateLabel}>Check-in</Text>
        <Text style={styles.dateValue}>
          {value.checkIn ? formatDate(value.checkIn) : 'Select date'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.dateButton, error && styles.dateButtonError]}
        onPress={() => setShowCheckOutPicker(true)}
      >
        <Text style={styles.dateLabel}>Check-out</Text>
        <Text style={styles.dateValue}>
          {value.checkOut ? formatDate(value.checkOut) : 'Select date'}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {showCheckInPicker && (
        <Modal transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowCheckInPicker(false)}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerTitle}>Check-in Date</Text>
                <TouchableOpacity onPress={() => setShowCheckInPicker(false)}>
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={checkInDate}
                mode="date"
                display="spinner"
                onChange={handleCheckInChange}
                minimumDate={today}
              />
            </View>
          </View>
        </Modal>
      )}

      {showCheckOutPicker && (
        <Modal transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowCheckOutPicker(false)}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerTitle}>Check-out Date</Text>
                <TouchableOpacity onPress={() => setShowCheckOutPicker(false)}>
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={value.checkOut ? new Date(value.checkOut) : minCheckOutDate}
                mode="date"
                display="spinner"
                onChange={handleCheckOutChange}
                minimumDate={minCheckOutDate}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  dateButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  dateButtonError: {
    borderColor: '#dc3545',
  },
  dateLabel: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginBottom: 4,
  },
  dateValue: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
  errorText: {
    ...Typography.styles.caption,
    color: '#dc3545',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerTitle: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
  cancelButton: {
    ...Typography.styles.bodyMedium,
    color: '#6c757d',
  },
  doneButton: {
    ...Typography.styles.bodyMedium,
    color: '#A83442',
  },
});

export default DateRangeField; 