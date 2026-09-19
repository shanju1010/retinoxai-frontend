import { useEffect, useMemo, useState } from 'react';
import { ScanEye, X, AlertCircle, Eye, Info } from 'lucide-react';
import { getExplanationImageUrl } from '@/services/api';

interface Props {
  originalImage: string | null;
  hasResult: boolean;
  prediction?: {
    grade: number;
    grade_name: string;
    confidence: number;
    referable_dr: boolean;
  } | null;
}

export default function ExplanationViewer({ originalImage, hasResult, prediction }: Props) {
  const [camError, setCamError] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const camUrl = useMemo(() => `${getExplanationImageUrl()}?t=${Date.now()}`, [hasResult]);

  useEffect(() => {
    setCamError(false);
  }, [camUrl]);

  if (!hasResult) return null;

  const confidencePct = prediction ? (prediction.confidence * 100).toFixed(1) : '—';

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ScanEye className="w-4 h-4 text-teal-700" />
          <h2 className="text-sm font-semibold text-slate-800">Explainable AI</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1.5">
          Visual explanation of image regions that contributed to the model prediction.
        </p>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Original Fundus Image</h3>
            </div>
            {originalImage ? (
              <button
                onClick={() => setLightbox(originalImage)}
                className="block w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-900 hover:ring-2 hover:ring-teal-500 transition-all"
              >
                <img
                  src={originalImage}
                  alt="Original retinal fundus image"
                  className="w-full h-64 object-contain"
                />
              </button>
            ) : (
              <div className="flex items-center justify-center h-64 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-500">
                Original image unavailable
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ScanEye className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Grad-CAM Explanation</h3>
            </div>
            {!camError ? (
              <button
                onClick={() => setLightbox(camUrl)}
                className="block w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-900 hover:ring-2 hover:ring-teal-500 transition-all"
              >
                <img
                  src={camUrl}
                  alt="Grad-CAM heatmap explanation of model attention"
                  className="w-full h-64 object-contain"
                  onError={() => setCamError(true)}
                />
              </button>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-slate-200 bg-slate-50 text-center px-4">
                <AlertCircle className="w-5 h-5 text-slate-400 mb-2" />
                <p className="text-xs text-slate-500">Visual explanation is temporarily unavailable.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Predicted grade</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {prediction ? `${prediction.grade} — ${prediction.grade_name}` : '—'}
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Model confidence</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{confidencePct}%</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Referable DR</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {prediction ? (prediction.referable_dr ? 'Yes (Grade ≥ 2)' : 'No (Grade < 2)') : '—'}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-teal-100 bg-teal-50/60 px-4 py-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-teal-900">Why this result?</p>
              <p className="text-xs text-teal-900/80 mt-1 leading-relaxed">
                Higher-intensity regions in the Grad-CAM overlay indicate areas that contributed more strongly to the model prediction.
                The visualization is an interpretability aid for human review; it does not by itself confirm a specific lesion or establish a clinical diagnosis.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" /> Model attention map
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
            Supports clinical review
          </span>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            aria-label="Close"
            onClick={() => setLightbox(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightbox}
            alt="Enlarged fundus or Grad-CAM explanation"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </section>
  );
}
