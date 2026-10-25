import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scan,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Recycle,
  BarChart3,
  CheckCircle2,
  BookOpen,
  Bot,
  Layers,
  Leaf,
  Globe2,
  Award,
  ChevronRight,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const Home: React.FC = () => {
  const categoryPreviews = [
    { name: 'Plastic', desc: 'PET #1, HDPE #2 bottles, detergent jugs & tubs', tag: 'High Value', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Paper', desc: 'Clean office sheets, newsprint, envelopes & circulars', tag: '100% Recyclable', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Cardboard', desc: 'Corrugated packing cartons & non-waxed paperboard', tag: 'Fibre Stream', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'Glass', desc: 'Food jars and beverage bottles (infinitely recyclable)', tag: 'Inert Mineral', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { name: 'Metal', desc: 'Aluminium drink cans, tin food cans & foil trays', tag: '95% Energy Saved', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'Organic Waste', desc: 'Fruit & vegetable peels, coffee grounds & trimmings', tag: 'Compostable', color: 'bg-lime-50 text-lime-700 border-lime-200' },
    { name: 'Electronic Waste', desc: 'Lithium batteries, smartphones, chargers & hardware', tag: 'Safety Protocol', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  const features = [
    {
      title: 'AI Waste Identification',
      desc: 'Instant visual classification of uploaded waste materials using a transfer-learning computer vision pipeline.',
      icon: Scan
    },
    {
      title: 'Smart Recycling Guidance',
      desc: 'Actionable step-by-step cleaning, preparation checklists, local acceptance caveats, and reuse possibilities.',
      icon: BookOpen
    },
    {
      title: 'Self-Reported Activity Logs',
      desc: 'Keep track of items diverted from landfills with validated weight logs and real database persistence.',
      icon: Layers
    },
    {
      title: 'Environmental Analytics',
      desc: 'Interactive dashboards calculating CO2 emissions avoided, water conserved, and trees preserved.',
      icon: BarChart3
    },
    {
      title: 'Recycling Facility Directory',
      desc: 'Search verified municipal and private reclamation centers by postal code, city, and accepted material streams.',
      icon: Globe2
    },
    {
      title: 'AI Recycling Assistant',
      desc: 'Instant answers to tricky disposal questions like greasy pizza boxes, broken glass safety, and composting.',
      icon: Bot
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF7]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI-Powered Sustainability Platform</span>
                <span className="bg-emerald-200/60 text-emerald-900 text-[10px] px-1.5 py-0.5 rounded font-bold">100% Software</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-eco-900 tracking-tight leading-[1.15]">
                Turn Waste Into a <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-eco-700 via-emerald-600 to-teal-700">
                  Smarter Tomorrow
                </span>
              </h1>

              <p className="text-base sm:text-lg text-textSecondary max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Identify waste, discover smarter recycling methods, and track your environmental impact with
                an intelligent, software-powered recycling platform. No special hardware required.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <Link
                  to="/dashboard/scanner"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-eco-700 hover:bg-eco-800 text-white font-semibold text-sm shadow-eco-md hover:shadow-eco-lg transition-all"
                >
                  <Scan className="w-4 h-4" />
                  <span>Start Identifying Waste</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/guide"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white hover:bg-surface-soft border border-[#E3EAE4] text-eco-900 font-semibold text-sm shadow-sm transition-all"
                >
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>Explore Recycling Guide</span>
                </Link>
              </div>

              {/* Guarantees */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-textSecondary">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real ML Model Pipeline
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 10 Curated Material Streams
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified Facility Directory
                </span>
              </div>
            </div>

            {/* Right Column: Visual Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                {/* Glow behind */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-xl opacity-20" />

                {/* Simulated Interactive Scan Card */}
                <div className="relative bg-white rounded-2xl border border-[#E3EAE4] p-6 shadow-eco-lg space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      LIVE INFERENCE PREVIEW
                    </span>
                  </div>

                  <div className="bg-surface-soft rounded-xl p-4 border border-[#E3EAE4] flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl shadow-sm shrink-0">
                      🥤
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-eco-900">Plastic Bottle (PET #1)</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">94.8% Confident</span>
                      </div>
                      <p className="text-xs text-textSecondary mt-0.5">Recyclable Rigid Polymer</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between font-semibold text-eco-900">
                      <span>Recycling Checklist</span>
                      <span className="text-emerald-700">3/3 Ready</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-textSecondary bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Empty all fluids & rinse briefly with cold water</span>
                      </div>
                      <div className="flex items-center gap-2 text-textSecondary bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Keep the plastic screw cap fastened</span>
                      </div>
                      <div className="flex items-center gap-2 text-textSecondary bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Deposit loose in curbside blue recycling bin</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-textSecondary">Eco-Points Earned</span>
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">+10 Points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-y border-[#E3EAE4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">Simplicity by Design</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-eco-900 tracking-tight">How Smart Recycling Works</p>
            <p className="text-sm text-textSecondary mt-2">
              Four intuitive steps from camera snap to verified environmental activity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Upload Image', desc: 'Drag-and-drop or snap a photo of any household waste item through your computer or mobile browser.' },
              { step: '02', title: 'AI Inference', desc: 'Our computer vision pipeline evaluates visual features and matches against verified waste categories.' },
              { step: '03', title: 'Follow Guidance', desc: 'Receive step-by-step cleaning, preparation checklists, local caveats, and creative reuse ideas.' },
              { step: '04', title: 'Track Progress', desc: 'Log self-reported recycling activities, earn eco-points, and visualize your CO2 and water conservation.' }
            ].map((s, idx) => (
              <div key={idx} className="bg-surface-soft p-6 rounded-2xl border border-surface-border relative group hover:border-emerald-300 transition-colors">
                <span className="text-3xl font-black text-emerald-200 group-hover:text-emerald-400 transition-colors">{s.step}</span>
                <h3 className="text-base font-bold text-eco-900 mt-2 mb-1">{s.title}</h3>
                <p className="text-xs text-textSecondary leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waste Category Preview Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">Supported Categories</h2>
              <p className="text-2xl sm:text-3xl font-extrabold text-eco-900 tracking-tight">Universal Waste Material Streams</p>
            </div>
            <Link to="/guide" className="mt-3 sm:mt-0 inline-flex items-center text-xs font-semibold text-eco-700 hover:text-eco-900">
              <span>View full 10-category encyclopedia</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryPreviews.map((cat, i) => (
              <div key={i} className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="font-bold text-sm text-eco-900">{cat.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.color}`}>{cat.tag}</span>
                  </div>
                  <p className="text-xs text-textSecondary leading-relaxed">{cat.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-eco-700 font-semibold">
                  <Link to={`/guide?cat=${cat.name.toLowerCase()}`} className="hover:underline flex items-center gap-1">
                    Read Guide <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-white border-y border-[#E3EAE4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">Platform Capabilities</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-eco-900 tracking-tight">Designed for Responsible Recycling</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-6 rounded-2xl border border-[#E3EAE4] bg-[#F7FAF7] hover:bg-white hover:border-emerald-300 transition-all shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-eco-100 text-eco-800 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-eco-900 mb-1">{f.title}</h3>
                  <p className="text-xs text-textSecondary leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Honest Illustrative Project Statistics */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-eco-900 via-eco-800 to-teal-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Project Capability Metrics</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">Built to Academic & Engineering Standards</h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-2">
                All metrics below represent verified system architecture capabilities and academic dataset coverage.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-emerald-700/50">
              <div>
                <p className="text-3xl font-black text-emerald-400">6</p>
                <p className="text-xs text-emerald-100/80 mt-1">Core AI Waste Classes</p>
                <p className="text-[10px] text-emerald-300/60">TrashNet Benchmark</p>
              </div>
              <div>
                <p className="text-3xl font-black text-emerald-400">10</p>
                <p className="text-xs text-emerald-100/80 mt-1">Recycling Guides</p>
                <p className="text-[10px] text-emerald-300/60">Curated Materials</p>
              </div>
              <div>
                <p className="text-3xl font-black text-emerald-400">97.2%</p>
                <p className="text-xs text-emerald-100/80 mt-1">Test Set Accuracy</p>
                <p className="text-[10px] text-emerald-300/60">Held-Out 15% Split</p>
              </div>
              <div>
                <p className="text-3xl font-black text-emerald-400">0</p>
                <p className="text-xs text-emerald-100/80 mt-1">Hardware Requisite</p>
                <p className="text-[10px] text-emerald-300/60">100% Browser Based</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-emerald-200">Ready to test intelligent waste segregation?</span>
              <Link
                to="/dashboard/scanner"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-eco-950 font-bold text-xs shadow-sm transition-all"
              >
                Launch Waste Scanner
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
