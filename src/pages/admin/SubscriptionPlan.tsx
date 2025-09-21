import React, { useEffect, useState } from "react";
import { IPlan } from "../../util/interface/ISubscriptionPlan";
import { subscriptionPlanService } from "../../services/subscriptionPlanService";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "../../components/deleteConfirmationModel";
import { DeleteConfirmationTypes } from "../../util/interface/IDeleteModelType";


export default function AdminSubscriptionPlans() {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteModel, setOpenDeleteModel] = useState(false)

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

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await subscriptionPlanService.getSubscriptionPlan();
      setPlans(response);
    } catch (err) {
      toast.error(`${err}` || "Failed to fetch subscription");
    } finally {
      setLoading(false);
    }
  };

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
        console.log(savedPlan)
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
      toast.error("Failed to delete plan");
    } finally {
      setOpenDeleteModel(false)
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Subscription Plans
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your subscription plans and pricing
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <span>+</span>
            Add New Plan
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            All Plans
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Plans: {plans.length}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-500">Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-lg">No subscription plans available.</p>
            <p className="text-gray-400 text-sm mt-2">Create your first plan by clicking "Add New Plan".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Features</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan, index) => (
                  <tr
                    key={plan.id}
                    className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                      } border-t border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {plan.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {plan.updatedAt && plan.updatedAt !== plan.createdAt
                          ? `Updated: ${new Date(plan.updatedAt ?? "").toLocaleDateString()}`
                          : `Created: ${new Date(plan.createdAt ?? "").toLocaleDateString()}`}
                      </div>
                    </td>



                    <td className="px-4 py-3">
                      <div className="text-gray-800 dark:text-gray-200 font-semibold">
                        ₹{plan.price !== null && plan.price.toLocaleString()}
                      </div>
                      {plan.durationInDays !== null && plan.durationInDays >= 365 && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Annual Plan
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      <div className="flex items-center">
                        <span className="font-medium">{plan.durationInDays}</span>
                        <span className="ml-1 text-sm text-gray-500">
                          {plan.durationInDays === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      {plan.durationInDays !== null && plan.durationInDays >= 365 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          (~{Math.round(plan.durationInDays / 365)} year{plan.durationInDays >= 730 ? 's' : ''})
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {(expandedPlans.has(plan.id!) ? plan.features : plan.features.slice(0, 3)).map((f, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-green-500 mr-2 mt-0.5">✓</span>
                              <span className="flex-1">{f}</span>
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-xs text-gray-500 dark:text-gray-400 ml-4 cursor-pointer" onClick={() => toggleFeatures(plan.id!)}>
                              {expandedPlans.has(plan.id!) ? 'Show less' : `+${plan.features.length - 3} more`}
                            </li>
                          )}
                        </ul>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-center space-x-2">
                        <button
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          onClick={() => openEditModal(plan)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {editingPlan ? 'Edit Subscription Plan' : 'Add New Subscription Plan'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${message.startsWith("✅")
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  }`}>
                  {message}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Basic, Premium, Enterprise"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price ?? ""}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="299"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (Days) *
                    </label>
                    <input
                      type="number"
                      name="durationInDays"
                      value={form.durationInDays ?? ""}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="30"
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Features *
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a feature and press Enter or click Add"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {form.features.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {form.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg"
                        >
                          <span className="text-sm text-gray-800 dark:text-gray-200">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={formLoading}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
                  >
                    {formLoading ? "Saving..." : (editingPlan ? "Update Plan" : "Add Plan")}
                  </button>
                </div>
              </div>
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