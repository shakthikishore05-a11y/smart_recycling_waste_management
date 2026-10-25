import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Recycle, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }
    try {
      setSubmitting(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF7]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-eco-700 flex items-center justify-center text-white mx-auto shadow-eco-md">
              <Recycle className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-eco-900 tracking-tight">Welcome Back</h1>
            <p className="text-xs text-textSecondary">Sign in to your Smart Recycling account</p>
          </div>

          {/* Quick Fill Credentials Banner for academic demo convenience */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
            <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Quick Fill Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('user@smartrecycling.org', 'User@123456')}
                className="px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-900 font-semibold hover:bg-emerald-100/50 text-left transition-colors"
              >
                <div>Demo User</div>
                <div className="text-[10px] text-textSecondary font-normal">user@smartrecycling.org</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@smartrecycling.org', 'Admin@123456')}
                className="px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-900 font-semibold hover:bg-emerald-100/50 text-left transition-colors"
              >
                <div>Demo Admin</div>
                <div className="text-[10px] text-textSecondary font-normal">admin@smartrecycling.org</div>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3EAE4] shadow-sm space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-eco-900 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E3EAE4] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-eco-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-eco-900">Password</label>
                  <Link to="/forgot-password" className="text-xs text-eco-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E3EAE4] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-eco-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-eco-700 hover:bg-eco-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
              >
                <span>{submitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-textSecondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-eco-700 hover:underline">
              Create an account (+100 Eco-Points)
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};
