// import React, { useEffect, useState } from "react";

// interface ISubscriptionPlan {
//   _id: string;
//   name: string;
//   price: number;
//   durationInDays: number;
//   features: string[];
//   recommended?: boolean;
// }

// interface SubscriptionPlansModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubscribe: (planId: string) => void;
// }

// // Mock data for subscription plans
// const mockSubscriptionPlans: ISubscriptionPlan[] = [
//   {
//     _id: "plan_basic_monthly",
//     name: "Basic Plan",
//     price: 299,
//     durationInDays: 30,
//     features: [
//       "Access to basic features",
//       "5 projects included",
//       "2GB storage space",
//       "Email support",
//       "Mobile app access",
//       "Basic analytics"
//     ]
//   },
//   {
//     _id: "plan_pro_monthly",
//     name: "Pro Plan",
//     price: 599,
//     durationInDays: 30,
//     recommended: true,
//     features: [
//       "All Basic features included",
//       "Unlimited projects",
//       "50GB storage space",
//       "Priority email support",
//       "Advanced analytics",
//       "API access",
//       "Custom integrations",
//       "Team collaboration tools"
//     ]
//   },
//   {
//     _id: "plan_basic_yearly",
//     name: "Basic Annual",
//     price: 2999,
//     durationInDays: 365,
//     features: [
//       "All Basic monthly features",
//       "2 months free (12 months for price of 10)",
//       "Priority support",
//       "Annual billing discount",
//       "Extended storage (5GB)",
//       "Quarterly business reviews"
//     ]
//   },
//   {
//     _id: "plan_pro_yearly",
//     name: "Pro Annual",
//     price: 5999,
//     durationInDays: 365,
//     features: [
//       "All Pro monthly features",
//       "2 months free (12 months for price of 10)",
//       "Dedicated account manager",
//       "Custom onboarding",
//       "Advanced security features",
//       "Priority feature requests",
//       "100GB storage space",
//       "White-label options"
//     ]
//   },
//   {
//     _id: "plan_enterprise",
//     name: "Enterprise",
//     price: 1499,
//     durationInDays: 30,
//     features: [
//       "Everything in Pro Plan",
//       "Unlimited team members",
//       "500GB storage space",
//       "24/7 phone support",
//       "Custom contracts available",
//       "Advanced security & compliance",
//       "SSO integration",
//       "Custom reporting",
//       "Dedicated infrastructure",
//       "SLA guarantees"
//     ]
//   },
//   {
//     _id: "plan_starter",
//     name: "Starter",
//     price: 99,
//     durationInDays: 7,
//     features: [
//       "7-day trial period",
//       "Limited to 1 project",
//       "500MB storage",
//       "Basic email support",
//       "Core features only"
//     ]
//   }
// ];

// // Mock API service to simulate network behavior
// const mockApiService = {
//   getSubscriptionPlans: (): Promise<{ data: ISubscriptionPlan[] }> => {
//     return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         // Simulate occasional network errors (5% chance)
//         if (Math.random() < 0.05) {
//           reject(new Error("Network error occurred"));
//         } else {
//           resolve({ data: mockSubscriptionPlans });
//         }
//       }, 800); // Simulate network delay
//     });
//   }
// };

// const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
//   isOpen,
//   onClose,
//   onSubscribe,
// }) => {
//   const [plans, setPlans] = useState<ISubscriptionPlan[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       setLoading(true);
      
//       // Using mock API service instead of axios
//       mockApiService
//         .getSubscriptionPlans()
//         .then((res) => setPlans(res.data))
//         .catch((err) => {
//           console.error("Failed to load plans:", err);
//           // You could set an error state here if needed
//         })
//         .finally(() => setLoading(false));

//       // Alternative: Direct mock data without API simulation
//       // setTimeout(() => {
//       //   setPlans(mockSubscriptionPlans);
//       //   setLoading(false);
//       // }, 1000);
//     }
//   }, [isOpen]);

//   const formatDuration = (days: number): string => {
//     if (days === 7) return "Weekly";
//     if (days === 30) return "Monthly";
//     if (days === 365) return "Yearly";
//     return `${days} days`;
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-6">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
//               Choose a Subscription Plan
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 mt-1">
//               Select the perfect plan for your needs
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-16">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
//               <p className="text-center text-gray-500">Loading subscription plans...</p>
//             </div>
//           ) : plans.length === 0 ? (
//             <div className="text-center py-16">
//               <div className="text-6xl mb-4">📋</div>
//               <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
//                 No subscription plans available
//               </p>
//               <p className="text-gray-500 dark:text-gray-500">
//                 Please check back later or contact support.
//               </p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {plans.map((plan) => (
//                 <div
//                   key={plan._id}
//                   className={`relative border rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
//                     plan.recommended
//                       ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200"
//                       : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
//                   }`}
//                 >
//                   {/* Recommended Badge */}
//                   {plan.recommended && (
//                     <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
//                       <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
//                         Most Popular
//                       </span>
//                     </div>
//                   )}

//                   <div className="text-center mb-4">
//                     <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
//                       {plan.name}
//                     </h3>
//                     <div className="mb-2">
//                       <span className="text-3xl font-bold text-blue-600">₹{plan.price}</span>
//                       <span className="text-gray-500 dark:text-gray-400 text-sm">
//                         /{formatDuration(plan.durationInDays)}
//                       </span>
//                     </div>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       Duration: {plan.durationInDays} days
//                     </p>
//                   </div>

//                   <ul className="space-y-2 mb-6 text-sm">
//                     {plan.features.map((feature, i) => (
//                       <li key={i} className="flex items-start text-gray-700 dark:text-gray-300">
//                         <span className="text-green-500 mr-2 mt-0.5">✓</span>
//                         <span>{feature}</span>
//                       </li>
//                     ))}
//                   </ul>

//                   <button
//                     onClick={() => onSubscribe(plan._id)}
//                     className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
//                       plan.recommended
//                         ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
//                         : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
//                     }`}
//                   >
//                     {plan.recommended ? "Get Started" : "Subscribe"}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/50">
//           <div className="text-center text-sm text-gray-600 dark:text-gray-400">
//             <p className="flex items-center justify-center">
//               <span className="mr-2">🔒</span>
//               Secure payment • Cancel anytime • 30-day money-back guarantee
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubscriptionPlansModal;



import React, { useEffect, useState } from "react";

interface ISubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  durationInDays: number;
  features: string[];
  recommended?: boolean;
}

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (planId: string) => void;
}

// Mock data for subscription plans
const mockSubscriptionPlans: ISubscriptionPlan[] = [
  {
    _id: "plan_starter",
    name: "Starter",
    price: 99,
    durationInDays: 7,
    features: [
      "7-day trial period",
      "Limited to 1 project",
      "500MB storage",
      "Basic email support",
      "Core features only"
    ]
  },
  {
    _id: "plan_basic_monthly",
    name: "Basic Plan",
    price: 299,
    durationInDays: 30,
    features: [
      "Access to basic features",
      "5 projects included",
      "2GB storage space",
      "Email support",
      "Mobile app access",
      "Basic analytics"
    ]
  },
  {
    _id: "plan_pro_monthly",
    name: "Pro Plan",
    price: 599,
    durationInDays: 30,
    recommended: true,
    features: [
      "All Basic features included",
      "Unlimited projects",
      "50GB storage space",
      "Priority email support",
      "Advanced analytics",
      "API access",
      "Custom integrations",
      "Team collaboration tools"
    ]
  },
  {
    _id: "plan_basic_yearly",
    name: "Basic Annual",
    price: 2999,
    durationInDays: 365,
    features: [
      "All Basic monthly features",
      "2 months free (12 months for price of 10)",
      "Priority support",
      "Annual billing discount",
      "Extended storage (5GB)",
      "Quarterly business reviews"
    ]
  },
  {
    _id: "plan_pro_yearly",
    name: "Pro Annual",
    price: 5999,
    durationInDays: 365,
    features: [
      "All Pro monthly features",
      "2 months free (12 months for price of 10)",
      "Dedicated account manager",
      "Custom onboarding",
      "Advanced security features",
      "Priority feature requests",
      "100GB storage space",
      "White-label options"
    ]
  },
  {
    _id: "plan_enterprise",
    name: "Enterprise",
    price: 1499,
    durationInDays: 30,
    features: [
      "Everything in Pro Plan",
      "Unlimited team members",
      "500GB storage space",
      "24/7 phone support",
      "Custom contracts available",
      "Advanced security & compliance",
      "SSO integration",
      "Custom reporting",
      "Dedicated infrastructure",
      "SLA guarantees"
    ]
  }
];

// Mock API service to simulate network behavior
const mockApiService = {
  getSubscriptionPlans: (): Promise<{ data: ISubscriptionPlan[] }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate occasional network errors (5% chance)
        if (Math.random() < 0.05) {
          reject(new Error("Network error occurred"));
        } else {
          resolve({ data: mockSubscriptionPlans });
        }
      }, 1200); // Simulate network delay
    });
  }
};

const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
}) => {
  const [plans, setPlans] = useState<ISubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      
      // Using mock API service instead of axios
      mockApiService
        .getSubscriptionPlans()
        .then((res) => {
          setPlans(res.data);
          setError(null);
        })
        .catch((err) => {
          console.error("Failed to load plans:", err);
          setError("Failed to load subscription plans. Please try again.");
          setPlans([]); // Clear any existing plans
        })
        .finally(() => setLoading(false));

      // Alternative: Direct mock data without API simulation
      // setTimeout(() => {
      //   setPlans(mockSubscriptionPlans);
      //   setLoading(false);
      // }, 1000);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDuration = (days: number) => {
    if (days === 30) return "Monthly";
    if (days === 365) return "Yearly";
    if (days === 7) return "Weekly";
    return `${days} days`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden" style={{ maxHeight: '90vh', animation: 'fadeIn 0.3s ease-out' }}>
        {/* Header with gradient */}
        <div className="px-8 py-6 text-white relative" style={{ background: 'linear-gradient(to right, #2563eb, #7c3aed)' }}>
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}></div>
          <div className="relative">
            <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
            <p className="text-lg" style={{ color: '#dbeafe' }}>Unlock premium features with our flexible subscription options</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-colors text-white text-xl font-light hover:bg-white hover:bg-opacity-30"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div 
                className="rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"
                style={{ 
                  animation: 'spin 1s linear infinite',
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderLeftColor: 'transparent'
                }}
              ></div>
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
              {plans.map((plan, index) => (
                <div
                  key={plan._id}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                    plan.recommended
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
                  {/* Recommended Badge */}
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
                    {/* Plan Header */}
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
                      <div 
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: 'rgb(239 246 255)', 
                          color: 'rgb(29 78 216)' 
                        }}
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {formatDuration(plan.durationInDays)}
                      </div>
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
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md ${
                        plan.recommended
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
          {/* <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            30-day money-back guarantee • Cancel anytime • Secure payment
          </div> */}
        </div>
      </div>

    </div>
  );
};

export default SubscriptionPlansModal;