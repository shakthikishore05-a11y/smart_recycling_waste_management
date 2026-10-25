import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Phone,
  Mail,
  Globe,
  Clock,
  ShieldCheck,
  ExternalLink,
  Filter
} from 'lucide-react';
import { apiRequest } from '../../api/client';

interface FacilityItem {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  accepted_materials: string[];
  is_verified: boolean;
  operating_hours?: string;
  notes?: string;
}

export const FacilitiesPage: React.FC = () => {
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [materialFilter, setMaterialFilter] = useState<string>('all');

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (materialFilter !== 'all') params.append('material', materialFilter);

      const data = await apiRequest<FacilityItem[]>(`/api/v1/facilities?${params.toString()}`);
      setFacilities(data);
    } catch (err) {
      console.error('Failed to load facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [materialFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFacilities();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Reclamation Directory
          </span>
          <span className="text-xs text-textSecondary">Verified Drop-off Centers</span>
        </div>
        <h2 className="text-2xl font-extrabold text-eco-900 tracking-tight">Recycling Facilities & Drop-off Centers</h2>
        <p className="text-xs text-textSecondary mt-0.5">
          Find authorized material recovery depots, e-waste collectors, and composting sites in your region.
        </p>
      </div>

      {/* Search and Material Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3EAE4] shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by center name, city, or postal code (e.g. Metropolis, 560001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E3EAE4] text-xs focus:ring-2 focus:ring-eco-600 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E3EAE4] text-xs bg-white focus:ring-2 focus:ring-eco-600 font-medium"
          >
            <option value="all">All Materials Accepted</option>
            <option value="plastic">Plastics</option>
            <option value="cardboard">Cardboard</option>
            <option value="glass">Glass Containers</option>
            <option value="metal">Metals / Aluminium</option>
            <option value="electronic">E-Waste & Batteries</option>
            <option value="organic">Organic / Compost</option>
            <option value="hazardous">Hazardous Household Waste</option>
          </select>

          <button
            onClick={fetchFacilities}
            className="px-4 py-2 rounded-xl bg-eco-700 text-white text-xs font-semibold hover:bg-eco-800 transition-colors"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Facility Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-[#E3EAE4] animate-pulse h-48" />
          ))}
        </div>
      ) : facilities.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-[#E3EAE4]">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-eco-900">No facilities found</h3>
          <p className="text-xs text-textSecondary mt-1">Try broadening your search term or selecting All Materials.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-white p-6 rounded-2xl border border-[#E3EAE4] shadow-sm hover:shadow-eco-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-eco-900">{fac.name}</h3>
                  {fac.is_verified && (
                    <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-1.5 text-xs text-textSecondary">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    {fac.address}, {fac.city}, {fac.state} - {fac.postal_code}
                  </span>
                </div>

                {fac.operating_hours && (
                  <div className="flex items-center gap-1.5 text-xs text-textSecondary">
                    <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{fac.operating_hours}</span>
                  </div>
                )}

                {fac.notes && (
                  <p className="text-[11px] text-gray-500 italic bg-surface-soft p-2.5 rounded-xl border border-surface-border">
                    {fac.notes}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100">
                {/* Material tags */}
                <div className="flex flex-wrap gap-1.5">
                  {fac.accepted_materials.map((mat, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-soft border border-surface-border text-eco-900 capitalize"
                    >
                      {mat}
                    </span>
                  ))}
                </div>

                {/* Contact links */}
                <div className="flex flex-wrap items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-3">
                    {fac.phone && (
                      <a href={`tel:${fac.phone}`} className="flex items-center gap-1 text-textSecondary hover:text-eco-900">
                        <Phone className="w-3 h-3 text-emerald-700" />
                        <span>{fac.phone}</span>
                      </a>
                    )}
                    {fac.email && (
                      <a href={`mailto:${fac.email}`} className="flex items-center gap-1 text-textSecondary hover:text-eco-900">
                        <Mail className="w-3 h-3 text-emerald-700" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${fac.name} ${fac.address} ${fac.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-eco-700 hover:underline font-semibold"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
