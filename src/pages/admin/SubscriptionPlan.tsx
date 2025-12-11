import React, { useCallback, useEffect, useState } from "react";
import { IPlan } from "../../util/interface/ISubscriptionPlan";
import { subscriptionPlanService } from "../../services/subscriptionPlanService";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "../../components/deleteConfirmationModel";
import { DeleteConfirmationTypes } from "../../util/interface/IDeleteModelType";
import { useDebounce } from "../../hooks/useDebounce";
import { Search, Plus } from "lucide-react";

export default function AdminSubscriptionPlans() {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteModel, setOpenDeleteModel] = useState(false)
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<IPlan | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string>('');
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());


  const [form, setForm] = useState<IPlan>({
    name: "",
    price: null,
    durationInDays: 30,
    features: [],
  });

  const [featureInput, setFeatureInput] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await subscriptionPlanService.getSubscriptionPlan(debouncedSearchTerm);
      setPlans(response);
    } catch (err) {
      toast.error(`${err}` || "Failed to fetch subscription");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (isModalOpen) {
      if (editingPlan) {
        setForm({
          name: editingPlan.name,
          price: editingPlan.price,
          durationInDays: editingPlan.durationInDays,
          features: [...editingPlan.features],
        });
      } else {
        setForm({
          name: "",
          price: 0,
          durationInDays: 30,
          features: [],
        });
      }
      setMessage("");
      setFeatureInput("");
    }
  }, [editingPlan, isModalOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === "price" || name === "durationInDays"
          ? value === "" ? null : Number(value)
          : value,
    });
  };

  const addFeature = () => {
    if (featureInput.trim() === "") return;
    setForm({ ...form, features: [...form.features, featureInput.trim()] });
    setFeatureInput("");
  };

  const removeFeature = (index: number) => {
    setForm({
      ...form,
      features: form.features.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!form.name.trim() || form.price === null || form.price <= 0 || form.durationInDays === null || form.durationInDays <= 0) {
      setMessage("Please fill in all required fields with valid values");
      return;
    }

    if (form.features.length === 0) {
      setMessage("Please add at least one feature");
      return;
    }

    setFormLoading(true);


    try {

      let savedPlan: IPlan = {
        name: form.name.trim(),
        price: form.price,
        durationInDays: form.durationInDays,
        features: [...form.features],
      };

      if (editingPlan) {
        savedPlan = {
          ...savedPlan,
          id: editingPlan.id
        }
        await subscriptionPlanService.updateSubscriptionPlan(savedPlan);
        fetchPlans()
        setPlans(prev => prev.map(p => p.id === savedPlan.id ? savedPlan : p));
      } else {
        await subscriptionPlanService.createSubscriptionPlan(savedPlan);
        fetchPlans()
        setPlans(prev => [savedPlan, ...prev]);
      }

      toast.success(`Plan ${editingPlan ? 'updated' : 'added'} successfully!`);


    } catch (error) {
      toast.error(`Failed to ${editingPlan ? 'update' : 'add'} plan: ${error}`);
    } finally {
      setFormLoading(false);
      closeModal()
    }
  };

  const toggleFeatures = (planId: string) => {
    setExpandedPlans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  };


  const handleDeleteCancel = () => {
    setOpenDeleteModel(false);
    setDeletePlanId('')
  };

  const openAddModal = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: IPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setMessage("");
    setFeatureInput("");
  };

  const deletePlan = async () => {
    try {
      await subscriptionPlanService.deleteSubscriptionPlan(deletePlanId)
      setPlans(plans.filter((p) => p.id !== deletePlanId));
      toast.success("Plan deleted successfully!");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to delete plan");
      } else {
        toast.error(String(err) || "Failed to delete plan");
      }
    } finally {
      setOpenDeleteModel(false)
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return (
    // Main Container: dark:bg-gray-700
    <div className="min-h-screen bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Subscription Plans
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
              Manage your subscription plans and pricing
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add New Plan
          </button>
        </div>
      </div>

      {/* Main Content Card - dark:bg-gray-800 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-600/50 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                All Plans
            </h2>
            <span className="text-sm px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full font-medium">
                {plans.length}
            </span>
          </div>
          
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plans..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="ml-3 text-gray-500 dark:text-gray-400 font-medium">Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
              {searchTerm ? "No plans match your search." : "No subscription plans available."}
            </p>
            {searchTerm ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Try different keywords or clear your search.</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Create your first plan by clicking "Add New Plan".</p>
            )}          
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Features</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {plan.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {plan.updatedAt && plan.updatedAt !== plan.createdAt
                          ? `Updated: ${new Date(plan.updatedAt ?? "").toLocaleDateString()}`
                          : `Created: ${new Date(plan.createdAt ?? "").toLocaleDateString()}`}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-white font-semibold">
                        ₹{plan.price !== null && plan.price.toLocaleString()}
                      </div>
                      {plan.durationInDays !== null && plan.durationInDays >= 365 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mt-1">
                          Annual Plan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 dark:text-white">{plan.durationInDays}</span>
                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                          {plan.durationInDays === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      {plan.durationInDays !== null && plan.durationInDays >= 365 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          (~{Math.round(plan.durationInDays / 365)} year{plan.durationInDays >= 730 ? 's' : ''})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1.5">
                          {(expandedPlans.has(plan.id!) ? plan.features : plan.features.slice(0, 3)).map((f, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-green-500 dark:text-green-400 mr-2 mt-0.5 text-xs">✓</span>
                              <span className="flex-1 leading-tight">{f}</span>
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li 
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 ml-5 cursor-pointer font-medium mt-1" 
                                onClick={() => toggleFeatures(plan.id!)}
                            >
                              {expandedPlans.has(plan.id!) ? 'Show less' : `+${plan.features.length - 3} more`}
                            </li>
                          )}
                        </ul>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-3">
                        <button
                          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                          onClick={() => openEditModal(plan)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          onClick={() => {
                            setDeletePlanId(plan.id!)
                            setOpenDeleteModel(true)
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Overlay - dark mode supported */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-200">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingPlan ? 'Edit Subscription Plan' : 'Add New Plan'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {message && (
                <div className={`mb-5 p-3 rounded-lg text-sm font-medium border ${message.startsWith("✅")
                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30"
                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                  }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="e.g. Basic, Premium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price ?? ""}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="299"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Duration (Days) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="durationInDays"
                      value={form.durationInDays ?? ""}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="30"
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Features <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Add a feature..."
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      Add
                    </button>
                  </div>

                  {form.features.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {form.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 px-3 py-2 rounded-lg group"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-200">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 dark:text-gray-500 italic bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg text-center border border-dashed border-gray-200 dark:border-gray-700">
                        No features added yet.
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                  >
                    {formLoading ? "Saving..." : (editingPlan ? "Update Plan" : "Create Plan")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <DeleteConfirmationModal
        isOpen={openDeleteModel}
        onClose={handleDeleteCancel}
        onConfirm={deletePlan}
        itemType={DeleteConfirmationTypes.SUBSCRIPTION}
      />
    </div>
  );
}