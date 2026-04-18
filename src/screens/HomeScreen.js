import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import LeafletMap from '../components/LeafletMap';
import * as Location from 'expo-location';
import { useLocationTracker } from '../hooks/useLocationTracker';
import { useDestination } from '../hooks/useDestination';
import useProximityCheck from "../hooks/useProximityCheck";
import useAlarm from '../hooks/useAlarm';

export default function HomeScreen() {
  const { location, error } = useLocationTracker();
  const { destination, handleLongPress, clearDestination, handleSetDestination } = useDestination();
  const { isInsideRadius, distanceKm } = useProximityCheck(location, destination);
  const { isAlarmActive, dismissAlarm } = useAlarm(isInsideRadius);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    Keyboard.dismiss();
    
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        handleSetDestination(latitude, longitude);
        setSearchQuery('');
      } else {
        setSearchError('Location not found.');
      }
    } catch (err) {
      setSearchError('Search failed. Check your connection.');
    } finally {
      setIsSearching(false);
    }
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <Text>Getting your location...</Text>
      </View>
    );
  }

  // Set mapType to 'standard'. 
  // If set to 'none' on Android, it completely disables the native tile rendering 
  // engine, which accidentally stops our custom OpenStreetMap UrlTile from drawing!
  const mapType = 'standard';

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapType={mapType}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        followsUserLocation={true}
        showsUserLocation={true}
        onLongPress={handleLongPress}
      >
        {/* OpenStreetMap Tile Layer - high zIndex to cover the base map */}
        <UrlTile 
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          zIndex={1}
        />
        {destination && (
          <>
            <Marker
              coordinate={destination}
              title="Destination"
              pinColor="blue"
            />
            <Circle
              center={destination}
              radius={5000}
              strokeColor="rgba(0, 112, 255, 0.8)"
              fillColor="rgba(0, 112, 255, 0.15)"
              strokeWidth={2}
            />
          </>
        )}
      </MapView>

      {/* Search Bar Overlay */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.searchContainer}
      >
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search address or city..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setSearchError(null);
            }}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Go</Text>
            )}
          </TouchableOpacity>
        </View>
        {searchError ? <Text style={styles.searchErrorText}>{searchError}</Text> : null}
      </KeyboardAvoidingView>

      {/* Distance badge */}
      {distanceKm !== null && (
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>
            {distanceKm.toFixed(2)} km away {isInsideRadius ? '🔔 INSIDE RADIUS' : ''}
          </Text>
        </View>
      )}

      {destination && !isAlarmActive && (
        <TouchableOpacity style={styles.clearButton} onPress={clearDestination}>
          <Text style={styles.clearButtonText}>Clear Destination</Text>
        </TouchableOpacity>
      )}

      {!destination && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>Long press on map to set destination</Text>
        </View>
      )}

      {/* Alarm overlay */}
      {isAlarmActive && (
        <View style={styles.alarmOverlay}>
          <Text style={styles.alarmText}>🔔 You're near your destination!</Text>
          <TouchableOpacity style={styles.dismissButton} onPress={dismissAlarm}>
            <Text style={styles.dismissButtonText}>Dismiss Alarm</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // map: { flex: 1 }, // removed to avoid confusion
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 16 },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    right: 20,
    zIndex: 10,
    elevation: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchErrorText: {
    color: 'red',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    textAlign: 'center',
    fontWeight: '600',
  },
  clearButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#ff3b30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  clearButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  hint: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hintText: { color: '#fff', fontSize: 14 },
  distanceBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 110,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  distanceText: { color: '#fff', fontSize: 13 },
  alarmOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    zIndex: 9999,
    elevation: 9999,
  },
  alarmText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  dismissButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 32,
  },
  dismissButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});