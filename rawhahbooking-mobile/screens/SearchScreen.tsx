import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

// Icon components (simplified SVG replacements)
const PlaneIcon = ({ style }: { style?: any }) => (
  <View style={[styles.icon, style]} />
);

const CalendarIcon = ({ style }: { style?: any }) => (
  <View style={[styles.icon, style]} />
);

const BusinessIcon = ({ style }: { style?: any }) => (
  <View style={[styles.icon, style]} />
);

const PeopleIcon = ({ style }: { style?: any }) => (
  <View style={[styles.icon, style]} />
);

const BellIcon = ({ style }: { style?: any }) => (
  <View style={[styles.iconWhite, style]} />
);

const HotelIcon = ({ style }: { style?: any }) => (
  <View style={[styles.icon, style]} />
);

export const SearchScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'hotel' | 'flight'>('flight');
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip' | 'multiCity'>('oneWay');
  const [fromLocation, setFromLocation] = useState('New York');
  const [toLocation, setToLocation] = useState('San Francisco');
  const [departureDate, setDepartureDate] = useState('16 April 2024');
  const [flightClass, setFlightClass] = useState('Economy');
  const [passengers, setPassengers] = useState('2A 1C');

  const handleSwapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleSearch = () => {
    // Navigate to FlightResults screen at the root level
    navigation?.navigate('FlightResults');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D6D5C9" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Profile */}
        <View style={styles.header}>
          <View style={styles.profilePill}>
            <View style={styles.profileSection}>
              <View style={styles.profilePic}>
                <Text style={styles.profileText}>
                  {user?.email?.substring(0, 2).toUpperCase() || 'IM'}
                </Text>
              </View>
              <View>
                <Text style={styles.greetingText}>Good morning,</Text>
                <Text style={styles.usernameText}>
                  {user?.email?.split('@')[0] || 'Irvan Moses'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bellButton}>
              <BellIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Tab Container */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[
                styles.tabButton,
                activeTab === 'hotel' ? styles.tabButtonActive : styles.tabButtonInactive
              ]}
              onPress={() => setActiveTab('hotel')}
            >
              <HotelIcon style={styles.tabIcon} />
              <Text style={[
                styles.tabText,
                activeTab === 'hotel' ? styles.tabTextActive : styles.tabTextInactive
              ]}>
                Hotel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.tabButton,
                activeTab === 'flight' ? styles.tabButtonActive : styles.tabButtonInactive
              ]}
              onPress={() => setActiveTab('flight')}
            >
              <PlaneIcon style={styles.tabIcon} />
              <Text style={[
                styles.tabText,
                activeTab === 'flight' ? styles.tabTextActive : styles.tabTextInactive
              ]}>
                Flight
              </Text>
            </TouchableOpacity>
          </View>

          {/* Trip Type Selection */}
          <View style={styles.tripTypeContainer}>
            {[
              { key: 'oneWay', label: 'One Way' },
              { key: 'roundTrip', label: 'Round trip' },
              { key: 'multiCity', label: 'Multi City' },
            ].map((trip) => (
              <TouchableOpacity
                key={trip.key}
                style={styles.tripTypeOption}
                onPress={() => setTripType(trip.key as typeof tripType)}
              >
                <View style={styles.radioButton}>
                  {tripType === trip.key && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.tripTypeText}>{trip.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Flight Form */}
          <View style={styles.formContainer}>
            {/* From Location */}
            <View style={styles.locationContainer}>
              <View style={styles.inputWrapper}>
                <PlaneIcon style={styles.inputIcon} />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>From</Text>
                  <TextInput
                    style={styles.inputField}
                    value={fromLocation}
                    onChangeText={setFromLocation}
                    placeholder="Enter departure city"
                  />
                </View>
              </View>

              {/* Swap Button */}
              <TouchableOpacity
                style={styles.swapButton}
                onPress={handleSwapLocations}
              >
                <Text style={styles.swapButtonText}>⇅</Text>
              </TouchableOpacity>
            </View>

            {/* To Location */}
            <View style={styles.inputWrapper}>
              <PlaneIcon style={styles.inputIcon} />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>To</Text>
                <TextInput
                  style={styles.inputField}
                  value={toLocation}
                  onChangeText={setToLocation}
                  placeholder="Enter destination city"
                />
              </View>
            </View>

            {/* Departure Date */}
            <TouchableOpacity style={styles.inputWrapper}>
              <CalendarIcon style={styles.inputIcon} />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Departure</Text>
                <Text style={styles.inputField}>{departureDate}</Text>
              </View>
            </TouchableOpacity>

            {/* Class and Passengers Row */}
            <View style={styles.rowContainer}>
              <TouchableOpacity style={[styles.inputWrapper, styles.halfWidth]}>
                <BusinessIcon style={styles.inputIcon} />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Class</Text>
                  <Text style={styles.inputFieldSmall}>{flightClass}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.inputWrapper, styles.halfWidth]}>
                <PeopleIcon style={styles.inputIcon} />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Passengers</Text>
                  <Text style={styles.inputFieldSmall}>{passengers}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#D6D5C9',
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#1f2675',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 6,
  },
  profileText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
  greetingText: {
    color: '#6c757d',
    fontSize: 12,
  },
  usernameText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 6,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#D6D5C9',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#1f2675',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 6,
  },
  tabButtonActive: {
    backgroundColor: '#A83442',
  },
  tabButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#6c757d',
  },
  tripTypeContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  tripTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#dee2e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A83442',
  },
  tripTypeText: {
    color: '#000000',
    fontSize: 16,
  },
  formContainer: {
    gap: 12,
    marginBottom: 24,
  },
  locationContainer: {
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#1f2675',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    color: '#6c757d',
    fontSize: 12,
    marginBottom: 4,
  },
  inputField: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  inputFieldSmall: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  swapButton: {
    position: 'absolute',
    right: -16,
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    transform: [{ translateY: -20 }],
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 8,
    zIndex: 10,
  },
  swapButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  halfWidth: {
    flex: 1,
  },
  searchButton: {
    backgroundColor: '#A83442',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 320,
    alignSelf: 'center',
    marginBottom: 32,
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 12,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  icon: {
    width: 20,
    height: 20,
    backgroundColor: '#6c757d',
    borderRadius: 2,
  },
  iconWhite: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
}); 