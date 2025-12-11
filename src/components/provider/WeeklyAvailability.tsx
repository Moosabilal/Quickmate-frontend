import React from 'react';
import { PlusCircle, X } from 'lucide-react';
import { DaySchedule } from '../../util/interface/IProvider';

interface WeeklyAvailabilityProps {
    schedule: DaySchedule[];
    setSchedule: React.Dispatch<React.SetStateAction<DaySchedule[]>>;
}

const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const formattedHours = String(i).padStart(2, '0');
    return `${formattedHours}:00`;
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recurring Weekly Schedule</h2>
            <div className="space-y-6">
                {schedule.map((daySchedule, index) => (
                    <div key={index}>
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{daySchedule.day}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={daySchedule.active}
                                    onChange={() => handleToggleDay(daySchedule.day)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer 
                                    peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-900 
                                    peer-checked:after:translate-x-full peer-checked:after:border-white 
                                    after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                                    after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 
                                    after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500 transition-colors"></div>
                            </label>
                        </div>
                        {daySchedule.active ? (
                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700 transition-colors">
                                {daySchedule.slots.map((slot, slotIndex) => (
                                    <div key={slotIndex} className="flex items-center gap-2">
                                        <select
                                            value={slot.start}
                                            onChange={(e) => handleTimeChange(daySchedule.day, slotIndex, 'start', e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-colors"
                                        >
                                            {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                                        </select>
                                        <span className="text-gray-500 dark:text-gray-400">-</span>
                                        <select
                                            value={slot.end}
                                            onChange={(e) => handleTimeChange(daySchedule.day, slotIndex, 'end', e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-colors"
                                        >
                                            {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => removeTimeSlot(daySchedule.day, slotIndex)}
                                            aria-label='remove timeSlot'
                                            className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addTimeSlot(daySchedule.day)}
                                    className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                >
                                    <PlusCircle size={16} /> Add hours
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 pl-4">Unavailable</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};