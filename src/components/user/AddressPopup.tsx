import { MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { addressService } from "../../services/addressService";
import { providerService } from "../../services/providerService";
import { IAddress } from "../../interface/IAddress";
import { useAppSelector } from "../../hooks/useAppSelector";
import { toast } from "react-toastify";

interface AddressPopupProps {
  addressPopup: boolean;
  setAddressPopup: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAddress: IAddress | null;
  handleAddressConfirm: (address: any) => void;
  setShowAddAddress: React.Dispatch<React.SetStateAction<boolean>>;
  showAddAddress: boolean;
  newAddress: IAddress;
  setNewAddress: React.Dispatch<React.SetStateAction<any>>;
  handleAddAddress: () => void;
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


  const handleCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

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
            const withinRange = providerLoc.some((loc: string) => {
              const [provLat, provLng] = loc.split(",").map(Number);
              const distance = getDistanceInKm(lat, lng, provLat, provLng);
              return distance <= 5; // 5 km radius
            });

            if (!withinRange) {
              setError("No service provider found to your place, Please select different address.");
              return;
            }
          }

          try {
            const response = await addressService.createAddress(newAddress);
            handleAddressConfirm(response);
          } catch (err) {
            console.error("Failed to save address:", err);
          }

        } catch (err) {
          console.error("Failed to fetch address:", err);
          alert("Unable to fetch address for current location");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to fetch your current location");
      }
    );
  };

  const handleAddressConfirmWithCheck = (address: IAddress) => {
    if (!providerLoc || !address.locationCoords) {
      handleAddressConfirm(address);
      setAddressPopup(false);       
      return;
    } else {
      const [userLat, userLng] = address.locationCoords!.split(",").map(Number);

      const withinRange = providerLoc.some((loc: string) => {
        const [provLat, provLng] = loc.split(",").map(Number);
        const distance = getDistanceInKm(userLat, userLng, provLat, provLng);
        console.log('the distance', distance)
         console.log(`Distance to provider at ${provLat},${provLng} = ${distance.toFixed(2)} km`);
        return distance <= 5; 
      });

      if (withinRange) {
        handleAddressConfirm(address); 
        setAddressPopup(false);      
      } else {
        setError("No service provider found in your area."); 
      }
    }

  };



  useEffect(() => {
    const fetchAddress = async () => {
      const res = await addressService.getAddress()
      setMockAddresses(res)
    }
    fetchAddress()
  }, [])

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
            <div className="flex justify-between items-center">
              <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Select Address
              </label>



              <button
                onClick={handleCurrentLocation}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
              >
                📍 Use Current Location
              </button>

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={newAddress.zip}
                    onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleAddAddress}
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