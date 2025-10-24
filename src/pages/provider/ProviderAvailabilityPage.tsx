// import React, { useState, useEffect } from 'react'; 
// import { WeeklyAvailability } from '../../components/provider/WeeklyAvailability';
// import { DateOverrides } from '../../components/provider/DateOverrides';
// import { DaySchedule, DateOverride, LeavePeriod } from '../../util/interface/IProvider'; 
// // import { providerService } from '../../services/providerService';

// const initialWeeklySchedule: DaySchedule[] = [
//     { day: 'Sunday', active: false, slots: [] },
//     { day: 'Monday', active: true, slots: [{ start: '09:00', end: '17:00' }] },
//     { day: 'Tuesday', active: true, slots: [{ start: '09:00', end: '17:00' }] },
//     { day: 'Wednesday', active: true, slots: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
//     { day: 'Thursday', active: true, slots: [{ start: '09:00', end: '17:00' }] },
//     { day: 'Friday', active: true, slots: [{ start: '09:00', end: '17:00' }] },
//     { day: 'Saturday', active: false, slots: [] },
// ];

// const initialDateOverrides: DateOverride[] = [
//     { date: '2025-12-25', isUnavailable: true, busySlots: [] },
//     { date: '2025-11-15', isUnavailable: false, busySlots: [{ start: '10:00', end: '11:00' }] },
// ];

// const initialLeavePeriods: LeavePeriod[] = [
//     { from: '2025-12-20', to: '2026-01-05', reason: 'Holiday Break' },
// ];

// const ProviderAvailabilityPage: React.FC = () => {
//     const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(initialWeeklySchedule);
//     const [dateOverrides, setDateOverrides] = useState<DateOverride[]>(initialDateOverrides);
//     const [leavePeriods, setLeavePeriods] = useState<LeavePeriod[]>(initialLeavePeriods);
//     const [isSaving, setIsSaving] = useState(false);

//     // --- Example useEffect to fetch all availability data ---
//     // useEffect(() => {
//     //   providerService.getAvailability().then(data => {
//     //     setWeeklySchedule(data.weeklySchedule || initialWeeklySchedule);
//     //     setDateOverrides(data.dateOverrides || initialDateOverrides);
//     //     setLeavePeriods(data.leavePeriods || initialLeavePeriods);
//     //   });
//     // }, []);

//     const handleSaveChanges = async () => {
//         setIsSaving(true);
//         console.log("Saving data:", { weeklySchedule, dateOverrides, leavePeriods });
//         // --- API Call ---
//         // await providerService.updateAvailability({ weeklySchedule, dateOverrides, leavePeriods });
//         setTimeout(() => setIsSaving(false), 1500);
//     };

//     return (
//         <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
//             <div className="max-w-7xl mx-auto">
//                 <div className="mb-8">
//                     <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Manage Availability</h1>
//                     <p className="text-base text-gray-500 mt-2">
//                         Set your weekly schedule, mark holidays, and block specific days or times for breaks.
//                     </p>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
//                     <div className="lg:col-span-3">
//                         <WeeklyAvailability
//                             schedule={weeklySchedule}
//                             setSchedule={setWeeklySchedule}
//                         />
//                     </div>

//                     <div className="lg:col-span-2">
//                         <DateOverrides
//                             overrides={dateOverrides}
//                             setOverrides={setDateOverrides}
//                             leavePeriods={leavePeriods}
//                             setLeavePeriods={setLeavePeriods}
//                         />
//                     </div>
//                 </div>

//                 <div className="mt-8 flex justify-end">
//                     <button
//                         onClick={handleSaveChanges}
//                         disabled={isSaving}
//                         className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         {isSaving ? 'Saving...' : 'Save Changes'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ProviderAvailabilityPage;









// src/pages/provider/ProviderAvailabilityPage.tsx

import React, { useState, useEffect } from 'react';
import { WeeklyAvailability } from '../../components/provider/WeeklyAvailability';
import { DateOverrides } from '../../components/provider/DateOverrides';
import { DaySchedule, DateOverride, LeavePeriod } from '../../util/interface/IProvider';
import { providerService } from '../../services/providerService';
import { toast } from 'react-toastify';

const ProviderAvailabilityPage: React.FC = () => {
    // --- State ---
    const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);
    const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([]);
    const [leavePeriods, setLeavePeriods] = useState<LeavePeriod[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Fetch data from backend ---
    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                setIsLoading(true);
                const data = await providerService.getAvailability();

                setWeeklySchedule(data.weeklySchedule || []);
                setDateOverrides(data.dateOverrides || []);
                setLeavePeriods(data.leavePeriods || []);
            } catch (err) {
                console.error("Error loading provider availability:", err);
                setError("Failed to load availability data. Please try again.");
                toast.error("Failed to load availability data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAvailability();
    }, []);

    // --- Save updates to backend ---
    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const dataToSave = { weeklySchedule, dateOverrides, leavePeriods };
            console.log("Saving data:", dataToSave);

            await providerService.updateAvailability(dataToSave);
            toast.success("Availability saved successfully!");
        } catch (err) {
            console.error("Error saving provider availability:", err);
            toast.error("Failed to save availability. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Loading State ---
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
        );
    }

    // --- Error State ---
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    // --- Main UI ---
    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* --- Header --- */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Manage Availability
                    </h1>
                    <p className="text-base text-gray-500 mt-2">
                        Set your weekly schedule, mark holidays, and block specific days or times for breaks.
                    </p>
                </div>

                {/* --- Main Grid --- */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Weekly Schedule Section */}
                    <div className="lg:col-span-3">
                        <WeeklyAvailability
                            schedule={weeklySchedule}
                            setSchedule={setWeeklySchedule}
                        />
                    </div>

                    {/* Date Overrides Section */}
                    <div className="lg:col-span-2">
                        <DateOverrides
                            overrides={dateOverrides}
                            setOverrides={setDateOverrides}
                            leavePeriods={leavePeriods}
                            setLeavePeriods={setLeavePeriods}
                        />
                    </div>
                </div>

                {/* --- Save Button --- */}
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
