import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Typography } from '../../constants/Typography';
import DestinationSelector from '../form/DestinationSelector';
import DateRangeField from '../form/DateRangeField';
import HotelPicker from './HotelPicker';
import HotelPreferences from './HotelPreferences';

export interface StayData {
  destination: { city: string; country?: string; lat?: number; lng?: number };
  dates: { checkIn: string; checkOut: string };
  rooms: number;
  hotelChoice: {
    type: 'specific' | 'preferences';
    hotelId?: string;
    hotelName?: string;
    rating?: number;
    distanceMeters?: number;
    mealPlan?: string;
    budget?: { min?: number; max?: number };
    brands?: string[];
    facilities?: string[];
  };
  notes?: string;
}

interface StayCardProps {
  index: number;
  stay: StayData;
  onUpdate: (stay: StayData) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  canRemove: boolean;
  errors?: any;
}

const StayCard: React.FC<StayCardProps> = ({
  index,
  stay,
  onUpdate,
  onDuplicate,
  onRemove,
  canRemove,
  errors
}) => {
  const [hasSpecificHotel, setHasSpecificHotel] = useState(stay.hotelChoice.type === 'specific');

  const updateStay = (field: keyof StayData, value: any) => {
    onUpdate({ ...stay, [field]: value });
  };

  const updateRooms = (increment: boolean) => {
    const newRooms = Math.max(1, increment ? stay.rooms + 1 : stay.rooms - 1);
    updateStay('rooms', newRooms);
  };

  const toggleHotelChoice = (isSpecific: boolean) => {
    setHasSpecificHotel(isSpecific);
    if (isSpecific) {
      updateStay('hotelChoice', { type: 'specific', hotelId: '', hotelName: '' });
    } else {
      updateStay('hotelChoice', { type: 'preferences' });
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Stay {index + 1}{stay.destination.city ? ` — ${stay.destination.city}` : ''}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onDuplicate}>
            <Text style={styles.actionButtonText}>📋</Text>
          </TouchableOpacity>
          {canRemove && (
            <TouchableOpacity style={styles.actionButton} onPress={onRemove}>
              <Text style={styles.actionButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Destination */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Destination</Text>
        <DestinationSelector
          value={stay.destination}
          onValueChange={(destination) => updateStay('destination', destination)}
          error={errors?.destination?.city?.message}
        />
      </View>

      {/* Dates */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Dates</Text>
        <DateRangeField
          value={stay.dates}
          onValueChange={(dates) => updateStay('dates', dates)}
          error={errors?.dates?.checkIn?.message || errors?.dates?.checkOut?.message}
        />
      </View>

      {/* Rooms */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Rooms</Text>
        <View style={styles.roomsInput}>
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={() => updateRooms(false)}
          >
            <Text style={styles.counterButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{stay.rooms}</Text>
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={() => updateRooms(true)}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hotel Choice Toggle */}
      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <Text style={styles.sectionLabel}>I have a specific hotel</Text>
          <Switch
            value={hasSpecificHotel}
            onValueChange={toggleHotelChoice}
            trackColor={{ false: '#e9ecef', true: '#A83442' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Hotel Selection */}
      <View style={styles.section}>
        {hasSpecificHotel ? (
          <HotelPicker
            value={stay.hotelChoice}
            onValueChange={(hotelChoice) => updateStay('hotelChoice', hotelChoice)}
            destination={stay.destination}
            error={errors?.hotelChoice?.hotelId?.message}
          />
        ) : (
          <HotelPreferences
            value={stay.hotelChoice}
            onValueChange={(hotelChoice) => updateStay('hotelChoice', hotelChoice)}
            error={errors?.hotelChoice?.message}
          />
        )}
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Notes for this stay (optional)</Text>
        <View style={styles.notesInput}>
          <Text style={styles.notesPlaceholder}>Any special requests for this stay...</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    ...Typography.styles.headerMedium,
    color: '#000000',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    ...Typography.styles.label,
    color: '#000000',
    marginBottom: 8,
    fontWeight: '500',
  },
  roomsInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignSelf: 'flex-start',
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  counterButtonText: {
    ...Typography.styles.buttonMedium,
    color: '#000000',
  },
  counterValue: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notesInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minHeight: 60,
    justifyContent: 'center',
  },
  notesPlaceholder: {
    ...Typography.styles.bodyMedium,
    color: '#6c757d',
  },
});

export default StayCard; 