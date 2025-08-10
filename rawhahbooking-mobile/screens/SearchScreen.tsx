import React, { useState, useEffect } from 'react';
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
  SafeAreaView,
  Alert,
  Animated,
  Linking,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import DateTimePicker, { DateType } from 'react-native-ui-datepicker';
import FromToPicker from '../components/FromToPicker';
import { AirportOption } from '../services/airportSearch';

const { width, height } = Dimensions.get('window');

// Enhanced interfaces for professional flight search
interface PassengerCounts {
  adults: number;
  children: number;
  infantsInSeat: number;
  infantsOnLap: number;
}

interface SearchFormData {
  from: AirportOption | null;
  to: AirportOption | null;
  departureDate: Date;
  returnDate: Date;
  passengers: PassengerCounts;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  tripType: 'oneWay' | 'roundTrip' | 'multiCity';
}

interface RecentSearch {
  id: string;
  from: string;
  to: string;
  date: string;
  passengers: number;
}

interface PopularDestination {
  id: string;
  city: string;
  country: string;
  code: string;
  price: string;
  image: string;
}

export const SearchScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [selectedService, setSelectedService] = useState<'hotel' | 'flight'>('flight');
  const [selectedTripType, setSelectedTripType] = useState<'oneWay' | 'roundTrip' | 'multiCity'>('roundTrip');
  const [fromAirport, setFromAirport] = useState<AirportOption | null>(null);
  const [toAirport, setToAirport] = useState<AirportOption | null>(null);
  const [seatClass, setSeatClass] = useState<'Economy' | 'Premium Economy' | 'Business' | 'First'>('Economy');
  
  // Enhanced date management
  const [selectedDepartureDate, setSelectedDepartureDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days from now
  const [selectedReturnDate, setSelectedReturnDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)); // 14 days from now
  
  // Modal and UI states
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Enhanced passenger management
  const [passengers, setPassengers] = useState<PassengerCounts>({
    adults: 2,
    children: 0,
    infantsInSeat: 0,
    infantsOnLap: 0,
  });

  // Multi-city flights state
  const [multiCityFlights, setMultiCityFlights] = useState([
    { from: null as AirportOption | null, to: null as AirportOption | null, date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
  ]);

  // Mock data for enhanced experience
  const [recentSearches] = useState<RecentSearch[]>([
    { id: '1', from: 'NYC', to: 'LAX', date: 'Dec 15', passengers: 2 },
    { id: '2', from: 'JFK', to: 'DXB', date: 'Jan 10', passengers: 1 },
    { id: '3', from: 'LHR', to: 'CDG', date: 'Nov 28', passengers: 4 },
  ]);

  const [popularDestinations] = useState<PopularDestination[]>([
    { id: '1', city: 'Dubai', country: 'UAE', code: 'DXB', price: 'from $899', image: '🏙️' },
    { id: '2', city: 'London', country: 'UK', code: 'LHR', price: 'from $1,299', image: '🏰' },
    { id: '3', city: 'Tokyo', country: 'Japan', code: 'NRT', price: 'from $1,199', image: '🗾' },
    { id: '4', city: 'Paris', country: 'France', code: 'CDG', price: 'from $1,099', image: '🗼' },
  ]);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));

  // Start loading spinner animation
  useEffect(() => {
    if (isLoading) {
      const spinAnimation = Animated.loop(
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    }
  }, [isLoading, slideAnim]);

  // Enhanced search functionality
  const handleSearch = () => {
    // Validation
    if (!fromAirport || !toAirport) {
      Alert.alert('Missing Information', 'Please select departure and destination airports');
      return;
    }

    if (fromAirport.iata === toAirport.iata) {
      Alert.alert('Invalid Route', 'Departure and destination cannot be the same');
      return;
    }

    if (selectedDepartureDate < new Date()) {
      Alert.alert('Invalid Date', 'Departure date cannot be in the past');
      return;
    }

    if (selectedTripType === 'roundTrip' && selectedReturnDate <= selectedDepartureDate) {
      Alert.alert('Invalid Dates', 'Return date must be after departure date');
      return;
    }

    // Set loading state with animation
    setIsLoading(true);
    Animated.timing(fadeAnim, {
      toValue: 0.7,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Prepare search parameters
    const searchParams = {
      from: fromAirport.iata,
      to: toAirport.iata,
      departureDate: selectedDepartureDate.toISOString().split('T')[0],
      returnDate: selectedTripType === 'roundTrip' ? selectedReturnDate.toISOString().split('T')[0] : null,
      passengers,
      cabinClass: seatClass,
      tripType: selectedTripType,
    };

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Navigate to results with search parameters
      navigation?.navigate('FlightResults', { searchParams });
    }, 2000);
  };

  const handleHotelInquiry = () => {
    navigation?.navigate('HotelInquiry');
  };

  // Quick search from recent or popular destinations
  const handleQuickSearch = (destination: PopularDestination) => {
    setToAirport({
      iata: destination.code,
      name: destination.city,
      city: destination.city,
      country: destination.country,
      source: 'local' as const,
      type: 'airport' as const,
    });
  };

  const handleRecentSearch = (recent: RecentSearch) => {
    // This would typically set the full search data
    Alert.alert('Quick Search', `Search from ${recent.from} to ${recent.to} on ${recent.date}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Search', onPress: () => handleSearch() },
    ]);
  };

  const addMultiCityFlight = () => {
    if (multiCityFlights.length < 6) {
      setMultiCityFlights(prev => [
        ...prev,
        { from: null, to: null, date: new Date(Date.now() + (prev.length + 7) * 24 * 60 * 60 * 1000) }
      ]);
    } else {
      Alert.alert('Maximum Flights', 'You can add up to 6 flights for multi-city trips.');
    }
  };

  const removeMultiCityFlight = (index: number) => {
    if (multiCityFlights.length > 1) {
      setMultiCityFlights(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateMultiCityFlight = (index: number, field: 'from' | 'to' | 'date', value: any) => {
    setMultiCityFlights(prev => prev.map((flight, i) => 
      i === index ? { ...flight, [field]: value } : flight
    ));
  };

  const updatePassengerCount = (type: keyof PassengerCounts, increment: boolean) => {
    setPassengers(prev => {
      const newCount = increment ? prev[type] + 1 : Math.max(0, prev[type] - 1);
      // Ensure at least 1 adult
      if (type === 'adults' && newCount === 0) return prev;
      return { ...prev, [type]: newCount };
    });
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
            <Text style={styles.hotelStepText}>Get Expert Options – We'll find the most suitable hotels for you with quality selections approved for reliability and comfort.</Text>
          </View>
          <View style={styles.hotelStepItem}>
            <Text style={styles.hotelStepNumber}>3.</Text>
            <Text style={styles.hotelStepText}>Book Securely – Confirm with confidence at the best rate with our competitive pricing guarantee and fast response within 10-15 minutes.</Text>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.hotelActionContainer}>
          <TouchableOpacity
            style={styles.hotelSubmitButton}
            onPress={handleHotelInquiry}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
            <Text style={styles.hotelSubmitButtonText}>Start Hotel Inquiry</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.hotelWhatsAppButton}
            onPress={() => {
              const message = "Hello! I'd like to inquire about hotel accommodations. Please help me find suitable options.";
              const encodedMessage = encodeURIComponent(message);
              const whatsappUrl = `https://wa.me/+1234567890?text=${encodedMessage}`;
              Linking.openURL(whatsappUrl).catch(() => {
                Alert.alert('Error', 'Could not open WhatsApp');
              });
            }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
            <Text style={styles.hotelWhatsAppButtonText}>WhatsApp Inquiry</Text>
          </TouchableOpacity>
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
            <Ionicons name="add-circle-outline" size={20} color="#A83442" />
            <Text style={styles.addFlightText}>Add Another Flight</Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          {/* Service Tabs */}
          <View style={styles.serviceTabs}>
            <TouchableOpacity
              style={[styles.serviceTab, selectedService === 'flight' && styles.serviceTabActive]}
              onPress={() => setSelectedService('flight')}
            >
              <Ionicons 
                name="airplane-outline" 
                size={20} 
                color={selectedService === 'flight' ? '#FFFFFF' : '#6B7280'} 
              />
              <Text style={[styles.serviceTabText, selectedService === 'flight' && styles.serviceTabTextActive]}>
                Flights
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.serviceTab, selectedService === 'hotel' && styles.serviceTabActive]}
              onPress={() => setSelectedService('hotel')}
            >
              <Ionicons 
                name="bed-outline" 
                size={20} 
                color={selectedService === 'hotel' ? '#FFFFFF' : '#6B7280'} 
              />
              <Text style={[styles.serviceTabText, selectedService === 'hotel' && styles.serviceTabTextActive]}>
                Hotels
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {selectedService === 'flight' ? (
            <>
              {/* Flight Search Form */}
              <View style={styles.searchCard}>
                {/* Trip Type Selection */}
                <View style={styles.tripTypeContainer}>
                  {[
                    { key: 'roundTrip', label: 'Round Trip', icon: 'swap-horizontal-outline' },
                    { key: 'oneWay', label: 'One Way', icon: 'arrow-forward-outline' },
                    { key: 'multiCity', label: 'Multi City', icon: 'location-outline' },
                  ].map((trip) => (
                    <TouchableOpacity
                      key={trip.key}
                      style={[
                        styles.tripTypeButton,
                        selectedTripType === trip.key && styles.tripTypeButtonActive
                      ]}
                      onPress={() => setSelectedTripType(trip.key as any)}
                    >
                      <Ionicons 
                        name={trip.icon as any} 
                        size={18} 
                        color={selectedTripType === trip.key ? '#A83442' : '#6B7280'} 
                      />
                      <Text style={[
                        styles.tripTypeText,
                        selectedTripType === trip.key && styles.tripTypeTextActive
                      ]}>
                        {trip.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Route Selection */}
                <View style={styles.routeContainer}>
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
                </View>

                {/* Date Selection */}
                <View style={styles.dateContainer}>
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => setShowDateModal(true)}
                  >
                    <View style={styles.dateContent}>
                      <View style={styles.dateSection}>
                        <Ionicons name="calendar-outline" size={20} color="#A83442" />
                        <View style={styles.dateInfo}>
                          <Text style={styles.dateLabel}>Departure</Text>
                          <Text style={styles.dateValue}>
                            {selectedDepartureDate.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </Text>
                        </View>
                      </View>
                      
                      {selectedTripType === 'roundTrip' && (
                        <>
                          <View style={styles.dateDivider}>
                            <Ionicons name="arrow-forward" size={16} color="#6B7280" />
                          </View>
                          <View style={styles.dateSection}>
                            <Ionicons name="calendar-outline" size={20} color="#A83442" />
                            <View style={styles.dateInfo}>
                              <Text style={styles.dateLabel}>Return</Text>
                              <Text style={styles.dateValue}>
                                {selectedReturnDate.toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </Text>
                            </View>
                          </View>
                        </>
                      )}
                    </View>
                    <View style={styles.dateMetaInfo}>
                      <Ionicons name="chevron-down" size={20} color="#6B7280" />
                      {selectedTripType === 'roundTrip' && (
                        <Text style={styles.dayCount}>
                          {calculateDaysBetween(selectedDepartureDate, selectedReturnDate)} days
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Passengers and Class */}
                <View style={styles.bottomRow}>
                  <TouchableOpacity 
                    style={styles.passengerButton}
                    onPress={() => setShowPassengerModal(true)}
                  >
                    <Ionicons name="people-outline" size={20} color="#A83442" />
                    <View style={styles.passengerInfo}>
                      <Text style={styles.passengerLabel}>Travelers</Text>
                      <Text style={styles.passengerValue}>{getPassengerText()}</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.classButton}
                    onPress={() => setShowClassModal(true)}
                  >
                    <Ionicons name="airplane-outline" size={20} color="#A83442" />
                    <View style={styles.classInfo}>
                      <Text style={styles.classLabel}>Class</Text>
                      <Text style={styles.classValue}>{seatClass}</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Add Flight Button for Multi-City */}
                {selectedTripType === 'multiCity' && (
                  <TouchableOpacity 
                    style={styles.addFlightButton}
                    onPress={addMultiCityFlight}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#A83442" />
                    <Text style={styles.addFlightText}>Add Another Flight ({multiCityFlights.length}/6)</Text>
                  </TouchableOpacity>
                )}

                {/* Search Button */}
                <TouchableOpacity 
                  style={[styles.searchButton, isLoading && styles.searchButtonLoading]} 
                  onPress={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Animated.View style={[
                        styles.loadingSpinner, 
                        { 
                          transform: [{ 
                            rotate: slideAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg']
                            })
                          }] 
                        }
                      ]} />
                      <Text style={styles.searchButtonText}>Searching...</Text>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="search" size={20} color="#FFFFFF" />
                      <Text style={styles.searchButtonText}>Search Flights</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            renderHotelForm()
          )}
        </ScrollView>
      </Animated.View>

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
            <Text style={styles.modalTitle}>Travelers</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
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
              <Text style={styles.modernDoneButtonText}>
                {selectedTripType === 'roundTrip' 
                  ? `Confirm Dates (${formatDate(selectedDepartureDate)} - ${formatDate(selectedReturnDate)})`
                  : `Confirm Date (${formatDate(selectedDepartureDate)})`
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Class Selection Modal */}
      <Modal
        visible={showClassModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.compactModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowClassModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Cabin Class</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.compactModalContent} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.classOptions}>
              {[
                { 
                  key: 'Economy', 
                  label: 'Economy', 
                  description: 'Standard seating and service',
                  icon: 'airplane-outline' 
                },
                { 
                  key: 'Premium Economy', 
                  label: 'Premium Economy', 
                  description: 'Extra legroom and enhanced service',
                  icon: 'airplane' 
                },
                { 
                  key: 'Business', 
                  label: 'Business', 
                  description: 'Lie-flat seats and premium dining',
                  icon: 'business-outline' 
                },
                { 
                  key: 'First', 
                  label: 'First Class', 
                  description: 'Ultimate luxury and privacy',
                  icon: 'diamond-outline' 
                },
              ].map((classOption) => (
                <TouchableOpacity
                  key={classOption.key}
                  style={[
                    styles.classOption,
                    seatClass === classOption.key && styles.classOptionSelected
                  ]}
                  onPress={() => {
                    setSeatClass(classOption.key as 'Economy' | 'Premium Economy' | 'Business' | 'First');
                    setShowClassModal(false);
                  }}
                >
                  <View style={styles.classOptionContent}>
                    <View style={styles.classOptionLeft}>
                      <Ionicons 
                        name={classOption.icon as any} 
                        size={24} 
                        color={seatClass === classOption.key ? '#A83442' : '#6B7280'} 
                      />
                      <View style={styles.classOptionText}>
                        <Text style={[
                          styles.classOptionLabel,
                          seatClass === classOption.key && styles.classOptionLabelSelected
                        ]}>
                          {classOption.label}
                        </Text>
                        <Text style={styles.classOptionDescription}>
                          {classOption.description}
                        </Text>
                      </View>
                    </View>
                    {seatClass === classOption.key && (
                      <Ionicons name="checkmark-circle" size={24} color="#A83442" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Main Layout
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '600',
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Service Tabs
  serviceTabs: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceTabActive: {
    backgroundColor: '#A83442',
    borderColor: '#A83442',
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  serviceTabTextActive: {
    color: '#FFFFFF',
  },
  
  // Search Card
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // Trip Type Selection
  tripTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  tripTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  tripTypeButtonActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#A83442',
  },
  tripTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tripTypeTextActive: {
    color: '#A83442',
    fontWeight: '600',
  },
  
  // Route and Date Selection
  routeContainer: {
    marginBottom: 24,
  },
  dateContainer: {
    marginBottom: 24,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minHeight: 64,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateInfo: {
    flexDirection: 'column',
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dateDivider: {
    marginHorizontal: 16,
  },
  dateMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Bottom Row (Passengers and Class)
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  passengerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minHeight: 64,
  },
  passengerInfo: {
    flex: 1,
  },
  passengerLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  passengerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  classButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minHeight: 64,
  },
  classInfo: {
    flex: 1,
  },
  classLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  classValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  
  // Search Button
  searchButton: {
    width: '100%',
    backgroundColor: '#A83442',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButtonLoading: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderRadius: 10,
  },
  
  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  
  // Recent Searches
  recentContainer: {
    marginBottom: 24,
  },
  recentList: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  recentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentRoute: {
    alignItems: 'center',
    marginBottom: 8,
  },
  recentFromTo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  recentDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  recentPassengers: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Popular Destinations
  popularContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  destinationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  destinationCard: {
    width: (width - 64) / 2, // Account for padding and gap
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  destinationEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  destinationInfo: {
    alignItems: 'center',
  },
  destinationCity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  destinationCountry: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  destinationPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A83442',
  },
  
  // Additional required styles
  formSection: {
    marginBottom: 16,
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
    fontWeight: '500',
    color: '#000000',
  },
  addFlightButton: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  addFlightText: {
    color: '#A83442',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // New styles for the rest of the file
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
    fontWeight: '500',
    color: '#000000',
  },
  airportCode: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    marginLeft: 8,
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
  bottomField: {
    flex: 1,
    minWidth: 0,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 8,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    flexGrow: 1,
    maxHeight: 300,
  },
  modalScrollContent: {
    paddingBottom: 20, // Added padding to the scroll content
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
  singleDateRowContainer: {
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
  classOptions: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  classOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  classOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  classOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  classOptionText: {
    flexDirection: 'column',
  },
  classOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  classOptionLabelSelected: {
    color: '#A83442',
  },
  classOptionDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  classOptionSelected: {
    backgroundColor: '#f8f9fa',
  },
  compactModalContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  compactModalContent: {
    flexGrow: 1,
    maxHeight: 250,
  },
  hotelActionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  hotelSubmitButton: {
    width: '100%',
    backgroundColor: '#A83442',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  hotelSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hotelWhatsAppButton: {
    width: '100%',
    backgroundColor: '#25D366', // WhatsApp green
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  hotelWhatsAppButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 