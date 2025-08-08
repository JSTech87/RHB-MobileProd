import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { Typography } from '../../constants/Typography';

interface GuestCountProps {
  value: { adults: number; children: number; childAges?: number[] };
  onValueChange: (value: { adults: number; children: number; childAges?: number[] }) => void;
  error?: string;
}

const GuestCount: React.FC<GuestCountProps> = ({
  value,
  onValueChange,
  error,
}) => {
  const [showModal, setShowModal] = useState(false);

  const updateCount = (type: 'adults' | 'children', increment: boolean) => {
    const newValue = { ...value };
    
    if (type === 'adults') {
      newValue.adults = Math.max(1, increment ? value.adults + 1 : value.adults - 1);
    } else {
      const newChildren = Math.max(0, increment ? value.children + 1 : value.children - 1);
      newValue.children = newChildren;
      
      // Adjust child ages array
      if (newChildren === 0) {
        newValue.childAges = [];
      } else if (newChildren > (value.childAges?.length || 0)) {
        // Add new child ages
        newValue.childAges = [...(value.childAges || []), ...Array(newChildren - (value.childAges?.length || 0)).fill(5)];
      } else if (newChildren < (value.childAges?.length || 0)) {
        // Remove excess child ages
        newValue.childAges = value.childAges?.slice(0, newChildren);
      }
    }
    
    onValueChange(newValue);
  };

  const updateChildAge = (index: number, age: number) => {
    const newAges = [...(value.childAges || [])];
    newAges[index] = Math.max(0, Math.min(17, age));
    onValueChange({ ...value, childAges: newAges });
  };

  const getGuestText = () => {
    let text = `${value.adults} Adult${value.adults > 1 ? 's' : ''}`;
    if (value.children > 0) {
      text += `, ${value.children} Child${value.children > 1 ? 'ren' : ''}`;
    }
    return text;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.guestButton, error && styles.guestButtonError]}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.guestText}>{getGuestText()}</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Guests</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Adults */}
            <View style={styles.guestRow}>
              <Text style={styles.guestLabel}>Adults</Text>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateCount('adults', false)}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{value.adults}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateCount('adults', true)}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Children */}
            <View style={styles.guestRow}>
              <View>
                <Text style={styles.guestLabel}>Children</Text>
                <Text style={styles.guestSubLabel}>Ages 0-17</Text>
              </View>
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateCount('children', false)}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{value.children}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateCount('children', true)}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Child Ages */}
            {value.children > 0 && (
              <View style={styles.childAgesSection}>
                <Text style={styles.childAgesTitle}>Children Ages</Text>
                {Array.from({ length: value.children }, (_, index) => (
                  <View key={index} style={styles.childAgeRow}>
                    <Text style={styles.childAgeLabel}>Child {index + 1} Age</Text>
                    <TextInput
                      style={styles.ageInput}
                      value={String(value.childAges?.[index] || 5)}
                      onChangeText={(text) => updateChildAge(index, parseInt(text) || 5)}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  guestButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  guestButtonError: {
    borderColor: '#dc3545',
  },
  guestText: {
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
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    ...Typography.styles.headerMedium,
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
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  guestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  guestLabel: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
  guestSubLabel: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginTop: 2,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 8,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  counterButtonText: {
    ...Typography.styles.buttonMedium,
    color: '#000000',
  },
  counterValue: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  childAgesSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  childAgesTitle: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    marginBottom: 16,
  },
  childAgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  childAgeLabel: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
  ageInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    width: 60,
    textAlign: 'center',
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
});

export default GuestCount; 