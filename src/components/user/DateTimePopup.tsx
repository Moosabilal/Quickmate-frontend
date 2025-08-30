import React, { useState } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { toast } from "react-toastify";

const convert12ToMinutes = (time12: string) => {
  if (!time12) return null;
  const [time, modifier] = time12.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const convert24ToMinutes = (time24: string) => {
  const [hours, minutes] = time24.split(":").map(Number);
  return hours * 60 + minutes;
};

interface DateTimePopupProps {
  dateTimePopup: boolean;
  setDateTimePopup: (value: boolean) => void;
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  selectedTime: string;
  setSelectedTime: (value: string) => void;
  timeSlots?: string[];
  handleDateTimeConfirm: (date: string, time: string) => void;
  providersTimings?: { day: string; startTime: string; endTime: string }[];
}

const DateTimePopup: React.FC<DateTimePopupProps> = ({
  dateTimePopup,
  setDateTimePopup,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  timeSlots,
  handleDateTimeConfirm,
  providersTimings,
}) => {
  if (!dateTimePopup) return null;

  console.log('the provider timings', providersTimings)

  const [info, setInfo] = useState<string | null>(null);

  const handleConfirm = () => {
    const selectedDay = new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long" });
    const providerDay = providersTimings?.find((p) => p.day === selectedDay);

    if (!providerDay) {
      setInfo("No provider available on this day");
      return;
    }

    const selectedMinutes = convert12ToMinutes(selectedTime);
    if (selectedMinutes === null) {
    setInfo("Please select a valid time");
    return;
  }
    const startMinutes = convert24ToMinutes(providerDay.startTime);
    const endMinutes = convert24ToMinutes(providerDay.endTime);

    if (selectedMinutes < startMinutes || selectedMinutes > endMinutes) {
      setInfo("No provider found at this time");
      return;
    }
    handleDateTimeConfirm(selectedDate, selectedTime);
  };

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
          {info && <div className="bg-red-100 text-red-700 p-3 rounded-md">{info}</div>}
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
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
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
              {timeSlots && timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className={`w-full py-3 rounded-xl text-white font-medium transition duration-200 ${
              selectedDate && selectedTime
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimePopup;
