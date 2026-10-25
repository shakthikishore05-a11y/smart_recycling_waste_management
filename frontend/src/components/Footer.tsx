import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, ShieldCheck, Heart, Github, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E3EAE4] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand and Description */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-eco-700 flex items-center justify-center text-white">
                <Recycle className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-eco-900 tracking-tight">Smart Recycling</span>
            </div>
            <p className="text-xs text-textSecondary leading-relaxed">
              An intelligent, software-powered recycling platform delivering real-time AI waste classification,
              tailored segregation guidance, and environmental impact tracking.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Software-Only Final Year Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-eco-900 mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs text-textSecondary">
              <li><Link to="/" className="hover:text-eco-800 transition-colors">Home</Link></li>
              <li><Link to="/how-it-works" className="hover:text-eco-800 transition-colors">How It Works</Link></li>
              <li><Link to="/guide" className="hover:text-eco-800 transition-colors">Recycling Guide</Link></li>
              <li><Link to="/about" className="hover:text-eco-800 transition-colors">About Project</Link></li>
              <li><Link to="/login" className="hover:text-eco-800 transition-colors">User Sign In</Link></li>
            </ul>
          </div>

          {/* Supported Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-eco-900 mb-3">Recycling Categories</h4>
            <ul className="space-y-2 text-xs text-textSecondary">
              <li><Link to="/guide" className="hover:text-eco-800 transition-colors">Plastic Polymers (#1-#7)</Link></li>
              <li><Link to="/guide" className="hover:text-eco-800 transition-colors">Paper & Fibres</Link></li>
              <li><Link to="/guide" className="hover:text-eco-800 transition-colors">Corrugated Cardboard</Link></li>
              <li><Link to="/guide" className="hover:text-eco-800 transition-colors">Inert Glass Containers</Link></li>
              <li><Link to="/guide" className="hover:text-eco-800 transition-colors">Aluminium & Steel Cans</Link></li>
              <li><Link to="/guide" className="hover:text-eco-800 transition-colors">Electronic & Hazardous Waste</Link></li>
            </ul>
          </div>

          {/* Academic Transparency */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-eco-900 mb-3">Academic Disclosure</h4>
            <p className="text-xs text-textSecondary leading-relaxed mb-3">
              Developed as a software-based engineering demonstration. AI models utilize the Stanford TrashNet academic
              dataset standards. No physical IoT hardware, sensors, or smart bins are required.
            </p>
            <div className="text-[11px] text-gray-500">
              API Server: <span className="text-emerald-700 font-mono font-medium">FastAPI + PyTorch/MLP</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E3EAE4] flex flex-col sm:flex-row items-center justify-between text-xs text-textSecondary space-y-3 sm:space-y-0">
          <p>© {new Date().getFullYear()} Smart Recycling Waste Management System. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> for Planet Earth
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
