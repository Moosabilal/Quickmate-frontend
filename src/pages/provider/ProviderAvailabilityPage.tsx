// src/pages/provider/ProviderAvailabilityPage.tsx

import React, { useState, useEffect } from 'react'; // Added useEffect
import { WeeklyAvailability } from '../../components/provider/WeeklyAvailability';
import { DateOverrides } from '../../components/provider/DateOverrides';
import { DaySchedule, DateOverride, LeavePeriod } from '../../util/interface/IProvider'; // Added LeavePeriod
// import { providerService } from '../../services/providerService'; // Uncomment for real API calls

// --- Mock Data (replace with API call) ---
const initialWeeklySchedule: DaySchedule[] = [
    { day: 'Sunday', active: false, slots: [] },
    { day: 'Monday', active: true, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 'Tuesday', active: true, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 'Wednesday', active: true, slots: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
    { day: 'Thursday', active: true, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 'Friday', active: true, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 'Saturday', active: false, slots: [] },
];

const initialDateOverrides: DateOverride[] = [
    { date: '2025-12-25', isUnavailable: true, busySlots: [] },
    { date: '2025-11-15', isUnavailable: false, busySlots: [{ start: '10:00', end: '11:00' }] },
];

// --- Add Mock Data for Leave ---
const initialLeavePeriods: LeavePeriod[] = [
    { from: '2025-12-20', to: '2026-01-05', reason: 'Holiday Break' },
];

const ProviderAvailabilityPage: React.FC = () => {
    const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(initialWeeklySchedule);
    const [dateOverrides, setDateOverrides] = useState<DateOverride[]>(initialDateOverrides);
    const [leavePeriods, setLeavePeriods] = useState<LeavePeriod[]>(initialLeavePeriods);
    const [isSaving, setIsSaving] = useState(false);

    // --- Example useEffect to fetch all availability data ---
    // useEffect(() => {
    //   providerService.getAvailability().then(data => {
    //     setWeeklySchedule(data.weeklySchedule || initialWeeklySchedule);
    //     setDateOverrides(data.dateOverrides || initialDateOverrides);
    //     setLeavePeriods(data.leavePeriods || initialLeavePeriods);
    //   });
    // }, []);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        console.log("Saving data:", { weeklySchedule, dateOverrides, leavePeriods });
        // --- API Call ---
        // await providerService.updateAvailability({ weeklySchedule, dateOverrides, leavePeriods });
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Manage Availability</h1>
                    <p className="text-base text-gray-500 mt-2">
                        Set your weekly schedule, mark holidays, and block specific days or times for breaks.
                    </p>
                </div>

                {/* --- Main Grid Layout --- */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Column: Weekly Schedule */}
                    <div className="lg:col-span-3">
                        <WeeklyAvailability
                            schedule={weeklySchedule}
                            setSchedule={setWeeklySchedule}
                        />
                    </div>

                    {/* Right Column: Date Overrides and Leave Periods */}
                    <div className="lg:col-span-2">
                        <DateOverrides
                            overrides={dateOverrides}
                            setOverrides={setDateOverrides}
                            leavePeriods={leavePeriods} // <-- Pass leave periods down
                            setLeavePeriods={setLeavePeriods}
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProviderAvailabilityPage;
