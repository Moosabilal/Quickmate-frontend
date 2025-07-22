import { Calendar, User, Settings, Star, DollarSign, CheckCircle } from 'lucide-react';
import React from 'react'

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
    const profileData: ProfileData = {
        name: "Sophia Carter",
        phone: "+1-555-123-4567",
        email: "sophia.carter@email.com",
        experience: 5,
        servicePincodes: ["90210", "90048", "90069"],
        schedule: "Monday to Friday, 9 AM - 6 PM",
        profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        verified: true
    };
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
                                        src={profileData.profileImage}
                                        alt="Sophia Clark"
                                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                                    />
                                    {profileData.verified && (
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-semibold text-slate-800 mt-4">{profileData.name.split(' ')[0]} Clark</h3>
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
