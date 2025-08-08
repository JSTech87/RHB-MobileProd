import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput } from 'react-native';
import { Typography } from '../../constants/Typography';

interface GuestCountProps {
  value: {
    adults: number;
    children: number;
    childAges?: number[];
  };
  onValueChange: (value: {
    adults: number;
    children: number;
    childAges?: number[];
  }) => void;
  error?: string;
}

const GuestCount: React.FC<GuestCountProps> = ({ value, onValueChange, error }) => {
  const [showModal, setShowModal] = useState(false);

  const updateCount = (field: 'adults' | 'children', increment: boolean) => {
    const newValue = { ...value };
    
    if (field === 'adults') {
      newValue.adults = Math.max(1, increment ? value.adults + 1 : value.adults - 1);
    } else {
      const newChildren = Math.max(0, increment ? value.children + 1 : value.children - 1);
      newValue.children = newChildren;
      
      // Adjust child ages array
      if (newChildren === 0) {
        newValue.childAges = [];
      } else if (newChildren > (value.childAges?.length || 0)) {
        // Add new ages (default to 5)
        newValue.childAges = [...(value.childAges || []), ...Array(newChildren - (value.childAges?.length || 0)).fill(5)];
      } else if (newChildren < (value.childAges?.length || 0)) {
        // Remove excess ages
        newValue.childAges = value.childAges?.slice(0, newChildren) || [];
      }
    }
    
    onValueChange(newValue);
  };

  const updateChildAge = (index: number, age: string) => {
    const ageNum = parseInt(age) || 0;
    const newAges = [...(value.childAges || [])];
    newAges[index] = Math.max(0, Math.min(17, ageNum));
    onValueChange({ ...value, childAges: newAges });
  };

  const getGuestText = () => {
    let text = `${value.adults} adult${value.adults > 1 ? 's' : ''}`;
    if (value.children > 0) {
      text += `, ${value.children} child${value.children > 1 ? 'ren' : ''}`;
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
        <Text style={styles.guestArrow}>▼</Text>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Guests</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Adults */}
              <View style={styles.counterRow}>
                <View style={styles.counterInfo}>
                  <Text style={styles.counterLabel}>Adults</Text>
                  <Text style={styles.counterSubLabel}>Ages 18+</Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={[styles.counterButton, value.adults <= 1 && styles.counterButtonDisabled]}
                    onPress={() => updateCount('adults', false)}
                    disabled={value.adults <= 1}
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
              <View style={styles.counterRow}>
                <View style={styles.counterInfo}>
                  <Text style={styles.counterLabel}>Children</Text>
                  <Text style={styles.counterSubLabel}>Ages 0-17</Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={[styles.counterButton, value.children <= 0 && styles.counterButtonDisabled]}
                    onPress={() => updateCount('children', false)}
                    disabled={value.children <= 0}
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
                  <Text style={styles.childAgesTitle}>Child Ages</Text>
                  <View style={styles.childAgesGrid}>
                    {Array.from({ length: value.children }).map((_, index) => (
                      <View key={index} style={styles.childAgeItem}>
                        <Text style={styles.childAgeLabel}>Child {index + 1}</Text>
                        <TextInput
                          style={styles.childAgeInput}
                          value={(value.childAges?.[index] || 5).toString()}
                          onChangeText={(text) => updateChildAge(index, text)}
                          keyboardType="numeric"
                          maxLength={2}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
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
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#dee2e6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestButtonError: {
    borderColor: '#dc3545',
  },
  guestText: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
  guestArrow: {
    ...Typography.styles.bodyMedium,
    color: '#6c757d',
  },
  errorText: {
    ...Typography.styles.caption,
    color: '#dc3545',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    ...Typography.styles.headerMedium,
    color: '#000000',
  },
  doneButton: {
    ...Typography.styles.bodyMedium,
    color: '#A83442',
    fontWeight: '600',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  counterInfo: {
    flex: 1,
  },
  counterLabel: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    marginBottom: 2,
  },
  counterSubLabel: {
    ...Typography.styles.caption,
    color: '#6c757d',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonDisabled: {
    opacity: 0.5,
  },
  counterButtonText: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    fontWeight: '600',
  },
  counterValue: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    minWidth: 24,
    textAlign: 'center',
  },
  childAgesSection: {
    paddingTop: 20,
  },
  childAgesTitle: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    marginBottom: 12,
    fontWeight: '600',
  },
  childAgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  childAgeItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  childAgeLabel: {
    ...Typography.styles.caption,
    color: '#6c757d',
    marginBottom: 6,
  },
  childAgeInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    textAlign: 'center',
    width: 60,
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
});

export default GuestCount; 