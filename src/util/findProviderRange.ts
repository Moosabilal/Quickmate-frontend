// Helper function to calculate distance between two lat/lng points in km
export const getDistanceInKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

// Updated findProviderRange to return boolean + nearest distance (optional)
export const findProviderRange = (
  userLat: number,
  userLng: number,
  radius: number,
  providerLoc: string[]
): boolean => {
  return providerLoc.some((loc: string) => {
    const [provLat, provLng] = loc.split(",").map(Number);
    const distance = getDistanceInKm(userLat, userLng, provLat, provLng);

    console.log(`Distance to provider ${provLat},${provLng}: ${distance.toFixed(2)} km`);

    return distance <= radius;
  });
};
