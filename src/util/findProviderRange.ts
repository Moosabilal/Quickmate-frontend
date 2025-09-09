  const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };


export const findProviderRange = ( userLat: number, userLng: number, radius: number, providerLoc: string[]): boolean => {
    return providerLoc.some((loc: string) => {
        const [provLat, provLng] = loc.split(",").map(Number);
        const distance = getDistanceInKm(userLat, userLng, provLat, provLng);
        return distance <= radius;
      });
}
      
