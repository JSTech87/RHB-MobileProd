import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker, { DateType } from 'react-native-ui-datepicker';
import FromToPicker from '../components/FromToPicker';
import { AirportOption } from '../services/airportSearch';

const { width, height } = Dimensions.get('window');

interface PassengerCounts {
  adults: number;
  children: number;
  infantsInSeat: number;
  infantsOnLap: number;
}

export const SearchScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [selectedService, setSelectedService] = useState<'hotel' | 'flight'>('flight');
  const [selectedTripType, setSelectedTripType] = useState<'oneWay' | 'roundTrip' | 'multiCity'>('oneWay');
  const [fromAirport, setFromAirport] = useState<AirportOption | null>(null);
  const [toAirport, setToAirport] = useState<AirportOption | null>(null);
  const [seatClass, setSeatClass] = useState('Business');
  
  // Date objects for calendar
  const [selectedDepartureDate, setSelectedDepartureDate] = useState(new Date(2025, 7, 12)); // Aug 12, 2025
  const [selectedReturnDate, setSelectedReturnDate] = useState(new Date(2025, 7, 19)); // Aug 19, 2025
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 7, 1)); // August 2025
  const [isSelectingDeparture, setIsSelectingDeparture] = useState(true);
  
  // Modal states
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  
  // Passenger counts
  const [passengers, setPassengers] = useState<PassengerCounts>({
    adults: 1,
    children: 0,
    infantsInSeat: 0,
    infantsOnLap: 0,
  });

  const handleSearch = () => {
    // Navigate to FlightResults screen at the root level
    navigation?.navigate('FlightResults');
  };

  const handleHotelInquiry = () => {
    // Navigate to Hotel Inquiry Screen
    navigation?.navigate('HotelInquiry');
  };

  const renderHotelForm = () => {
    return (
      <View style={styles.hotelContainer}>
        {/* Main Heading */}
        <Text style={styles.hotelMainHeading}>Professional Hotel Accommodations</Text>
        
        {/* Subheading */}
        <Text style={styles.hotelSubheading}>
          A trusted selection of quality hotels offering excellent service, comfort, and value.
        </Text>

        {/* How It Works Section */}
        <View style={styles.hotelSection}>
          <Text style={styles.hotelSectionTitle}>How It Works</Text>
          <View style={styles.hotelStepItem}>
            <Text style={styles.hotelStepNumber}>1.</Text>
            <Text style={styles.hotelStepText}>Tell Us Your Plans – Destination, travel dates, and preferences.</Text>
          </View>
          <View style={styles.hotelStepItem}>
            <Text style={styles.hotelStepNumber}>2.</Text>
            <Text style={styles.hotelStepText}>Get Expert Options – We'll find the most suitable hotels for you.</Text>
          </View>
          <View style={styles.hotelStepItem}>
            <Text style={styles.hotelStepNumber}>3.</Text>
            <Text style={styles.hotelStepText}>Book Securely – Confirm with confidence at the best rate.</Text>
          </View>
        </View>

        {/* Quality Selection Section */}
        <View style={styles.hotelSection}>
          <Text style={styles.hotelSectionTitle}>Quality Selection</Text>
          <Text style={styles.hotelBodyText}>Hotels approved for reliability and comfort.</Text>
        </View>

        {/* Best Rate Guarantee Section */}
        <View style={styles.hotelSection}>
          <Text style={styles.hotelSectionTitle}>Best Rate Guarantee</Text>
          <Text style={styles.hotelBodyText}>Competitive pricing you can trust.</Text>
        </View>

        {/* Fast Response Section */}
        <View style={styles.hotelSection}>
          <Text style={styles.hotelSectionTitle}>Fast Response</Text>
          <Text style={styles.hotelBodyText}>Booking options sent within 10–15 minutes.</Text>
        </View>
      </View>
    );
  };

  const getPassengerText = () => {
    const parts = [];
    if (passengers.adults > 0) parts.push(`${passengers.adults}A`);
    if (passengers.children > 0) parts.push(`${passengers.children}C`);
    if (passengers.infantsInSeat > 0) parts.push(`${passengers.infantsInSeat}IS`);
    if (passengers.infantsOnLap > 0) parts.push(`${passengers.infantsOnLap}IL`);
    
    return parts.length > 0 ? parts.join(' ') : '1A';
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatDateRange = (departure: Date, returnDate: Date) => {
    const depFormatted = formatDate(departure);
    const retFormatted = formatDate(returnDate);
    return `${depFormatted} - ${retFormatted}`;
  };

  const calculateDaysBetween = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isDateInRange = (date: Date, start: Date, end: Date) => {
    return date >= start && date <= end;
  };

  const getDurationText = () => {
    if (selectedTripType === 'roundTrip') {
      const diffDays = calculateDaysBetween(selectedDepartureDate, selectedReturnDate);
      return `${diffDays} days`;
    }
    return '';
  };

  const updatePassengerCount = (type: keyof PassengerCounts, increment: boolean) => {
    setPassengers(prev => {
      const newCount = increment ? prev[type] + 1 : Math.max(0, prev[type] - 1);
      // Ensure at least 1 adult
      if (type === 'adults' && newCount === 0) return prev;
      return { ...prev, [type]: newCount };
    });
  };

  const ServiceTab = ({ type, label }: { type: 'hotel' | 'flight', label: string }) => (
    <TouchableOpacity
      style={[styles.serviceTab, selectedService === type && styles.serviceTabActive]}
      onPress={() => setSelectedService(type)}
    >
      <Text style={[styles.serviceTabText, selectedService === type && styles.serviceTabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const TripTypeOption = ({ type, label }: { type: 'oneWay' | 'roundTrip' | 'multiCity', label: string }) => (
    <TouchableOpacity
      style={styles.tripType}
      onPress={() => setSelectedTripType(type)}
    >
      <View style={[styles.radioButton, selectedTripType === type && styles.radioButtonSelected]}>
        <View style={[styles.radioInner, selectedTripType === type && styles.radioInnerSelected]} />
      </View>
      <Text style={styles.tripTypeText}>{label}</Text>
    </TouchableOpacity>
  );

  const renderSearchForm = () => {
    if (selectedTripType === 'oneWay') {
      return (
        <>
          {/* From/To Picker */}
          <FromToPicker
            mode="flight"
            onChange={({ from, to }) => {
              setFromAirport(from);
              setToAirport(to);
            }}
            onSwap={() => {
              const temp = fromAirport;
              setFromAirport(toAirport);
              setToAirport(temp);
            }}
          />

          {/* Date Section */}
          <View style={styles.formSection}>
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={() => setShowDateModal(true)}
            >
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Departure Date</Text>
                <Text style={styles.formInputText}>{formatDate(selectedDepartureDate)}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Bottom Row */}
          <View style={styles.bottomRow}>
            <TouchableOpacity 
              style={styles.passengerCabinContainer}
              onPress={() => setShowPassengerModal(true)}
            >
              <View style={styles.passengerSection}>
                <Text style={styles.inputLabel}>Travelers</Text>
                <Text style={styles.formInputText}>{getPassengerText()}</Text>
              </View>
              <View style={styles.cabinSection}>
                <Text style={styles.inputLabel}>Class</Text>
                <Text style={styles.cabinClassText}>{seatClass}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      );
    } else if (selectedTripType === 'roundTrip') {
      return (
        <>
          {/* From/To Picker */}
          <FromToPicker
            mode="flight"
            onChange={({ from, to }) => {
              setFromAirport(from);
              setToAirport(to);
            }}
            onSwap={() => {
              const temp = fromAirport;
              setFromAirport(toAirport);
              setToAirport(temp);
            }}
          />

          <View style={styles.locationDivider}>
            <View style={styles.flightPath} />
          </View>

          {/* Date Row for Round Trip */}
          <TouchableOpacity 
            style={styles.singleDateRowContainer}
            onPress={() => setShowDateModal(true)}
          >
            <View style={styles.inputContainer}>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Departure Date - Return Date</Text>
                <Text style={styles.formInputText}>
                  {formatDate(selectedDepartureDate)} - {formatDate(selectedReturnDate)}
                </Text>
              </View>
            </View>
            {getDurationText() && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{getDurationText()}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Bottom Row */}
          <View style={styles.bottomRow}>
            <TouchableOpacity 
              style={styles.passengerCabinContainer}
              onPress={() => setShowPassengerModal(true)}
            >
              <View style={styles.passengerSection}>
                <Text style={styles.inputLabel}>Travelers</Text>
                <Text style={styles.formInputText}>{getPassengerText()}</Text>
              </View>
              <View style={styles.cabinSection}>
                <Text style={styles.inputLabel}>Class</Text>
                <Text style={styles.cabinClassText}>{seatClass}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      );
    } else {
      // Multi City
      return (
        <>
          {/* From/To Picker */}
          <FromToPicker
            mode="flight"
            onChange={({ from, to }) => {
              setFromAirport(from);
              setToAirport(to);
            }}
            onSwap={() => {
              const temp = fromAirport;
              setFromAirport(toAirport);
              setToAirport(temp);
            }}
          />

          <View style={styles.locationDivider}>
            <View style={styles.flightPath} />
          </View>

          {/* Date Section */}
          <View style={styles.formSection}>
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={() => setShowDateModal(true)}
            >
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Departure Date</Text>
                <Text style={styles.formInputText}>{formatDate(selectedDepartureDate)}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Add Flight Button */}
          <TouchableOpacity style={styles.addFlightButton}>
            <Text style={styles.addFlightText}>+ Add Another Flight</Text>
          </TouchableOpacity>

          {/* Bottom Row */}
          <View style={styles.bottomRow}>
            <TouchableOpacity 
              style={styles.passengerCabinContainer}
              onPress={() => setShowPassengerModal(true)}
            >
              <View style={styles.passengerSection}>
                <Text style={styles.inputLabel}>Travelers</Text>
                <Text style={styles.formInputText}>{getPassengerText()}</Text>
              </View>
              <View style={styles.cabinSection}>
                <Text style={styles.inputLabel}>Class</Text>
                <Text style={styles.cabinClassText}>{seatClass}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D6D5C9" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Bar Area */}
        <View style={styles.statusBarArea} />

        {/* Header Section */}
        <View style={styles.header}>
          {/* Profile Greeting */}
          <View style={styles.profileGreeting}>
            <View style={styles.profileSection}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>IM</Text>
              </View>
              <View style={styles.greetingText}>
                <Text style={styles.greeting}>Good morning,</Text>
                <Text style={styles.username}>Irvan Moses</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bellIcon}>
              <Text style={styles.bellIconText}>🔔</Text>
            </TouchableOpacity>
          </View>

          {/* Service Tabs */}
          <View style={styles.serviceTabs}>
            <ServiceTab type="hotel" label="Hotel" />
            <ServiceTab type="flight" label="Flight" />
          </View>

          {/* Trip Type Selection - Only show for flights */}
          {selectedService === 'flight' && (
            <View style={styles.tripTypes}>
              <TripTypeOption type="oneWay" label="One way" />
              <TripTypeOption type="roundTrip" label="Round Trip" />
              <TripTypeOption type="multiCity" label="Multi City" />
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Ticket Style Form */}
          <View style={styles.ticketForm}>
            {/* Ticket cutouts */}
            <View style={[styles.cutout, styles.leftCutout]} />
            <View style={[styles.cutout, styles.rightCutout]} />

            {selectedService === 'hotel' ? renderHotelForm() : renderSearchForm()}

            {/* Search Button */}
            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={selectedService === 'hotel' ? handleHotelInquiry : handleSearch}
            >
              <Text style={styles.searchButtonText}>
                {selectedService === 'hotel' 
                  ? 'Start Hotel Inquiry' 
                  : (selectedTripType === 'multiCity' ? 'Search Ticket' : 'Search')
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Passenger Selection Modal */}
      <Modal
        visible={showPassengerModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPassengerModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Travelers and Cabin class</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Adults */}
            <View style={styles.passengerRow}>
              <Text style={styles.passengerLabel}>Adults</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => updatePassengerCount('adults', false)}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{passengers.adults}</Text>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => updatePassengerCount('adults', true)}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Children */}
            <View style={styles.passengerRow}>
              <View>
                <Text style={styles.passengerLabel}>Children</Text>
                <Text style={styles.passengerSubLabel}>Ages 2 to 17</Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => updatePassengerCount('children', false)}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{passengers.children}</Text>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => updatePassengerCount('children', true)}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Infants in seat */}
            <View style={styles.passengerRow}>
              <View>
                <Text style={styles.passengerLabel}>Infants in seat</Text>
                <Text style={styles.passengerSubLabel}>Younger than 2</Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => updatePassengerCount('infantsInSeat', false)}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{passengers.infantsInSeat}</Text>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => updatePassengerCount('infantsInSeat', true)}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Infants on lap */}
            <View style={styles.passengerRow}>
              <View>
                <Text style={styles.passengerLabel}>Infants on lap</Text>
                <Text style={styles.passengerSubLabel}>Younger than 2</Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => updatePassengerCount('infantsOnLap', false)}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{passengers.infantsOnLap}</Text>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => updatePassengerCount('infantsOnLap', true)}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Cabin Class */}
            <View style={styles.cabinClassSection}>
              <Text style={styles.sectionTitle}>Cabin class</Text>
              <TouchableOpacity 
                style={styles.cabinClassSelector}
                onPress={() => setShowClassModal(true)}
              >
                <Text style={styles.cabinClassValue}>{seatClass}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
              
              {showClassModal && (
                <View style={styles.classDropdown}>
                  {['Economy', 'Premium Economy', 'Business', 'First Class'].map((classType) => (
                    <TouchableOpacity
                      key={classType}
                      style={[styles.classDropdownOption, seatClass === classType && styles.classDropdownOptionSelected]}
                      onPress={() => {
                        setSeatClass(classType);
                        setShowClassModal(false);
                      }}
                    >
                      <Text style={[styles.classDropdownText, seatClass === classType && styles.classDropdownTextSelected]}>
                        {classType}
                      </Text>
                      {seatClass === classType && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => setShowPassengerModal(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Selection Modal */}
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

          {/* Modern Date Picker */}
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              mode={selectedTripType === 'roundTrip' ? 'range' : 'single'}
              startDate={selectedTripType === 'roundTrip' ? selectedDepartureDate : undefined}
              endDate={selectedTripType === 'roundTrip' ? selectedReturnDate : undefined}
              date={selectedTripType === 'oneWay' ? selectedDepartureDate : undefined}
              onChange={(params: any) => {
                if (selectedTripType === 'roundTrip') {
                  if (params.startDate) setSelectedDepartureDate(params.startDate as Date);
                  if (params.endDate) setSelectedReturnDate(params.endDate as Date);
                } else {
                  if (params.date) setSelectedDepartureDate(params.date as Date);
                }
              }}
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
  container: {
    flex: 1,
    backgroundColor: '#D6D5C9',
  },
  scrollView: {
    flex: 1,
  },
  statusBarArea: {
    height: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileGreeting: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 25,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600', // Changed from '700' to semi-bold
  },
  greetingText: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: '600', // Changed from '700' to semi-bold
    color: '#000000',
  },
  bellIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#000000',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  bellIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  serviceTabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  serviceTab: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  serviceTabActive: {
    backgroundColor: '#A83442',
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  serviceTabText: {
    fontSize: 16,
    fontWeight: '600', // Changed from '700' to semi-bold
    color: '#6c757d',
  },
  serviceTabTextActive: {
    color: '#FFFFFF',
  },
  tripTypes: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 5,
  },
  tripType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#dee2e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#A83442',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A83442',
    opacity: 0,
  },
  radioInnerSelected: {
    opacity: 1,
  },
  tripTypeText: {
    fontSize: 16,
    fontWeight: '400', // Changed from '500' to normal
    color: '#000000',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  ticketForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  cutout: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D6D5C9',
    top: '50%',
    marginTop: -8,
    zIndex: 2,
  },
  leftCutout: {
    left: -8,
  },
  rightCutout: {
    right: -8,
  },
  formSection: {
    marginBottom: 8,
    position: 'relative',
  },
  formLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
    fontWeight: '500',
  },
  formInput: {
    fontSize: 16,
    fontWeight: '500', // Changed from '700' to medium
    color: '#000000',
    flex: 1,
    borderWidth: 0,
    paddingVertical: 0,
    marginTop: 4,
  },
  airportCode: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    marginLeft: 8,
  },
  locationDivider: {
    height: 20,
    marginVertical: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flightPath: {
    position: 'absolute',
    left: 20,
    right: 60,
    top: '50%',
    marginTop: -1,
    height: 2,
    borderTopWidth: 2,
    borderTopColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  swapButton: {
    position: 'absolute',
    right: 20,
    top: -35,
    width: 40,
    height: 40,
    backgroundColor: '#000000',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  swapButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  dateField: {
    flex: 1,
  },
  bottomRow: {
    marginBottom: 24,
  },
  bottomField: {
    flex: 1,
    minWidth: 0,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 8,
  },
  searchButton: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600', // Changed from '700' to semi-bold
  },
  addFlightButton: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 24,
  },
  addFlightText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500', // Changed from '700' to medium
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minHeight: 60,
  },
  inputContent: {
    flex: 1,
    minWidth: 0,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    fontWeight: '500',
  },
  formInputText: {
    fontSize: 16,
    fontWeight: '500', // Changed from '700' to medium
    color: '#000000',
  },
  dateRowContainer: {
    marginBottom: 20,
  },
  durationBadge: {
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginTop: -10,
  },
  durationText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeButton: {
    fontSize: 24,
    color: '#6c757d',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600', // Changed from '700' to semi-bold
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  modalFooter: {
    paddingBottom: 20,
  },
  passengerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  passengerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  passengerSubLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  counterButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  counterButtonText: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '600', // Changed from '700' to semi-bold
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '600', // Changed from '700' to semi-bold
    color: '#000000',
    paddingHorizontal: 10,
  },
  cabinClassSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  cabinClassSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cabinClassValue: {
    fontSize: 16,
    fontWeight: '500', // Changed from '700' to medium
    color: '#000000',
  },
  doneButton: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600', // Changed from '700' to semi-bold
  },
  passengerCabinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minHeight: 60,
  },
  passengerSection: {
    flex: 1,
    minWidth: 0,
  },
  cabinSection: {
    minWidth: 0,
  },
  cabinClassText: {
    fontSize: 16,
    fontWeight: '500', // Changed from '700' to medium
    color: '#000000',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  classDropdown: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginTop: 8,
    overflow: 'hidden',
  },
  classDropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  classDropdownOptionSelected: {
    backgroundColor: '#f8f9fa',
  },
  classDropdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  classDropdownTextSelected: {
    color: '#A83442',
  },
  checkmark: {
    fontSize: 18,
    color: '#A83442',
    marginLeft: 10,
  },
  dateModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  dateModalHeader: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  closeButtonContainer: {
    alignSelf: 'flex-end',
    padding: 10,
    marginBottom: 10,
  },
  roundTripDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  oneWayDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  dateRangePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    flex: 1,
    marginRight: 12,
  },
  dateSection: {
    flex: 1,
    alignItems: 'center',
  },
  dateSectionActive: {
    backgroundColor: '#A83442',
    borderRadius: 25,
    paddingVertical: 10,
  },
  dateSectionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6c757d',
  },
  dateSectionTextActive: {
    color: '#FFFFFF',
  },
  singleDatePill: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  singleDateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  dateArrow: {
    fontSize: 20,
    color: '#6c757d',
    marginHorizontal: 10,
  },
  dayCounter: {
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  dayCounterText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  calendarContainer: {
    flex: 1,
  },
  monthSection: {
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekHeaderText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayButton: {
    width: (width - 40 - 16) / 7, // Adjust for padding and gap
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  departureDay: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  returnDay: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  rangeDay: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
  },
  pastDay: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
    opacity: 0.5,
  },
  pastDayText: {
    color: '#6c757d',
  },
  emptyDay: {
    width: (width - 40 - 16) / 7,
    aspectRatio: 1,
  },
  dateModalFooter: {
    paddingBottom: 20,
  },
  singleDateRowContainer: {
    marginBottom: 20,
  },
  modernDateModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  modernDateHeader: {
    marginBottom: 20,
  },
  modernHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modernModalTitle: {
    fontSize: 20,
    fontWeight: '600', // Changed from '700' to semi-bold
    color: '#000000',
  },
  modernCloseButton: {
    padding: 10,
  },
  modernCloseButtonText: {
    fontSize: 24,
    color: '#6c757d',
  },
  modernDateTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  modernDateTab: {
    alignItems: 'center',
    flex: 1,
  },
  modernDateTabActive: {
    backgroundColor: '#A83442',
    borderRadius: 25,
    paddingVertical: 10,
  },
  modernTabLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  modernTabDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  modernTabDateActive: {
    color: '#FFFFFF',
  },
  modernDateConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  modernConnectorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dee2e6',
    marginHorizontal: 10,
  },
  modernConnectorText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  modernCalendarContainer: {
    flex: 1,
  },
  modernMonthContainer: {
    marginBottom: 20,
  },
  modernMonthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  modernWeekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  modernWeekHeaderText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  modernCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  modernEmptyDay: {
    width: (width - 40 - 16) / 7,
    aspectRatio: 1,
  },
  modernDayButton: {
    width: (width - 40 - 16) / 7, // Adjust for padding and gap
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  modernDayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  modernTodayButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
  },
  modernDepartureDay: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  modernReturnDay: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
  },
  modernRangeDay: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
  },
  modernPastDay: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
    opacity: 0.5,
  },
  modernTodayText: {
    color: '#000000',
  },
  modernSelectedDayText: {
    color: '#FFFFFF',
  },
  modernPastDayText: {
    color: '#6c757d',
  },
  modernDateFooter: {
    paddingBottom: 20,
  },
  modernDoneButton: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600', // Changed from '700' to semi-bold
  },
  datePickerContainer: {
    flex: 1,
  },
  hotelContainer: {
    paddingTop: 24,
    paddingHorizontal: '5%', // 90% width, 5% margin on each side
    maxWidth: '90%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
  },
  hotelMainHeading: {
    fontSize: width > 768 ? 28 : 24, // Responsive: 26-28px on tablet, 22-24px on mobile
    fontWeight: '700',
    color: '#A83442', // Brand color for main heading
    textAlign: 'left', // Left aligned as specified
    marginBottom: 8,
    lineHeight: width > 768 ? 36 : 32,
  },
  hotelSubheading: {
    fontSize: width > 768 ? 17 : 16, // 15-16px base, slightly larger on tablet
    lineHeight: 22,
    fontWeight: '400',
    color: '#6c757d',
    textAlign: 'left', // Left aligned as specified
    marginBottom: 16,
    maxWidth: '95%', // Ensure line length stays under ~60 characters
  },
  hotelSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: width > 768 ? 20 : 16, // More spacing on tablet
    borderWidth: 1,
    borderColor: '#A83442', // Brand color border
    shadowColor: '#A83442', // Brand color shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hotelSectionTitle: {
    fontSize: width > 768 ? 18 : 17, // 16-17px base, slightly larger on tablet
    fontWeight: '600',
    color: '#A83442', // Brand color for section titles
    textAlign: 'left', // Left aligned as specified
    marginBottom: 12,
  },
  hotelStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Top align for better text flow
    marginBottom: 8, // 8px between list items as specified
    paddingRight: 10, // Prevent text from touching edge
  },
  hotelStepNumber: {
    fontSize: width > 768 ? 16 : 15, // Body text size
    fontWeight: '600',
    color: '#A83442',
    marginRight: 8,
    minWidth: 20, // Ensure consistent alignment
  },
  hotelStepText: {
    fontSize: width > 768 ? 16 : 15, // 14-15px body text, slightly larger on tablet
    lineHeight: width > 768 ? 22 : 20, // 20-22px line height
    fontWeight: '400',
    color: '#000000',
    flex: 1,
    textAlign: 'left',
  },
  hotelBodyText: {
    fontSize: width > 768 ? 16 : 15, // 14-15px body text
    lineHeight: width > 768 ? 22 : 20, // 20-22px line height
    fontWeight: '400',
    color: '#6c757d',
    textAlign: 'left', // Left aligned as specified
  },
}); 