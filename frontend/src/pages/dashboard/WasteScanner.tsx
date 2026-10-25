import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Scan,
  BookOpen,
  History,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface PredictionResponse {
  scan_id?: number;
  image_url: string;
  original_filename?: string;
  predicted_category: string;
  display_name: string;
  confidence: number;
  confidence_percentage: number;
  is_confident: boolean;
  confidence_threshold: number;
  model_identifier: string;
  model_status: string;
  warning?: string | null;
  classification_type: string;
  description: string;
  recycling_instructions: string;
  preparation_checklist: string[];
  reuse_suggestions: string[];
  environmental_impact: string;
  safety_notes: string;
  all_probabilities: Record<string, number>;
}

export const WasteScanner: React.FC = () => {
  const { refreshUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);

  // User correction states
  const [userCorrection, setUserCorrection] = useState<string>('');
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [feedbackSaved, setFeedbackSaved] = useState<boolean>(false);
  const [savingFeedback, setSavingFeedback] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    setResult(null);
    setFeedbackSaved(false);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(`File exceeds maximum size of 5 MB (${(file.size / (1024 * 1024)).toFixed(2)} MB uploaded).`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Sample quick test generator (creates realistic canvas images for test benchmarking)
  const handleLoadSample = (category: string, label: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = '#f0f4f1';
    ctx.fillRect(0, 0, 256, 256);

    const colors: Record<string, string> = {
      cardboard: '#b58863',
      glass: '#a0d2db',
      metal: '#9ea6ad',
      paper: '#f5f5f7',
      plastic: '#3296dc',
      trash: '#554f49'
    };

    ctx.fillStyle = colors[category] || '#22c55e';
    ctx.beginPath();
    ctx.roundRect(40, 40, 176, 176, 20);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#27342b';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 128, 135);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${category}_sample.jpg`, { type: 'image/jpeg' });
        handleFileSelect(file);
      }
    }, 'image/jpeg');
  };

  const handleClassify = async () => {
    if (!selectedFile) return;

    try {
      setAnalyzing(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const data = await apiRequest<PredictionResponse>('/api/v1/classify', {
        method: 'POST',
        body: formData,
      });

      setResult(data);
      refreshUser(); // update eco points
    } catch (err: any) {
      setError(err.message || 'Image classification failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (!result?.scan_id) return;
    try {
      setSavingFeedback(true);
      await apiRequest(`/api/v1/scans/${result.scan_id}/feedback`, {
        method: 'PATCH',
        body: JSON.stringify({
          user_feedback_category: userCorrection || undefined,
          notes: feedbackNotes || undefined,
        }),
      });
      setFeedbackSaved(true);
    } catch (err: any) {
      console.error('Failed to submit user feedback:', err);
    } finally {
      setSavingFeedback(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Real-Time Inference
          </span>
          <span className="text-xs text-textSecondary font-mono">MobileNetV3 / Vision-MLP Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-eco-900 tracking-tight">AI Waste Scanner</h2>
        <p className="text-xs sm:text-sm text-textSecondary mt-1">
          Upload any waste item photo to predict its material stream, calculate confidence, and receive tailored disposal checklists.
        </p>
      </div>

      {/* Preset Quick Test Buttons */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3EAE4] shadow-sm space-y-2">
        <span className="text-xs font-bold text-eco-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Quick Test Benchmarks (No camera required):
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => handleLoadSample('plastic', 'Plastic Bottle')}
            className="px-3 py-1.5 rounded-lg bg-surface-soft hover:bg-emerald-50 border border-[#E3EAE4] text-eco-900 font-medium transition-colors"
          >
            🥤 Plastic Bottle
          </button>
          <button
            onClick={() => handleLoadSample('cardboard', 'Cardboard Carton')}
            className="px-3 py-1.5 rounded-lg bg-surface-soft hover:bg-emerald-50 border border-[#E3EAE4] text-eco-900 font-medium transition-colors"
          >
            📦 Cardboard Box
          </button>
          <button
            onClick={() => handleLoadSample('metal', 'Aluminium Can')}
            className="px-3 py-1.5 rounded-lg bg-surface-soft hover:bg-emerald-50 border border-[#E3EAE4] text-eco-900 font-medium transition-colors"
          >
            🥫 Soda / Tin Can
          </button>
          <button
            onClick={() => handleLoadSample('glass', 'Glass Food Jar')}
            className="px-3 py-1.5 rounded-lg bg-surface-soft hover:bg-emerald-50 border border-[#E3EAE4] text-eco-900 font-medium transition-colors"
          >
            🫙 Glass Jar
          </button>
          <button
            onClick={() => handleLoadSample('paper', 'Office Paper')}
            className="px-3 py-1.5 rounded-lg bg-surface-soft hover:bg-emerald-50 border border-[#E3EAE4] text-eco-900 font-medium transition-colors"
          >
            📄 Paper Document
          </button>
          <button
            onClick={() => handleLoadSample('trash', 'Mixed Waste')}
            className="px-3 py-1.5 rounded-lg bg-surface-soft hover:bg-emerald-50 border border-[#E3EAE4] text-eco-900 font-medium transition-colors"
          >
            🗑️ General Trash
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      {!result && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3EAE4] shadow-sm space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!previewUrl ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#CBD5CD] hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl p-10 text-center cursor-pointer transition-all duration-200"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-eco-50 border border-eco-200 text-eco-700 flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-eco-900 mb-1">
                Click to upload, or drag & drop waste image
              </p>
              <p className="text-xs text-textSecondary">
                Supports JPEG, PNG, WebP up to 5 MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-[#E3EAE4] max-h-80 flex items-center justify-center bg-black/5">
                <img
                  src={previewUrl}
                  alt="Waste item preview"
                  className="max-h-80 w-auto object-contain rounded-2xl"
                />
                <button
                  onClick={clearSelection}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-red-600 shadow-md transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-textSecondary">
                <span>Selected: <strong className="text-eco-900">{selectedFile?.name}</strong> ({(selectedFile?.size || 0) / 1024 < 1024 ? `${((selectedFile?.size || 0) / 1024).toFixed(1)} KB` : `${((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB`})</span>
                <button onClick={clearSelection} className="text-red-600 hover:underline">
                  Change Photo
                </button>
              </div>

              <button
                onClick={handleClassify}
                disabled={analyzing}
                className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-eco-700 hover:bg-eco-800 text-white font-bold text-sm shadow-eco-md transition-all disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running Machine Vision Inference...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    <span>Classify Waste Material</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Polished Result Card */}
      {result && (
        <div className="bg-white rounded-3xl border border-[#E3EAE4] shadow-eco-lg overflow-hidden space-y-6">
          {/* Result Card Top Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-eco-900 to-teal-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                Prediction Completed
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
                {result.display_name}
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5 font-medium">
                {result.classification_type}
              </p>
            </div>

            {/* Confidence Score Pill */}
            <div className="text-right">
              <div className="text-3xl font-black text-emerald-300">
                {result.confidence_percentage}%
              </div>
              <span className="text-[11px] text-emerald-200">Confidence Score</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Uncertainty Warning Alert if below threshold */}
            {result.warning && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block font-semibold">Low Confidence Model Warning</strong>
                  {result.warning}
                </div>
              </div>
            )}

            {/* Main content grid: Image preview & description */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-5 rounded-2xl overflow-hidden border border-[#E3EAE4] bg-surface-soft">
                <img
                  src={result.image_url}
                  alt={result.display_name}
                  className="w-full h-56 object-cover"
                />
              </div>

              <div className="md:col-span-7 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-eco-900">Material Description</h4>
                <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                  {result.description}
                </p>

                <h4 className="text-xs font-bold uppercase tracking-wider text-eco-900 pt-2">Recommended Disposal Method</h4>
                <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                  {result.recycling_instructions}
                </p>
              </div>
            </div>

            {/* Preparation Checklist */}
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Preparation Checklist
              </h4>
              <div className="space-y-2">
                {result.preparation_checklist.map((item, idx) => (
                  <label key={idx} className="flex items-start gap-2.5 text-xs text-emerald-950 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded text-eco-700 focus:ring-eco-600" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reuse & Safety */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-soft p-4 rounded-xl border border-surface-border space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-eco-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Reuse Possibilities
                </h4>
                <ul className="space-y-1 text-xs text-textSecondary">
                  {result.reuse_suggestions.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-surface-soft p-4 rounded-xl border border-surface-border space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-eco-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-orange-600" />
                  Safety Precautions
                </h4>
                <p className="text-xs text-textSecondary leading-relaxed">
                  {result.safety_notes}
                </p>
              </div>
            </div>

            {/* Environmental Impact Fact */}
            <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 flex items-start gap-3 text-xs text-teal-950">
              <Sparkles className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Environmental Context:</strong>
                <p className="mt-0.5">{result.environmental_impact}</p>
              </div>
            </div>

            {/* User Correction & Feedback Section */}
            {result.scan_id && (
              <div className="p-5 rounded-2xl bg-surface-soft border border-[#E3EAE4] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-eco-900 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    Report Inaccurate Prediction / Add Notes
                  </span>
                  {feedbackSaved && (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" /> Feedback Saved
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-textSecondary mb-1">
                      Correct Category (if model was wrong):
                    </label>
                    <select
                      value={userCorrection}
                      onChange={(e) => setUserCorrection(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4] text-xs bg-white focus:ring-2 focus:ring-eco-600"
                    >
                      <option value="">-- No Correction (Correct Prediction) --</option>
                      <option value="Plastic">Plastic</option>
                      <option value="Paper">Paper</option>
                      <option value="Cardboard">Cardboard</option>
                      <option value="Glass">Glass</option>
                      <option value="Metal">Metal</option>
                      <option value="General Waste">General Waste</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-textSecondary mb-1">
                      Personal Note:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Scanned 1L olive oil bottle"
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E3EAE4] text-xs bg-white focus:ring-2 focus:ring-eco-600"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveFeedback}
                  disabled={savingFeedback || feedbackSaved}
                  className="px-4 py-2 rounded-lg bg-white border border-[#E3EAE4] text-xs font-semibold text-eco-900 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {savingFeedback ? 'Saving...' : feedbackSaved ? 'Feedback Recorded' : 'Save Feedback & Notes'}
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={clearSelection}
                className="px-5 py-2.5 rounded-xl bg-eco-700 hover:bg-eco-800 text-white font-semibold text-xs shadow-sm transition-all"
              >
                Scan Another Item
              </button>

              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard/history"
                  className="px-4 py-2.5 rounded-xl border border-[#E3EAE4] text-eco-900 hover:bg-surface-soft font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>My History</span>
                </Link>
                <Link
                  to={`/guide?cat=${result.predicted_category}`}
                  className="px-4 py-2.5 rounded-xl border border-[#E3EAE4] text-eco-900 hover:bg-surface-soft font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Material Guide</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
