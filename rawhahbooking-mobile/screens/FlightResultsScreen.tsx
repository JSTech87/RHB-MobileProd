// @ts-nocheck
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DuffelApiService, { DuffelOffer, DuffelOfferRequest } from '../services/duffelApi';
import AuthService from '../services/authService';
import DatabaseService from '../services/databaseService';

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
    arrivalTime: 'any' | 'morning' | 'afternoon' | 'evening';
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

type RootStackParamList = {
  FlightCheckout: {
    flight: DuffelOffer;
    passengers: number;
  };
  FlightResults: {
    searchParams: DuffelOfferRequest;
    offers: DuffelOffer[];
  };
};

type FlightResultsScreenRouteProp = RouteProp<RootStackParamList, 'FlightResults'>;
type FlightResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FlightResults'>;

export const FlightResultsScreen: React.FC = () => {
  const navigation = useNavigation<FlightResultsScreenNavigationProp>();
  const route = useRoute<FlightResultsScreenRouteProp>();
  
  const { searchParams, offers: initialOffers = [] } = route.params || {};
  
  // Safety check for searchParams
  if (!searchParams) {
    console.error('FlightResultsScreen: Missing searchParams');
    // Navigate back or show error
  }
  
  const [offers, setOffers] = useState<DuffelOffer[]>(initialOffers || []);
  const [filteredOffers, setFilteredOffers] = useState<DuffelOffer[]>(initialOffers || []);
  const [loading, setLoading] = useState(false);
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [markupRules, setMarkupRules] = useState<any[]>([]); // Changed to any[] as MarkupRule is removed
  
  const [sortFilterOptions, setSortFilterOptions] = useState<SortFilterOptions>({
    sortBy: 'price',
    sortOrder: 'asc',
    filters: {
      maxPrice: 10000,
      airlines: [],
      stops: 'any',
      departureTime: 'any',
      arrivalTime: 'any',
      duration: 'any'
    }
  });

  useEffect(() => {
    loadMarkupRules();
    
    // If no offers were provided, perform search automatically
    if (searchParams && (!offers || offers.length === 0)) {
      console.log('🔍 No offers provided, performing automatic search...');
      performInitialSearch();
    }
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [offers, sortFilterOptions]);

  const performInitialSearch = async () => {
    try {
      setLoading(true);
      console.log('📡 Performing initial Supabase flight search with params:', searchParams);
      
      // Import BackendApiService to use Supabase Edge Functions
      const { BackendApiService } = await import('../services/backendApi');
      
      // Create flight search request format for Supabase Edge Function
      const flightSearchRequest = {
        origin: searchParams.from,
        destination: searchParams.to,
        departure_date: searchParams.departureDate,
        return_date: searchParams.tripType === 'roundTrip' ? searchParams.returnDate : undefined,
        passengers: {
          adults: searchParams.passengers?.adults || 1,
          children: searchParams.passengers?.children || 0,
          infants: searchParams.passengers?.infants || 0,
        },
        cabin_class: searchParams.cabinClass?.toLowerCase().replace(' ', '_') || 'economy',
        trip_type: searchParams.tripType || 'oneWay',
        user_id: 'anonymous_user', // Add user_id as required by Edge Function
      };
      
      console.log('🚀 Supabase Edge Function Request:', JSON.stringify(flightSearchRequest, null, 2));
      
      // Search for offers via Supabase Edge Functions
      try {
        await BackendApiService.searchFlights(flightSearchRequest as any);
      } catch (e) {
        console.warn('Supabase logging failed (continuing with direct Duffel search):', (e as any)?.message || e);
      }
      
      const { default: DuffelApiService } = await import('../services/duffelApi');
      const duffelOfferRequest = {
        cabin_class: flightSearchRequest.cabin_class,
        passengers: [
          ...Array(searchParams.passengers?.adults || 1).fill({ type: 'adult' }),
          ...Array(searchParams.passengers?.children || 0).fill({ type: 'child' }),
          ...Array(searchParams.passengers?.infants || 0).fill({ type: 'infant_without_seat' }),
        ],
        slices: [
          {
            origin: searchParams.from,
            destination: searchParams.to,
            departure_date: searchParams.departureDate,
          },
          ...(searchParams.tripType === 'roundTrip' && searchParams.returnDate ? [{
            origin: searchParams.to,
            destination: searchParams.from,
            departure_date: searchParams.returnDate,
          }] : [])
        ],
        return_offers: true,
      } as any;
      const duffelResponse = await DuffelApiService.searchOffers(duffelOfferRequest);
      console.log('✅ Direct Duffel offers:', duffelResponse.data?.length || 0);
      setOffers(duffelResponse.data || []);
       
      setLoading(false);
    } catch (error) {
      console.error('❌ Supabase flight search failed:', error);
      setLoading(false);
      
      Alert.alert(
        'Search Error', 
        'Unable to search for flights via Supabase. Please try again.',
        [
          {
            text: 'Retry',
            onPress: () => performInitialSearch(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const loadMarkupRules = async () => {
    try {
      const rules = await DatabaseService.getMarkupRules();
      setMarkupRules(rules);
      
      // Note: Markup application moved to backend for security
      console.log('Markup rules loaded:', rules.length);
    } catch (error) {
      console.error('Error loading markup rules:', error);
    }
  };

  const applyFiltersAndSort = () => {
    // Safety check: ensure offers is defined and is an array
    if (!offers || !Array.isArray(offers) || offers.length === 0) {
      setFilteredOffers([]);
      return;
    }

    let filtered = [...offers];

    // Apply price filter
    if (sortFilterOptions.filters.maxPrice) {
      filtered = filtered.filter(offer => 
        parseFloat(offer.total_amount) <= sortFilterOptions.filters.maxPrice!
      );
    }

    // Apply duration filter
    filtered = filtered.filter(offer => {
      if (!offer.slices || !Array.isArray(offer.slices)) return false;
      const totalDuration = offer.slices.reduce((total, slice) => {
        const duration = slice.duration ? parseDuration(slice.duration) : 0;
        return total + duration;
      }, 0);
      const maxDuration = sortFilterOptions.filters.duration === 'any' ? 24 * 60 : 
                         sortFilterOptions.filters.duration === 'short' ? 4 * 60 :
                         sortFilterOptions.filters.duration === 'medium' ? 8 * 60 : 12 * 60;
      return totalDuration <= maxDuration;
    });

    // Apply airline filter
    if (sortFilterOptions.filters.airlines && sortFilterOptions.filters.airlines.length > 0) {
      filtered = filtered.filter(offer =>
        offer.slices && offer.slices.some(slice =>
          slice.segments && slice.segments.some(segment =>
            segment.operating_carrier && sortFilterOptions.filters.airlines.includes(segment.operating_carrier.iata_code)
          )
        )
      );
    }

    // Apply stops filter
    if (sortFilterOptions.filters.stops !== 'any') {
      filtered = filtered.filter(offer => {
        if (!offer.slices || !Array.isArray(offer.slices)) return false;
        const maxStops = Math.max(...offer.slices.map(slice => 
          slice.segments && Array.isArray(slice.segments) ? slice.segments.length - 1 : 0
        ));
        switch (sortFilterOptions.filters.stops) {
          case 'nonstop':
            return maxStops === 0;
          case 'oneStop':
            return maxStops <= 1;
          default:
            return true;
        }
      });
    }

    // Apply time filters
    if (sortFilterOptions.filters.departureTime !== 'any') {
      filtered = filtered.filter(offer => {
        if (!offer.slices || !offer.slices[0] || !offer.slices[0].departing_at) return false;
        const departureTime = new Date(offer.slices[0].departing_at).getHours();
        return matchesTimeFilter(departureTime, sortFilterOptions.filters.departureTime);
      });
    }

    if (sortFilterOptions.filters.arrivalTime !== 'any') {
      filtered = filtered.filter(offer => {
        if (!offer.slices || offer.slices.length === 0) return false;
        const lastSlice = offer.slices[offer.slices.length - 1];
        if (!lastSlice || !lastSlice.arriving_at) return false;
        const arrivalTime = new Date(lastSlice.arriving_at).getHours();
        return matchesTimeFilter(arrivalTime, sortFilterOptions.filters.arrivalTime);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortFilterOptions.sortBy) {
        case 'price':
          comparison = parseFloat(a.total_amount || '0') - parseFloat(b.total_amount || '0');
          break;
        case 'duration':
          const aDuration = (a.slices || []).reduce((total, slice) => 
            total + parseDuration(slice.duration || ''), 0);
          const bDuration = (b.slices || []).reduce((total, slice) => 
            total + parseDuration(slice.duration || ''), 0);
          comparison = aDuration - bDuration;
          break;
        case 'departure':
          const aDepTime = a.slices && a.slices[0] && a.slices[0].departing_at ? 
            new Date(a.slices[0].departing_at).getTime() : 0;
          const bDepTime = b.slices && b.slices[0] && b.slices[0].departing_at ? 
            new Date(b.slices[0].departing_at).getTime() : 0;
          comparison = aDepTime - bDepTime;
          break;
        case 'arrival':
          const aLastSlice = a.slices && a.slices.length > 0 ? a.slices[a.slices.length - 1] : null;
          const bLastSlice = b.slices && b.slices.length > 0 ? b.slices[b.slices.length - 1] : null;
          const aArrTime = aLastSlice && aLastSlice.arriving_at ? 
            new Date(aLastSlice.arriving_at).getTime() : 0;
          const bArrTime = bLastSlice && bLastSlice.arriving_at ? 
            new Date(bLastSlice.arriving_at).getTime() : 0;
          comparison = aArrTime - bArrTime;
          break;
      }
      
      return sortFilterOptions.sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredOffers(filtered);
  };

  const parseDuration = (duration: string): number => {
    // Parse ISO 8601 duration (PT1H30M) to minutes
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    return hours * 60 + minutes;
  };

  const matchesTimeFilter = (hour: number, filter: string): boolean => {
    switch (filter) {
      case 'morning':
        return hour >= 6 && hour < 12;
      case 'afternoon':
        return hour >= 12 && hour < 18;
      case 'evening':
        return hour >= 18 || hour < 6;
      default:
        return true;
    }
  };

  const formatDuration = (duration: string): string => {
    const minutes = parseDuration(duration);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStopsText = (segments: any[]): string => {
    const stops = segments.length - 1;
    if (stops === 0) return 'Nonstop';
    if (stops === 1) return '1 stop';
    return `${stops} stops`;
  };

  const handleBookNow = async (offer: DuffelOffer) => {
    try {
      // Check if user is authenticated
      const user = AuthService.getCurrentUser();
      if (!user) {
        Alert.alert(
          'Authentication Required',
          'Please log in to book flights.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Calculate total passengers
      // Use search params to get passenger count since offer doesn't have passengers
      const totalPassengers = searchParams?.passengers ? 
        (searchParams.passengers.adults + searchParams.passengers.children + searchParams.passengers.infants) : 1;

      navigation.navigate('FlightCheckout', {
        flight: offer,
        passengers: totalPassengers,
      });
    } catch (error) {
      console.error('Error navigating to checkout:', error);
      Alert.alert('Error', 'Unable to proceed to checkout. Please try again.');
    }
  };

  const refreshOffers = async () => {
    try {
      setLoading(true);
      
      // Import BackendApiService to use Supabase Edge Functions
      const { BackendApiService } = await import('../services/backendApi');
      
      // Re-fetch offers with same search parameters via Supabase
      const response = await BackendApiService.searchFlights(searchParams as any);
      let newOffers = response.offers;

      // Note: Markup rules applied on backend for security

      setOffers(newOffers);
      
      // Cache the new results
      await DatabaseService.setCache('last_flight_search', {
        searchParams,
        offers: newOffers,
        timestamp: new Date().toISOString(),
      }, 30); // Cache for 30 minutes

    } catch (error) {
      console.error('Error refreshing offers via Supabase:', error);
      Alert.alert('Error', 'Unable to refresh flight offers via Supabase. Please try again.');
    } finally {
      setLoading(false);
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
              {offers && Array.isArray(offers) && offers.length > 0 ? 
                Array.from(new Set(offers.flatMap(f => 
                  f.slices && Array.isArray(f.slices) ? 
                    f.slices.flatMap(s => 
                      s.segments && Array.isArray(s.segments) ? 
                        s.segments.map(seg => seg.operating_carrier?.iata_code).filter(Boolean)
                        : []
                    ) 
                    : []
                ))).map((airline) => (
                <TouchableOpacity
                  key={airline}
                  style={[
                    styles.filterChip,
                    sortFilterOptions.filters.airlines.includes(airline) && styles.filterChipSelected
                  ]}
                  onPress={() => {
                    const newAirlines = sortFilterOptions.filters.airlines.includes(airline)
                      ? sortFilterOptions.filters.airlines.filter(a => a !== airline)
                      : [...sortFilterOptions.filters.airlines, airline];
                    setSortFilterOptions(prev => ({
                      ...prev,
                      filters: { ...prev.filters, airlines: newAirlines }
                    }));
                  }}
                >
                  <Text style={[
                    styles.filterChipText,
                    sortFilterOptions.filters.airlines.includes(airline) && styles.filterChipTextSelected
                  ]}>
                    {airline}
                  </Text>
                </TouchableOpacity>
              )) : (
                <Text style={styles.noDataText}>No airlines available</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const FlightCard = ({ offer }: { offer: DuffelOffer }) => {
    const isFlipped = false; // No flipping logic for Duffel offers

    return (
      <View style={styles.cardContainer}>
        {/* Front of Card */}
        {!isFlipped && (
          <TouchableOpacity
            style={styles.flightCard}
            onPress={() => handleBookNow(offer)}
            activeOpacity={0.95}
          >
            {/* Ticket cutouts */}
            <View style={[styles.cutout, styles.leftCutout]} />
            <View style={[styles.cutout, styles.rightCutout]} />
            
            {/* Airline Header */}
            <View style={styles.airlineHeader}>
              <View style={styles.airlineInfo}>
                <View style={[styles.airlineLogo, { backgroundColor: offer.slices[0].operating_carrier.marketing_carrier.color }]}>
                  <Text style={styles.airlineLogoText}>{offer.slices[0].operating_carrier.marketing_carrier.iata_code}</Text>
                </View>
                <View style={styles.airlineText}>
                  <Text style={styles.airlineLabel}>Airlines</Text>
                  <Text style={styles.airlineName}>{offer.slices[0].operating_carrier.marketing_carrier.name}</Text>
                </View>
              </View>
              <View style={styles.flightTypeContainer}>
                <View style={styles.flightType}>
                  <Text style={styles.flightTypeText}>{offer.slices[0].operating_carrier.marketing_carrier.name}</Text>
                </View>
                <Text style={styles.flightNumber}>{offer.slices[0].operating_carrier.marketing_carrier.iata_code} {offer.slices[0].operating_carrier.marketing_carrier.iata_code}</Text>
                <Text style={styles.cabinClassText}>{offer.slices[0].operating_carrier.marketing_carrier.iata_code}</Text>
              </View>
            </View>

            {/* Flight Route */}
            <View style={styles.flightRoute}>
              <View style={styles.routeEndpoint}>
                <Text style={styles.routeTime}>{formatTime(offer.slices[0].departing_at)}</Text>
                <Text style={styles.routeCode}>{offer.slices[0].origin.iata_code}</Text>
                <Text style={styles.routeLocationName}>{offer.slices[0].origin.name}</Text>
              </View>

              <View style={styles.routeMiddle}>
                <View style={styles.routeLine} />
                <View style={styles.routePlaneIcon}>
                  <Text style={styles.planeIcon}>→</Text>
                </View>
              </View>

              <View style={styles.routeEndpoint}>
                <Text style={styles.routeTime}>{formatTime(offer.slices[offer.slices.length - 1].arriving_at)}</Text>
                <Text style={styles.routeCode}>{offer.slices[offer.slices.length - 1].destination.iata_code}</Text>
                <Text style={styles.routeLocationName}>{offer.slices[offer.slices.length - 1].destination.name}</Text>
              </View>
            </View>

            {/* Bottom Row - Duration with Date and Price */}
            <View style={styles.bottomRow}>
              <View style={styles.durationContainer}>
                <Text style={styles.duration}>{formatDuration(offer.slices[0].duration)}</Text>
                <Text style={styles.flightDate}>{formatDate(offer.slices[0].departing_at)}</Text>
              </View>
              <View style={styles.flightPrice}>
                <Text style={styles.priceAmount}>{offer.total_amount}</Text>
                <Text style={styles.pricePer}>/pax</Text>
              </View>
            </View>

            {/* View Details Button */}
            <TouchableOpacity 
              style={styles.viewDetailsButton}
              onPress={() => handleBookNow(offer)}
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
                <View style={[styles.airlineLogo, { backgroundColor: offer.slices[0].operating_carrier.marketing_carrier.color }]}>
                  <Text style={styles.airlineLogoText}>{offer.slices[0].operating_carrier.marketing_carrier.iata_code}</Text>
                </View>
                <View>
                  <Text style={styles.airlineName}>{offer.slices[0].operating_carrier.marketing_carrier.name}</Text>
                  <Text style={styles.flightNumber}>{offer.slices[0].operating_carrier.marketing_carrier.iata_code} {offer.slices[0].operating_carrier.marketing_carrier.iata_code} • {offer.slices[0].operating_carrier.marketing_carrier.iata_code}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {}} // No flipping for Duffel offers
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Flight Details */}
            <View style={styles.detailsSection}>
              {/* Route Info */}
              <View style={styles.routeDetails}>
                <View style={styles.routePoint}>
                  <Text style={styles.routeTime}>{formatTime(offer.slices[0].departing_at)}</Text>
                  <Text style={styles.routeCode}>{offer.slices[0].origin.iata_code}</Text>
                  <Text style={styles.terminalInfo}>{offer.slices[0].origin.terminal}</Text>
                  <Text style={styles.gateInfo}>{offer.slices[0].origin.gate}</Text>
                  <Text style={styles.dateInfo}>{formatDate(offer.slices[0].departing_at)}</Text>
                </View>
                
                <View style={styles.routeMiddleDetailed}>
                  <Text style={styles.durationText}>{formatDuration(offer.slices[0].duration)}</Text>
                  <View style={styles.routeLine} />
                  <Text style={styles.stopsText}>{getStopsText(offer.slices[0].segments)}</Text>
                </View>
                
                <View style={styles.routePoint}>
                  <Text style={styles.routeTime}>{formatTime(offer.slices[offer.slices.length - 1].arriving_at)}</Text>
                  <Text style={styles.routeCode}>{offer.slices[offer.slices.length - 1].destination.iata_code}</Text>
                  <Text style={styles.terminalInfo}>{offer.slices[offer.slices.length - 1].destination.terminal}</Text>
                  <Text style={styles.gateInfo}>{offer.slices[offer.slices.length - 1].destination.gate}</Text>
                  <Text style={styles.dateInfo}>{formatDate(offer.slices[offer.slices.length - 1].arriving_at)}</Text>
                </View>
              </View>

              {/* Flight Info */}
              <View style={styles.flightInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Cabin Class:</Text>
                  <Text style={styles.infoValue}>{offer.slices[0].operating_carrier.marketing_carrier.iata_code}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Baggage:</Text>
                  <Text style={styles.infoValue}>{offer.slices[0].operating_carrier.marketing_carrier.iata_code}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Refundable:</Text>
                  <Text style={[styles.infoValue, { color: offer.slices[0].operating_carrier.marketing_carrier.iata_code ? '#2ecc71' : '#e74c3c' }]}>
                    {offer.slices[0].operating_carrier.marketing_carrier.iata_code ? 'Yes' : 'No'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Seat Selection:</Text>
                  <Text style={[styles.infoValue, { color: offer.slices[0].operating_carrier.marketing_carrier.iata_code ? '#2ecc71' : '#e74c3c' }]}>
                    {offer.slices[0].operating_carrier.marketing_carrier.iata_code ? 'Available' : 'Not Available'}
                  </Text>
                </View>
              </View>

              {/* Amenities */}
              <View style={styles.amenitiesSection}>
                <Text style={styles.amenitiesTitle}>Amenities</Text>
                <View style={styles.amenitiesList}>
                  {offer.slices[0].operating_carrier.marketing_carrier.iata_code && (
                    <View key="amenity-wifi" style={styles.amenityItem}>
                      <Text style={styles.amenityBullet}>•</Text>
                      <Text style={styles.amenityText}>WiFi</Text>
                    </View>
                  )}
                  {offer.slices[0].operating_carrier.marketing_carrier.iata_code && (
                    <View key="amenity-entertainment" style={styles.amenityItem}>
                      <Text style={styles.amenityBullet}>•</Text>
                      <Text style={styles.amenityText}>In-flight Entertainment</Text>
                    </View>
                  )}
                  {offer.slices[0].operating_carrier.marketing_carrier.iata_code && (
                    <View key="amenity-meal" style={styles.amenityItem}>
                      <Text style={styles.amenityBullet}>•</Text>
                      <Text style={styles.amenityText}>Meal Service</Text>
                    </View>
                  )}
                  {offer.slices[0].operating_carrier.marketing_carrier.iata_code && (
                    <View key="amenity-usb" style={styles.amenityItem}>
                      <Text style={styles.amenityBullet}>•</Text>
                      <Text style={styles.amenityText}>USB Charging</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Price and Book Button */}
              <View style={styles.bookingSection}>
                <View style={styles.priceSection}>
                  <Text style={styles.totalLabel}>Total Price</Text>
                  <Text style={styles.totalPrice}>{offer.total_amount}</Text>
                  <Text style={styles.perPax}>/pax</Text>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={() => handleBookNow(offer)}>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Flight Results</Text>
          <TouchableOpacity style={styles.headerAction} onPress={handleSortFilter}>
            <Ionicons name="options-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Route Information */}
        <View style={styles.routeContainer}>
        <View style={styles.routeInfo}>
            <View style={styles.routeEndpoint}>
              <Text style={styles.airportCode}>{searchParams?.from || 'N/A'}</Text>
              <Text style={styles.cityName}>Surabaya</Text>
            </View>
            
            <View style={styles.routeMiddle}>
              <View style={styles.routeLine} />
              <View style={styles.planeIconContainer}>
                <Ionicons name="airplane" size={16} color="#A83442" />
          </View>
              <View style={styles.routeLine} />
          </View>
            
            <View style={styles.routeEndpoint}>
              <Text style={styles.airportCode}>{searchParams?.to || 'N/A'}</Text>
              <Text style={styles.cityName}>Denpasar</Text>
            </View>
          </View>
          
          <View style={styles.tripInfo}>
            <Text style={styles.tripDate}>{searchParams?.departureDate || 'N/A'}</Text>
            <Text style={styles.passengerCount}>
              {searchParams?.passengers ? 
                (searchParams.passengers.adults + searchParams.passengers.children + searchParams.passengers.infants) : 1
              } Passenger{searchParams?.passengers && 
                (searchParams.passengers.adults + searchParams.passengers.children + searchParams.passengers.infants) !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Results Summary */}
        <View style={styles.resultsSummary}>
          <Text style={styles.resultsCount}>
            {filteredOffers.length} flight{filteredOffers.length !== 1 ? 's' : ''} available
          </Text>
          <TouchableOpacity style={styles.sortIndicator} onPress={handleSortFilter}>
            <Text style={styles.sortText}>
              Sorted by {sortFilterOptions.sortBy} {sortFilterOptions.sortOrder === 'asc' ? '↑' : '↓'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A83442" />
            <Text style={styles.loadingText}>Loading flight offers...</Text>
          </View>
        ) : filteredOffers.length > 0 ? (
          filteredOffers.map((offer) => (
            <FlightCard key={offer.id} offer={offer} />
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Ionicons name="airplane-outline" size={64} color="#A83442" />
            <Text style={styles.noResultsTitle}>No flights found</Text>
            <Text style={styles.noResultsText}>
              Try adjusting your filters or search criteria to find more options
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Main Layout
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Route Information
  routeContainer: {
    marginBottom: 20,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routeEndpoint: {
    alignItems: 'center',
  },
  airportCode: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cityName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  routeMiddle: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
    position: 'relative',
  },
  routeLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  planeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#A83442',
  },
  tripInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  passengerCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  
  // Results Summary
  resultsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sortIndicator: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A83442',
  },
  
  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  // Flight Cards
  cardContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  flightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  flightCardDetailed: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#A83442',
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // Card Decorative Elements
  cutout: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
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
  
  // Airline Header
  airlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  airlineLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  airlineLogoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  airlineText: {
    flexDirection: 'column',
  },
  airlineLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 2,
  },
  airlineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  
  // Flight Type Badge
  flightTypeContainer: {
    alignItems: 'center',
  },
  flightType: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  flightTypeText: {
    color: '#A83442',
    fontSize: 11,
    fontWeight: '600',
  },
  flightNumber: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
  flightNumberText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
  cabinClassText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Flight Route in Cards
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  routeTime: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  routeCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  routeLocationName: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  routePlaneIcon: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    marginTop: -12,
  },
  planeIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    transform: [{ rotate: '90deg' }],
  },
  
  // Bottom Row
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  durationContainer: {
    alignItems: 'flex-start',
  },
  duration: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  flightDate: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 2,
  },
  flightPrice: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#A83442',
    marginBottom: 2,
  },
  pricePer: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Action Buttons
  viewDetailsButton: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Detailed Card View
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
  },
  detailsSection: {
    flex: 1,
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  routePoint: {
    alignItems: 'center',
    flex: 1,
  },
  terminalInfo: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  gateInfo: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateInfo: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  routeMiddleDetailed: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  stopsText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
  
  // Flight Info
  flightInfo: {
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  
  // Amenities
  amenitiesSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  amenitiesTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 12,
  },
  amenitiesList: {
    flexDirection: 'column',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  amenityBullet: {
    fontSize: 12,
    color: '#A83442',
    marginRight: 8,
  },
  amenityText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  
  // Booking Section
  bookingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceSection: {
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#A83442',
  },
  perPax: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#A83442',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  
  // No Results
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  noResultsTitle: {
    fontSize: 20,
    color: '#111827',
    fontWeight: '600',
    marginTop: 20,
  },
  noResultsText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  
  // Floating Button
  bottomPadding: {
    height: 100,
  },
  floatingSortFilter: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    marginLeft: -75,
    backgroundColor: '#A83442',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortFilterText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalSave: {
    fontSize: 16,
    color: '#A83442',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  // Filter Sections
  filterSection: {
    marginBottom: 32,
  },
  filterTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 16,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sortOptionSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#A83442',
    borderWidth: 2,
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sortOptionText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  sortOptionTextSelected: {
    color: '#A83442',
    fontWeight: '600',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterOptionSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#A83442',
    borderWidth: 2,
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#A83442',
    fontWeight: '600',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  filterChipText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  filterChipSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#A83442',
    borderWidth: 2,
    shadowColor: '#A83442',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipTextSelected: {
    color: '#A83442',
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
  },
}); 