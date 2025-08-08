import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Keyboard,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import {
  AirportOption,
  searchAirports,
  getRecentSearches,
  saveRecentSearch,
  getTopAirports,
  nearestAirports,
  formatAirportDisplay,
  formatAirportCompact,
} from '../services/airportSearch';

const { width } = Dimensions.get('window');

interface FromToPickerProps {
  mode?: 'flight' | 'hotel';
  defaultFrom?: AirportOption | null;
  defaultTo?: AirportOption | null;
  onChange: (selection: { from: AirportOption | null; to: AirportOption | null }) => void;
  onSwap?: () => void;
}

type FocusedField = 'from' | 'to' | null;

export const FromToPicker: React.FC<FromToPickerProps> = ({
  mode = 'flight',
  defaultFrom = null,
  defaultTo = null,
  onChange,
  onSwap,
}) => {
  // State
  const [fromAirport, setFromAirport] = useState<AirportOption | null>(defaultFrom);
  const [toAirport, setToAirport] = useState<AirportOption | null>(defaultTo);
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [searchResults, setSearchResults] = useState<AirportOption[]>([]);
  const [recentSearches, setRecentSearches] = useState<AirportOption[]>([]);
  const [topAirports, setTopAirportsState] = useState<AirportOption[]>([]);
  const [nearbyAirports, setNearbyAirports] = useState<AirportOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Refs
  const fromInputRef = useRef<TextInput>(null);
  const toInputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSelectingRef = useRef(false);

  // Initialize data
  useEffect(() => {
    initializeData();
  }, []);

  // Update parent when selection changes
  useEffect(() => {
    onChange({ from: fromAirport, to: toAirport });
    validateSelection();
  }, [fromAirport, toAirport]);

  const initializeData = async () => {
    try {
      const [recent, top] = await Promise.all([
        getRecentSearches(),
        Promise.resolve(getTopAirports(20))
      ]);
      
      setRecentSearches(recent);
      setTopAirportsState(top);

      // Try to get user location for nearby airports
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const nearby = nearestAirports(location.coords.latitude, location.coords.longitude);
          setNearbyAirports(nearby);
        }
      } catch (error) {
        console.log('Location permission denied or unavailable');
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  };

  const validateSelection = () => {
    if (fromAirport && toAirport && fromAirport.iata === toAirport.iata) {
      setValidationError('From and To airports cannot be the same');
    } else {
      setValidationError(null);
    }
  };

  const debouncedSearch = useCallback((query: string, field: FocusedField) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchAirports(query);
          if (focusedField === field) { // Only update if still focused on same field
            setSearchResults(results);
          }
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 280); // 280ms debounce
  }, [focusedField]);

  const handleInputChange = (text: string, field: 'from' | 'to') => {
    if (field === 'from') {
      setFromQuery(text);
      if (!text) setFromAirport(null);
    } else {
      setToQuery(text);
      if (!text) setToAirport(null);
    }
    
    debouncedSearch(text, field);
  };

  const handleInputFocus = (field: 'from' | 'to') => {
    console.log('handleInputFocus called for:', field);
    setFocusedField(field);
    setDropdownVisible(true);
    const query = field === 'from' ? fromQuery : toQuery;
    
    if (query.length >= 2) {
      debouncedSearch(query, field);
    } else {
      // Show default suggestions
      const suggestions = [
        ...nearbyAirports.slice(0, 5),
        ...recentSearches.slice(0, 5),
        ...topAirports.slice(0, 10)
      ];
      
      // Remove duplicates
      const uniqueSuggestions = suggestions.filter((airport, index, self) => 
        index === self.findIndex(a => a.iata === airport.iata)
      );
      
      setSearchResults(uniqueSuggestions.slice(0, 10));
    }
  };

  const handleInputCardPress = (field: 'from' | 'to') => {
    console.log('handleInputCardPress called for:', field);
    
    // Clear the query to allow new search when tapping on selected airport
    if (field === 'from' && fromAirport) {
      setFromQuery('');
    } else if (field === 'to' && toAirport) {
      setToQuery('');
    }
    
    if (field === 'from') {
      fromInputRef.current?.focus();
    } else {
      toInputRef.current?.focus();
    }
    handleInputFocus(field);
  };

  const handleInputBlur = (field: 'from' | 'to') => {
    // Prevent blur from closing dropdown - we'll handle it manually
    return;
  };

  const closeDropdown = () => {
    setFocusedField(null);
    setDropdownVisible(false);
    setSearchResults([]);
  };

  const handleAirportSelect = async (airport: AirportOption) => {
    isSelectingRef.current = true;
    
    if (focusedField === 'from') {
      setFromAirport(airport);
      setFromQuery(formatAirportCompact(airport));
      fromInputRef.current?.blur();
    } else if (focusedField === 'to') {
      setToAirport(airport);
      setToQuery(formatAirportCompact(airport));
      toInputRef.current?.blur();
    }

    // Save to recent searches
    await saveRecentSearch(airport);
    
    // Update recent searches state
    const updatedRecent = await getRecentSearches();
    setRecentSearches(updatedRecent);

    // Close dropdown
    closeDropdown();
    
    // Reset flag
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 100);
  };

  const handleDropdownTouchStart = () => {
    // Set flag when user starts touching dropdown
    isSelectingRef.current = true;
  };

  const handleDropdownTouchEnd = () => {
    // Reset flag when touch ends (but not immediately to allow onPress to fire)
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 200);
  };

  const handleSwap = () => {
    const tempAirport = fromAirport;
    const tempQuery = fromQuery;
    
    setFromAirport(toAirport);
    setToAirport(tempAirport);
    setFromQuery(toQuery);
    setToQuery(tempQuery);
    
    onSwap?.();
  };

  const getDisplaySections = () => {
    if (searchResults.length === 0) return [];

    const sections = [];
    
    // If we have nearby airports in results, show them first
    const nearby = searchResults.filter(a => nearbyAirports.some(n => n.iata === a.iata));
    if (nearby.length > 0) {
      sections.push({ title: 'Nearby', data: nearby });
    }

    // Recent searches
    const recent = searchResults.filter(a => 
      recentSearches.some(r => r.iata === a.iata) && 
      !nearby.some(n => n.iata === a.iata)
    );
    if (recent.length > 0) {
      sections.push({ title: 'Recent', data: recent });
    }

    // Other results
    const others = searchResults.filter(a => 
      !nearby.some(n => n.iata === a.iata) && 
      !recent.some(r => r.iata === a.iata)
    );
    if (others.length > 0) {
      const title = fromQuery.length >= 2 || toQuery.length >= 2 ? 'Search Results' : 'Popular';
      sections.push({ title, data: others });
    }

    return sections;
  };

  const renderAirportItem = ({ item }: { item: AirportOption }) => (
    <Pressable
      style={({ pressed }) => [
        styles.airportItem,
        pressed && styles.airportItemPressed
      ]}
      onPress={() => handleAirportSelect(item)}
      onPressIn={handleDropdownTouchStart}
      onPressOut={handleDropdownTouchEnd}
      accessibilityRole="button"
      accessibilityLabel={formatAirportDisplay(item)}
    >
      <View style={styles.airportItemContent}>
        <View style={styles.airportInfo}>
          <Text style={styles.airportPrimary}>
            {item.city}{item.region ? `, ${item.region}` : ''}
          </Text>
          <Text style={styles.airportSecondary}>
            {item.name} • {item.country}
          </Text>
        </View>
        <Text style={styles.airportIata}>{item.iata}</Text>
      </View>
      {item.source === 'api' && (
        <View style={styles.apiIndicator}>
          <Ionicons name="cloud" size={12} color="#6c757d" />
        </View>
      )}
    </Pressable>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* From Input */}
      <TouchableOpacity onPress={() => handleInputCardPress('from')}>
        <View style={[styles.inputCard, focusedField === 'from' && styles.inputCardFocused]}>
          <Text style={styles.inputLabel}>From</Text>
          <TextInput
            ref={fromInputRef}
            style={styles.input}
            value={
              focusedField === 'from' 
                ? fromQuery 
                : (fromAirport ? formatAirportCompact(fromAirport) : fromQuery)
            }
            onChangeText={(text) => handleInputChange(text, 'from')}
            onFocus={() => handleInputFocus('from')}
            onBlur={() => handleInputBlur('from')}
            onPressIn={() => handleInputFocus('from')}
            placeholder="Search airports or cities"
            placeholderTextColor="#6c757d"
            autoCapitalize="words"
            autoComplete="off"
            autoCorrect={false}
            accessibilityLabel="From airport"
            accessibilityHint="Search for departure airport or city"
          />
        </View>
      </TouchableOpacity>

      {/* To Input */}
      <TouchableOpacity onPress={() => handleInputCardPress('to')}>
        <View style={[styles.inputCard, focusedField === 'to' && styles.inputCardFocused]}>
          <Text style={styles.inputLabel}>To</Text>
          <TextInput
            ref={toInputRef}
            style={styles.input}
            value={
              focusedField === 'to' 
                ? toQuery 
                : (toAirport ? formatAirportCompact(toAirport) : toQuery)
            }
            onChangeText={(text) => handleInputChange(text, 'to')}
            onFocus={() => handleInputFocus('to')}
            onBlur={() => handleInputBlur('to')}
            onPressIn={() => handleInputFocus('to')}
            placeholder="Search airports or cities"
            placeholderTextColor="#6c757d"
            autoCapitalize="words"
            autoComplete="off"
            autoCorrect={false}
            accessibilityLabel="To airport"
            accessibilityHint="Search for destination airport or city"
          />
        </View>
      </TouchableOpacity>

      {/* Swap Button */}
      <TouchableOpacity
        style={styles.swapButton}
        onPress={handleSwap}
        accessibilityRole="button"
        accessibilityLabel="Swap airports"
        accessibilityHint="Swap from and to airports"
      >
        <Ionicons name="swap-vertical" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Validation Error */}
      {validationError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#dc3545" />
          <Text style={styles.errorText}>{validationError}</Text>
        </View>
      )}

      {/* Search Results Dropdown */}
      {dropdownVisible && focusedField && (
        <View 
          style={[
            styles.dropdown,
            { top: focusedField === 'from' ? 90 : 182 }
          ]}
          onTouchStart={handleDropdownTouchStart}
          onTouchEnd={handleDropdownTouchEnd}
        >
          {/* Dropdown Header with Close Button */}
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>
              {focusedField === 'from' ? 'Select Departure' : 'Select Destination'}
            </Text>
            <TouchableOpacity 
              style={styles.dropdownCloseButton}
              onPress={closeDropdown}
            >
              <Text style={styles.dropdownCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {isSearching && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#A83442" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}
          
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.resultsList}
            onTouchStart={handleDropdownTouchStart}
            onTouchEnd={handleDropdownTouchEnd}
          >
            {searchResults.length === 0 && !isSearching ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {(fromQuery.length >= 2 || toQuery.length >= 2) 
                    ? 'No airports found' 
                    : 'Start typing to search'}
                </Text>
              </View>
            ) : (
              searchResults.map((item) => (
                <View key={item.iata}>
                  {renderAirportItem({ item })}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  inputCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 80,
  },
  inputCardFocused: {
    borderColor: '#A83442',
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '400', // Changed from '500' to normal
    marginBottom: 4,
  },
  input: {
    fontSize: 18,
    fontWeight: '500', // Changed from '700' to medium
    color: '#000000',
    padding: 0,
    margin: 0,
  },
  swapButton: {
    position: 'absolute',
    right: 20,
    top: 50,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    marginLeft: 8,
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    top: 90, // Will be dynamically set based on focused field
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: 300,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 1000,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6c757d',
  },
  resultsList: {
    maxHeight: 300,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
  },
  sectionHeader: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500', // Changed from '600' to medium
    color: '#6c757d',
    textTransform: 'uppercase',
  },
  airportItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  airportItemPressed: {
    backgroundColor: '#f8f9fa',
  },
  airportItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  airportInfo: {
    flex: 1,
    marginRight: 12,
  },
  airportPrimary: {
    fontSize: 16,
    fontWeight: '500', // Changed from '600' to medium
    color: '#000000',
    marginBottom: 2,
  },
  airportSecondary: {
    fontSize: 14,
    fontWeight: '400', // Added normal weight
    color: '#6c757d',
  },
  airportIata: {
    fontSize: 16,
    fontWeight: '600', // Changed from '700' to semi-bold
    color: '#A83442',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  apiIndicator: {
    marginLeft: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600', // Changed from '700' to semi-bold
    color: '#000000',
  },
  dropdownCloseButton: {
    padding: 8,
  },
  dropdownCloseText: {
    fontSize: 24,
    color: '#6c757d',
  },
});

export default FromToPicker; 