import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useLocationTracker } from '../hooks/useLocationTracker';
import { useDestination } from '../hooks/useDestination';
import useProximityCheck from "../hooks/useProximityCheck";

export default function HomeScreen() {
  const { location, error } = useLocationTracker();
  const { destination, handleLongPress, clearDestination } = useDestination();
  const { isInsideRadius, distanceKm } = useProximityCheck(
    location,
    destination
  );

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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
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

      {/* Distance badge */}
      {distanceKm !== null && (
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>
            {distanceKm.toFixed(2)} km away {isInsideRadius ? '🔔 INSIDE RADIUS' : ''}
          </Text>
        </View>
      )}



      {destination && (
        <TouchableOpacity style={styles.clearButton} onPress={clearDestination}>
          <Text style={styles.clearButtonText}>Clear Destination</Text>
        </TouchableOpacity>
      )}

      {!destination && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>Long press on map to set destination</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 16 },
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
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  distanceText: { color: '#fff', fontSize: 13 },
  debugText: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    fontSize: 10,
    borderRadius: 8,
  },
});