import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Typography } from '../../constants/Typography';
import { searchCities, getRecentCities, getTopCities, saveRecentCity, CityOption } from '../../services/citySearch';

interface DestinationSelectorProps {
  value: { city: string; country?: string; lat?: number; lng?: number };
  onValueChange: (city: { city: string; country?: string; lat?: number; lng?: number }) => void;
  error?: string;
}

const DestinationSelector: React.FC<DestinationSelectorProps> = ({ value, onValueChange, error }) => {
  const [query, setQuery] = useState(value?.city || '');
  const [results, setResults] = useState<CityOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load default suggestions (recent + top) on mount
  useEffect(() => {
    loadDefaultSuggestions();
  }, []);

  const loadDefaultSuggestions = async () => {
    const recent = await getRecentCities();
    const top = getTopCities();
    setResults([...recent, ...top]);
  };

  const handleInputChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.length === 0) {
      loadDefaultSuggestions();
      setShowDropdown(true);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      const merged = await searchCities(text);
      setResults(merged);
      setIsLoading(false);
      setShowDropdown(true);
    }, 300);
  };

  const handleSelect = (city: CityOption) => {
    setQuery(`${city.city}, ${city.country}`);
    onValueChange({ city: city.city, country: city.country, lat: city.lat, lng: city.lon });
    saveRecentCity(city);
    setShowDropdown(false);
  };

  const renderItem = ({ item }: { item: CityOption }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
      <Text style={styles.itemText}>{item.city}{item.region ? `, ${item.region}` : ''} — {item.country}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholder="Enter city or destination"
          placeholderTextColor="#6c757d"
          value={query}
          onChangeText={handleInputChange}
          onFocus={() => {
            if (query.length === 0) loadDefaultSuggestions();
            setShowDropdown(true);
          }}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {showDropdown && (
        <View style={styles.dropdown}>
          {isLoading ? (
            <ActivityIndicator style={{ padding: 20 }} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  inputWrapper: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  input: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
    padding: 0,
    margin: 0,
  },
  errorText: {
    ...Typography.styles.caption,
    color: '#dc3545',
    marginTop: 4,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    maxHeight: 250,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    zIndex: 1000,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemText: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
});

export default DestinationSelector; 