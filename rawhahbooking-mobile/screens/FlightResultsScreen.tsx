import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Alert,
  Modal,
  TextInput,
  Switch,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Enhanced interfaces
interface SearchParams {
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  tripType: 'oneWay' | 'roundTrip';
  cabinClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
}

interface SortFilterOptions {
  sortBy: 'price' | 'duration' | 'departure' | 'arrival';
  sortOrder: 'asc' | 'desc';
  filters: {
    maxPrice?: number;
    airlines: string[];
    stops: 'any' | 'nonstop' | 'oneStop';
    departureTime: 'any' | 'morning' | 'afternoon' | 'evening';
    duration: 'any' | 'short' | 'medium' | 'long';
  };
}

interface FlightData {
  id: string;
  airline: {
    name: string;
    code: string;
    logo: string;
    color: string;
  };
  flightType: string;
  flightNumber: string;
  cabinClass: string;
  departure: {
    time: string;
    code: string;
    location: string;
    terminal: string;
    gate: string;
    date: string;
  };
  arrival: {
    time: string;
    code: string;
    location: string;
    terminal: string;
    gate: string;
    date: string;
  };
  price: string;
  duration: string;
  stops: string;
  baggage: string;
  refundable: boolean;
  seatSelection: boolean;
  amenities: string[];
}

const mockFlights: FlightData[] = [
  {
    id: '1',
    airline: {
      name: 'Garuda Indonesia',
      code: 'GA',
      logo: 'GA',
      color: '#0066cc',
    },
    flightType: 'Type A330',
    flightNumber: 'GA 123',
    cabinClass: 'Economy',
    departure: {
      time: '09:00 AM',
      code: 'SBY',
      location: 'Surabaya, East Java',
      terminal: 'Terminal 1',
      gate: 'Gate A12',
      date: 'Dec 21, 2023',
    },
    arrival: {
      time: '13:30 PM',
      code: 'DPS',
      location: 'Denpasar, Bali',
      terminal: 'Terminal 2',
      gate: 'Gate B7',
      date: 'Dec 21, 2023',
    },
    price: '$320',
    duration: '4h 30m',
    stops: 'Non-stop',
    baggage: '20kg checked + 7kg cabin',
    refundable: true,
    seatSelection: true,
    amenities: ['WiFi', 'In-flight Entertainment', 'Meal Service', 'USB Charging'],
  },
  {
    id: '2',
    airline: {
      name: 'Lion Air',
      code: 'LA',
      logo: 'LA',
      color: '#A83442',
    },
    flightType: 'Type JT-25',
    flightNumber: 'JT 456',
    cabinClass: 'Economy',
    departure: {
      time: '10:00 AM',
      code: 'SBY',
      location: 'Surabaya, East Java',
      terminal: 'Terminal 1',
      gate: 'Gate A8',
      date: 'Dec 21, 2023',
    },
    arrival: {
      time: '15:30 PM',
      code: 'DPS',
      location: 'Denpasar, Bali',
      terminal: 'Terminal 1',
      gate: 'Gate C3',
      date: 'Dec 21, 2023',
    },
    price: '$479',
    duration: '5h 30m',
    stops: '1 Stop in Jakarta',
    baggage: '15kg checked + 7kg cabin',
    refundable: false,
    seatSelection: true,
    amenities: ['In-flight Entertainment', 'Snack Service'],
  },
  {
    id: '3',
    airline: {
      name: 'Citilink',
      code: 'CL',
      logo: 'CL',
      color: '#2ecc71',
    },
    flightType: 'Type JT-15',
    flightNumber: 'QG 789',
    cabinClass: 'Economy',
    departure: {
      time: '12:30 PM',
      code: 'SBY',
      location: 'Surabaya, East Java',
      terminal: 'Terminal 2',
      gate: 'Gate B15',
      date: 'Dec 21, 2023',
    },
    arrival: {
      time: '17:00 PM',
      code: 'DPS',
      location: 'Denpasar, Bali',
      terminal: 'Terminal 1',
      gate: 'Gate A9',
      date: 'Dec 21, 2023',
    },
    price: '$285',
    duration: '4h 30m',
    stops: 'Non-stop',
    baggage: '20kg checked + 7kg cabin',
    refundable: true,
    seatSelection: false,
    amenities: ['WiFi', 'Meal Service'],
  },
];

export const FlightResultsScreen: React.FC<{ 
  navigation?: any;
  route?: any;
}> = ({ navigation, route }) => {
  // Navigation hook
  const nav = useNavigation();
  
  // Get search parameters from route or use defaults
  const searchParams: SearchParams = route?.params?.searchParams || {
    from: 'SBY',
    to: 'DPS', 
    departureDate: 'Dec 21, 2023',
    passengers: { adults: 1, children: 0, infants: 0 },
    tripType: 'oneWay',
    cabinClass: 'Economy'
  };

  // State management
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [filteredFlights, setFilteredFlights] = useState<FlightData[]>(mockFlights);
  const [sortFilterOptions, setSortFilterOptions] = useState<SortFilterOptions>({
    sortBy: 'price',
    sortOrder: 'asc',
    filters: {
      airlines: [],
      stops: 'any',
      departureTime: 'any',
      duration: 'any'
    }
  });

  const toggleCard = (flightId: string) => {
    const newFlippedCards = new Set(flippedCards);
    if (newFlippedCards.has(flightId)) {
      newFlippedCards.delete(flightId);
    } else {
      newFlippedCards.add(flightId);
    }
    setFlippedCards(newFlippedCards);
  };

  // Sorting and filtering functions
  const applyFiltersAndSort = () => {
    let filtered = [...mockFlights];
    const { filters, sortBy, sortOrder } = sortFilterOptions;

    // Apply filters
    if (filters.maxPrice) {
      filtered = filtered.filter(flight => 
        parseInt(flight.price.replace('$', '')) <= filters.maxPrice!
      );
    }

    if (filters.airlines.length > 0) {
      filtered = filtered.filter(flight => 
        filters.airlines.includes(flight.airline.name)
      );
    }

    if (filters.stops !== 'any') {
      if (filters.stops === 'nonstop') {
        filtered = filtered.filter(flight => flight.stops === 'Non-stop');
      } else if (filters.stops === 'oneStop') {
        filtered = filtered.filter(flight => flight.stops.includes('1 Stop'));
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'price':
          aValue = parseInt(a.price.replace('$', ''));
          bValue = parseInt(b.price.replace('$', ''));
          break;
        case 'duration':
          aValue = parseInt(a.duration.replace(/[^\d]/g, ''));
          bValue = parseInt(b.duration.replace(/[^\d]/g, ''));
          break;
        case 'departure':
          aValue = new Date(`1970-01-01 ${a.departure.time}`);
          bValue = new Date(`1970-01-01 ${b.departure.time}`);
          break;
        case 'arrival':
          aValue = new Date(`1970-01-01 ${a.arrival.time}`);
          bValue = new Date(`1970-01-01 ${b.arrival.time}`);
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredFlights(filtered);
  };

  // Apply filters when options change
  useEffect(() => {
    applyFiltersAndSort();
  }, [sortFilterOptions]);

  // Enhanced Book Now handler
  const handleBookNow = (flight: FlightData) => {
    const flightDetails = {
      id: flight.id,
      airline: flight.airline.name,
      flightNumber: flight.flightNumber,
      departure: {
        airport: flight.departure.code,
        city: flight.departure.location,
        time: flight.departure.time,
        date: flight.departure.date,
      },
      arrival: {
        airport: flight.arrival.code,
        city: flight.arrival.location,
        time: flight.arrival.time,
        date: flight.arrival.date,
      },
      duration: flight.duration,
      aircraft: flight.flightType,
      class: flight.cabinClass as 'Economy' | 'Premium Economy' | 'Business' | 'First',
      price: parseInt(flight.price.replace('$', '')),
      currency: 'USD',
    };

    // Navigate to checkout with flight details
    if (navigation) {
      navigation.navigate('FlightCheckout', {
        flightDetails,
        searchParams,
      });
    } else {
      // Fallback navigation
      Alert.alert('Book Flight', `Selected flight: ${flight.flightNumber} for ${flight.price}`, [
        { text: 'OK', onPress: () => console.log('Flight booking initiated') }
      ]);
    }
  };

  // Handle sort/filter modal
  const handleSortFilter = () => {
    setShowSortFilter(true);
  };

  const applySortFilter = () => {
    setShowSortFilter(false);
    // Filters are already applied via useEffect
  };

  // Sort & Filter Modal Component
  const SortFilterModal = () => (
    <Modal
      visible={showSortFilter}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowSortFilter(false)}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Sort & Filter</Text>
          <TouchableOpacity onPress={applySortFilter}>
            <Text style={styles.modalSave}>Apply</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Sort Section */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sort By</Text>
            <View style={styles.sortOptions}>
              {[
                { key: 'price', label: 'Price' },
                { key: 'duration', label: 'Duration' },
                { key: 'departure', label: 'Departure Time' },
                { key: 'arrival', label: 'Arrival Time' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortOption,
                    sortFilterOptions.sortBy === option.key && styles.sortOptionSelected
                  ]}
                  onPress={() => setSortFilterOptions(prev => ({ 
                    ...prev, 
                    sortBy: option.key as any 
                  }))}
                >
                  <Text style={[
                    styles.sortOptionText,
                    sortFilterOptions.sortBy === option.key && styles.sortOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {sortFilterOptions.sortBy === option.key && (
                    <TouchableOpacity
                      onPress={() => setSortFilterOptions(prev => ({ 
                        ...prev, 
                        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                      }))}
                    >
                      <Ionicons 
                        name={sortFilterOptions.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                        size={16} 
                        color="#A83442" 
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filter Section */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Stops</Text>
            <View style={styles.filterOptions}>
              {[
                { key: 'any', label: 'Any' },
                { key: 'nonstop', label: 'Non-stop' },
                { key: 'oneStop', label: '1 Stop' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOption,
                    sortFilterOptions.filters.stops === option.key && styles.filterOptionSelected
                  ]}
                  onPress={() => setSortFilterOptions(prev => ({ 
                    ...prev, 
                    filters: { ...prev.filters, stops: option.key as any }
                  }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    sortFilterOptions.filters.stops === option.key && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Airlines Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Airlines</Text>
            <View style={styles.filterOptions}>
              {Array.from(new Set(mockFlights.map(f => f.airline.name))).map((airline) => (
                <TouchableOpacity
                  key={airline}
                  style={[
                    styles.filterOption,
                    sortFilterOptions.filters.airlines.includes(airline) && styles.filterOptionSelected
                  ]}
                  onPress={() => setSortFilterOptions(prev => ({ 
                    ...prev, 
                    filters: { 
                      ...prev.filters, 
                      airlines: prev.filters.airlines.includes(airline)
                        ? prev.filters.airlines.filter(a => a !== airline)
                        : [...prev.filters.airlines, airline]
                    }
                  }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    sortFilterOptions.filters.airlines.includes(airline) && styles.filterOptionTextSelected
                  ]}>
                    {airline}
                  </Text>
                  {sortFilterOptions.filters.airlines.includes(airline) && (
                    <Ionicons name="checkmark" size={16} color="#A83442" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const FlightCard = ({ flight }: { flight: FlightData }) => {
    const isFlipped = flippedCards.has(flight.id);

    return (
      <View style={styles.cardContainer}>
        {/* Front of Card */}
        {!isFlipped && (
          <TouchableOpacity
            style={styles.flightCard}
            onPress={() => toggleCard(flight.id)}
            activeOpacity={0.9}
          >
            {/* Ticket cutouts */}
            <View style={[styles.cutout, styles.leftCutout]} />
            <View style={[styles.cutout, styles.rightCutout]} />
            
            {/* Airline Header */}
            <View style={styles.airlineHeader}>
              <View style={styles.airlineInfo}>
                <View style={[styles.airlineLogo, { backgroundColor: flight.airline.color }]}>
                  <Text style={styles.airlineLogoText}>{flight.airline.logo}</Text>
                </View>
                <View style={styles.airlineText}>
                  <Text style={styles.airlineLabel}>Airlines</Text>
                  <Text style={styles.airlineName}>{flight.airline.name}</Text>
                </View>
              </View>
              <View style={styles.flightTypeContainer}>
                <View style={styles.flightType}>
                  <Text style={styles.flightTypeText}>{flight.flightType}</Text>
                </View>
                <Text style={styles.flightNumberText}>{flight.flightNumber}</Text>
                <Text style={styles.cabinClassText}>{flight.cabinClass}</Text>
              </View>
            </View>

            {/* Flight Route */}
            <View style={styles.flightRoute}>
              <View style={styles.routeEndpoint}>
                <Text style={styles.routeTime}>{flight.departure.time}</Text>
                <Text style={styles.routeCode}>{flight.departure.code}</Text>
                <Text style={styles.routeLocationName}>{flight.departure.location}</Text>
              </View>

              <View style={styles.routeMiddle}>
                <View style={styles.routeLine} />
                <View style={styles.routePlaneIcon}>
                  <Text style={styles.planeIcon}>→</Text>
                </View>
              </View>

              <View style={styles.routeEndpoint}>
                <Text style={styles.routeTime}>{flight.arrival.time}</Text>
                <Text style={styles.routeCode}>{flight.arrival.code}</Text>
                <Text style={styles.routeLocationName}>{flight.arrival.location}</Text>
              </View>
            </View>

            {/* Bottom Row - Duration with Date and Price */}
            <View style={styles.bottomRow}>
              <View style={styles.durationContainer}>
                <Text style={styles.duration}>{flight.duration}</Text>
                <Text style={styles.flightDate}>{flight.departure.date}</Text>
              </View>
              <View style={styles.flightPrice}>
                <Text style={styles.priceAmount}>{flight.price}</Text>
                <Text style={styles.pricePer}>/pax</Text>
              </View>
            </View>

            {/* View Details Button */}
            <TouchableOpacity 
              style={styles.viewDetailsButton}
              onPress={() => toggleCard(flight.id)}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Back of Card - Detailed View */}
        {isFlipped && (
          <View style={styles.flightCardDetailed}>
            {/* Ticket cutouts */}
            <View style={[styles.cutout, styles.leftCutout]} />
            <View style={[styles.cutout, styles.rightCutout]} />
            
            {/* Header with Close */}
            <View style={styles.detailHeader}>
              <View style={styles.airlineInfo}>
                <View style={[styles.airlineLogo, { backgroundColor: flight.airline.color }]}>
                  <Text style={styles.airlineLogoText}>{flight.airline.logo}</Text>
                </View>
                <View>
                  <Text style={styles.airlineName}>{flight.airline.name}</Text>
                  <Text style={styles.flightNumber}>{flight.flightNumber} • {flight.cabinClass}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => toggleCard(flight.id)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Flight Details */}
            <View style={styles.detailsSection}>
              {/* Route Info */}
              <View style={styles.routeDetails}>
                <View style={styles.routePoint}>
                  <Text style={styles.routeTime}>{flight.departure.time}</Text>
                  <Text style={styles.routeCode}>{flight.departure.code}</Text>
                  <Text style={styles.terminalInfo}>{flight.departure.terminal}</Text>
                  <Text style={styles.gateInfo}>{flight.departure.gate}</Text>
                  <Text style={styles.dateInfo}>{flight.departure.date}</Text>
                </View>
                
                <View style={styles.routeMiddleDetailed}>
                  <Text style={styles.durationText}>{flight.duration}</Text>
                  <View style={styles.routeLine} />
                  <Text style={styles.stopsText}>{flight.stops}</Text>
                </View>
                
                <View style={styles.routePoint}>
                  <Text style={styles.routeTime}>{flight.arrival.time}</Text>
                  <Text style={styles.routeCode}>{flight.arrival.code}</Text>
                  <Text style={styles.terminalInfo}>{flight.arrival.terminal}</Text>
                  <Text style={styles.gateInfo}>{flight.arrival.gate}</Text>
                  <Text style={styles.dateInfo}>{flight.arrival.date}</Text>
                </View>
              </View>

              {/* Flight Info */}
              <View style={styles.flightInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Cabin Class:</Text>
                  <Text style={styles.infoValue}>{flight.cabinClass}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Baggage:</Text>
                  <Text style={styles.infoValue}>{flight.baggage}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Refundable:</Text>
                  <Text style={[styles.infoValue, { color: flight.refundable ? '#2ecc71' : '#e74c3c' }]}>
                    {flight.refundable ? 'Yes' : 'No'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Seat Selection:</Text>
                  <Text style={[styles.infoValue, { color: flight.seatSelection ? '#2ecc71' : '#e74c3c' }]}>
                    {flight.seatSelection ? 'Available' : 'Not Available'}
                  </Text>
                </View>
              </View>

              {/* Amenities */}
              <View style={styles.amenitiesSection}>
                <Text style={styles.amenitiesTitle}>Amenities</Text>
                <View style={styles.amenitiesList}>
                  {flight.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityItem}>
                      <Text style={styles.amenityBullet}>•</Text>
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Price and Book Button */}
              <View style={styles.bookingSection}>
                <View style={styles.priceSection}>
                  <Text style={styles.totalLabel}>Total Price</Text>
                  <Text style={styles.totalPrice}>{flight.price}</Text>
                  <Text style={styles.perPax}>/pax</Text>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={() => handleBookNow(flight)}>
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D6D5C9" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (navigation) {
                navigation.goBack();
              } else {
                nav.goBack();
              }
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Result Search</Text>
          {/* Removed the burger menu button */}
          <View style={styles.spacer} />
        </View>

        <View style={styles.routeInfo}>
          <View style={styles.routeLocation}>
            <Text style={styles.airportCode}>{searchParams.from}</Text>
            <Text style={styles.airportName}>Surabaya, East Java</Text>
          </View>
          <View style={styles.routeArrow}>
            <Text style={styles.flightIconHeader}>→</Text>
            <Text style={styles.routeDate}>{searchParams.departureDate}</Text>
          </View>
          <View style={styles.routeLocation}>
            <Text style={styles.airportCode}>{searchParams.to}</Text>
            <Text style={styles.airportName}>Denpasar, Bali</Text>
          </View>
        </View>
      </View>

      {/* Results Summary */}
      <View style={styles.resultsSummary}>
        <Text style={styles.resultsText}>
          {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''} found
        </Text>
        <Text style={styles.passengersText}>
          {searchParams.passengers.adults} Adult{searchParams.passengers.adults !== 1 ? 's' : ''}
          {searchParams.passengers.children > 0 && `, ${searchParams.passengers.children} Child${searchParams.passengers.children !== 1 ? 'ren' : ''}`}
          {searchParams.passengers.infants > 0 && `, ${searchParams.passengers.infants} Infant${searchParams.passengers.infants !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredFlights.length > 0 ? (
          filteredFlights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Ionicons name="airplane-outline" size={48} color="#A83442" />
            <Text style={styles.noResultsTitle}>No flights found</Text>
            <Text style={styles.noResultsText}>
              Try adjusting your filters or search criteria
            </Text>
          </View>
        )}
        
        {/* Add some bottom padding for the floating button */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Sort & Filter Button */}
      <TouchableOpacity style={styles.floatingSortFilter} onPress={handleSortFilter}>
        <Ionicons name="options-outline" size={16} color="#FFFFFF" />
        <Text style={styles.sortFilterText}>Sort & Filter</Text>
      </TouchableOpacity>
      <SortFilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D6D5C9',
  },
  header: {
    backgroundColor: '#D6D5C9',
    paddingTop: 50, // Account for status bar
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '600', // Changed from 'bold' to semi-bold
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '600', // Changed from '700' to semi-bold
    color: '#000000',
    textAlign: 'center',
    flex: 1,
  },
  spacer: {
    width: 40,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  routeLocation: {
    alignItems: 'center',
  },
  airportCode: {
    color: '#000000',
    fontSize: 28,
    fontWeight: '700', // Keep bold for airport codes as they're key identifiers
    marginBottom: 2,
  },
  airportName: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '400', // Added normal weight
    opacity: 0.8,
  },
  routeArrow: {
    alignItems: 'center',
    gap: 5,
  },
  flightIconHeader: {
    color: '#A83442',
    fontSize: 24,
    transform: [{ rotate: '0deg' }],
  },
  routeDate: {
    color: '#333333',
    fontSize: 12,
    opacity: 0.7,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#D6D5C9',
  },
  scrollContent: {
    paddingTop: 15,
  },
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  flightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  flightCardDetailed: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  cutout: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D6D5C9',
    top: '50%',
    marginTop: -6,
    zIndex: 2,
  },
  leftCutout: {
    left: -6,
  },
  rightCutout: {
    right: -6,
  },
  airlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  airlineLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  airlineLogoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600', // Changed from '700' to semi-bold
  },
  airlineText: {
    flexDirection: 'column',
  },
  airlineLabel: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '400', // Added normal weight
    marginBottom: 1,
  },
  airlineName: {
    fontSize: 14,
    fontWeight: '500', // Changed from '700' to medium
    color: '#000000',
  },
  flightNumber: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '400', // Changed from '500' to normal
  },
  flightNumberText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '400', // Changed from '500' to normal
    marginTop: 4,
  },
  cabinClassText: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '400', // Changed from '500' to normal
  },
  flightTypeContainer: {
    alignItems: 'center',
  },
  flightType: {
    backgroundColor: 'rgba(168, 52, 66, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  flightTypeText: {
    color: '#A83442',
    fontSize: 10,
    fontWeight: '500', // Changed from '600' to medium
  },
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeEndpoint: {
    flex: 1,
    alignItems: 'center',
  },
  routeTime: {
    fontSize: 18,
    fontWeight: '600', // Changed from '700' to semi-bold
    color: '#000000',
    marginBottom: 2,
  },
  routeCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 1,
  },
  routeLocationName: {
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center',
  },
  routeMiddle: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
    position: 'relative',
  },
  routeLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#e9ecef',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginVertical: 4,
  },
  routePlaneIcon: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    marginTop: -10,
  },
  planeIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    transform: [{ rotate: '90deg' }],
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  durationContainer: {
    alignItems: 'flex-start',
  },
  duration: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  flightDate: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '500',
    marginTop: 2,
  },
  flightPrice: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#A83442',
    marginBottom: 1,
  },
  pricePer: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '500',
  },
  viewDetailsButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailsSection: {
    flex: 1,
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routePoint: {
    alignItems: 'center',
    flex: 1,
  },
  terminalInfo: {
    fontSize: 10,
    color: '#6c757d',
    marginBottom: 1,
  },
  gateInfo: {
    fontSize: 10,
    color: '#6c757d',
  },
  dateInfo: {
    fontSize: 10,
    color: '#6c757d',
    marginTop: 2,
  },
  routeMiddleDetailed: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  durationText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 4,
  },
  stopsText: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '500',
    marginTop: 4,
  },
  flightInfo: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  bookingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  priceSection: {
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#A83442',
  },
  perPax: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#A83442',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
  floatingSortFilter: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    marginLeft: -60,
    backgroundColor: '#A83442',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#A83442',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  amenitiesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  amenitiesTitle: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 8,
  },
  amenitiesList: {
    flexDirection: 'column',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  amenityBullet: {
    fontSize: 10,
    color: '#6c757d',
    marginRight: 4,
  },
  amenityText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50, // Account for status bar
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#A83442',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  modalSave: {
    fontSize: 16,
    color: '#A83442',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 8,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sortOptionSelected: {
    backgroundColor: '#e9ecef',
    borderColor: '#A83442',
  },
  sortOptionText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  sortOptionTextSelected: {
    color: '#A83442',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterOptionSelected: {
    backgroundColor: '#e9ecef',
    borderColor: '#A83442',
  },
  filterOptionText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#A83442',
  },
  resultsSummary: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  passengersText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '400',
    marginTop: 2,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noResultsTitle: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
    marginTop: 20,
  },
  noResultsText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
}); 