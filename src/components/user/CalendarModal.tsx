import React, { useEffect, useMemo, useState } from "react";
import { providerService } from "../../services/providerService";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, Loader2, X, Calendar as CalendarIcon, Clock } from "lucide-react";
import { IApiProviderAvailability, CalendarModalProps } from "../../util/interface/IBooking";

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, latitude, longitude, serviceId, radius, onSlotSelect }) => {
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
  const toISODateString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchAvailabilityForMonth = async () => {
      if (!isOpen) {
        setLoading(false);
        return;
      }

      setAvailability({});
      setLoading(true);

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const timeMin = new Date(year, month, 1);
      const timeMax = new Date(year, month + 1, 0);

      try {
        const response: IApiProviderAvailability[] = await providerService.getProviderAvailability(
          latitude,
          longitude,
          serviceId || "",
          radius || 10,
          timeMin.toISOString(),
          timeMax.toISOString()
        );

        const mergedSlotsByDate: { [date: string]: Set<string> } = {};

        response.forEach(provider => {
          if (provider && Array.isArray(provider.availableSlots)) {
            provider.availableSlots.forEach(slot => {
              const startDate = new Date(slot.start);
              const dateKey = toISODateString(startDate);

              if (!mergedSlotsByDate[dateKey]) {
                mergedSlotsByDate[dateKey] = new Set();
              }

              mergedSlotsByDate[dateKey].add(formatTimeSlot(startDate));
            });
          }
        });

        const finalAvailabilityForMonth: { [date: string]: string[] } = {};
        Object.entries(mergedSlotsByDate).forEach(([date, slotsSet]) => {
          finalAvailabilityForMonth[date] = Array.from(slotsSet).sort((a, b) =>
            convertTo24Hour(a).localeCompare(convertTo24Hour(b))
          );
        });

        setAvailability(finalAvailabilityForMonth);
      } catch (error) {
        console.error("Error fetching provider availability:", error);
        toast.error("Failed to fetch availability for the selected month.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchAvailabilityForMonth();
    }
  }, [isOpen, currentMonth, latitude, longitude, serviceId, radius]);


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
      days.push(<div key={`blank-${i}`} className="border-r border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = toISODateString(date);
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
      const isPast = date < today;
      const hasSlots = availability[dateKey] && availability[dateKey].length > 0;

      days.push(
        <div key={dateKey} className="border-r border-b border-gray-100 dark:border-gray-700 p-1 sm:p-2 text-center relative h-14 sm:h-16 flex flex-col items-center justify-center">
          <button
            onClick={() => !isPast && setSelectedDate(date)}
            disabled={isPast}
            className={`
              w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
              ${isPast 
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                : isSelected 
                  ? 'bg-blue-600 text-white shadow-md scale-110' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
              ${isToday && !isSelected ? 'border-2 border-blue-500 text-blue-600 dark:text-blue-400' : ''}
            `}
          >
            {day}
          </button>
          {hasSlots && !isSelected && !isPast && (
            <div className="absolute bottom-1.5 sm:bottom-2 w-1.5 h-1.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"></div>
          )}
        </div>
      );
    }
    return days;
  }, [currentMonth, selectedDate, availability]);

  const selectedDateSlots = selectedDate ? availability[toISODateString(selectedDate)] || [] : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95">
        
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Schedule Appointment</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Select a date and time slot</p>
          </div>
          <button 
            type="button" 
            aria-label="close" 
            onClick={onClose} 
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          
          <div className="flex-grow md:w-2/3 p-4 sm:p-6 overflow-y-auto bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <button 
                aria-label="previous month" 
                type="button" 
                onClick={() => changeMonth(-1)} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <button 
                aria-label="next month"
                type="button" 
                onClick={() => changeMonth(1)} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            
            <div className="grid grid-cols-7 border-t border-l border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
              {calendarGrid}
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-blue-500"></div> Today</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Available</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div> Selected</div>
            </div>
          </div>

          <div className="md:w-1/3 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : "Select a Date"}
            </h3>
            
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Checking availability...</p>
                </div>
              ) : selectedDate ? (
                selectedDateSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 content-start">
                    {selectedDateSlots.map(slot => (
                      <button 
                        key={slot} 
                        onClick={() => handleTimeSlotClick(selectedDate, slot)} 
                        className="px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-blue-600 dark:text-blue-300 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 dark:hover:text-white dark:hover:border-blue-600 transition-all text-sm font-medium shadow-sm"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                    <p className="text-gray-400 dark:text-gray-500 mb-2">No slots available</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Please try selecting another date.</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center px-4 opacity-60">
                  <CalendarIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Choose a date from the calendar to view available time slots.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};