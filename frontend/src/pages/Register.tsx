import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Recycle, Lock, Mail, User, ArrowRight, AlertCircle, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await register(fullName, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
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
            <h1 className="text-2xl font-extrabold text-eco-900 tracking-tight">Create an Account</h1>
            <p className="text-xs text-textSecondary">Join the smart recycling community</p>
          </div>

          {/* Welcome Bonus Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center space-x-3 text-xs text-emerald-900">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <strong className="block font-semibold">100 Eco-Points Welcome Bonus!</strong>
              <span className="text-[11px] text-emerald-800">Earn extra points with every waste scan and verified recycling log.</span>
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
                <label className="block text-xs font-semibold text-eco-900 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E3EAE4] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-eco-600"
                  />
                </div>
              </div>

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
                <label className="block text-xs font-semibold text-eco-900 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E3EAE4] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-eco-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-eco-900 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E3EAE4] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-eco-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-eco-700 hover:bg-eco-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
              >
                <span>{submitting ? 'Creating Account...' : 'Register & Claim 100 Points'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-textSecondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-eco-700 hover:underline">
              Sign in instead
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};
