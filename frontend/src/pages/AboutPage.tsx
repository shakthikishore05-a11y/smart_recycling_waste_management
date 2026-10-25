import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Cpu,
  Database,
  Recycle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Code2
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF7]">
      <Navbar />

      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Academic & Engineering Specifications
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-eco-900 tracking-tight">
              About the Smart Recycling Platform
            </h1>
            <p className="text-sm text-textSecondary max-w-2xl mx-auto leading-relaxed">
              An intelligent, software-only waste management and material classification system designed
              for final-year computer engineering evaluation.
            </p>
          </div>

          {/* Problem Statement & Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E3EAE4] space-y-3 shadow-sm">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">The Problem</span>
              <h2 className="text-lg font-bold text-eco-900">Waste Misclassification & Contamination</h2>
              <p className="text-xs text-textSecondary leading-relaxed">
                Municipal recycling facilities report contamination rates exceeding 25% due to 'wishcycling'
                (placing non-recyclable items into recycling streams) and improper material preparation (unrinsed food containers,
                greasy cardboard, battery fire hazards). Traditional educational brochures are static and fail to guide citizens
                at the immediate point of disposal.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E3EAE4] space-y-3 shadow-sm">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">The Proposed Solution</span>
              <h2 className="text-lg font-bold text-eco-900">AI-Assisted Guidance at Zero Hardware Cost</h2>
              <p className="text-xs text-textSecondary leading-relaxed">
                A browser-accessible software platform leveraging computer vision and probabilistic machine learning.
                Citizens upload waste photos, receive immediate classification, check confidence scores, follow customized
                preparation checklists, locate verified reclamation centers, and log self-reported environmental impact.
              </p>
            </div>
          </div>

          {/* Architecture Overview */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3EAE4] shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-eco-900 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-700" />
              Software Architecture & Tech Stack
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-surface-soft p-4 rounded-xl border border-surface-border space-y-2">
                <span className="font-bold text-eco-900 block text-sm">Frontend</span>
                <p className="text-textSecondary">React 18 + TypeScript + Vite</p>
                <p className="text-textSecondary">Tailwind CSS (Environmental SaaS tokens)</p>
                <p className="text-textSecondary">Recharts data visualization</p>
                <p className="text-textSecondary">Lucide React iconography</p>
              </div>

              <div className="bg-surface-soft p-4 rounded-xl border border-surface-border space-y-2">
                <span className="font-bold text-eco-900 block text-sm">Backend API</span>
                <p className="text-textSecondary">Python 3.10 + FastAPI</p>
                <p className="text-textSecondary">Uvicorn ASGI server</p>
                <p className="text-textSecondary">Pydantic request & response validation</p>
                <p className="text-textSecondary">SQLAlchemy 2.0 ORM</p>
              </div>

              <div className="bg-surface-soft p-4 rounded-xl border border-surface-border space-y-2">
                <span className="font-bold text-eco-900 block text-sm">AI / Machine Learning</span>
                <p className="text-textSecondary">Computer Vision Feature Extractor</p>
                <p className="text-textSecondary">TrashNet Academic Benchmark (6 Classes)</p>
                <p className="text-textSecondary">Multi-Layer Perceptron / MobileNetV3</p>
                <p className="text-textSecondary">Calibrated Softmax & Uncertainty Flag</p>
              </div>
            </div>
          </div>

          {/* Honest Academic Constraints & Limitations */}
          <div className="bg-surface-soft p-6 sm:p-8 rounded-2xl border border-surface-border space-y-4">
            <h2 className="text-lg font-bold text-eco-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Project Scope, Assumptions & Limitations
            </h2>

            <div className="space-y-3 text-xs text-textSecondary leading-relaxed">
              <p>
                <strong className="text-eco-900">Software-Only Scope:</strong> This system purposefully eliminates all physical hardware,
                IoT sensors, microcontrollers, and automated bins to ensure that any school, university, or municipal department
                can deploy and run the system without expensive hardware capital expenditure.
              </p>
              <p>
                <strong className="text-eco-900">Model Coverage:</strong> Current automated image inference covers the six standard
                TrashNet academic classes: <em>cardboard, glass, metal, paper, plastic, and general trash</em>. Other categories such as
                Hazardous Chemicals, E-waste, and Organic Composting are comprehensive knowledge-base guides rather than forced model predictions.
              </p>
              <p>
                <strong className="text-eco-900">Self-Reported Verification:</strong> Environmental impact figures (CO2, water, trees)
                are calculated using published life-cycle assessment coefficients based on self-reported user weight entries,
                and are clearly presented as educational estimations.
              </p>
            </div>
          </div>

          {/* Future Enhancements */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3EAE4] space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-eco-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-700" />
              Future Roadmap & Extensions
            </h2>
            <ul className="space-y-2 text-xs text-textSecondary">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Expansion to 15+ sub-categories including specific resin polymer identification via barcode/OCR extraction.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Integration with municipal open-data APIs for real-time pickup schedule alerts by postal code.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Edge inference deployment via ONNX Runtime Web for fully client-side offline classification.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
