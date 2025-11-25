import React, { useState, MouseEvent } from 'react';
import { DayPicker, DateRange, Modifiers } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, addDays } from 'date-fns';
import { DateOverride, TimeSlot, LeavePeriod, EditDateModalProps } from '../../util/interface/IProvider';
import { toast } from 'react-toastify';
import { X, PlusCircle, Trash2, CalendarX2 } from 'lucide-react';

const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
});

interface DateOverridesProps {
    overrides: DateOverride[];
    setOverrides: React.Dispatch<React.SetStateAction<DateOverride[]>>;
    leavePeriods: LeavePeriod[];
    setLeavePeriods: React.Dispatch<React.SetStateAction<LeavePeriod[]>>;
}

export const DateOverrides: React.FC<DateOverridesProps> = ({
    overrides,
    setOverrides,
    leavePeriods,
    setLeavePeriods
}) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
    const [leaveReason, setLeaveReason] = useState(''); 

    const handleDayClickSingle = (day: Date) => {
        if (selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) {
            setSelectedDate(null);
        } else {
            setSelectedDate(day);
            setSelectedRange(undefined);
        }
    };
    
    const handleCalendarClick = (e: MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const button = target.closest('button.rdp-day_disabled');
        if (button) {
            toast.info("You cannot select a past date or a date within a leave period.");
        }
    };


    const handleSaveOverride = (date: Date, isUnavailable: boolean, busySlots: TimeSlot[], reason: string) => {
        const dateString = format(date, 'yyyy-MM-dd');
        const existingIndex = overrides.findIndex(o => o.date === dateString);

        const validSlots = busySlots.filter(slot => slot.start && slot.end);
        const newOverride: DateOverride = { date: dateString, isUnavailable, busySlots: validSlots, reason };

        let newOverrides = [...overrides];
        if (existingIndex > -1) newOverrides[existingIndex] = newOverride;
        else newOverrides.push(newOverride);

        newOverrides = newOverrides.filter(o => o.isUnavailable || o.busySlots.length > 0 || o.reason);
        setOverrides(newOverrides);
        setSelectedDate(null);
    };

    const handleSelectRange = (range: DateRange | undefined) => {
        setSelectedRange(range);
        setSelectedDate(null);
    };

    const handleAddLeavePeriod = () => {
        if (selectedRange?.from && selectedRange?.to) {
            const newPeriod: LeavePeriod = {
                from: format(selectedRange.from, 'yyyy-MM-dd'),
                to: format(selectedRange.to, 'yyyy-MM-dd'),
                reason: leaveReason || 'Leave'
            };
            setLeavePeriods([...leavePeriods, newPeriod]);
            setSelectedRange(undefined);
            setLeaveReason('');
        }
    };

    const handleRemoveLeavePeriod = (indexToRemove: number) => {
        setLeavePeriods(leavePeriods.filter((_, i) => i !== indexToRemove));
    };

    const overrideDates = overrides.map(o => new Date(o.date.replace(/-/g, '/')));

    const disabledDays = leavePeriods.flatMap(period => {
        const days = [];
        let current = new Date(period.from.replace(/-/g, '/'));
        const end = new Date(period.to.replace(/-/g, '/'));
        while (current <= end) {
            days.push(new Date(current));
            current = addDays(current, 1);
        }
        return days;
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-200">
            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Single Day Adjustments</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Select a date to set specific busy times or mark the entire day as unavailable.
                </p>

                <div onClickCapture={handleCalendarClick}>
                    <DayPicker
                        mode="single"
                        selected={selectedDate || undefined}
                        onDayClick={handleDayClickSingle}
                        modifiers={{ overridden: overrideDates, leave: disabledDays }}
                        modifiersClassNames={{ overridden: 'day-overridden', leave: 'day-leave' }}
                        disabled={[{ before: new Date() }, ...disabledDays]}
                        className="w-full"
                        styles={{ day: { transition: 'all 0.2s ease' } }}
                    />
                </div>

                <style>{`
                    .day-overridden { font-weight: bold; color: #4f46e5; background-color: #e0e7ff; }
                    .day-leave { color: #f87171 !important; background-color: #fee2e2 !important; text-decoration: line-through; }
                `}</style>
            </div>

            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Add Leave / Vacation</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Select a start and end date on the calendar below to block off an extended period.
                </p>

                <div onClickCapture={handleCalendarClick}>
                    <DayPicker
                        mode="range"
                        selected={selectedRange}
                        onSelect={handleSelectRange}
                        modifiers={{ leave: disabledDays }}
                        modifiersClassNames={{ leave: 'day-leave' }}
                        disabled={[{ before: new Date() }, ...disabledDays]}
                        className="w-full"
                        styles={{ day: { transition: 'all 0.2s ease' } }}
                        footer={
                            selectedRange?.from && (
                                <div className="mt-4 pt-4 border-t space-y-4">
                                    <p className="text-sm text-gray-600 text-center">
                                        Selected Period: <strong>{format(selectedRange.from, 'PP')}</strong>
                                        {selectedRange.to && ` - ${format(selectedRange.to, 'PP')}`}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={leaveReason}
                                            onChange={(e) => setLeaveReason(e.target.value)}
                                            placeholder="Reason for leave (e.g., Vacation)"
                                            className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
                                        />
                                        <button
                                            onClick={handleAddLeavePeriod}
                                            disabled={!selectedRange.to}
                                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    />
                </div>

                {leavePeriods.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="text-md font-semibold text-gray-800 mb-3">Current Leave Periods</h3>
                        <ul className="space-y-2">
                            {leavePeriods.map((period, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between bg-red-50 p-3 rounded-md border border-red-200"
                                >
                                    <span className="text-sm text-red-800 font-medium">
                                        <CalendarX2 className="inline w-4 h-4 mr-2 text-red-600" />
                                        {format(new Date(period.from.replace(/-/g, '/')), 'MMM d, yyyy')} -{' '}
                                        {format(new Date(period.to.replace(/-/g, '/')), 'MMM d, yyyy')}
                                        {period.reason && (
                                            <span className="italic text-red-600 ml-1">
                                                ({period.reason})
                                            </span>
                                        )}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveLeavePeriod(index)}
                                        className="p-1 text-red-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {selectedDate && (
                <EditDateModal
                    date={selectedDate}
                    onClose={() => setSelectedDate(null)}
                    onSave={handleSaveOverride}
                    initialOverride={overrides.find(o => o.date === format(selectedDate, 'yyyy-MM-dd'))}
                />
            )}
        </div>
    );
};

const EditDateModal: React.FC<EditDateModalProps> = ({ date, onClose, onSave, initialOverride }) => {
    const [isUnavailable, setIsUnavailable] = useState(initialOverride?.isUnavailable || false);
    const [busySlots, setBusySlots] = useState<TimeSlot[]>(initialOverride?.busySlots || []);
    const [reason, setReason] = useState(initialOverride?.reason || '');

    const handleUnavailableToggle = (checked: boolean) => {
        setIsUnavailable(checked);
        if (checked) {
            // When toggled ON (unavailable), clear specific busy slots.
            setBusySlots([]);
        }
    };

    const handleAddSlot = () => setBusySlots([...busySlots, { start: '09:00', end: '10:00' }]);
    const handleRemoveSlot = (index: number) => setBusySlots(busySlots.filter((_, i) => i !== index));
    const handleSlotTimeChange = (index: number, type: 'start' | 'end', value: string) => {
        const updated = [...busySlots];
        updated[index][type] = value;
        setBusySlots(updated);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fadeInUp">
                <div className="flex items-center justify-between pb-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Edit Availability for {format(date, 'MMMM d, yyyy')}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6 py-6">
                    <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                        <label htmlFor="unavailable-toggle" className="font-medium text-gray-700 select-none">
                            Unavailable all day
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="unavailable-toggle"
                                checked={isUnavailable}
                                onChange={e => handleUnavailableToggle(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div>
                        <label htmlFor="reason-input" className="text-sm font-medium text-gray-700">Reason / Note (optional)</label>
                        <input
                            id="reason-input"
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Personal work, event, etc."
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
                        />
                    </div>

                    {!isUnavailable && (
                        <div>
                            <h4 className="font-medium text-gray-700 mb-3">Add busy time slots</h4>
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                {busySlots.map((slot, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <select
                                            value={slot.start}
                                            onChange={e => handleSlotTimeChange(index, 'start', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-1 focus:ring-indigo-500"
                                        >
                                            {timeOptions.map(time => (
                                                <option key={`start-${time}`} value={time}>{time}</option>
                                            ))}
                                        </select>
                                        <span className="text-gray-500">-</span>
                                        <select
                                            value={slot.end}
                                            onChange={e => handleSlotTimeChange(index, 'end', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-1 focus:ring-indigo-500"
                                        >
                                            {timeOptions.map(time => (
                                                <option key={`end-${time}`} value={time}>{time}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleRemoveSlot(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleAddSlot}
                                className="flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:text-indigo-800 mt-4"
                            >
                                <PlusCircle size={16} /> Add busy slot
                            </button>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(date, isUnavailable, busySlots, reason)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
