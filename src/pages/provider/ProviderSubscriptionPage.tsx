import React, { useState, useEffect, useCallback } from 'react';
import { subscriptionPlanService } from '../../services/subscriptionPlanService';
import { ActiveModalState, IPlan, ISubscription } from '../../util/interface/ISubscriptionPlan';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../hooks/useAppSelector';
import { ArrowDownCircle, CheckCircle, Clock, Loader2, X, Zap } from 'lucide-react';
import { IProviderProfile } from '../../util/interface/IProvider';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateProviderProfile } from '../../features/provider/providerSlice';
import { SubscriptionActionModal } from '../../components/provider/SubscriptionActionModal';

declare var Razorpay: any;
const paymentKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

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
  
  const { provider } = useAppSelector((state) => state.provider);
  
  const [currentSubscription, setCurrentSubscription] = useState<ISubscription | null>(provider?.subscription || null);
  const [currentPlanDetails, setCurrentPlanDetails] = useState<IPlan | null>(null);

const [modalConfig, setModalConfig] = useState<ActiveModalState | null>(null);
  const isModalOpen = !!modalConfig;

  const dispatch = useAppDispatch();

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const plans = await subscriptionPlanService.getSubscriptionPlan();
      setAllPlans(plans);

      if (currentSubscription?.planId && plans.length > 0) {
        const current = plans.find((p: IPlan) => (p.id || p._id) === currentSubscription.planId);
        setCurrentPlanDetails(current || null);
      } else {
        setCurrentPlanDetails(null); 
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

  useEffect(() => {
    setCurrentSubscription(provider?.subscription || null);
  }, [provider]);

  const handlePayment = (
    order: any, 
    plan: IPlan,
    onSuccessMessage: string
  ) => {
    const planId = plan.id || plan._id;
    if (!provider?.id || !planId) {
        toast.error("Provider or Plan ID is missing.");
        return;
    }
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
            provider.id!,
            planId,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );

          console.log('the verified data', verifyData)
          
          toast.success(onSuccessMessage);
          // setCurrentSubscription(verifyData.provider.subscription);
          dispatch(updateProviderProfile({ provider: verifyData.provider }));
        } catch (err) {
          console.log('payment verification failed : ', err)
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

  const handleConfirmAction = async () => {
    if (!modalConfig) return;

    if (modalConfig.type === 'upgrade' && modalConfig.details && modalConfig.newPlan) {
      handlePayment(modalConfig.order, modalConfig.newPlan, "Upgrade successful!");
      setModalConfig(null);
      return;
    }

    setIsProcessing(true);
    
    if (modalConfig.type === 'downgrade' && modalConfig.plan) {
      try {
        const response = await subscriptionPlanService.scheduleDowngrade(modalConfig.plan.id!);
        const updatedProvider = { ...provider, subscription: response.data } as IProviderProfile;
        dispatch(updateProviderProfile({ provider: updatedProvider }));
        toast.success(response.message);
      } catch (err: any) {
        toast.error(err.message || "Failed to schedule downgrade.");
      }
    }
    
    else if (modalConfig.type === 'cancelDowngrade') {
      try {
        const response = await subscriptionPlanService.cancelDowngrade();
        const updatedProvider = { ...provider, subscription: response.data } as IProviderProfile;
        dispatch(updateProviderProfile({ provider: updatedProvider }));
        toast.success(response.message);
      } catch (err: any) {
        toast.error(err.message || "Failed to cancel downgrade.");
      }
    }

    setIsProcessing(false);
    setModalConfig(null); 
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
    const planId = plan.id || plan._id;
    if (!planId) {
        toast.error("Cannot process upgrade, plan ID is missing.");
        return;
    }
    setIsProcessing(true);
    try {
      const res = await subscriptionPlanService.calculateUpgrade(planId);
      console.log(res.newPlan)
      
      setModalConfig({
        type: 'upgrade',
        plan: plan,
        details: res, 
        order: res.order, 
        newPlan: res.newPlan 
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to calculate upgrade cost.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onDowngradeClick = async (plan: IPlan) => {   
    setModalConfig({ type: 'downgrade', plan: plan });
  };

  const onCancelDowngradeClick = async () => {
    setModalConfig({ type: 'cancelDowngrade' });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const otherPlans = allPlans.filter(p => (p.id || p._id) !== currentSubscription?.planId);
  const pendingDowngradePlan = allPlans.find(
    p => (p.id || p._id) === currentSubscription?.pendingDowngradePlanId
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Subscription</h1>

      {pendingDowngradePlan && currentSubscription?.status === 'ACTIVE' && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800">Downgrade Scheduled</h3>
                <p className="text-sm text-yellow-700">
                  You are scheduled to downgrade to the <strong>{pendingDowngradePlan.name}</strong> plan on 
                  <strong> {formatDate(currentSubscription.endDate)}</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={onCancelDowngradeClick}
              disabled={isProcessing}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel Downgrade
            </button>
          </div>
        </div>
      )}

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

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          {currentSubscription?.status === 'ACTIVE' ? 'Upgrade or Change Your Plan' : 'Choose a Plan'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPlans.map(plan => {
            const currentPrice = currentPlanDetails?.price || 0;
            const planPrice = plan.price || 0;
            const isUpgrade = currentPlanDetails && planPrice > currentPrice;
            const isDowngrade = currentPlanDetails && planPrice < currentPrice;
            const isDisabled = isProcessing || !!pendingDowngradePlan;
            
            return (
              <div key={plan.id || plan._id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col">
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
                
                <button
                  onClick={() => {
                    if (isUpgrade) onUpgradeClick(plan);
                    else if (isDowngrade) onDowngradeClick(plan);
                    else onSubscribeClick(plan);
                  }}
                  disabled={isDisabled}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2
                    ${isUpgrade ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                    ${isDowngrade ? 'bg-gray-700 text-white hover:bg-gray-800' : ''}
                    ${!isUpgrade && !isDowngrade ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  title={isDisabled && pendingDowngradePlan ? "You already have a pending downgrade." : (isDowngrade ? "Schedule downgrade" : "")}
                >
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isUpgrade && <Zap className="w-4 h-4" />}
                  {isDowngrade && <ArrowDownCircle className="w-4 h-4" />}
                  
                  {isUpgrade ? 'Upgrade Now' : (isDowngrade ? 'Schedule Downgrade' : 'Subscribe')}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {isModalOpen && modalConfig && (
        <SubscriptionActionModal
          isOpen={isModalOpen}
          isProcessing={isProcessing}
          onClose={() => { if (!isProcessing) setModalConfig(null); }}
          onConfirm={handleConfirmAction}
          actionType={modalConfig.type}
          plan={modalConfig.plan}
          details={modalConfig.details}
        />
      )}
    </div>
  );
};

export default ProviderSubscriptionPage;