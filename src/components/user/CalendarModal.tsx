import { useEffect, useMemo, useState } from "react";
import { IBackendProvider } from "../../util/interface/IProvider";
import { providerService } from "../../services/providerService";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";



interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: IBackendProvider[];
  onSlotSelect: (date: string, time: string) => void; // Function to pass selected slot to parent
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, providers, onSlotSelect }) => {
  const [availability, setAvailability] = useState<{ [date: string]: string[] }>({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const formatTimeSlot = (utcTime: Date): string => utcTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };
  const toISODateString = (date: Date) => date.toISOString().split("T")[0];

  useEffect(() => {
    const fetchAvailabilityForMonth = async () => {
      if (!isOpen || providers.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const timeMin = new Date(year, month, 1);
      const timeMax = new Date(year, month + 1, 0);

      try {
        const providerIds = providers.map((provider) => provider._id);
        const response = await providerService.getProviderAvailability(
          providerIds,
          timeMin.toISOString(),
          timeMax.toISOString()
        );

        const mergedSlotsByDate: { [date: string]: Set<string> } = {};
        Object.values(response).forEach((slots) => {
          if (!slots) return;
          (slots as { start: string; end: string }[]).forEach(({ start, end }) => {
            const startDate = new Date(start);
            const endDate = new Date(end);
            const dateKey = toISODateString(startDate);
            if (!mergedSlotsByDate[dateKey]) {
              mergedSlotsByDate[dateKey] = new Set();
            }
            let current = new Date(startDate);
            while (current < endDate) {
              mergedSlotsByDate[dateKey].add(formatTimeSlot(current));
              current.setHours(current.getHours() + 1);
            }
          });
        });

        const finalAvailabilityForMonth: { [date: string]: string[] } = {};
        Object.entries(mergedSlotsByDate).forEach(([date, slotsSet]) => {
          finalAvailabilityForMonth[date] = Array.from(slotsSet).sort((a, b) =>
            convertTo24Hour(a).localeCompare(convertTo24Hour(b))
          );
        });
        setAvailability(prev => ({ ...prev, ...finalAvailabilityForMonth }));

      } catch (error) {
        console.error("Error fetching provider availability:", error);
        toast.error("Failed to fetch availability for the selected month.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailabilityForMonth();
  }, [isOpen, currentMonth, providers]);

  const handleTimeSlotClick = (date: Date, time: string) => {
    onSlotSelect(toISODateString(date), time);
    onClose();
  };

  const changeMonth = (amount: number) => {
    setSelectedDate(null);
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + amount);
      return newDate;
    });
  };

  const calendarGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`blank-${i}`} className="border-r border-b"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = toISODateString(date);
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
      const isPast = date < today;
      const hasSlots = availability[dateKey] && availability[dateKey].length > 0;

      days.push(
        <div key={dateKey} className="border-r border-b p-2 text-center">
          <button
            onClick={() => !isPast && setSelectedDate(date)}
            disabled={isPast}
            className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-colors ${isPast ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-indigo-100'} ${isToday ? 'border-2 border-indigo-500' : ''} ${isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}`}
          >
            {day}
            {hasSlots && !isSelected && <div className="absolute bottom-1 w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
          </button>
        </div>
      );
    }
    return days;
  }, [currentMonth, selectedDate, availability]);

  const selectedDateSlots = selectedDate ? availability[toISODateString(selectedDate)] || [] : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Select an Available Slot</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex flex-col md:flex-row p-4 gap-4 overflow-y-auto">
          <div className="flex-grow md:w-2/3 border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button>
              <h3 className="font-semibold text-lg">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight /></button>
            </div>
            <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 border-t border-l">{calendarGrid}</div>
          </div>
          <div className="md:w-1/3 border rounded-lg p-4 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : "Select a Date"}
            </h3>
            <div className="flex-grow overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
              ) : selectedDate ? (
                selectedDateSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedDateSlots.map(slot => (
                      <button key={slot} onClick={() => handleTimeSlotClick(selectedDate, slot)} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-600 hover:text-white transition-colors text-sm font-medium">
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 mt-8">No available slots on this day.</p>
                )
              ) : (
                <p className="text-center text-gray-500 mt-8">Select a date from the calendar to see available times.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};