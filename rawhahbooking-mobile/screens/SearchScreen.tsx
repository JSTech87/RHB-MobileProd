import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  SafeAreaView,
  Alert,
  Animated,
  StatusBar,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import DateTimePicker from 'react-native-ui-datepicker';
import { useNavigation, NavigationProp } from '@react-navigation/native';
// Duffel API Service (fetch-based wrapper)
import DuffelApiService from '../services/duffelApi';
import AuthService from '../services/authService';
import DatabaseService from '../services/databaseService';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  FlightResults: {
    searchParams: any;
    offers: any[];
  };
  HotelInquiry: undefined;
};

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface DuffelAirport {
  iata_code: string;
  name: string;
  city_name: string;
  country_code: string;
}

interface SearchFormData {
  tripType: 'oneway' | 'roundtrip' | 'multicity';
  fromAirport: DuffelAirport | null;
  toAirport: DuffelAirport | null;
  departureDate: Date;
  returnDate: Date | null;
  passengers: PassengerCounts;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  multiCityFlights: Array<{
    id: string;
    from: DuffelAirport | null;
    to: DuffelAirport | null;
    date: Date;
  }>;
}

interface IslamicDate {
  name: string;
  date: string;
  hijriDate: string;
  description: string;
}

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // Form state
  const [formData, setFormData] = useState<SearchFormData>({
    tripType: 'roundtrip',
    fromAirport: null,
    toAirport: null,
    departureDate: new Date(),
    returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    passengers: { adults: 1, children: 0, infants: 0 },
    cabinClass: 'economy',
    multiCityFlights: [],
  });
  
  // Modal states
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'departure' | 'return'>('departure');

  // Airport search states
  const [showFromAirportSearch, setShowFromAirportSearch] = useState(false);
  const [showToAirportSearch, setShowToAirportSearch] = useState(false);
  const [airportSearchQuery, setAirportSearchQuery] = useState('');
  const [airportSearchResults, setAirportSearchResults] = useState<DuffelAirport[]>([]);
  const [searchingAirports, setSearchingAirports] = useState(false);

  // Loading states
  const [isSearching, setIsSearching] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  // Islamic calendar dates
  const [islamicDates] = useState<IslamicDate[]>([
    {
      name: 'Hajj',
      date: 'June 14-19, 2026',
      hijriDate: '9-12 Dhu al-Hijjah 1447',
      description: 'Annual Islamic pilgrimage to Mecca',
    },
    {
      name: 'Day of Arafah',
      date: 'June 15, 2026',
      hijriDate: '9 Dhu al-Hijjah 1447',
      description: 'The holiest day in the Islamic calendar',
    },
    {
      name: 'Eid al-Adha',
      date: 'June 16, 2026',
      hijriDate: '10 Dhu al-Hijjah 1447',
      description: 'Festival of the Sacrifice',
    },
    {
      name: 'Eid al-Fitr',
      date: 'March 30, 2026',
      hijriDate: '1 Shawwal 1447',
      description: 'Festival of Breaking the Fast',
    },
    {
      name: 'Mawlid an-Nabi',
      date: 'September 15, 2025',
      hijriDate: '12 Rabi al-Awwal 1447',
      description: 'Birth of Prophet Muhammad',
    },
  ]);

  // Test Duffel connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const ok = await DuffelApiService.ping();
        setConnectionStatus(ok ? 'connected' : 'failed');
        if (!ok) {
          console.warn('Duffel API connection failed');
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        setConnectionStatus('failed');
      }
    };

    testConnection();
  }, []);

  // Handle flight search with proper Duffel API integration
  const handleSearch = async () => {
    // Validation
    if (!formData.fromAirport || !formData.toAirport) {
      Alert.alert('Missing Information', 'Please select both departure and destination airports.');
      return;
    }

    if (formData.passengers.adults === 0) {
      Alert.alert('Invalid Passengers', 'At least one adult passenger is required.');
      return;
    }

    if (formData.tripType === 'roundtrip' && !formData.returnDate) {
      Alert.alert('Missing Return Date', 'Please select a return date for round trip flights.');
      return;
    }

    setIsSearching(true);

    try {
      // Check authentication
      const user = AuthService.getCurrentUser();
      console.log('User authenticated:', !!user);

      // Build passengers array for Duffel
      const passengers = [
        ...Array(formData.passengers.adults).fill({ type: 'adult' }),
        ...Array(formData.passengers.children).fill({ type: 'child', age: 10 }),
        ...Array(formData.passengers.infants).fill({ type: 'infant_without_seat', age: 1 }),
      ];

      const slices = [
        {
          origin: formData.fromAirport.iata_code,
          destination: formData.toAirport.iata_code,
          departure_date: formData.departureDate.toISOString().split('T')[0],
        },
      ];

      if (formData.tripType === 'roundtrip' && formData.returnDate) {
        slices.push({
          origin: formData.toAirport.iata_code,
          destination: formData.fromAirport.iata_code,
          departure_date: formData.returnDate.toISOString().split('T')[0],
        });
      }

      const request = {
        cabin_class: formData.cabinClass,
        passengers,
        slices,
        max_connections: 2,
      } as any;

      console.log('Searching with Duffel request:', request);

      const response = await DuffelApiService.searchOffers(request);

      const offers = response.data || [];

      // Cache search results
      await DatabaseService.setCache(
        'last_flight_search',
        {
          request,
          offers,
          searchedAt: new Date().toISOString(),
        },
        30
      );

      navigation.navigate('FlightResults', {
        searchParams: request,
        offers,
      });

    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(
        'Search Error', 
        (error as Error).message || 'Unable to search for flights. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Replace mock airport search with Duffel API search (v2)
  const searchAirports = async (query: string) => {
    if (query.length < 2) return;

    setSearchingAirports(true);
    try {
      const res = await DuffelApiService.searchAirports(query);
      // Map to local type if needed
      setAirportSearchResults(
        (res.data || []).map((a: any) => ({
          iata_code: a.iata_code,
          name: a.name,
          city_name: a.city_name,
          country_code: a.iata_country_code || a.country_code || '',
        }))
      );
    } catch (e) {
      console.error('Airport search error:', e);
      setAirportSearchResults([]);
    } finally {
      setSearchingAirports(false);
    }
  };

  useEffect(() => {
    if (airportSearchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchAirports(airportSearchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setAirportSearchResults([]);
    }
  }, [airportSearchQuery]);

  // Helper functions
  const handleAirportSelect = (airport: DuffelAirport, type: 'from' | 'to') => {
    if (type === 'from') {
      setFormData(prev => ({ ...prev, fromAirport: airport }));
      setShowFromAirportSearch(false);
    } else {
      setFormData(prev => ({ ...prev, toAirport: airport }));
      setShowToAirportSearch(false);
    }
    setAirportSearchQuery('');
    setAirportSearchResults([]);
  };

  const swapAirports = () => {
    setFormData(prev => ({
      ...prev,
      fromAirport: prev.toAirport,
      toAirport: prev.fromAirport,
    }));
  };

  const updatePassengerCount = (type: keyof PassengerCounts, increment: boolean) => {
    setFormData(prev => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(0, prev.passengers[type] + (increment ? 1 : -1)),
      },
    }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPassengerText = () => {
    const { adults, children, infants } = formData.passengers;
    const total = adults + children + infants;
    if (total === 1) return '1 Passenger';
    return `${total} Passengers`;
  };

  const getCabinClassText = () => {
    const classMap = {
      economy: 'Economy',
      premium_economy: 'Premium Economy',
      business: 'Business',
      first: 'First Class',
    };
    return classMap[formData.cabinClass];
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoSection}>
        <Image
          source={require('../assets/rawhah-adaptive-icon.png')}
          style={styles.topLogo}
          resizeMode="contain"
        />
        <View style={styles.brandTextContainer}>
          <Text style={styles.brandText}>Rawhah</Text>
          <Text style={styles.brandTextRed}>Booking</Text>
        </View>
      </View>
      {connectionStatus === 'failed' && (
        <View style={styles.connectionWarning}>
          <Ionicons name="warning" size={16} color="#EF4444" />
          <Text style={styles.connectionWarningText}>API Connection Failed</Text>
        </View>
      )}
    </View>
  );

  // Rest of the component implementation continues...
  // (The render method and other components remain the same structure but with fixed styles)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F3F0" />
      <SafeAreaView style={styles.mainContainer}>
        {renderHeader()}
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Trip Type Selector */}
          <View style={styles.tripTypeContainer}>
            {(['oneway', 'roundtrip', 'multicity'] as const).map((type) => (
    <TouchableOpacity
                key={type}
                style={[
                  styles.tripTypeButton,
                  formData.tripType === type && styles.tripTypeButtonActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, tripType: type }))}
              >
                <Text
                  style={[
                    styles.tripTypeText,
                    formData.tripType === type && styles.tripTypeTextActive,
                  ]}
                >
                  {type === 'oneway' ? 'One Way' : type === 'roundtrip' ? 'Round Trip' : 'Multi City'}
      </Text>
    </TouchableOpacity>
            ))}
          </View>

          {/* Search Card */}
          <View style={styles.searchCard}>
            {/* Airport Selection */}
            <View style={styles.airportSection}>
              <View style={styles.airportRow}>
    <TouchableOpacity
                  style={[styles.airportButton, formData.fromAirport && styles.airportButtonActive]}
                  onPress={() => setShowFromAirportSearch(true)}
                >
                  <Text style={styles.airportLabel}>From</Text>
                  <Text style={styles.airportText}>
                    {formData.fromAirport ? formData.fromAirport.iata_code : 'Select'}
                  </Text>
                  <Text style={styles.airportSubtext}>
                    {formData.fromAirport ? formData.fromAirport.city_name : 'Departure city'}
                  </Text>
    </TouchableOpacity>

                <View style={styles.swapButtonContainer}>
                  <TouchableOpacity style={styles.swapButton} onPress={swapAirports}>
                    <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

            <TouchableOpacity 
                  style={[styles.airportButton, formData.toAirport && styles.airportButtonActive]}
                  onPress={() => setShowToAirportSearch(true)}
                >
                  <Text style={styles.airportLabel}>To</Text>
                  <Text style={styles.airportText}>
                    {formData.toAirport ? formData.toAirport.iata_code : 'Select'}
                  </Text>
                  <Text style={styles.airportSubtext}>
                    {formData.toAirport ? formData.toAirport.city_name : 'Destination city'}
                  </Text>
            </TouchableOpacity>
              </View>
          </View>

            {/* Date Selection */}
            <View style={styles.dateSection}>
              <View style={styles.dateRow}>
            <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => {
                    setDatePickerType('departure');
                    setShowDateModal(true);
                  }}
                >
                  <Text style={styles.dateLabel}>Departure</Text>
                  <Text style={styles.dateText}>{formatDate(formData.departureDate)}</Text>
            </TouchableOpacity>

                {formData.tripType === 'roundtrip' && (
          <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => {
                      setDatePickerType('return');
                      setShowDateModal(true);
                    }}
                  >
                    <Text style={styles.dateLabel}>Return</Text>
                    <Text style={styles.dateText}>
                      {formData.returnDate ? formatDate(formData.returnDate) : 'Select'}
                </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Options Container */}
            <View style={styles.optionsContainer}>
            <TouchableOpacity 
                style={styles.optionButton}
              onPress={() => setShowPassengerModal(true)}
            >
                <Ionicons name="people" size={20} color="#6B7280" />
                <Text style={styles.optionText}>{getPassengerText()}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => setShowClassModal(true)}
              >
                <Ionicons name="airplane" size={20} color="#6B7280" />
                <Text style={styles.optionText}>{getCabinClassText()}</Text>
            </TouchableOpacity>
          </View>

            {/* Search Button */}
            <TouchableOpacity 
              style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="search" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.searchButtonText}>
                {isSearching ? 'Searching...' : 'Search Flights'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Islamic Calendar Card */}
          <View style={styles.islamicCalendarCard}>
            <Text style={styles.islamicCalendarTitle}>Notable Islamic Dates</Text>
            <View style={styles.islamicDatesList}>
              {islamicDates.map((islamicDate, index) => (
                <View key={index} style={styles.islamicDateItem}>
                  <View style={styles.islamicDateLeft}>
                    <Text style={styles.islamicDateName}>{islamicDate.name}</Text>
                    <Text style={styles.islamicDateDescription}>{islamicDate.description}</Text>
              </View>
                  <View style={styles.islamicDateRight}>
                    <Text style={styles.islamicDateGregorian}>{islamicDate.date}</Text>
                    <Text style={styles.islamicDateHijri}>{islamicDate.hijriDate}</Text>
              </View>
            </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Airport Search Modal */}
        <Modal visible={showFromAirportSearch || showToAirportSearch} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => {
                  setShowFromAirportSearch(false);
                  setShowToAirportSearch(false);
                }} 
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {showFromAirportSearch ? 'Select Departure Airport' : 'Select Destination Airport'}
              </Text>
              <View style={{ width: 24 }} />
          </View>

            <View style={{ paddingHorizontal: 20 }}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search airports..."
                value={airportSearchQuery}
                onChangeText={setAirportSearchQuery}
                autoFocus
              />
          </View>

            {searchingAirports ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#A83442" />
            </View>
            ) : (
              <ScrollView style={styles.airportResults}>
                {airportSearchResults.map((airport, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.airportResult}
                    onPress={() => {
                      handleAirportSelect(airport, showFromAirportSearch ? 'from' : 'to');
                    }}
                  >
                    <Text style={styles.airportResultName}>
                      {airport.name} ({airport.iata_code})
                    </Text>
                    <Text style={styles.airportResultDetails}>
                      {airport.city_name}, {airport.country_code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </SafeAreaView>
        </Modal>

        {/* Date Picker Modal */}
        <Modal visible={showDateModal} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {datePickerType === 'departure' ? 'Departure Date' : 'Return Date'}
              </Text>
            <TouchableOpacity 
                onPress={() => {
                  setShowDateModal(false);
                }}
              >
                <Text style={styles.modalSaveText}>Done</Text>
            </TouchableOpacity>
          </View>
            <View style={styles.datePickerContent}>
              <DateTimePicker
                mode="single"
                date={datePickerType === 'departure' ? formData.departureDate : formData.returnDate || new Date()}
                onChange={(params) => {
                  if (params.date) {
                    const selectedDate = new Date(params.date as string | number | Date);
                    if (datePickerType === 'departure') {
                      setFormData(prev => ({ ...prev, departureDate: selectedDate }));
                    } else {
                      setFormData(prev => ({ ...prev, returnDate: selectedDate }));
                    }
                  }
                }}
                minDate={new Date()}
              />
        </View>
          </View>
        </Modal>

        {/* Passenger Modal */}
        <Modal visible={showPassengerModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.compactModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPassengerModal(false)}>
                <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
              <Text style={styles.modalTitle}>Passengers</Text>
              <TouchableOpacity onPress={() => setShowPassengerModal(false)}>
                <Text style={styles.modalSaveText}>Done</Text>
              </TouchableOpacity>
          </View>

            <View style={{ paddingHorizontal: 20 }}>
            {/* Adults */}
            <View style={styles.passengerRow}>
                <View style={styles.passengerInfo}>
                  <Text style={styles.passengerType}>Adults</Text>
                  <Text style={styles.passengerDescription}>12+ years</Text>
                </View>
                <View style={styles.passengerCounter}>
                <TouchableOpacity 
                    style={[styles.counterButton, formData.passengers.adults > 1 && styles.counterButtonActive]}
                  onPress={() => updatePassengerCount('adults', false)}
                    disabled={formData.passengers.adults <= 1}
                >
                    <Ionicons name="remove" size={16} color={formData.passengers.adults > 1 ? "#FFFFFF" : "#9CA3AF"} />
                </TouchableOpacity>
                  <Text style={styles.counterText}>{formData.passengers.adults}</Text>
                <TouchableOpacity 
                    style={[styles.counterButton, styles.counterButtonActive]}
                  onPress={() => updatePassengerCount('adults', true)}
                >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Children */}
            <View style={styles.passengerRow}>
                <View style={styles.passengerInfo}>
                  <Text style={styles.passengerType}>Children</Text>
                  <Text style={styles.passengerDescription}>2-11 years</Text>
              </View>
                <View style={styles.passengerCounter}>
                <TouchableOpacity 
                    style={[styles.counterButton, formData.passengers.children > 0 && styles.counterButtonActive]}
                  onPress={() => updatePassengerCount('children', false)}
                    disabled={formData.passengers.children <= 0}
                >
                    <Ionicons name="remove" size={16} color={formData.passengers.children > 0 ? "#FFFFFF" : "#9CA3AF"} />
                </TouchableOpacity>
                  <Text style={styles.counterText}>{formData.passengers.children}</Text>
                <TouchableOpacity 
                    style={[styles.counterButton, styles.counterButtonActive]}
                  onPress={() => updatePassengerCount('children', true)}
                >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

              {/* Infants */}
            <View style={styles.passengerRow}>
                <View style={styles.passengerInfo}>
                  <Text style={styles.passengerType}>Infants</Text>
                  <Text style={styles.passengerDescription}>Under 2 years</Text>
              </View>
                <View style={styles.passengerCounter}>
                <TouchableOpacity 
                    style={[styles.counterButton, formData.passengers.infants > 0 && styles.counterButtonActive]}
                    onPress={() => updatePassengerCount('infants', false)}
                    disabled={formData.passengers.infants <= 0}
                >
                    <Ionicons name="remove" size={16} color={formData.passengers.infants > 0 ? "#FFFFFF" : "#9CA3AF"} />
                </TouchableOpacity>
                  <Text style={styles.counterText}>{formData.passengers.infants}</Text>
                <TouchableOpacity 
                    style={[styles.counterButton, styles.counterButtonActive]}
                    onPress={() => updatePassengerCount('infants', true)}
                >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
              </View>
          </SafeAreaView>
        </Modal>

        {/* Class Selection Modal */}
        <Modal visible={showClassModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.compactModalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowClassModal(false)}>
                <Text style={styles.modalCloseText}>Cancel</Text>
                </TouchableOpacity>
              <Text style={styles.modalTitle}>Cabin Class</Text>
              <TouchableOpacity onPress={() => setShowClassModal(false)}>
                <Text style={styles.modalSaveText}>Done</Text>
                </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 20 }}>
              {(['economy', 'premium_economy', 'business', 'first'] as const).map((classType) => (
                    <TouchableOpacity
                      key={classType}
                  style={[
                    styles.classOption,
                    formData.cabinClass === classType && styles.classOptionSelected,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, cabinClass: classType }))}
                >
                  <Text
                    style={[
                      styles.classOptionText,
                      formData.cabinClass === classType && styles.classOptionTextSelected,
                    ]}
                  >
                    {classType === 'economy' ? 'Economy' :
                     classType === 'premium_economy' ? 'Premium Economy' :
                     classType === 'business' ? 'Business' : 'First Class'}
                      </Text>
                  {formData.cabinClass === classType && (
                    <Ionicons name="checkmark" size={20} color="#A83442" />
                  )}
                    </TouchableOpacity>
                  ))}
                </View>
          </SafeAreaView>
      </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3F0',
  },
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Header Styles
  header: {
    backgroundColor: '#F5F3F0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  topLogo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  brandTextContainer: {
    flexDirection: 'row',
  },
  brandText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  brandTextRed: {
    fontSize: 24,
    fontWeight: '700',
    color: '#A83442',
  },
  connectionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  connectionWarningText: {
    color: '#EF4444',
    fontSize: 12,
    marginLeft: 8,
  },
  
  // Trip Type Selector
  tripTypeContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 4,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tripTypeButtonActive: {
    backgroundColor: '#A83442',
  },
  tripTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tripTypeTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Search Card
  searchCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Airport Selection
  airportSection: {
    marginBottom: 20,
  },
  airportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  airportButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  airportButtonActive: {
    borderColor: '#A83442',
    backgroundColor: '#FEF2F2',
  },
  airportLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  airportText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  airportSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  swapButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Date Selection
  dateSection: {
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateButtonActive: {
    borderColor: '#A83442',
    backgroundColor: '#FEF2F2',
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  
  // Multi-City Flights
  multiCitySection: {
    marginBottom: 20,
  },
  multiCityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  addFlightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A83442',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addFlightText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  multiCityFlight: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  multiCityHeader2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flightNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A83442',
  },
  removeButton: {
    padding: 4,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  // Options Container
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  optionButtonActive: {
    borderColor: '#A83442',
    backgroundColor: '#FEF2F2',
  },
  optionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  
  // Search Button
  searchButton: {
    backgroundColor: '#A83442',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Islamic Calendar Card
  islamicCalendarCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  islamicCalendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  islamicDatesList: {
    gap: 12,
  },
  islamicDateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  islamicDateLeft: {
    flex: 1,
  },
  islamicDateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  islamicDateDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  islamicDateRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  islamicDateGregorian: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A83442',
  },
  islamicDateHijri: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    color: '#6B7280',
    fontSize: 16,
  },
  modalSaveText: {
    color: '#A83442',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Airport Search Modal
  searchInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  airportResults: {
    maxHeight: 300,
  },
  airportResult: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  airportResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  airportResultDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  
  // Compact Modal Styles
  compactModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '50%',
  },
  
  // Passenger Counter
  passengerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  passengerInfo: {
    flex: 1,
  },
  passengerType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  passengerDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  passengerCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonActive: {
    backgroundColor: '#A83442',
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 20,
    textAlign: 'center',
  },
  
  // Class Selection
  classOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classOptionSelected: {
    backgroundColor: '#FEF2F2',
  },
  classOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  classOptionTextSelected: {
    color: '#A83442',
    fontWeight: '600',
  },
  
  // Date Picker Modal
  datePickerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '70%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  datePickerContent: {
    paddingHorizontal: 20,
  },
}); 