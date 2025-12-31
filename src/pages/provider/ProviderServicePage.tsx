import React, { useEffect, useState } from 'react';
import {
    Star,
    Plus,
    Edit3,
    Trash2,
    IndianRupee,
    Briefcase,
    Wrench,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toast } from 'react-toastify';
import { serviceService } from '../../services/serviceService';
import DeleteConfirmationModal from '../../components/deleteConfirmationModel';
import { DeleteConfirmationTypes } from '../../util/interface/IDeleteModelType';
import SubscriptionPlansModal from '../../components/provider/SubscriptionPlanModel';
import { ISubscriptionPlan } from '../../util/interface/ISubscriptionPlan';
import { subscriptionPlanService } from '../../services/subscriptionPlanService';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateProviderProfile } from '../../features/provider/providerSlice';
import { IService } from '../../util/interface/IService';
import { isAxiosError } from 'axios';
import { RazorpayOptions, RazorpayResponse } from '../../util/interface/IRazorpay';
const paymentKey = import.meta.env.VITE_RAZORPAY_KEY_ID

const ProviderServicesPage: React.FC = () => {

    const { provider } = useAppSelector(state => state.provider)
    console.log('the providersdddd', provider)

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

                const subscriptionResponse = await subscriptionPlanService.getSubscriptionPlan('');
                setSubscriptionPlans(subscriptionResponse);
            } catch (error) {
                console.log('the errororrr111', error)
                let errorMessage = "Something went wrong while fetching data";
                if (isAxiosError(error) && error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                }
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [provider]);




    const handleAddNewService = () => {
        const { subscription } = provider;

        console.log('the subscription', subscription);

        if (!subscription || subscription.status === "NONE") {
            if (services.length >= 1) {
                console.log('its coming to opend the model')
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

            const serviceLimit = currentPlan.features.find(f => f.includes("Max service limit"));
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
        } catch (error) {
            let errorMessage = 'Failed to delete service';
            if (isAxiosError(error) && error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
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
            const options: RazorpayOptions = {
                key: paymentKey,
                amount: response.plan.price,
                currency: "INR",
                name: "QuickMate",
                description: response.plan.name,
                order_id: response.order.id,
                handler: async function (razorpayResponse: RazorpayResponse) {
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

            const razor = new window.Razorpay(options);
            razor.open();
        } catch (error) {
            let errorMessage = "Failed to create subscription order";
            if (isAxiosError(error) && error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
            setIsLoading(false);
        }
    };


    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setServiceToDelete(null);
    };

    const serviceAddFunction = () => {
        if (provider.status === "Approved") {
            navigate('/provider/providerService/new')
        } else {
            toast.info("You should be Approved by admin to add service")
        }
    }


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500" role="status" aria-label="Loading"></div>
                <p className="ml-4 text-xl font-medium">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="flex flex-col">
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Services</h1>
                                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base transition-colors">Manage your service offerings and certificates</p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {services.length > 0 && (
                                    <button
                                        className="w-full sm:w-auto bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-600/25 dark:shadow-blue-900/40"
                                        onClick={handleAddNewService}
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add a service
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
                            {services && services.length > 0 ? (
                                services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 group"
                                    >
                                        <div className="aspect-video relative overflow-hidden">
                                            <img
                                                src={service.serviceImage}
                                                alt={service.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                                                    {service.category}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5 sm:p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 pr-4">
                                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                                                        {service.title}
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">{service.description}</p>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                {service.rating}
                                                            </span>
                                                        </div>
                                                        <span className="text-gray-400 dark:text-gray-600">•</span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {service.reviews} reviews
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="flex items-center justify-end text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                                        <IndianRupee className="h-5 w-5 mr-1" />
                                                        {service.price}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">per service</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <button
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
                                                    onClick={() => navigate(`/provider/providerService/edit/${service.id}`)}
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-medium text-sm"
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
                                <div className="col-span-full text-center py-12 sm:py-16 px-4">
                                    <div className="mb-8 flex justify-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-3xl opacity-30 animate-pulse"></div>

                                            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-3xl p-8 sm:p-12 border-2 border-blue-100 dark:border-gray-700">
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl shadow-lg transform -rotate-6 hover:rotate-0 transition-transform">
                                                        <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
                                                        <Wrench className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                        Start Offering Your Services
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-8 max-w-md mx-auto">
                                        Showcase your expertise and connect with customers looking for your skills.
                                    </p>

                                    <button
                                        onClick={serviceAddFunction}
                                        className="inline-flex items-center px-6 py-3 text-base font-medium bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl dark:shadow-blue-900/40"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add Your First Service
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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