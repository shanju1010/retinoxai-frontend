import { useState } from 'react';
import { ScanEye, X, AlertCircle, Eye } from 'lucide-react';
import { getExplanationImageUrl } from '@/services/api';

interface Props {
  originalImage: string | null;
  hasResult: boolean;
}

export default function ExplanationViewer({ originalImage, hasResult }: Props) {
  const [camError, setCamError] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!hasResult) return null;

  const camUrl = getExplanationImageUrl();

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
            {originalImage && (
              <button
                onClick={() => setLightbox(originalImage)}
                className="block w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-900 hover:ring-2 hover:ring-teal-500 transition-all"
              >
                <img
                  src={originalImage}
                  alt="Original retinal fundus image"
                  className="w-full h-56 object-contain"
                />
              </button>
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
                  className="w-full h-56 object-contain"
                  onError={() => setCamError(true)}
                />
              </button>
            ) : (
              <div className="flex flex-col items-center justify-center h-56 rounded-lg border border-slate-200 bg-slate-50 text-center px-4">
                <AlertCircle className="w-5 h-5 text-slate-400 mb-2" />
                <p className="text-xs text-slate-500">Visual explanation is temporarily unavailable.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-md">
          <p className="text-xs text-slate-600 leading-relaxed">
            Higher intensity indicates stronger model attention. This visualization supports human review of the model output. It does not establish a clinical diagnosis.
          </p>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightbox}
            alt="Enlarged view"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </section>
  );
}
