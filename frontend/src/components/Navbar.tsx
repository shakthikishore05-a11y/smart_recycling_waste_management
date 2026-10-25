import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Recycle, Sparkles, Menu, X, ArrowRight, UserCircle, LogOut, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Recycling Guide', path: '/guide' },
    { label: 'About', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-[#E3EAE4] bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-eco-600 to-eco-800 flex items-center justify-center text-white shadow-eco-md group-hover:scale-105 transition-transform duration-200">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-eco-900 tracking-tight flex items-center gap-1.5">
                Smart Recycling
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-eco-100 text-eco-800 border border-eco-200">
                  AI
                </span>
              </span>
              <p className="text-[11px] text-textSecondary hidden sm:block">Intelligent Waste Segregation</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-eco-800 bg-eco-50 font-semibold'
                    : 'text-textSecondary hover:text-eco-900 hover:bg-surface-soft'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                {/* Eco Points Pill */}
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>{user.eco_points} pts</span>
                </div>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-eco-700 hover:bg-eco-800 text-white text-sm font-semibold shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-lg text-textSecondary hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-eco-900 hover:bg-surface-soft transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-eco-700 hover:bg-eco-800 text-white text-sm font-semibold shadow-sm transition-all hover:shadow-eco-md"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-textSecondary hover:text-eco-900 hover:bg-surface-soft"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E3EAE4] bg-white px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.path)
                  ? 'text-eco-800 bg-eco-50 font-semibold'
                  : 'text-textSecondary hover:text-eco-900 hover:bg-surface-soft'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-lg bg-eco-700 text-white font-semibold"
                >
                  Open Dashboard ({user?.eco_points} pts)
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center px-4 py-2 rounded-lg border border-red-200 text-red-600 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-lg border border-[#E3EAE4] text-eco-900 font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-lg bg-eco-700 text-white font-semibold"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
