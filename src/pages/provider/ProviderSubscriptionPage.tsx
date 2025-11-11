import React, { useState, useEffect, useCallback } from 'react';
import { subscriptionPlanService } from '../../services/subscriptionPlanService';
import { IPlan, ISubscription, IUpgradeCostResponse } from '../../util/interface/ISubscriptionPlan';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../hooks/useAppSelector';
import { CheckCircle, Clock, CreditCard, Loader2, Zap } from 'lucide-react';
import { IProviderProfile } from '../../util/interface/IProvider';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateProviderProfile } from '../../features/provider/providerSlice';
import { UpgradeConfirmationModal } from '../../components/provider/UpgradeConfirmationModal';

// We need to declare Razorpay for TypeScript
declare var Razorpay: any;
const paymentKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Helper to format dates
const formatDate = (dateString?: Date) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const ProviderSubscriptionPage: React.FC = () => {
  const [allPlans, setAllPlans] = useState<IPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get provider info from Redux
  const { provider } = useAppSelector((state) => state.provider);
  const { user } = useAppSelector((state) => state.auth);
  
  const [currentSubscription, setCurrentSubscription] = useState<ISubscription | null>(provider?.subscription || null);
  const [currentPlanDetails, setCurrentPlanDetails] = useState<IPlan | null>(null);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalData, setModalData] = useState<{ plan: IPlan, details: IUpgradeCostResponse } | null>(null);

  const dispatch = useAppDispatch();

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const plans = await subscriptionPlanService.getSubscriptionPlan();
      setAllPlans(plans);

      // Find the provider's current plan details
      if (currentSubscription?.planId && plans.length > 0) {
        const current = plans.find((p: IPlan) => p.id === currentSubscription.planId);
        setCurrentPlanDetails(current || null);
      }
    } catch (err) {
      toast.error(`${err instanceof Error ? err.message : `${err}` || "Failed to load subscription plans."}`);
    } finally {
      setLoading(false);
    }
  }, [currentSubscription]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Main payment handler
  const handlePayment = (
    order: any, 
    plan: IPlan,
    onSuccessMessage: string
  ) => {
    const options = {
      key: paymentKey,
      amount: order.amount,
      currency: "INR",
      name: "QuickMate Subscription",
      description: `Payment for ${plan.name}`,
      order_id: order.id,
      handler: async (response: any) => {
        try {
          setIsProcessing(true);
          const verifyData = await subscriptionPlanService.verifySubscriptionPayment(
            provider.id!, // We know provider exists if this is called
            plan._id!,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );

          console.log('the verified data', verifyData)
          
          toast.success(onSuccessMessage);
          setCurrentSubscription(verifyData.provider.subscription);
          dispatch(updateProviderProfile(verifyData.provider));
        } catch (err) {
          toast.error("Payment verification failed. Please contact support.");
        } finally {
          setIsProcessing(false);
        }
      },
      prefill: {
        name: provider?.fullName,
        email: provider?.email,
        contact: provider?.phoneNumber,
      },
      theme: { color: "#3057b0ff" }
    };
    
    const rzp1 = new Razorpay(options);
    rzp1.open();
  };

  // --- Button Click Handlers ---

  const handleConfirmUpgrade = () => {
    if (!modalData) return;
    
    // Call the payment handler with the data we saved in state
    handlePayment(modalData.details.order, modalData.details.newPlan, "Upgrade successful!");
    
    // Close the modal
    setShowUpgradeModal(false);
    setModalData(null);
  };

  const onSubscribeClick = async (plan: IPlan) => {
    console.log('the selected plan', plan)
    if (!provider?.id || !plan.id) {
        toast.error("Provider or Plan ID is missing.");
        return;
    }
    setIsProcessing(true);
    try {
      const { order } = await subscriptionPlanService.createSubscriptionOrder(provider.id, plan.id);
      handlePayment(order, plan, "Subscription activated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create order.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onUpgradeClick = async (plan: IPlan) => {
    console.log('the selected plan', plan)
    if (!plan.id) {
        toast.error("Cannot process upgrade, plan ID is missing.");
        return;
    }
    setIsProcessing(true);
    try {
      const res = await subscriptionPlanService.calculateUpgrade(plan.id);
      console.log(res.newPlan)
      
      setModalData({ plan, details: res });
      
      // 3. Open the modal (instead of window.confirm)
      setShowUpgradeModal(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to calculate upgrade cost.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onDowngradeClick = () => {
    toast.info("Downgrades are not supported yet. Your new plan will be active after your current one expires.");
  };

  // --- Render Logic ---
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const otherPlans = allPlans.filter(p => p.id !== currentSubscription?.planId);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Subscription</h1>

      {/* --- CURRENT PLAN --- */}
      {currentSubscription && currentSubscription.status === 'ACTIVE' && currentPlanDetails ? (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Current Plan</h2>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentPlanDetails.name}
                </span>
                <h3 className="text-4xl font-bold mt-4">₹{currentPlanDetails.price}
                  <span className="text-lg font-normal"> / {currentPlanDetails.durationInDays} days</span>
                </h3>
              </div>
              <CheckCircle className="w-16 h-16 text-white/30" />
            </div>
            <div className="mt-6 pt-6 border-t border-white/20 text-blue-100">
              <p>Status: <span className="font-semibold text-white">Active</span></p>
              <p>Renews on: <span className="font-semibold text-white">{formatDate(currentSubscription.endDate)}</span></p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-12 text-center p-8 bg-gray-100 rounded-2xl">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Active Subscription</h2>
          <p className="text-gray-500">Choose a plan below to get started and unlock all features.</p>
        </div>
      )}

      {/* --- OTHER PLANS --- */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          {currentSubscription?.status === 'ACTIVE' ? 'Upgrade or Change Your Plan' : 'Choose a Plan'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPlans.map(plan => {
            const isUpgrade = currentPlanDetails && (plan.price || 0) > (currentPlanDetails.price || 0);
            const isDowngrade = currentPlanDetails && (plan.price || 0) < (currentPlanDetails.price || 0);
            
            return (
              <div key={plan.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">₹{plan.price}</p>
                  <p className="text-gray-500 text-sm">/ {plan.durationInDays} days</p>
                </div>
                <ul className="flex-grow space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* The Smart Button */}
                <button
                  onClick={() => {
                    if (isUpgrade) onUpgradeClick(plan);
                    else if (isDowngrade) onDowngradeClick();
                    else onSubscribeClick(plan); // For new or expired subs
                  }}
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2
                    ${isUpgrade ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}
                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isUpgrade ? 'Upgrade Now' : (isDowngrade ? 'Downgrade' : 'Subscribe')}
                  {isUpgrade && <Zap className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {showUpgradeModal && modalData && (
        <UpgradeConfirmationModal
          isOpen={showUpgradeModal}
          isProcessing={isProcessing}
          onClose={() => setShowUpgradeModal(false)}
          onConfirm={handleConfirmUpgrade}
          plan={modalData.plan}
          details={modalData.details}
        />
      )}
    </div>
  );
};

export default ProviderSubscriptionPage;