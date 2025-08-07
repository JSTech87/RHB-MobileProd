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
} from 'react-native';

const { width, height } = Dimensions.get('window');

export const SearchScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [selectedService, setSelectedService] = useState<'hotel' | 'flight'>('flight');
  const [selectedTripType, setSelectedTripType] = useState<'oneWay' | 'roundTrip' | 'multiCity'>('oneWay');
  const [fromLocation, setFromLocation] = useState('Surabaya, East Java');
  const [toLocation, setToLocation] = useState('Denpasar, Bali');
  const [departureDate, setDepartureDate] = useState('Dec 21, 2023');
  const [returnDate, setReturnDate] = useState('Dec 26, 2023');
  const [passengers, setPassengers] = useState('2 Seats');
  const [seatClass, setSeatClass] = useState('Business');

  const handleSearch = () => {
    // Navigate to FlightResults screen at the root level
    navigation?.navigate('FlightResults');
  };

  const swapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
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
          {/* From Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>From</Text>
                <TextInput
                  style={styles.formInput}
                  value={fromLocation}
                  onChangeText={setFromLocation}
                  editable={false}
                />
                <Text style={styles.airportCode}>(SBY)</Text>
              </View>
            </View>
          </View>

          {/* To Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>To</Text>
                <TextInput
                  style={styles.formInput}
                  value={toLocation}
                  onChangeText={setToLocation}
                  editable={false}
                />
                <Text style={styles.airportCode}>(DPS)</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.swapButton} onPress={swapLocations}>
              <Text style={styles.swapButtonIcon}>⇅</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.locationDivider}>
            <View style={styles.flightPath} />
          </View>

          {/* Date Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Departure Date</Text>
                <TextInput
                  style={styles.formInput}
                  value={departureDate}
                  onChangeText={setDepartureDate}
                  editable={false}
                />
              </View>
            </View>
          </View>

          {/* Bottom Row */}
          <View style={styles.bottomRow}>
            <View style={styles.bottomField}>
              <View style={styles.inputContainer}>
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Passengers</Text>
                  <TextInput
                    style={styles.formInput}
                    value={passengers}
                    onChangeText={setPassengers}
                    editable={false}
                  />
                </View>
              </View>
            </View>
            <View style={styles.bottomField}>
              <View style={styles.fieldWrapper}>
                <View style={styles.inputContainer}>
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Class</Text>
                    <TextInput
                      style={styles.formInput}
                      value={seatClass}
                      onChangeText={setSeatClass}
                      editable={false}
                    />
                  </View>
                </View>
                <Text style={styles.dropdownArrow}>▼</Text>
              </View>
            </View>
          </View>
        </>
      );
    } else if (selectedTripType === 'roundTrip') {
      return (
        <>
          {/* From Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>From</Text>
                <TextInput
                  style={styles.formInput}
                  value={fromLocation}
                  onChangeText={setFromLocation}
                  editable={false}
                />
                <Text style={styles.airportCode}>(SBY)</Text>
              </View>
            </View>
          </View>

          {/* To Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>To</Text>
                <TextInput
                  style={styles.formInput}
                  value={toLocation}
                  onChangeText={setToLocation}
                  editable={false}
                />
                <Text style={styles.airportCode}>(DPS)</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.swapButton} onPress={swapLocations}>
              <Text style={styles.swapButtonIcon}>⇅</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.locationDivider}>
            <View style={styles.flightPath} />
          </View>

          {/* Date Row for Round Trip */}
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <View style={styles.inputContainer}>
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Departure Date</Text>
                  <TextInput
                    style={styles.formInput}
                    value={departureDate}
                    onChangeText={setDepartureDate}
                    editable={false}
                  />
                </View>
              </View>
            </View>
            <View style={styles.dateField}>
              <View style={styles.inputContainer}>
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Return Date</Text>
                  <TextInput
                    style={styles.formInput}
                    value={returnDate}
                    onChangeText={setReturnDate}
                    editable={false}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Row */}
          <View style={styles.bottomRow}>
            <View style={styles.bottomField}>
              <View style={styles.inputContainer}>
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Passengers</Text>
                  <TextInput
                    style={styles.formInput}
                    value={passengers}
                    onChangeText={setPassengers}
                    editable={false}
                  />
                </View>
              </View>
            </View>
            <View style={styles.bottomField}>
              <View style={styles.fieldWrapper}>
                <View style={styles.inputContainer}>
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Seat Class</Text>
                    <TextInput
                      style={styles.formInput}
                      value={seatClass}
                      onChangeText={setSeatClass}
                      editable={false}
                    />
                  </View>
                </View>
                <Text style={styles.dropdownArrow}>▼</Text>
              </View>
            </View>
          </View>
        </>
      );
    } else {
      // Multi City
      return (
        <>
          {/* From Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>From</Text>
                <TextInput
                  style={styles.formInput}
                  value={fromLocation}
                  onChangeText={setFromLocation}
                  editable={false}
                />
                <Text style={styles.airportCode}>(SBY)</Text>
              </View>
            </View>
          </View>

          {/* To Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>To</Text>
                <TextInput
                  style={styles.formInput}
                  value={toLocation}
                  onChangeText={setToLocation}
                  editable={false}
                />
                <Text style={styles.airportCode}>(DPS)</Text>
              </View>
            </View>
          </View>

          <View style={styles.locationDivider}>
            <View style={styles.flightPath} />
          </View>

          {/* Date Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Departure Date</Text>
                <TextInput
                  style={styles.formInput}
                  value={departureDate}
                  onChangeText={setDepartureDate}
                  editable={false}
                />
              </View>
            </View>
          </View>

          {/* Add Flight Button */}
          <TouchableOpacity style={styles.addFlightButton}>
            <Text style={styles.addFlightText}>+ Add Another Flight</Text>
          </TouchableOpacity>

          {/* Bottom Row */}
          <View style={styles.bottomRow}>
            <View style={styles.bottomField}>
              <View style={styles.inputContainer}>
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Passengers</Text>
                  <TextInput
                    style={styles.formInput}
                    value={passengers}
                    onChangeText={setPassengers}
                    editable={false}
                  />
                </View>
              </View>
            </View>
            <View style={styles.bottomField}>
              <View style={styles.fieldWrapper}>
                <View style={styles.inputContainer}>
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Class</Text>
                    <TextInput
                      style={styles.formInput}
                      value={seatClass}
                      onChangeText={setSeatClass}
                      editable={false}
                    />
                  </View>
                </View>
                <Text style={styles.dropdownArrow}>▼</Text>
              </View>
            </View>
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

          {/* Trip Type Options */}
          <View style={styles.tripTypes}>
            <TripTypeOption type="oneWay" label="One way" />
            <TripTypeOption type="roundTrip" label="Round Trip" />
            <TripTypeOption type="multiCity" label="Multi City" />
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Ticket Style Form */}
          <View style={styles.ticketForm}>
            {/* Ticket cutouts */}
            <View style={[styles.cutout, styles.leftCutout]} />
            <View style={[styles.cutout, styles.rightCutout]} />

            {renderSearchForm()}

            {/* Search Button */}
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>
                {selectedTripType === 'multiCity' ? 'Search Ticket' : 'Search'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '500',
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
    fontWeight: '700',
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
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  bottomField: {
    flex: 1,
    minWidth: 0,
  },
  fieldWrapper: {
    flex: 1,
    position: 'relative',
  },
  dropdownArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -6,
    fontSize: 12,
    color: '#6c757d',
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
    fontWeight: '700',
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
    fontWeight: '700',
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
}); 