import { MapPin, X } from "lucide-react";
interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

const mockAddresses: Address[] = [
  {
    id: '1',
    label: 'Home',
    street: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
  },
  {
    id: '2',
    label: 'Work',
    street: '456 Oak Ave',
    city: 'Springfield',
    state: 'IL',
    zip: '62702',
  },
];


const AddressPopup = ({addressPopup, setAddressPopup, selectedAddress, handleAddressConfirm, setShowAddAddress, showAddAddress, newAddress, setNewAddress, handleAddAddress}) => {
  
    if (!addressPopup) return null;
    //  useEffect(() => {
    //   const fetchAddress = async()=> {
    //     const res = await addressService.getAddress()
    //     setmockAddresses(res)
    //   }
    //   fetchAddress
    // },[])

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
              <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Select Address
              </label>
              <div className="space-y-3">
                {mockAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedAddress?.id === address.id
                        ? 'bg-indigo-50 border-indigo-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleAddressConfirm(address)}
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