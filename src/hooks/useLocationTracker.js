import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export function useLocationTracker() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscriber = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation.coords);
        }
      );
    })();

    return () => {
      if (subscriber) subscriber.remove();
    };
  }, []);

  return { location, error };
}