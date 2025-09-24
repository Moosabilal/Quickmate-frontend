import { MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { addressService } from "../../services/addressService";
import { providerService } from "../../services/providerService";
import { IAddress } from "../../util/interface/IAddress";
import { useAppSelector } from "../../hooks/useAppSelector";
import { toast } from "react-toastify";
import { findProviderRange } from "../../util/findProviderRange";

interface AddressPopupProps {
  addressPopup: boolean;
  setAddressPopup: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAddress: IAddress | null;
  handleAddressConfirm: (address: IAddress, radius: number) => void;
  setShowAddAddress: React.Dispatch<React.SetStateAction<boolean>>;
  showAddAddress: boolean;
  newAddress: IAddress;
  setNewAddress: React.Dispatch<React.SetStateAction<any>>;
  handleAddAddress: (address: IAddress) => void;
  providerLoc?: string[];
}


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
  providerLoc,
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



  const handleCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const locationData = await providerService.getState(lat, lng);

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

          if (providerLoc) {
            const withinRange = findProviderRange(lat, lng, radius, providerLoc);

            if (!withinRange) {
              setError("No service provider found to your place, Please select different address.");
              return;
            }
          }

          try {
            const response = await addressService.createAddress(newAddress);
            handleAddressConfirm(response, radius);
          } catch (err) {
            console.error("Failed to save address:", err);
          }

        } catch (err) {
          console.error("Failed to fetch address:", err);
          toast.error("Unable to fetch address for current location");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Unable to fetch your current location");
      }
    );
  };


  const handleAddressConfirmWithCheck = (address: IAddress) => {
    if (!providerLoc || !address.locationCoords) {
      handleAddressConfirm(address, radius);
      setAddressPopup(false);
      return;
    } else {
      const [userLat, userLng] = address.locationCoords!.split(",").map(Number);

      const withinRange = findProviderRange(userLat, userLng, radius, providerLoc)

      if (withinRange) {
        handleAddressConfirm(address, radius);
      } else {
        setError("No service provider found on this location.");
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
    if (providerLoc) {
      const [userLat, userLng] = newAddr.locationCoords!.split(",").map(Number);

      const withinRange = findProviderRange(userLat, userLng, radius, providerLoc)

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
    } catch (error) {
      toast.error('Failed to fetch Address! Please try again later')
    }

  }

  useEffect(() => {
    if (!addressPopup) return; // only fetch when popup opens

    fetchAddress()
  }, [addressPopup])

  if (!addressPopup) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">Select Address</h3>
          <button
            onClick={() => setAddressPopup(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <div>
              {error && <p className="text-red-600 mb-2">{error}</p>}
            </div>
            <div className="flex flex-col gap-4">
              {providerLoc && <div className="flex items-center gap-4">
                <label className="block text-sm font-medium text-gray-700 whitespace-nowrap">
                  Search Radius: {radius} km
                </label>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-16 px-2 py-1 border rounded-md text-center"
                />
              </div>}
              <div className="flex justify-between items-center">
                <label className="block text-base font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Select Address
                </label>

                <button
                  onClick={handleCurrentLocation}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                >
                  {loading ? 'fetching your address...' : '📍 Use Current Location'}
                </button>
              </div>


            </div>




            <div className="space-y-3">
              {mockAddresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 ${selectedAddress?.id === address.id
                    ? 'bg-indigo-50 border-indigo-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  onClick={() => handleAddressConfirmWithCheck(address)}
                >
                  <p className="font-medium text-gray-900">{address.label}</p>
                  <p className="text-sm text-gray-600">
                    {address.street}, {address.city}, {address.state} {address.zip}
                  </p>
                </div>
              ))}
              <button
                onClick={() => setShowAddAddress(true)}
                className="w-full px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
              >
                + Add New Address
              </button>
            </div>
          </div>
          {showAddAddress && (
            <div className="border-t pt-4">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Add New Address</h4>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Address Label (e.g., Home, Work)"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none ${validationErrors.label ? "border-red-500" : "border-gray-300"}`}
                />
                {validationErrors.label && <p className="text-red-500 text-sm">{validationErrors.label}</p>}

                <input
                  type="text"
                  placeholder="Street Address"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none ${validationErrors.street ? "border-red-500" : "border-gray-300"}`}
                />
                {validationErrors.street && <p className="text-red-500 text-sm">{validationErrors.street}</p>}

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col">
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none ${validationErrors.city ? "border-red-500" : "border-gray-300"}`}
                    />
                    {validationErrors.city && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none ${validationErrors.state ? "border-red-500" : "border-gray-300"}`}
                    />
                    {validationErrors.state && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.state}</p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={newAddress.zip}
                      onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none ${validationErrors.zip ? "border-red-500" : "border-gray-300"}`}
                    />
                    {validationErrors.zip && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.zip}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={saveAddressAndFetch}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition duration-200"
                >
                  Save Address
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressPopup