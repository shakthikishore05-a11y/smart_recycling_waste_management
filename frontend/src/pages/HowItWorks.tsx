import React from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  Cpu,
  CheckCircle,
  AlertTriangle,
  History,
  Activity,
  BarChart2,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const HowItWorks: React.FC = () => {
  const workflowSteps = [
    {
      num: '01',
      title: 'Image Acquisition & Validation',
      desc: 'Users upload an image via drag-and-drop or file picker. The frontend verifies file format (JPEG, PNG, WebP) and checks size constraints (< 5MB). The backend performs binary verification to ensure safe image parsing.',
      icon: UploadCloud,
      badge: 'Client & Server Validation'
    },
    {
      num: '02',
      title: 'Feature Extraction & Preprocessing',
      desc: 'The image is normalized to standard resolution. The computer vision pipeline computes color moments in RGB and HSV color spaces, spatial edge densities using Sobel convolutions, and quadrant energy distributions.',
      icon: Cpu,
      badge: 'Machine Vision'
    },
    {
      num: '03',
      title: 'Model Inference & Probability Scoring',
      desc: 'The classifier evaluates the extracted feature vector against learned parameters for the 6 TrashNet standard categories (cardboard, glass, metal, paper, plastic, trash) and generates a calibrated probability distribution.',
      icon: CheckCircle,
      badge: 'Softmax Distribution'
    },
    {
      num: '04',
      title: 'Confidence Threshold & Uncertainty Flag',
      desc: 'To prevent false certainty, the engine evaluates whether the top score exceeds the confidence threshold (60%). If uncertain, a low-confidence warning is explicitly presented with suggestions for a clearer shot.',
      icon: AlertTriangle,
      badge: 'Threshold: 60%'
    },
    {
      num: '05',
      title: 'Tailored Recycling Recommendations',
      desc: 'The user receives actionable instructions: whether to rinse, keep caps on or off, separate lids, flatten boxes, check resin codes (#1-#7), explore creative upcycling ideas, and review safety precautions.',
      icon: Info,
      badge: 'Actionable Guidance'
    },
    {
      num: '06',
      title: 'Persistent Scan History & User Correction',
      desc: 'Authenticated users have their scans saved to their private history. If a prediction is inaccurate, users can record a confirmed correction, which provides valuable feedback data for future retraining.',
      icon: History,
      badge: 'User Feedback Loop'
    },
    {
      num: '07',
      title: 'Self-Reported Recycling Activities',
      desc: 'Scanning an item does NOT equal recycling it. Users deliberately record actual recycling events with material types and estimated weights (kg) to log confirmed physical diversion.',
      icon: Activity,
      badge: 'Self-Reported Log'
    },
    {
      num: '08',
      title: 'Environmental Impact Analytics',
      desc: 'User activity logs are aggregated into real environmental metrics: estimated CO2 emissions avoided (1.85 kg CO2e/kg), equivalent trees saved, and water conserved using standard lifecycle assessments.',
      icon: BarChart2,
      badge: 'LCA Formulas'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF7]">
      <Navbar />

      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Technical Architecture
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-eco-900 tracking-tight mt-3 mb-4">
              How the Smart Recycling System Works
            </h1>
            <p className="text-base text-textSecondary leading-relaxed">
              A comprehensive walkthrough of our end-to-end software pipeline: from raw camera input and feature
              extraction to probabilistic classification and validated environmental impact.
            </p>
          </div>

          {/* Critical Distinction Notice */}
          <div className="mb-12 bg-amber-50/80 border border-amber-200 rounded-2xl p-5 flex items-start space-x-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="font-semibold block mb-0.5">Important Academic Distinction: Classification vs Proof of Recycling</strong>
              Taking a photo of an empty plastic bottle only identifies what material it is. It does NOT prove that the user
              subsequently placed it in a blue recycling bin. To ensure academic integrity, our system clearly distinguishes
              between <em>AI Image Classification</em> and <em>Self-Reported Recycling Activities</em>. Eco-points for recycling
              require deliberate activity logging.
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-6">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#E3EAE4] p-6 shadow-sm hover:shadow-eco-md transition-all flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-5"
                >
                  <div className="w-12 h-12 rounded-xl bg-eco-50 border border-eco-200 text-eco-800 flex items-center justify-center font-bold text-lg shrink-0">
                    <Icon className="w-6 h-6 text-eco-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-emerald-700">STEP {step.num}</span>
                        <h3 className="text-base font-bold text-eco-900">{step.title}</h3>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to action */}
          <div className="mt-14 text-center bg-white p-8 rounded-2xl border border-[#E3EAE4]">
            <h2 className="text-lg font-bold text-eco-900 mb-2">Ready to test the inference pipeline?</h2>
            <p className="text-xs text-textSecondary mb-5 max-w-md mx-auto">
              You can test the scanner with your own photos or use our preset sample images without any registration.
            </p>
            <Link
              to="/dashboard/scanner"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-eco-700 hover:bg-eco-800 text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>Try Waste Scanner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
