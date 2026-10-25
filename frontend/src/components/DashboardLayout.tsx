import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Scan,
  History,
  Activity,
  BookOpen,
  MapPin,
  Trophy,
  Bot,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Recycle,
  Sparkles,
  ChevronRight,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Waste Scanner', path: '/dashboard/scanner', icon: Scan, highlight: true },
    { label: 'My Waste History', path: '/dashboard/history', icon: History },
    { label: 'Recycling Activities', path: '/dashboard/activities', icon: Activity },
    { label: 'Recycling Guide', path: '/dashboard/guide', icon: BookOpen },
    { label: 'Recycling Centers', path: '/dashboard/facilities', icon: MapPin },
    { label: 'Eco Challenges', path: '/dashboard/challenges', icon: Trophy },
    { label: 'AI Assistant', path: '/dashboard/assistant', icon: Bot },
    { label: 'My Profile', path: '/dashboard/profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Hub', path: '/dashboard/admin', icon: Shield, highlight: false });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7FAF7] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-[#E3EAE4] fixed inset-y-0 z-30">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#E3EAE4]">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-eco-700 flex items-center justify-center text-white shadow-sm">
              <Recycle className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base text-eco-900 tracking-tight">Smart Recycling</span>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-[#E3EAE4]">
          <div className="bg-surface-soft p-3 rounded-xl border border-surface-border flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-eco-100 border border-eco-200 text-eco-800 flex items-center justify-center font-bold text-sm shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-eco-900 truncate">{user?.full_name}</p>
                <p className="text-[10px] text-textSecondary truncate">{user?.email}</p>
              </div>
            </div>
            <div className="shrink-0 flex items-center space-x-1 px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              <Award className="w-3 h-3 text-emerald-700" />
              <span>{user?.eco_points} pts</span>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-eco-700 text-white font-semibold shadow-eco-sm'
                    : item.highlight
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold'
                    : 'text-textSecondary hover:text-eco-900 hover:bg-surface-soft'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : item.highlight ? 'text-emerald-700' : 'text-textSecondary'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && !active && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-200/60 text-emerald-900">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[#E3EAE4] space-y-1">
          <Link
            to="/"
            className="flex items-center space-x-3 px-3.5 py-2 rounded-lg text-xs font-medium text-textSecondary hover:text-eco-900 hover:bg-surface-soft transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Public Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-72 bg-white flex flex-col h-full border-r border-[#E3EAE4] z-10">
            <div className="h-16 px-6 flex items-center justify-between border-b border-[#E3EAE4]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-eco-700 flex items-center justify-center text-white">
                  <Recycle className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base text-eco-900">Smart Recycling</span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded text-gray-500 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                      active ? 'bg-eco-700 text-white font-semibold' : 'text-textSecondary hover:bg-surface-soft'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-[#E3EAE4]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#E3EAE4] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-textSecondary hover:bg-surface-soft"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-eco-900 capitalize">
              {location.pathname.replace('/dashboard', '').replace('/', '') || 'Overview'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/dashboard/scanner"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-eco-700 hover:bg-eco-800 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Scan className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scan Item</span>
            </Link>
            <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {user?.eco_points} Eco-Points
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
