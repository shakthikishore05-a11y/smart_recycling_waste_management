import React from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Award,
  Calendar,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-eco-900 tracking-tight">My Profile</h2>
        <p className="text-xs text-textSecondary mt-0.5">Manage your personal account credentials and sustainability standing.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-[#E3EAE4] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-gray-100 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-eco-700 to-emerald-500 text-white flex items-center justify-center font-extrabold text-3xl shadow-eco-md">
            {user?.full_name?.charAt(0) || 'U'}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-bold text-eco-900">{user?.full_name}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-textSecondary">{user?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-textSecondary">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '2026'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-center shrink-0">
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-0.5">
              Eco-Points Balance
            </span>
            <span className="text-2xl font-black text-emerald-700">{user?.eco_points}</span>
          </div>
        </div>

        {/* Security & Authentication Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-eco-900 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-700" />
            Security & Session
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-surface-soft border border-surface-border">
              <span className="text-textSecondary block">Authentication Method:</span>
              <strong className="text-eco-900">Encrypted JWT Bearer Session</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-soft border border-surface-border">
              <span className="text-textSecondary block">Password Security:</span>
              <strong className="text-eco-900">Bcrypt Salted & Hashed (Zero Plaintext)</strong>
            </div>
          </div>
        </div>

        {/* Environmental Commitment Notice */}
        <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 flex items-start gap-3 text-xs text-teal-950">
          <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your account is actively contributing to municipal waste reduction goals. All logged recycling events
            help compile accurate academic lifecycle assessments.
          </p>
        </div>
      </div>
    </div>
  );
};
