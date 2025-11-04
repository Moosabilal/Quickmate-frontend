
import React from 'react';
import { PlusCircle, X } from 'lucide-react';
import { DaySchedule, TimeSlot } from '../../util/interface/IProvider';

interface WeeklyAvailabilityProps {
    schedule: DaySchedule[];
    setSchedule: React.Dispatch<React.SetStateAction<DaySchedule[]>>;
}

const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
});

export const WeeklyAvailability: React.FC<WeeklyAvailabilityProps> = ({ schedule, setSchedule }) => {

    const handleToggleDay = (day: string) => {
        setSchedule(prev => prev.map(d => {
            if (d.day === day) {
                const newSlots = !d.active && d.slots.length === 0
                    ? [{ start: '09:00', end: '17:00' }]
                    : d.slots;
                return { ...d, active: !d.active, slots: newSlots };
            }
            return d;
        }));
    };

    const handleTimeChange = (day: string, slotIndex: number, type: 'start' | 'end', value: string) => {
        setSchedule(prev => prev.map(d => {
            if (d.day === day) {
                const newSlots = [...d.slots];
                newSlots[slotIndex][type] = value;
                return { ...d, slots: newSlots };
            }
            return d;
        }));
    };

    const addTimeSlot = (day: string) => {
        setSchedule(prev => prev.map(d =>
            d.day === day ? { ...d, slots: [...d.slots, { start: '09:00', end: '17:00' }] } : d
        ));
    };

    const removeTimeSlot = (day: string, slotIndex: number) => {
        setSchedule(prev => prev.map(d =>
            d.day === day ? { ...d, slots: d.slots.filter((_, i) => i !== slotIndex) } : d
        ));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recurring Weekly Schedule</h2>
            <div className="space-y-6">
                {schedule.map((daySchedule, index) => (
                    <div key={index}>
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800">{daySchedule.day}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={daySchedule.active} onChange={() => handleToggleDay(daySchedule.day)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                        {daySchedule.active ? (
                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                                {daySchedule.slots.map((slot, slotIndex) => (
                                    <div key={slotIndex} className="flex items-center gap-2">
                                        <select value={slot.start} onChange={(e) => handleTimeChange(daySchedule.day, slotIndex, 'start', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm">
                                            {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                                        </select>
                                        <span className="text-gray-500">-</span>
                                        <select value={slot.end} onChange={(e) => handleTimeChange(daySchedule.day, slotIndex, 'end', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm">
                                            {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                                        </select>
                                        <button onClick={() => removeTimeSlot(daySchedule.day, slotIndex)} className="text-gray-400 hover:text-red-500"><X size={18} /></button>
                                    </div>
                                ))}
                                <button onClick={() => addTimeSlot(daySchedule.day)} className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-800">
                                    <PlusCircle size={16} /> Add hours
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 mt-2 pl-4">Unavailable</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};