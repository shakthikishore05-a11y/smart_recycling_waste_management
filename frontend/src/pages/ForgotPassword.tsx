import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Mail, Lock, KeyRound, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../api/client';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      setLoading(true);
      const res = await apiRequest<{ message: string; reset_token?: string }>('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage(res.message);
      if (res.reset_token) {
        setToken(res.reset_token);
        setStep('reset');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      setLoading(true);
      const res = await apiRequest<{ message: string }>('/api/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      setMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF7]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-eco-700 flex items-center justify-center text-white mx-auto shadow-eco-md">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-eco-900 tracking-tight">Reset Password</h1>
            <p className="text-xs text-textSecondary">Regain access to your Smart Recycling account</p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3EAE4] shadow-sm space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {step === 'request' ? (
              <form onSubmit={handleRequestToken} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-eco-900 mb-1.5">Registered Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@smartrecycling.org"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E3EAE4] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-eco-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-eco-700 hover:bg-eco-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  <span>{loading ? 'Sending...' : 'Generate Password Reset Token'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-eco-900 mb-1.5">Reset Token</label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-[#E3EAE4] text-xs font-mono bg-surface-soft"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-eco-900 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E3EAE4] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-eco-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-eco-700 hover:bg-eco-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-textSecondary">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-eco-700 hover:underline">
              Return to login
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};
