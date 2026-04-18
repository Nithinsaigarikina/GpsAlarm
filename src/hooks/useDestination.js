import { useState } from 'react';

export function useDestination() {
  const [destination, setDestination] = useState(null);

  const handleLongPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setDestination({ latitude, longitude });
  };

  const handleSetDestination = (latitude, longitude) => {
    setDestination({ latitude, longitude });
  };

  const clearDestination = () => {
    setDestination(null);
  };

  return { destination, handleLongPress, clearDestination, handleSetDestination };
}