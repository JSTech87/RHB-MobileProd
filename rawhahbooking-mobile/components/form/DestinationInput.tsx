import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Typography } from '../../constants/Typography';
import { apiService, DestinationSuggestion } from '../../services/api';

interface DestinationInputProps {
  value: { city: string; country?: string; lat?: number; lng?: number };
  onValueChange: (value: { city: string; country?: string; lat?: number; lng?: number }) => void;
  error?: string;
}

const DestinationInput: React.FC<DestinationInputProps> = ({
  value,
  onValueChange,
  error,
}) => {
  const [query, setQuery] = useState(value.city || '');
  const [suggestions, setSuggestions] = useState<DestinationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (value.city !== query) {
      setQuery(value.city || '');
    }
  }, [value.city]);

  const searchDestinations = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await apiService.searchDestinations(searchQuery);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching destinations:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (text: string) => {
    setQuery(text);
    onValueChange({ city: text });
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchDestinations(text);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSuggestionSelect = (suggestion: DestinationSuggestion) => {
    const destinationText = `${suggestion.city}, ${suggestion.country}`;
    setQuery(destinationText);
    onValueChange({
      city: suggestion.city,
      country: suggestion.country,
      lat: suggestion.lat,
      lng: suggestion.lng,
    });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const renderSuggestion = ({ item }: { item: DestinationSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <Text style={styles.suggestionText}>
        {item.city}, {item.country}
        {item.region && ` • ${item.region}`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleInputChange}
          placeholder="Enter your destination (city, country)"
          placeholderTextColor="#6c757d"
          autoCapitalize="words"
          autoComplete="off"
          autoCorrect={false}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `${item.city}-${item.country}-${index}`}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  inputContainer: {
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
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    maxHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    ...Typography.styles.bodyMedium,
    color: '#000000',
  },
});

export default DestinationInput; 