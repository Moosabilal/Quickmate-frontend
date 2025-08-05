import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Home,
    Calendar,
    Settings,
    Star,
    DollarSign,
    User,
    Bell,
    Plus,
    Edit3,
    Trash2,
    Award,
    Eye,
    X,
    Download,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toast } from 'react-toastify';

interface Service {
    id: string;
    category: string;
    title: string;
    price: number;
    image: string;
    hasCertificate: boolean;
    certificateUrl?: string;
    description: string;
    rating: number;
    reviews: number;
}

const ProviderServicesPage: React.FC = () => {
    const [selectedCertificate, setSelectedCertificate] = useState<Service | null>(null);

    const { provider } = useAppSelector(state => state.provider)

    const navigate = useNavigate()

    const services: Service[] = [
        
    ];

    //   const CertificateModal = ({ service, onClose }: { service: Service; onClose: () => void }) => (
    //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    //       <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    //         <div className="p-6 border-b border-gray-200">
    //           <div className="flex items-center justify-between">
    //             <div className="flex items-center gap-3">
    //               <div className="p-2 bg-blue-100 rounded-lg">
    //                 <Award className="w-6 h-6 text-blue-600" />
    //               </div>
    //               <div>
    //                 <h3 className="text-xl font-bold text-gray-900">Certificate</h3>
    //                 <p className="text-gray-600">{service.title}</p>
    //               </div>
    //             </div>
    //             <button
    //               onClick={onClose}
    //               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
    //             >
    //               <X className="w-5 h-5 text-gray-500" />
    //             </button>
    //           </div>
    //         </div>

    //         <div className="p-6">
    //           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center mb-6">
    //             <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
    //               <Award className="w-10 h-10 text-blue-600" />
    //             </div>
    //             <h4 className="text-2xl font-bold text-gray-900 mb-2">Professional Certificate</h4>
    //             <p className="text-gray-600 mb-4">Certified in {service.title}</p>
    //             <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
    //               <span>Issued by Professional Services Board</span>
    //             </div>
    //           </div>

    //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    //             <div className="bg-gray-50 rounded-lg p-4">
    //               <h5 className="font-semibold text-gray-900 mb-1">Issue Date</h5>
    //               <p className="text-gray-600">January 15, 2024</p>
    //             </div>
    //             <div className="bg-gray-50 rounded-lg p-4">
    //               <h5 className="font-semibold text-gray-900 mb-1">Expiry Date</h5>
    //               <p className="text-gray-600">January 15, 2026</p>
    //             </div>
    //             <div className="bg-gray-50 rounded-lg p-4">
    //               <h5 className="font-semibold text-gray-900 mb-1">Certificate ID</h5>
    //               <p className="text-gray-600">PSB-{service.id.padStart(6, '0')}</p>
    //             </div>
    //             <div className="bg-gray-50 rounded-lg p-4">
    //               <h5 className="font-semibold text-gray-900 mb-1">Status</h5>
    //               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
    //                 Active
    //               </span>
    //             </div>
    //           </div>

    //           <div className="flex gap-3">
    //             <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
    //               <Download className="w-4 h-4" />
    //               Download Certificate
    //             </button>
    //             <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
    //               <ExternalLink className="w-4 h-4" />
    //               Verify Online
    //             </button>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   );

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="flex">
                <div className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Services</h1>
                                <p className="text-gray-600">Manage your service offerings and certificates</p>
                            </div>
                            {services.length > 0 && <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-600/25"
                                onClick={() => navigate(`/providerService/new`)}
                            >
                                <Plus className="w-5 h-5" />
                                Add a service
                            </button>}
                        </div>

                        {/* Services Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {services && services.length > 0 ? (
                                services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="aspect-video relative overflow-hidden">
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                                                    {service.category}
                                                </span>
                                            </div>
                                            {service.hasCertificate && (
                                                <div className="absolute top-4 right-4">
                                                    <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                                                        <Award className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                        {service.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {service.rating}
                                                            </span>
                                                        </div>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-sm text-gray-600">
                                                            {service.reviews} reviews
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        ${service.price}
                                                    </div>
                                                    <div className="text-sm text-gray-500">per service</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                    onClick={() => navigate(`/providerService/new/${service.id}`)}
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-gray-500 text-lg mb-4">You haven’t added any services yet.</p>
                                    <button
                                        onClick={() => provider.status === "Pending" ? toast.info("You should be activated by admin to add service ") : navigate(`/providerService/new`)}
                                        className="inline-flex items-center px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Your First Service
                                    </button>
                                </div>
                            )}

                        </div>

                        {services.length > 0 && <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Settings className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{services.length}</div>
                                        <div className="text-sm text-gray-600">Active Services</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Award className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{services.filter(s => s.hasCertificate).length}</div>
                                        <div className="text-sm text-gray-600">Certified Services</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <Star className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">4.8</div>
                                        <div className="text-sm text-gray-600">Average Rating</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <DollarSign className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">${services.reduce((sum, s) => sum + s.price, 0)}</div>
                                        <div className="text-sm text-gray-600">Total Value</div>
                                    </div>
                                </div>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>

            {/* {selectedCertificate && (
        <CertificateModal
          service={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )} */}
        </div>
    );
};

export default ProviderServicesPage;