import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export function useLocationTracker() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscriber = null;

    (async () => {
      // Ask for permission first
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      // Start watching
      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // fire every 10 meters of movement
        },
        (newLocation) => {
          setLocation(newLocation.coords); // { latitude, longitude, speed, heading }
        }
      );
    })();

    // Cleanup on unmount
    return () => {
      if (subscriber) subscriber.remove();
    };
  }, []);

  return { location, error };
}