import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Scale,
  Award,
  Calendar,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface ActivityItem {
  id: number;
  category: string;
  material_type: string;
  weight_kg: number;
  activity_date: string;
  disposal_method: string;
  notes?: string;
  points_earned: number;
  created_at: string;
}

export const RecyclingActivities: React.FC = () => {
  const { refreshUser } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal create/edit state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formCategory, setFormCategory] = useState<string>('Plastic');
  const [formMaterial, setFormMaterial] = useState<string>('');
  const [formWeight, setFormWeight] = useState<string>('1.0');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formMethod, setFormMethod] = useState<string>('Curbside Recycling Bin');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Delete modal
  const [activityToDelete, setActivityToDelete] = useState<ActivityItem | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/v1/activities');
      setActivities(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormCategory('Plastic');
    setFormMaterial('');
    setFormWeight('1.0');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMethod('Curbside Recycling Bin');
    setFormNotes('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (act: ActivityItem) => {
    setEditingId(act.id);
    setFormCategory(act.category);
    setFormMaterial(act.material_type);
    setFormWeight(act.weight_kg.toString());
    setFormDate(act.activity_date);
    setFormMethod(act.disposal_method);
    setFormNotes(act.notes || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const weightNum = parseFloat(formWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setFormError('Please enter a valid weight in kilograms (greater than 0).');
      return;
    }
    if (!formMaterial.trim()) {
      setFormError('Please specify the material type (e.g. HDPE Milk Jugs, Delivery Boxes).');
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await apiRequest(`/api/v1/activities/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            category: formCategory,
            material_type: formMaterial.trim(),
            weight_kg: weightNum,
            activity_date: formDate,
            disposal_method: formMethod,
            notes: formNotes.trim() || undefined,
          }),
        });
      } else {
        await apiRequest('/api/v1/activities', {
          method: 'POST',
          body: JSON.stringify({
            category: formCategory,
            material_type: formMaterial.trim(),
            weight_kg: weightNum,
            activity_date: formDate,
            disposal_method: formMethod,
            notes: formNotes.trim() || undefined,
          }),
        });
      }
      setModalOpen(false);
      fetchActivities();
      refreshUser();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save activity log.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!activityToDelete) return;
    try {
      await apiRequest(`/api/v1/activities/${activityToDelete.id}`, { method: 'DELETE' });
      setActivityToDelete(null);
      fetchActivities();
      refreshUser();
    } catch (err) {
      console.error('Failed to delete activity:', err);
    }
  };

  const totalWeight = activities.reduce((acc, a) => acc + a.weight_kg, 0);
  const totalPoints = activities.reduce((acc, a) => acc + a.points_earned, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-eco-900 tracking-tight">Recycling Activities</h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Log self-reported material recycling events and earn validated server-calculated eco-points.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-eco-700 hover:bg-eco-800 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Activity</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E3EAE4] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-textSecondary uppercase">Total Activities</span>
            <p className="text-xl font-black text-eco-900">{total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E3EAE4] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-textSecondary uppercase">Self-Reported Weight</span>
            <p className="text-xl font-black text-eco-900">{totalWeight.toFixed(2)} <span className="text-xs font-bold text-gray-500">kg</span></p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E3EAE4] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-textSecondary uppercase">Activity Points Earned</span>
            <p className="text-xl font-black text-eco-900">+{totalPoints} <span className="text-xs font-bold text-gray-500">pts</span></p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="bg-white rounded-2xl border border-[#E3EAE4] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-textSecondary animate-pulse">
            Loading activity log...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-eco-900">No recycling activities recorded yet</h3>
            <p className="text-xs text-textSecondary mt-1">Record your first recycling log to earn eco-points!</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 rounded-xl bg-eco-700 text-white text-xs font-semibold"
            >
              Record First Activity
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft border-b border-[#E3EAE4] text-textSecondary font-semibold">
                <tr>
                  <th className="py-3 px-4">Material / Category</th>
                  <th className="py-3 px-4">Weight (kg)</th>
                  <th className="py-3 px-4">Disposal Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-surface-soft/60 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-eco-900">{act.category}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-textSecondary">{act.material_type}</span>
                        </div>
                        {act.notes && <p className="text-[11px] text-gray-500 italic mt-0.5">{act.notes}</p>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-eco-900">{act.weight_kg} kg</span>
                    </td>
                    <td className="py-3 px-4 text-textSecondary">{act.disposal_method}</td>
                    <td className="py-3 px-4 text-textSecondary">{act.activity_date}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Award className="w-3 h-3" />
                        +{act.points_earned}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(act)}
                        className="p-1.5 rounded-lg text-textSecondary hover:text-eco-900 hover:bg-surface-soft"
                        title="Edit record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setActivityToDelete(act)}
                        className="p-1.5 rounded-lg text-textSecondary hover:text-red-600 hover:bg-red-50"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Activity Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E3EAE4] shadow-eco-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-eco-900">
                {editingId ? 'Edit Recycling Activity' : 'Record Recycling Activity'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-eco-900 mb-1">Waste Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4] bg-white focus:ring-2 focus:ring-eco-600"
                  >
                    <option value="Plastic">Plastic</option>
                    <option value="Paper">Paper</option>
                    <option value="Cardboard">Cardboard</option>
                    <option value="Glass">Glass</option>
                    <option value="Metal">Metal</option>
                    <option value="Organic">Organic Waste</option>
                    <option value="Electronic">Electronic Waste</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-eco-900 mb-1">Estimated Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1000"
                    required
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4] focus:ring-2 focus:ring-eco-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-eco-900 mb-1">Material Details</label>
                <input
                  type="text"
                  placeholder="e.g. 5 PET soda bottles, detergent jugs"
                  required
                  value={formMaterial}
                  onChange={(e) => setFormMaterial(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4] focus:ring-2 focus:ring-eco-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-eco-900 mb-1">Activity Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4] focus:ring-2 focus:ring-eco-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-eco-900 mb-1">Disposal Method</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4] bg-white focus:ring-2 focus:ring-eco-600"
                  >
                    <option value="Curbside Recycling Bin">Curbside Blue Bin</option>
                    <option value="Community Drop-off Depot">Community Depot</option>
                    <option value="Facility Reclamation Center">Reclamation Center</option>
                    <option value="Home Compost Bin">Home Composting</option>
                    <option value="Retailer Takeback Kiosk">Retailer Drop Kiosk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-eco-900 mb-1">Optional Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Rinsed and crushed to save bin space"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4] focus:ring-2 focus:ring-eco-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E3EAE4] font-semibold text-gray-700 hover:bg-surface-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-eco-700 hover:bg-eco-800 text-white font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Activity' : 'Record Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activityToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#E3EAE4] shadow-eco-lg space-y-4">
            <h3 className="font-extrabold text-base text-eco-900">Delete Activity Log</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Are you sure you want to delete this {activityToDelete.weight_kg} kg {activityToDelete.category} log?
              Earned points (+{activityToDelete.points_earned}) will be deducted accordingly.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setActivityToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#E3EAE4] text-xs font-semibold text-gray-700 hover:bg-surface-soft"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
