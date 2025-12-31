import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ISubscriptionPlan, SubscriptionPlansModalProps } from "../../util/interface/ISubscriptionPlan";

const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
  subscriptionPlans
}) => {
  const [plans, setPlans] = useState<ISubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      if (subscriptionPlans && Array.isArray(subscriptionPlans)) {
        setPlans(subscriptionPlans);
        setError(null);
      } else {
        setError("Invalid subscription plan data.");
      }
    } catch (err) {
      if(err instanceof Error){
        setError(err.message);
      } else {
        setError("Failed to load subscription plans.");
      }
    } finally {
      setLoading(false);
    }
  }, [subscriptionPlans]);

  if (!isOpen) return null;



  const formatDuration = (days: number) => {
    if (days === 30) return "Monthly";
    if (days === 365) return "Yearly";
    if (days === 7) return "Weekly";
    return `${days} days`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in duration-300" style={{ maxHeight: '90vh' }}>
        <div className="px-8 py-6 text-white relative" style={{ background: 'linear-gradient(to right, #2563eb, #7c3aed)' }}>
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}></div>
          <div className="relative">
            <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
            <p className="text-lg" style={{ color: '#dbeafe' }}>Unlock premium features with our flexible subscription options</p>
          </div>
          <button
            aria-label="Close Modal"
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-colors text-white text-xl font-light hover:bg-white hover:bg-opacity-30"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <X />
          </button>
        </div>

        <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Loading subscription plans...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl text-red-600 dark:text-red-400 mb-2">Error Loading Plans</p>
              <p className="text-gray-500 dark:text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">No subscription plans available</p>
              <p className="text-gray-500 dark:text-gray-500">Please check back later or contact support.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 ${plan.recommended
                    ? "border-blue-500 scale-105"
                    : "border-gray-200 dark:border-gray-700"
                    }`}
                  style={{
                    ...(plan.recommended && {
                      boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)'
                    })
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = plan.recommended ? 'scale(1.05) translateY(-4px)' : 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = plan.recommended ? 'scale(1.05)' : 'scale(1)';
                    e.currentTarget.style.boxShadow = plan.recommended ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : '';
                  }}
                >
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span
                        className="text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg"
                        style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}
                      >
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {plan.name}
                      </h3>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-4xl font-bold text-blue-600">₹{plan.price}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                          / {formatDuration(plan.durationInDays)}
                        </span>
                      </div>
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {plan.durationInDays} days
                      </div>
                      {plan.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-4 px-2 line-clamp-2">
                          {plan.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start">
                          <div
                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5"
                            style={{ backgroundColor: 'rgb(220 252 231)' }}
                          >
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => onSubscribe(plan._id)}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md ${plan.recommended
                        ? "text-white shadow-lg"
                        : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 hover:shadow-lg"
                        }`}
                      style={plan.recommended ? { background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' } : {}}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        if (plan.recommended) {
                          e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #7c3aed)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        if (plan.recommended) {
                          e.currentTarget.style.background = 'linear-gradient(to right, #3b82f6, #8b5cf6)';
                        }
                      }}
                    >
                      {plan.recommended ? "Get Started" : "Choose Plan"}
                    </button>
                  </div>

                  <div
                    className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
                    style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}
                  ></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="px-8 py-6 border-t border-gray-200 dark:border-gray-700"
          style={{ backgroundColor: 'rgb(249 250 251)' }}
        >
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansModal;