import { X, Calendar, Clock } from "lucide-react";


const DateTimePopup = ({dateTimePopup, setDateTimePopup, selectedDate, setSelectedDate, selectedTime, setSelectedTime, timeSlots, handleDateTimeConfirm}) => {
    if (!dateTimePopup) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 text-white flex justify-between items-center">
            <h3 className="text-xl font-bold">Select Date & Time</h3>
            <button
              onClick={() => setDateTimePopup(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition duration-200"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {/* Time Selection */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Select Time
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition duration-200"
              >
                <option value="">Select a time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            {/* Confirm Button */}
            <button
              onClick={() => handleDateTimeConfirm(selectedDate, selectedTime)}
              disabled={!selectedDate || !selectedTime}
              className={`w-full py-3 rounded-xl text-white font-medium transition duration-200 ${
                selectedDate && selectedTime
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default DateTimePopup