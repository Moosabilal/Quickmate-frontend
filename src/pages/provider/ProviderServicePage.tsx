import React, { useEffect, useState } from 'react';
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
    ExternalLink,
    IndianRupee
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toast } from 'react-toastify';
import { serviceService } from '../../services/serviceService';
import { getCloudinaryUrl } from '../../util/cloudinary';
import DeleteConfirmationModal from '../../components/deleteConfirmationModel';
import { DeleteConfirmationTypes } from '../../util/interface/IDeleteModelType';
import { Provider } from 'react-redux';
import { SubscriptionStatus } from '../../util/interface/IProvider';
import SubscriptionPlansModal from '../../components/provider/SubscriptionPlanModel';
import { ISubscriptionPlan } from '../../util/interface/ISubscriptionPlan';
import { subscriptionPlanService } from '../../services/subscriptionPlanService';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateProviderProfile } from '../../features/provider/providerSlice';
import { IService } from '../../util/interface/IService';
const paymentKey = import.meta.env.VITE_RAZORPAY_KEY_ID


const ProviderServicesPage: React.FC = () => {

    const { provider } = useAppSelector(state => state.provider)

    const [services, setServices] = useState<IService[]>([])
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<IService | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [subscriptionPlans, setSubscriptionPlans] = useState<ISubscriptionPlan[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    useEffect(() => {
        const fetchData = async () => {
            if (!provider.id) return;

            setIsLoading(true);
            try {
                const servicesResponse = await serviceService.getServicesByProviderId(provider.id);
                setServices(servicesResponse.services);

                const subscriptionResponse = await subscriptionPlanService.getSubscriptionPlan();
                setSubscriptionPlans(subscriptionResponse);
            } catch (error: any) {
                toast.error(error || "Something went wrong while fetching data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [provider]);




    const handleAddNewService = () => {
        const { subscription } = provider;

        if (!subscription || subscription.status === "NONE") {
            if (services.length >= 1) {
                setIsModalOpen(true);
                return;
            }
            return navigate(`/provider/providerService/new`);
        }

        if (subscription.status === "EXPIRED") {
            toast.info("Your subscription has expired. Please renew to add more services.");
            setIsModalOpen(true);
            return;
        }

        if (subscription.status === "ACTIVE") {
            const currentPlan = subscriptionPlans.find(
                (plan) => plan._id === subscription.planId
            );

            if (!currentPlan) {
                toast.error("Subscription plan not found. Please subscribe again.");
                setIsModalOpen(true);
                return;
            }

            const serviceLimit = currentPlan.features.find(f => f.includes("max service limit"));
            if (serviceLimit) {
                const maxServices = parseInt(serviceLimit.match(/\d+/)?.[0] || "0", 10);
                if (services.length >= maxServices) {
                    toast.info("You’ve reached your service limit for this plan. Please upgrade.");
                    setIsModalOpen(true);
                    return;
                }
            }

            return navigate(`/provider/providerService/new`);
        }
    };


    const handleDeleteClick = (service: IService) => {
        setServiceToDelete(service);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!serviceToDelete) return;

        setIsDeleting(true);
        try {
            const { message } = await serviceService.deleteService(serviceToDelete.id);
            toast.info(message);
            setServices((prev) => prev.filter(service => service.id !== serviceToDelete.id));
            setShowDeleteModal(false);
            setServiceToDelete(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete service');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubscribe = async (planId: string) => {
        if (!provider.id) {
            toast.error("Something went wrong!, please try again later");
            return;
        }

        setIsLoading(true);
        try {
            const response = await subscriptionPlanService.createSubscriptionOrder(provider.id, planId);
            const options = {
                key: paymentKey,
                amount: response.plan.price,
                currency: "INR",
                name: "QuickMate",
                description: response.plan.name,
                order_id: response.order.id,
                handler: async function (razorpayResponse: any) {
                    if (!provider.id) {
                        toast.error("Something went wrong!, please try again later");
                        return;
                    }
                    try {
                        const res = await subscriptionPlanService.verifySubscriptionPayment(
                            provider.id,
                            planId,
                            razorpayResponse.razorpay_order_id,
                            razorpayResponse.razorpay_payment_id,
                            razorpayResponse.razorpay_signature
                        );

                        if (res.provider) {
                            dispatch(updateProviderProfile({ provider: res.provider }));
                        }
                        toast.success(res.message);
                    } catch (error) {
                        console.error("Payment handler error:", error);
                        toast.error("Payment verification failed.");
                    } finally {
                        setIsModalOpen(false);
                        setIsLoading(false);
                    }
                },
                prefill: {
                    name: provider.fullName,
                    email: provider.email,
                    contact: provider.phoneNumber,
                },
                notes: {
                    address: "Razorpay Corporate Office",
                },
                theme: {
                    color: "#3057b0ff",
                },
                modal: {
                    ondismiss: () => {
                        setIsLoading(false);
                        toast.info("Payment process was cancelled.");
                    },
                },
            };

            const razor = new (window as any).Razorpay(options);
            razor.open();
        } catch (error: any) {
            toast.error(error.message || "Failed to create subscription order");
            setIsLoading(false);
        }
    };


    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setServiceToDelete(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500" role="status" aria-label="Loading"></div>
                <p className="ml-4 text-xl">Loading...</p>
            </div>
        );
    }

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
                                onClick={handleAddNewService}
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
                                                src={getCloudinaryUrl(service.serviceImage)}
                                                alt={service.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                                                    {service.category}
                                                </span>
                                            </div>

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
                                                                {/* {service.rating} */}
                                                            </span>
                                                        </div>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-sm text-gray-600">
                                                            {/* {service.reviews} reviews */}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center justify-end text-2xl font-bold text-gray-900">
                                                        <IndianRupee className="h-5 w-5 mr-1" />
                                                        {service.price}
                                                    </div>
                                                    <div className="text-sm text-gray-500">per service</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                    onClick={() => navigate(`/provider/providerService/edit/${service.id}`)}
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    onClick={() => handleDeleteClick(service)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-gray-500 text-lg mb-4">You haven't added any services yet.</p>
                                    <button
                                        onClick={() => provider.status === "Pending" ? toast.info("You should be activated by admin to add service ") : navigate(`/provider/providerService/new`)}
                                        className="inline-flex items-center px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Your First Service
                                    </button>
                                </div>
                            )}

                        </div>

                        {/* {services.length > 0 && <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
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
                        </div>} */}
                    </div>
                </div>
            </div>

            {/* Provider Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemType={DeleteConfirmationTypes.SERVICE}
                itemName={serviceToDelete?.title}
                itemDetails={`${serviceToDelete?.category} • ₹${serviceToDelete?.price}`}
                isLoading={isDeleting}
                additionalInfo="Any existing bookings for this service will need to be handled separately."
            />
            <SubscriptionPlansModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubscribe={handleSubscribe}
                subscriptionPlans={subscriptionPlans}
            />
        </div>
    );
};

export default ProviderServicesPage;