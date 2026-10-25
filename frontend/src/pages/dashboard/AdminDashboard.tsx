import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Scan,
  Scale,
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  RefreshCw,
  X
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface AdminStats {
  total_users: number;
  total_scans: number;
  total_activities: number;
  total_weight_kg: number;
  total_facilities: number;
  feedback_corrections_submitted: number;
  model_architecture: string;
  model_status: string;
  dataset_standard: string;
}

interface AdminUserItem {
  id: number;
  email: string;
  full_name: string;
  role: string;
  eco_points: number;
  scans_count: number;
  activities_count: number;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New facility modal
  const [facilityModalOpen, setFacilityModalOpen] = useState<boolean>(false);
  const [facName, setFacName] = useState('');
  const [facAddress, setFacAddress] = useState('');
  const [facCity, setFacCity] = useState('');
  const [facState, setFacState] = useState('');
  const [facPostal, setFacPostal] = useState('');
  const [facMaterials, setFacMaterials] = useState('plastic, paper, cardboard, glass, metal');
  const [facHours, setFacHours] = useState('Mon-Sat: 08:00 AM - 05:00 PM');
  const [facNotes, setFacNotes] = useState('');
  const [creatingFac, setCreatingFac] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, scansData] = await Promise.all([
        apiRequest<AdminStats>('/api/v1/admin/stats'),
        apiRequest<AdminUserItem[]>('/api/v1/admin/users'),
        apiRequest<any[]>('/api/v1/admin/scans'),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setRecentScans(scansData);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingFac(true);
      const materialsArray = facMaterials.split(',').map((m) => m.trim().toLowerCase());
      await apiRequest('/api/v1/admin/facilities', {
        method: 'POST',
        body: JSON.stringify({
          name: facName,
          address: facAddress,
          city: facCity,
          state: facState,
          postal_code: facPostal,
          accepted_materials: materialsArray,
          operating_hours: facHours,
          notes: facNotes || undefined,
          is_verified: true,
        }),
      });
      setFacilityModalOpen(false);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to create facility:', err);
    } finally {
      setCreatingFac(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <h3 className="text-base font-bold text-red-900">Access Restricted</h3>
        <p className="text-xs text-textSecondary mt-1">Administrator privileges required to view this hub.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Admin Control Hub
            </span>
            <span className="text-xs text-textSecondary font-mono">Platform Governance</span>
          </div>
          <h2 className="text-2xl font-extrabold text-eco-900 tracking-tight">System Administration</h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Monitor system-wide activity, manage users, review model feedback, and update facility directories.
          </p>
        </div>

        <button
          onClick={() => setFacilityModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-eco-700 hover:bg-eco-800 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Verified Facility</span>
        </button>
      </div>

      {/* Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E3EAE4] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-textSecondary uppercase">Registered Users</span>
            <p className="text-2xl font-black text-eco-900">{stats?.total_users ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3EAE4] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-textSecondary uppercase">Total System Scans</span>
            <p className="text-2xl font-black text-eco-900">{stats?.total_scans ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Scan className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3EAE4] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-textSecondary uppercase">Total Diverted</span>
            <p className="text-2xl font-black text-eco-900">{stats?.total_weight_kg ?? 0} kg</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3EAE4] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-textSecondary uppercase">Reported Corrections</span>
            <p className="text-2xl font-black text-amber-700">{stats?.feedback_corrections_submitted ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Registered Users Table */}
      <div className="bg-white rounded-2xl border border-[#E3EAE4] shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-eco-900">User Accounts Directory</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-soft border-b border-[#E3EAE4] text-textSecondary font-semibold">
              <tr>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Eco-Points</th>
                <th className="py-2.5 px-3">Scans</th>
                <th className="py-2.5 px-3">Activities</th>
                <th className="py-2.5 px-3">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-soft/60 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-eco-900 block">{u.full_name}</span>
                    <span className="text-[11px] text-textSecondary">{u.email}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-extrabold text-eco-900">{u.eco_points}</td>
                  <td className="py-3 px-3">{u.scans_count}</td>
                  <td className="py-3 px-3">{u.activities_count}</td>
                  <td className="py-3 px-3 text-textSecondary">{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Facility Modal */}
      {facilityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E3EAE4] shadow-eco-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-eco-900">Add Verified Reclamation Center</h3>
              <button onClick={() => setFacilityModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFacility} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-eco-900 mb-1">Center Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex E-Waste Reclamation Depot"
                  value={facName}
                  onChange={(e) => setFacName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4] focus:ring-2 focus:ring-eco-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-eco-900 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12 Industrial Sector Road"
                  value={facAddress}
                  onChange={(e) => setFacAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4] focus:ring-2 focus:ring-eco-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-eco-900 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={facCity}
                    onChange={(e) => setFacCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-eco-900 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={facState}
                    onChange={(e) => setFacState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-eco-900 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={facPostal}
                    onChange={(e) => setFacPostal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-eco-900 mb-1">Accepted Materials (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={facMaterials}
                  onChange={(e) => setFacMaterials(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4]"
                />
              </div>

              <div>
                <label className="block font-semibold text-eco-900 mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={facHours}
                  onChange={(e) => setFacHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setFacilityModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E3EAE4] font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingFac}
                  className="px-5 py-2 rounded-xl bg-eco-700 text-white font-semibold disabled:opacity-50"
                >
                  {creatingFac ? 'Saving...' : 'Add Center'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
