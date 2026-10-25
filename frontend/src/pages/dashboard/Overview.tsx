import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scan,
  Activity,
  Award,
  Scale,
  Sparkles,
  TreeDeciduous,
  Droplets,
  CloudRain,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  PieChart as PieIcon,
  Calendar,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface SummaryData {
  total_images_classified: number;
  total_recycling_activities: number;
  total_recycled_weight_kg: number;
  eco_points_balance: number;
  most_frequent_category: string;
  co2_saved_kg: number;
  trees_equivalent: number;
  water_saved_liters: number;
}

interface CategoryCount {
  category: string;
  count: number;
  percentage: number;
}

interface TrendItem {
  date: string;
  scans: number;
  activities: number;
  weight_kg: number;
}

const COLORS = ['#15803D', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'];

export const Overview: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [sumRes, catRes, trendRes, scanRes] = await Promise.all([
          apiRequest<SummaryData>('/api/v1/dashboard/summary'),
          apiRequest<CategoryCount[]>('/api/v1/dashboard/category-distribution'),
          apiRequest<TrendItem[]>('/api/v1/dashboard/activity-trend'),
          apiRequest<any>('/api/v1/scans?limit=5'),
        ]);
        setSummary(sumRes);
        setCategories(catRes);
        setTrends(trendRes);
        setRecentScans(scanRes.items || []);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-eco-800 via-eco-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-eco-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {user?.full_name}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Your Environmental Dashboard</h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl leading-relaxed">
            Every scanned item and recorded activity helps divert valuable materials from landfills into verified
            reclamation cycles.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <Link
            to="/dashboard/scanner"
            className="px-5 py-3 rounded-xl bg-white text-eco-900 font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition-all flex items-center gap-2"
          >
            <Scan className="w-4 h-4 text-eco-700" />
            <span>Scan New Item</span>
          </Link>
          <Link
            to="/dashboard/activities"
            className="px-5 py-3 rounded-xl bg-emerald-600/60 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm border border-emerald-400/30 transition-all flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            <span>Log Activity</span>
          </Link>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scans Metric */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3EAE4] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Images Classified</span>
            <p className="text-2xl font-black text-eco-900">{summary?.total_images_classified ?? 0}</p>
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-0.5">
              Top: {summary?.most_frequent_category || 'N/A'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Scan className="w-6 h-6" />
          </div>
        </div>

        {/* Recycling Activities */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3EAE4] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Recycling Activities</span>
            <p className="text-2xl font-black text-eco-900">{summary?.total_recycling_activities ?? 0}</p>
            <span className="text-[11px] text-emerald-700 font-medium">Self-Reported Logs</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Recycled Weight */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3EAE4] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Estimated Weight</span>
            <p className="text-2xl font-black text-eco-900">{summary?.total_recycled_weight_kg ?? 0} <span className="text-sm font-bold text-gray-500">kg</span></p>
            <span className="text-[11px] text-emerald-700 font-medium">Diverted from Landfill</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        {/* Eco Points */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3EAE4] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Eco-Points Balance</span>
            <p className="text-2xl font-black text-eco-900">{summary?.eco_points_balance ?? 0}</p>
            <Link to="/dashboard/challenges" className="text-[11px] text-emerald-700 font-semibold hover:underline flex items-center gap-0.5">
              View Challenges <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Environmental Impact Cards */}
      <div className="bg-white p-6 rounded-2xl border border-[#E3EAE4] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-eco-900">Estimated Environmental Impact</h3>
            <p className="text-xs text-textSecondary">Calculated from your self-reported recycling activities</p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            LCA Conversion Standards
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-eco-900">{summary?.co2_saved_kg ?? 0} kg</p>
              <p className="text-xs text-textSecondary">CO2 Emissions Avoided</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <TreeDeciduous className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-eco-900">{summary?.trees_equivalent ?? 0}</p>
              <p className="text-xs text-textSecondary">Equivalent Trees Preserved</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-eco-900">{summary?.water_saved_liters ?? 0} L</p>
              <p className="text-xs text-textSecondary">Freshwater Conserved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Trend Bar Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E3EAE4] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-eco-900">7-Day Activity & Scan Trend</h3>
              </div>
              <span className="text-[11px] text-textSecondary">Past 7 Days</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#66756B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#66756B' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E3EAE4',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="scans" name="AI Scans" fill="#15803D" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="activities" name="Recycling Logs" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E3EAE4] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <PieIcon className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-eco-900">Waste Material Distribution</h3>
            </div>

            {categories.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                <Layers className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-xs font-semibold text-textSecondary">No scans recorded yet</p>
                <Link to="/dashboard/scanner" className="text-xs text-eco-700 font-bold hover:underline mt-1">
                  Perform your first scan
                </Link>
              </div>
            ) : (
              <div className="h-64 w-full flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E3EAE4',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-white rounded-2xl border border-[#E3EAE4] shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-eco-900">Recent Waste Scans</h3>
            <p className="text-xs text-textSecondary">Recently classified items from your account</p>
          </div>
          <Link
            to="/dashboard/history"
            className="text-xs font-semibold text-eco-700 hover:text-eco-900 flex items-center gap-1"
          >
            <span>View All Scans</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentScans.length === 0 ? (
          <div className="text-center py-10 bg-surface-soft rounded-xl border border-surface-border">
            <Scan className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-eco-900">No scans in your history yet</p>
            <p className="text-[11px] text-textSecondary mt-0.5">Upload a waste photo to see AI predictions and instructions.</p>
            <Link
              to="/dashboard/scanner"
              className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-eco-700 text-white text-xs font-semibold"
            >
              Scan Your First Item
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft border-y border-[#E3EAE4] text-textSecondary font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Item Preview</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-surface-soft/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={scan.image_path}
                          alt={scan.display_name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#E3EAE4]"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="font-semibold text-eco-900 truncate max-w-[120px]">
                          {scan.display_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md font-medium text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {scan.predicted_category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-eco-900">{(scan.confidence * 100).toFixed(1)}%</span>
                    </td>
                    <td className="py-3 px-3">
                      {scan.is_confident ? (
                        <span className="text-emerald-700 font-medium">Confident</span>
                      ) : (
                        <span className="text-amber-700 font-medium">Uncertain</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-textSecondary">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to="/dashboard/history"
                        className="text-xs font-semibold text-eco-700 hover:underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
