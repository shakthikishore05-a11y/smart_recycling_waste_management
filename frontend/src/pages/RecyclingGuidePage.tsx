import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  Search,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  MapPin,
  Leaf,
  Filter
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { apiRequest } from '../api/client';

export interface GuideItem {
  id: number;
  category_key: string;
  title: string;
  short_description: string;
  common_examples: string[];
  disposal_method: string;
  preparation_steps: string[];
  reuse_ideas: string[];
  common_mistakes: string[];
  safety_precautions: string[];
  local_acceptance_notes: string;
  environmental_impact: string;
  icon_name: string;
}

export const RecyclingGuidePage: React.FC = () => {
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedGuideId, setExpandedGuideId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<GuideItem[]>('/api/v1/recycling-guides');
        setGuides(data);

        // Check if query param ?cat=plastic is passed
        const catParam = searchParams.get('cat');
        if (catParam) {
          const match = data.find((g) => g.category_key.toLowerCase() === catParam.toLowerCase());
          if (match) {
            setSelectedCategory(match.category_key);
            setExpandedGuideId(match.id);
          }
        } else if (data.length > 0) {
          setExpandedGuideId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load recycling guides:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, [searchParams]);

  const filteredGuides = guides.filter((g) => {
    const matchesCat = selectedCategory === 'all' || g.category_key === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.common_examples.some((ex) => ex.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const guideContent = (
    <div className={isDashboard ? "space-y-6" : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"}>
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Complete Material Encyclopedia
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-eco-900 tracking-tight mt-3 mb-3">
              Universal Waste & Recycling Guide
            </h1>
            <p className="text-sm text-textSecondary leading-relaxed">
              Explore segregation rules, preparation steps, safety warnings, and creative reuse possibilities
              across 10 material categories. Local municipal rules may vary.
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3EAE4] shadow-sm mb-8 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search materials (e.g. shampoo bottle, pizza box, batteries, aluminium, jar)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E3EAE4] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-eco-600 focus:border-transparent"
              />
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-eco-700 text-white font-semibold'
                    : 'bg-surface-soft text-textSecondary hover:text-eco-900'
                }`}
              >
                All Categories ({guides.length})
              </button>
              {guides.map((g) => (
                <button
                  key={g.category_key}
                  onClick={() => setSelectedCategory(g.category_key)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    selectedCategory === g.category_key
                      ? 'bg-eco-700 text-white font-semibold'
                      : 'bg-surface-soft text-textSecondary hover:text-eco-900'
                  }`}
                >
                  {g.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Guides List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-6 border border-[#E3EAE4] animate-pulse h-40" />
              ))}
            </div>
          ) : filteredGuides.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E3EAE4]">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-eco-900">No matching recycling guide found</p>
              <p className="text-xs text-textSecondary mt-1">Try searching with a different term or clear filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-eco-700 text-white text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredGuides.map((guide) => {
                const isExpanded = expandedGuideId === guide.id;
                return (
                  <div
                    key={guide.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isExpanded ? 'border-emerald-300 shadow-eco-md ring-1 ring-emerald-200' : 'border-[#E3EAE4] hover:border-gray-300'
                    }`}
                  >
                    {/* Collapsible Header */}
                    <div
                      onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                      className="p-5 sm:p-6 cursor-pointer flex items-center justify-between hover:bg-surface-soft/50 transition-colors"
                    >
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {guide.category_key}
                          </span>
                          <h2 className="text-base sm:text-lg font-bold text-eco-900">{guide.title}</h2>
                        </div>
                        <p className="text-xs text-textSecondary line-clamp-1">{guide.short_description}</p>
                      </div>

                      <button
                        className="p-2 rounded-xl bg-surface-soft text-textSecondary hover:text-eco-900"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Expanded Detail Body */}
                    {isExpanded && (
                      <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-gray-100 space-y-6 text-xs">
                        {/* Summary & Common Examples */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-surface-soft p-4 rounded-xl border border-surface-border">
                            <h4 className="font-bold text-eco-900 mb-2 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                              Common Items
                            </h4>
                            <ul className="space-y-1.5 text-textSecondary">
                              {guide.common_examples.map((ex, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                  <span>{ex}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-surface-soft p-4 rounded-xl border border-surface-border">
                            <h4 className="font-bold text-eco-900 mb-2 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              Recommended Disposal
                            </h4>
                            <p className="text-textSecondary leading-relaxed">{guide.disposal_method}</p>
                          </div>
                        </div>

                        {/* Preparation & Common Mistakes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                            <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Preparation Checklist
                            </h4>
                            <ul className="space-y-1.5 text-emerald-950/80">
                              {guide.preparation_steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-emerald-700 font-bold shrink-0">✓</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-red-50/40 p-4 rounded-xl border border-red-100">
                            <h4 className="font-bold text-red-900 mb-2 flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                              Common Mistakes ('Wishcycling')
                            </h4>
                            <ul className="space-y-1.5 text-red-950/80">
                              {guide.common_mistakes.map((mistake, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-red-600 font-bold shrink-0">✕</span>
                                  <span>{mistake}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Reuse & Safety */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100">
                            <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                              Creative Reuse & Upcycling
                            </h4>
                            <ul className="space-y-1.5 text-amber-950/80">
                              {guide.reuse_ideas.map((idea, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-amber-600 font-bold shrink-0">•</span>
                                  <span>{idea}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-orange-50/40 p-4 rounded-xl border border-orange-100">
                            <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
                              Safety Precautions
                            </h4>
                            <ul className="space-y-1.5 text-orange-950/80">
                              {guide.safety_precautions.map((safe, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-orange-600 font-bold shrink-0">⚠</span>
                                  <span>{safe}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Local Acceptance Caveat & Environmental Impact */}
                        <div className="bg-surface-soft p-4 rounded-xl border border-surface-border space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                            <p className="text-textSecondary">
                              <strong className="text-eco-900">Local Acceptance Caveat:</strong> {guide.local_acceptance_notes}
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <Leaf className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                            <p className="text-textSecondary">
                              <strong className="text-eco-900">Environmental Impact:</strong> {guide.environmental_impact}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
  );

  if (isDashboard) {
    return guideContent;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF7]">
      <Navbar />
      <main className="flex-1 py-12">
        {guideContent}
      </main>
      <Footer />
    </div>
  );
};
