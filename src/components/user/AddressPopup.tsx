import { MapPin, X, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { addressService } from "../../services/addressService";
import { providerService } from "../../services/providerService";
import { AddressPopupProps, IAddress } from "../../util/interface/IAddress";
import { toast } from "react-toastify";
import { bookingService } from "../../services/bookingService";
import { isAxiosError } from "axios";

const AddressPopup: React.FC<AddressPopupProps> = ({
  addressPopup,
  setAddressPopup,
  selectedAddress,
  handleAddressConfirm,
  setShowAddAddress,
  showAddAddress,
  newAddress,
  setNewAddress,
  handleAddAddress,
  serviceId,
}) => {

  const [mockAddresses, setMockAddresses] = useState<IAddress[]>([])
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [radius, setRadius] = useState(10)
  const [loading, setLoading] = useState(false)

  const validateAddress = (address: IAddress) => {
    const errors: { [key: string]: string } = {};

    if (!address.label.trim()) errors.label = "Label is required";
    if (!address.street.trim()) errors.street = "Street is required";
    if (!address.city.trim()) errors.city = "City is required";
    if (!address.state.trim()) errors.state = "State is required";
    if (!address.zip.trim()) {
      errors.zip = "ZIP Code is required";
    } else if (!/^\d{4,6}$/.test(address.zip)) {
      errors.zip = "Invalid ZIP Code";
    }

    return errors;
  };

  const getCoordinates = async (street: string, city: string, state: string, pincode: string) => {
    const data = await addressService.getLocationByPincode(street, city, state, pincode);
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    return null;
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    const handleSuccess = async (position: GeolocationPosition) => {
      try {
        const { accuracy, latitude, longitude } = position.coords;
        console.log(`Location acquired! Accuracy: ${accuracy} meters`);

        let lat = latitude;
        let lng = longitude;
        lat = 12.733242; 
        lng = 74.895929;

        if (serviceId) {
          const withinRange = await bookingService.findProviderRange(serviceId, lat, lng, radius);

          if (!withinRange) {
            setError("No service provider found at your location. Please select a different address.");
            return;
          }
        }

        const locationData = await providerService.getState(lat, lng);
        console.log('Location data:', locationData);

        const newAddress: IAddress = {
          label: "Current Location",
          street:
            locationData?.address?.road ||
            locationData?.address?.neighbourhood ||
            locationData?.address?.county ||
            "",
          city:
            locationData?.address?.village ||
            locationData?.address?.town ||
            locationData?.address?.city ||
            "",
          state: locationData?.address?.state || "",
          zip: locationData?.address?.postcode || "",
          locationCoords: `${lat},${lng}`,
        };

        const response = await addressService.createAddress(newAddress);
        handleAddressConfirm(response, radius);

      } catch (err) {
        console.error("An error occurred while processing location:", err);
        let message = "Failed to process current location. Please try again.";
        if (isAxiosError(err) && err.response?.data?.message) {
          message = err.response.data.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      if (error.code === 3) {
        console.warn("High accuracy GPS timed out. Retrying with network location...");
        toast.info("GPS signal weak, switching to network location...");

        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (retryError) => {
             setLoading(false);
             toast.error("Unable to retrieve location. Please enter address manually.");
             console.error("Retry failed:", retryError);
          },
          {
            enableHighAccuracy: false, 
            timeout: 10000,
            maximumAge: 0
          }
        );
        return; 
      }

      setLoading(false);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          toast.error("Location permission denied. Please enable it in browser settings.");
          break;
        case error.POSITION_UNAVAILABLE:
          toast.error("Location unavailable. Try moving to an open area.");
          break;
        case error.TIMEOUT:
          toast.error("Location request timed out. Please enter address manually.");
          break;
        default:
          toast.error("An unknown location error occurred.");
      }
      console.error("Geolocation error:", error);
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 20000, 
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  };

  const handleAddressConfirmWithCheck = async (address: IAddress) => {
    if (!address.locationCoords) {
      handleAddressConfirm(address, radius);
      setAddressPopup(false);
      setError('')
      return;
    } else {
      const [userLat, userLng] = address.locationCoords!.split(",").map(Number);
      try {
        const withinRange = await bookingService.findProviderRange(serviceId!, userLat, userLng, radius)

        if (withinRange) {
          handleAddressConfirm(address, radius);
          setError('')
        } else {
          setError("No service provider found on this location.");
        }
      } catch (error) {
        setError((error as Error).message || 'An unexpected error occurred.');
      }
    }
  };

  const saveAddressAndFetch = async () => {
    const errors = validateAddress(newAddress);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    const { street, city, state, zip } = newAddress;
    const coords = await getCoordinates(street, city, state, zip);
    if (!coords) {
      toast.info("Unable to find coordinates for this address.");
      return;
    }
    const newAddr = { ...newAddress, locationCoords: `${coords.lat},${coords.lng}`, };
    if (serviceId) {
      const [userLat, userLng] = newAddr.locationCoords!.split(",").map(Number);

      const withinRange = await bookingService.findProviderRange(serviceId, userLat, userLng, radius)

      if (withinRange) {
        setNewAddress(newAddr)
        handleAddAddress(newAddr)
        handleAddressConfirm(newAddr, radius);

      } else {
        setError("No service provider found on this location.");
        toast.info("No service provider found on this location.");
      }
    } else {
      setNewAddress(newAddr)
      handleAddressConfirm(newAddr, radius)
      handleAddAddress(newAddr)
    }
  }

  const fetchAddress = async () => {
    try {
      const res = await addressService.getAddress()
      setMockAddresses(res)
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  }

  useEffect(() => {
    if (!addressPopup) return;
    fetchAddress()
  }, [addressPopup])

  if (!addressPopup) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">

        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-900 p-4 sm:p-5 text-white flex justify-between items-center sticky top-0 z-10">
          <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Select Address
          </h3>
          <button
            type="button"
            aria-label="close"
            onClick={() => {
              setAddressPopup(false)
              setError('')
            }}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          {serviceId && (

            <div>
              <div className="flex flex-col gap-5 mb-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Search Radius: <span className="font-bold text-indigo-600 dark:text-indigo-400">{radius} km</span>
                  </label>
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={25}
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="flex-1 accent-indigo-600 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min={1}
                      max={25}
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-center text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    Saved Addresses
                  </label>
                  <button
                    onClick={handleCurrentLocation}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    {loading ? 'Locating...' : 'Use Current Location'}
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
                {mockAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 group ${selectedAddress?.id === address.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-500'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    onClick={() => handleAddressConfirmWithCheck(address)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 p-1.5 rounded-full ${selectedAddress?.id === address.id
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
                        }`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{address.label}</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                          {address.street}, {address.city}, {address.state} {address.zip}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <span>+</span> Add New Address
                </button>
              </div>
            </div>
          )}


          {showAddAddress && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2">
              <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">New Address Details</h4>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Address Label (e.g., Home, Work)"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 ${validationErrors.label ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                  />
                  {validationErrors.label && <p className="text-red-500 text-xs mt-1 ml-1">{validationErrors.label}</p>}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 ${validationErrors.street ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                  />
                  {validationErrors.street && <p className="text-red-500 text-xs mt-1 ml-1">{validationErrors.street}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col">
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 ${validationErrors.city ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                    />
                    {validationErrors.city && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{validationErrors.city}</p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 ${validationErrors.state ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                    />
                    {validationErrors.state && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{validationErrors.state}</p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={newAddress.zip}
                      onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 ${validationErrors.zip ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                    />
                    {validationErrors.zip && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{validationErrors.zip}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={saveAddressAndFetch}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30 font-medium mt-2"
                >
                  Save & Confirm Address
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressPopup;