import { COLORS } from "@/app/constants";
import { Coordinate } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddressSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressSearchInputProps {
  onAddressSelect: (coordinate: Coordinate) => void;
  placeholder?: string;
  currentLocation?: Coordinate | null;
}

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const AddressSearchInput = memo<AddressSearchInputProps>(
  ({
    onAddressSelect,
    placeholder = "Search for an address...",
    currentLocation,
  }) => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const searchAddresses = useCallback(
      async (searchQuery: string) => {
        if (!searchQuery.trim() || !GOOGLE_PLACES_API_KEY) {
          setSuggestions([]);
          setIsLoading(false);
          return;
        }

        try {
          // Use session token for billing optimization
          const sessionToken = Date.now().toString();

          // Bias results towards current location if available
          const locationBias = currentLocation
            ? `&location=${currentLocation.latitude},${currentLocation.longitude}&radius=50000`
            : "";

          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
              searchQuery
            )}&key=${GOOGLE_PLACES_API_KEY}&sessiontoken=${sessionToken}&types=address${locationBias}`
          );

          const data = await response.json();

          if (data.status === "OK" && data.predictions) {
            setSuggestions(data.predictions);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error("Address search error:", error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      },
      [currentLocation]
    );

    // Handle text input changes with debouncing
    const handleTextChange = useCallback(
      (text: string) => {
        setQuery(text);
        setIsLoading(true);
        setShowSuggestions(true);

        // Clear previous timer
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        // Set new timer
        debounceTimer.current = setTimeout(() => {
          searchAddresses(text);
        }, 300);
      },
      [searchAddresses]
    );

    // Get place details and coordinates
    const getPlaceDetails = useCallback(
      async (placeId: string): Promise<Coordinate | null> => {
        if (!GOOGLE_PLACES_API_KEY) return null;

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_PLACES_API_KEY}`
          );

          const data = await response.json();

          if (data.status === "OK" && data.result?.geometry?.location) {
            return {
              latitude: data.result.geometry.location.lat,
              longitude: data.result.geometry.location.lng,
            };
          }
        } catch (error) {
          console.error("Place details error:", error);
        }

        return null;
      },
      []
    );

    // Handle suggestion selection
    const handleSuggestionPress = useCallback(
      async (suggestion: AddressSuggestion) => {
        setIsSearching(true);
        setQuery(suggestion.description);
        setShowSuggestions(false);
        setSuggestions([]);

        try {
          const coordinate = await getPlaceDetails(suggestion.place_id);
          if (coordinate) {
            onAddressSelect(coordinate);
          }
        } catch (error) {
          console.error("Error selecting address:", error);
        } finally {
          setIsSearching(false);
        }
      },
      [getPlaceDetails, onAddressSelect]
    );

    // Clear search
    const handleClear = useCallback(() => {
      setQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }, []);

    // Close suggestions when clicking outside
    const handleInputBlur = useCallback(() => {
      // Delay hiding suggestions to allow for suggestion press
      setTimeout(() => {
        setShowSuggestions(false);
      }, 150);
    }, []);

    // Show suggestions when focusing input
    const handleInputFocus = useCallback(() => {
      if (suggestions.length > 0) {
        setShowSuggestions(true);
      }
    }, [suggestions.length]);

    // Cleanup timer on unmount
    useEffect(() => {
      return () => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
      };
    }, []);

    // Render suggestion item
    const renderSuggestion = useCallback(
      ({ item }: { item: AddressSuggestion }) => (
        <TouchableOpacity
          style={styles.suggestionItem}
          onPress={() => handleSuggestionPress(item)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={COLORS.MEDIUM_RISK}
          />
          <View style={styles.suggestionTextContainer}>
            <Text style={styles.suggestionTextContainer}>
              {item.structured_formatting.main_text}
            </Text>
            <Text style={styles.suggestionSecondaryText} numberOfLines={1}>
              {item.structured_formatting.secondary_text}
            </Text>
          </View>
        </TouchableOpacity>
      ),
      [handleSuggestionPress]
    );

    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.MEDIUM_RISK}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder={placeholder}
            placeholderTextColor={COLORS.MEDIUM_RISK}
            value={query}
            onChangeText={handleTextChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            autoCorrect={false}
            autoCapitalize="words"
          />
          {(isLoading || isSearching) && (
            <ActivityIndicator
              size="small"
              color={COLORS.LOW_RISK}
              style={styles.loadingIcon}
            />
          )}
          {query.length > 0 && !isLoading && !isSearching && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.MEDIUM_RISK}
              />
            </TouchableOpacity>
          )}
        </View>

        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.place_id}
              style={styles.suggestionsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </View>
    );
  }
);

AddressSearchInput.displayName = "AddressSearchInput";

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.BLACK,
    fontWeight: "400",
  },
  loadingIcon: {
    marginLeft: 10,
  },
  clearButton: {
    marginLeft: 10,
    padding: 2,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 12,
    marginTop: 5,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  suggestionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionMainText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.BLACK,
    marginBottom: 2,
  },
  suggestionSecondaryText: {
    fontSize: 14,
    color: COLORS.MEDIUM_RISK,
  },
});

export default AddressSearchInput;
