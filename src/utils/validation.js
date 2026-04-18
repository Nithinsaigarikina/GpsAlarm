export function isValidCoordinate(coord) {
    if (!coord) return false;
    const { latitude, longitude } = coord;
    return (
        typeof latitude === "number" &&
        typeof longitude === "number" &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}