import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import DateTimePicker, { DateType } from 'react-native-ui-datepicker';
import { Typography } from '../../constants/Typography';

interface DateRangeFieldProps {
  value: { checkIn: string; checkOut: string };
  onValueChange: (dates: { checkIn: string; checkOut: string }) => void;
  error?: string;
}

const DateRangeField: React.FC<DateRangeFieldProps> = ({ value, onValueChange, error }) => {
  const [showDateModal, setShowDateModal] = useState(false);
  
  // Local Date state like the flight picker
  const [localCheckIn, setLocalCheckIn] = useState<Date>(() => 
    value.checkIn ? new Date(value.checkIn) : new Date()
  );
  const [localCheckOut, setLocalCheckOut] = useState<Date>(() => 
    value.checkOut ? new Date(value.checkOut) : new Date()
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatDateRange = () => {
    if (!value.checkIn && !value.checkOut) return 'Select dates';
    if (!value.checkIn) return 'Select check-in date';
    if (!value.checkOut) return `${formatDate(value.checkIn)} - Select check-out`;
    return `${formatDate(value.checkIn)} - ${formatDate(value.checkOut)}`;
  };

  const calculateDaysBetween = () => {
    if (!value.checkIn || !value.checkOut) return 0;
    const checkIn = new Date(value.checkIn);
    const checkOut = new Date(value.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDurationText = () => {
    if (!value.checkIn || !value.checkOut) return '';
    const nights = calculateDaysBetween();
    return `${nights} night${nights > 1 ? 's' : ''}`;
  };

  const handleModalOpen = useCallback(() => {
    // Sync local state with props when opening modal
    if (value.checkIn) setLocalCheckIn(new Date(value.checkIn));
    if (value.checkOut) setLocalCheckOut(new Date(value.checkOut));
    setShowDateModal(true);
  }, [value.checkIn, value.checkOut]);

  const handleDateChange = useCallback((params: any) => {
    console.log('Hotel date change params:', params);
    
    // Update local state exactly like flight picker
    if (params.startDate) {
      setLocalCheckIn(params.startDate as Date);
    }
    if (params.endDate) {
      setLocalCheckOut(params.endDate as Date);
    }
    
    // Update parent only when both dates are selected
    if (params.startDate && params.endDate) {
      const checkInDate = new Date(params.startDate);
      const checkOutDate = new Date(params.endDate);
      
      onValueChange({
        checkIn: checkInDate.toISOString().split('T')[0],
        checkOut: checkOutDate.toISOString().split('T')[0],
      });
    }
  }, [onValueChange]);

  return (
    <View style={styles.container}>
      {/* Single Date Pill - matching flight search design */}
      <TouchableOpacity 
        style={styles.singleDateRowContainer}
        onPress={handleModalOpen}
      >
        <View style={[styles.inputContainer, error && styles.inputContainerError]}>
          <View style={styles.inputContent}>
            <Text style={styles.inputLabel}>Check-in - Check-out</Text>
            <Text style={[
              styles.formInputText,
              (!value.checkIn || !value.checkOut) && styles.formInputPlaceholder
            ]}>
              {formatDateRange()}
            </Text>
          </View>
        </View>
        {getDurationText() && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{getDurationText()}</Text>
          </View>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modern Date Selection Modal - IDENTICAL to Flight Search */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modernDateModalContainer}>
          {/* Header */}
          <View style={styles.modernDateHeader}>
            <Text style={styles.modernModalTitle}>Select Dates</Text>
            <TouchableOpacity 
              style={styles.modernCloseButton}
              onPress={() => setShowDateModal(false)}
            >
              <Text style={styles.modernCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Modern Date Picker - IDENTICAL to Flight Search */}
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              mode="range"
              startDate={localCheckIn}
              endDate={localCheckOut}
              onChange={handleDateChange}
              minDate={new Date()}
              firstDayOfWeek={1}
              styles={{
                selected: { backgroundColor: '#A83442' },
                selected_label: { color: '#FFFFFF' },
                today: { borderColor: '#A83442' },
                today_label: { color: '#A83442' },
              }}
            />
          </View>

          {/* Footer */}
          <View style={styles.modernDateFooter}>
            <TouchableOpacity 
              style={styles.modernDoneButton}
              onPress={() => setShowDateModal(false)}
            >
              <Text style={styles.modernDoneButtonText}>Confirm Dates</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  singleDateRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  inputContainerError: {
    borderColor: '#dc3545',
  },
  inputContent: {
    alignItems: 'center',
  },
  inputLabel: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginBottom: 4,
    fontSize: 12,
  },
  formInputText: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    fontWeight: '600',
  },
  formInputPlaceholder: {
    color: '#6c757d',
    fontWeight: '400',
  },
  durationBadge: {
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 80,
    alignItems: 'center',
  },
  durationText: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
  errorText: {
    ...Typography.styles.caption,
    color: '#dc3545',
    marginTop: 4,
    textAlign: 'center',
  },
  // Modern Date Modal Styles - IDENTICAL to Flight Search
  modernDateModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modernDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: 50, // Account for status bar
  },
  modernModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modernCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernCloseButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '600',
  },
  datePickerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modernDateFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modernDoneButton: {
    backgroundColor: '#A83442',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modernDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DateRangeField; 