import { Calendar, User, Settings, Star, DollarSign, CheckCircle } from 'lucide-react';
import React from 'react'
import { useAppSelector } from '../../hooks/useAppSelector';
import { getCloudinaryUrl } from '../../util/cloudinary';
import { IProviderProfile } from '../../interface/IProvider';

interface ProfileData {
    name: string;
    phone: string;
    email: string;
    experience: number;
    servicePincodes: string[];
    schedule: string;
    profileImage: string;
    verified: boolean;
}

const Sidebar = () => {

    const { provider } = useAppSelector(state => state.provider)


        const navigationItems = [
        { icon: <User className="w-5 h-5" />, label: "Dashboard", active: false },
        { icon: <Calendar className="w-5 h-5" />, label: "Bookings", active: false },
        { icon: <Settings className="w-5 h-5" />, label: "Services", active: false },
        { icon: <Star className="w-5 h-5" />, label: "Performance & Reviews", active: false },
        { icon: <DollarSign className="w-5 h-5" />, label: "Earnings", active: false },
        { icon: <User className="w-5 h-5" />, label: "Service Profile", active: true }
    ];
  return (
    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                            <div className="text-center mb-8">
                                <div className="relative inline-block">
                                    <img
                                        src={getCloudinaryUrl(provider.profilePhoto || '')}
                                        alt="Sophia Clark"
                                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                                    />
                                    {/* {provider.status == "Pending" && (
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                    )} */}
                                </div>
                                <h3 className="font-semibold text-slate-800 mt-4">{provider.fullName?.split(' ')[0]}</h3>
                                <p className="text-sm text-slate-500">Service Provider</p>
                            </div>

                            <nav className="space-y-2">
                                {navigationItems.map((item, index) => (
                                    <a
                                        key={index}
                                        href="#"
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${item.active
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                            }`}
                                    >
                                        {item.icon}
                                        <span className="font-medium">{item.label}</span>
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>
  )
}

export default Sidebar
