import React, { useEffect } from 'react';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Clock,
    FileText,
    Award,
    Star,
    Calendar,
    DollarSign,
    Settings,
    Bell,
    Edit3,
    CheckCircle,
    Eye
} from 'lucide-react';
import Header from '../../components/user/Header';
import Sidebar from '../../components/provider/Sidebar';
import { providerService } from '../../services/providerService';
import { useParams } from 'react-router-dom';

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

const ProviderProfile: React.FC = () => {

      const { userId } = useParams<{userId: string}>()
    console.log('the user id', userId)

    useEffect(() => {
        const getProvider = async () => {
            const response = await providerService.getProviderById(userId || '')
            console.log('the provider response', response)
        }

        getProvider()
    })

  
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



    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <Sidebar />

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Header Section */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-5 h-5 text-green-300" />
                                            <span className="text-blue-100">Verified information</span>
                                        </div>
                                    </div>
                                    <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2">
                                        <Edit3 className="w-4 h-4" />
                                        <span>Edit Profile</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Basic Information */}
                                <section>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                                        <User className="w-6 h-6 mr-3 text-blue-600" />
                                        Basic Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-slate-50 rounded-xl p-4">
                                            <label className="text-sm font-medium text-slate-500 mb-1 block">Name</label>
                                            <p className="text-slate-800 font-semibold">{profileData.name}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4">
                                            <label className="text-sm font-medium text-slate-500 mb-1 block flex items-center">
                                                <Phone className="w-4 h-4 mr-1" />
                                                Phone
                                            </label>
                                            <p className="text-slate-800 font-semibold">{profileData.phone}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 md:col-span-2">
                                            <label className="text-sm font-medium text-slate-500 mb-1 block flex items-center">
                                                <Mail className="w-4 h-4 mr-1" />
                                                Email
                                            </label>
                                            <p className="text-slate-800 font-semibold">{profileData.email}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Experience & Service Area */}
                                <section>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                                        <Award className="w-6 h-6 mr-3 text-blue-600" />
                                        Experience & Service Area
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                                            <label className="text-sm font-medium text-green-600 mb-2 block">Years of Experience</label>
                                            <p className="text-3xl font-bold text-green-700">{profileData.experience} years</p>
                                        </div>
                                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                                            <label className="text-sm font-medium text-purple-600 mb-2 block flex items-center">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                Service Area Pincodes
                                            </label>
                                            <p className="text-lg font-semibold text-purple-700">
                                                {profileData.servicePincodes.join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Availability */}
                                <section>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                                        <Clock className="w-6 h-6 mr-3 text-blue-600" />
                                        Availability
                                    </h2>
                                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                        <label className="text-sm font-medium text-blue-600 mb-2 block">Schedule</label>
                                        <p className="text-lg font-semibold text-blue-800">{profileData.schedule}</p>
                                    </div>
                                </section>

                                {/* Profile Photo */}
                                <section>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Profile Photo</h2>
                                    <div className="flex items-start space-x-6 p-6 bg-slate-50 rounded-xl">
                                        <div className="relative">
                                            <img
                                                src={profileData.profileImage}
                                                alt={profileData.name}
                                                className="w-24 h-24 rounded-2xl shadow-lg"
                                            />
                                            {profileData.verified && (
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <CheckCircle className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-slate-800 mb-1">{profileData.name}</h3>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-3">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Verified
                                            </span>
                                            <p className="text-sm text-slate-500">
                                                You can change your profile photo in profile settings
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Verification Documents */}
                                <section>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                                        <FileText className="w-6 h-6 mr-3 text-blue-600" />
                                        Verification Documents
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-xl hover:border-blue-200 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-800">Aadhaar/ID Proof</h3>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Verified
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
                                                <Eye className="w-4 h-4" />
                                                <span>View</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-xl hover:border-blue-200 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                                    <Award className="w-6 h-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-800">Business Certifications</h3>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Verified
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
                                                <Eye className="w-4 h-4" />
                                                <span>View</span>
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderProfile;