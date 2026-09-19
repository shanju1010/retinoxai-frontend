import { useEffect, useMemo, useState } from 'react';
import { CircleDot, Eye, Info, ScanLine, X } from 'lucide-react';
import { getRetinalStructureImageUrl } from '@/services/api';
import type { RetinalStructure } from '@/types/api';

interface Props {
  structure: RetinalStructure;
  hasResult: boolean;
}

export default function RetinalStructureViewer({ structure, hasResult }: Props) {
  const [imageError, setImageError] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const imageUrl = useMemo(
    () => `${getRetinalStructureImageUrl()}?t=${Date.now()}`,
    [hasResult]
  );

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const od = structure.optic_disc;
  const fovea = structure.fovea;
  const vessels = structure.vessels;

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ScanLine className="w-4 h-4 text-teal-700" />
          <h2 className="text-sm font-semibold text-slate-800">Retinal Structure Analysis</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1.5">
          Prototype analysis of retinal vessels, optic disc, and foveal location.
        </p>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-5">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Annotated Retina
              </h3>
            </div>

            {!imageError ? (
              <button
                onClick={() => setLightbox(imageUrl)}
                className="block w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-900 hover:ring-2 hover:ring-teal-500 transition-all"
              >
                <img
                  src={imageUrl}
                  alt="Annotated retinal structure analysis showing vessel, optic disc, and fovea estimates"
                  className="w-full h-[360px] object-contain"
                  onError={() => setImageError(true)}
                />
              </button>
            ) : (
              <div className="flex items-center justify-center h-[360px] rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-500 text-center px-5">
                Retinal structure visualization is temporarily unavailable.
              </div>
            )}

            <p className="mt-2 text-[11px] text-slate-400">
              Green overlay: vessel analysis · Red marker: optic disc · Blue marker: estimated fovea
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Retinal vessels</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {vessels.analyzed ? 'Analyzed' : 'Unavailable'}
                    </p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Candidate density: {(vessels.density * 100).toFixed(1)}%
                </p>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Optic disc</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {od.detected ? 'Localized' : 'Not localized'}
                    </p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${od.detected ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Center: ({od.center_x}, {od.center_y})
                </p>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Fovea</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {fovea.estimated ? 'Estimated' : 'Unavailable'}
                    </p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${fovea.estimated ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Center: ({fovea.center_x}, {fovea.center_y})
                </p>
              </div>
            </div>

            <div className="rounded-md border border-teal-100 bg-teal-50/60 px-4 py-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-teal-900">Interpretation</p>
                  <p className="text-xs text-teal-900/80 mt-1 leading-relaxed">
                    Vessel highlighting is a prototype image-analysis output. The optic-disc location is detected from image features, while the fovea uses an IDRiD-calibrated geometric estimate. These outputs are not independent clinical diagnoses.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                <CircleDot className="w-3 h-3" /> IDRiD-calibrated landmark workflow
              </span>
            </div>
          </div>
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
            alt="Enlarged annotated retinal structure analysis"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </section>
  );
}
