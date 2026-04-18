import { useEffect, useState } from "react";
import { getDistanceKm } from "../utils/haversine";
import { isValidCoordinate } from "../utils/validation";

export default function useProximityCheck(location, destination) {
  const [isInsideRadius, setIsInsideRadius] = useState(false);
  const [distanceKm, setDistanceKm] = useState(null);

  useEffect(() => {
    if (!isValidCoordinate(location) || !isValidCoordinate(destination)) {
      setDistanceKm(null);
      setIsInsideRadius(false);
      return;
    }

    const distance = getDistanceKm(
      location.latitude,
      location.longitude,
      destination.latitude,
      destination.longitude
    );

    setDistanceKm(distance);
    setIsInsideRadius(distance <= 5);
  }, [location, destination]);

  return { isInsideRadius, distanceKm };
}