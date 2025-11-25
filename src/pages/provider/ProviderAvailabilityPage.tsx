import React, { useState, useEffect } from 'react';
import { WeeklyAvailability } from '../../components/provider/WeeklyAvailability';
import { DateOverrides } from '../../components/provider/DateOverrides';
import { DaySchedule, DateOverride, LeavePeriod } from '../../util/interface/IProvider';
import { providerService } from '../../services/providerService';
import { toast } from 'react-toastify';

const ProviderAvailabilityPage: React.FC = () => {
    const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);
    const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([]);
    const [leavePeriods, setLeavePeriods] = useState<LeavePeriod[]>([]);

    const [initialWeeklySchedule, setInitialWeeklySchedule] = useState<DaySchedule[]>([]);
    const [initialDateOverrides, setInitialDateOverrides] = useState<DateOverride[]>([]);
    const [initialLeavePeriods, setInitialLeavePeriods] = useState<LeavePeriod[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                setIsLoading(true);
                const data = await providerService.getAvailability();

                setWeeklySchedule(data.weeklySchedule || []);
                setDateOverrides(data.dateOverrides || []);
                setLeavePeriods(data.leavePeriods || []);

                setInitialWeeklySchedule(data.weeklySchedule || []);
                setInitialDateOverrides(data.dateOverrides || []);
                setInitialLeavePeriods(data.leavePeriods || []);
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

    const handleSaveChanges = async () => {
        const hasChanges =
            JSON.stringify(weeklySchedule) !== JSON.stringify(initialWeeklySchedule) ||
            JSON.stringify(dateOverrides) !== JSON.stringify(initialDateOverrides) ||
            JSON.stringify(leavePeriods) !== JSON.stringify(initialLeavePeriods);

        if (!hasChanges) {
            toast.info("No changes detected.");
            return;
        }

        setIsSaving(true);
        try {
            const dataToSave = { weeklySchedule, dateOverrides, leavePeriods };
            const response = await providerService.updateAvailability(dataToSave);
            
            setInitialWeeklySchedule(response.data.weeklySchedule);
            setInitialDateOverrides(response.data.dateOverrides);
            setInitialLeavePeriods(response.data.leavePeriods);

            toast.success("Availability saved successfully!");
        } catch (err: any) {
            console.error("Error saving provider availability:", err);
            toast.error(err.message || "Failed to save availability. Please check for overlapping times or past dates.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Manage Availability
                    </h1>
                    <p className="text-base text-gray-500 mt-2">
                        Set your weekly schedule, mark holidays, and block specific days or times for breaks.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <WeeklyAvailability
                            schedule={weeklySchedule}
                            setSchedule={setWeeklySchedule}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <DateOverrides
                            overrides={dateOverrides}
                            setOverrides={setDateOverrides}
                            leavePeriods={leavePeriods}
                            setLeavePeriods={setLeavePeriods}
                        />
                    </div>
                </div>

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
