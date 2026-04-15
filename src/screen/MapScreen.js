import MapView, { Marker } from 'react-native-maps';
import { useLocationTracker } from '../src/hooks/useLocationTracker';

export default function MapScreen() {
  const { location, error } = useLocationTracker();

  if (!location) return <Text>Getting location...</Text>;
  return (
    <MapView
      style={{ flex: 1 }}
      region={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,  // zoom level
        longitudeDelta: 0.01,
      }}
      followsUserLocation={true}  // map pans as you move
    >
      <Marker
        coordinate={{ latitude: location.latitude, longitude: location.longitude }}
        title="You are here"
      />
    </MapView>
  );
}