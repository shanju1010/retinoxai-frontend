import { useEffect, useState } from 'react';
import {
  ScanEye,
  X,
  AlertCircle,
  Eye,
  Info,
  CircleHelp,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  ArrowDown,
} from 'lucide-react';
import type { RetinalStructure } from '@/types/api';

interface Props {
  originalImage: string | null;
  hasResult: boolean;
  prediction?: {
    grade: number;
    grade_name: string;
    confidence: number;
    referable_dr: boolean;
  } | null;
  retinalStructure?: RetinalStructure | null;
  explanationImage: string | null;
}

function getGradeExplanation(grade: number, gradeName: string): string {
  switch (grade) {
    case 0:
      return `The model classified this image as ${gradeName}. The visual patterns it learned were more consistent with the No DR category than with the other grades.`;
    case 1:
      return `The model classified this image as ${gradeName}. The visual patterns it learned were more consistent with mild diabetic retinopathy than with the other grades.`;
    case 2:
      return `The model classified this image as ${gradeName}. The visual patterns it learned were more consistent with moderate diabetic retinopathy than with the other grades.`;
    case 3:
      return `The model classified this image as ${gradeName}. The visual patterns it learned were more consistent with severe diabetic retinopathy than with the other grades.`;
    case 4:
      return `The model classified this image as ${gradeName}. The visual patterns it learned were more consistent with proliferative diabetic retinopathy than with the other grades.`;
    default:
      return `The model classified this image as ${gradeName}. The explanation below shows where the model focused most strongly when producing that prediction.`;
  }
}

function getSimpleGradeDescription(grade: number): string {
  switch (grade) {
    case 0:
      return 'No visible diabetic-retinopathy pattern identified by this model.';
    case 1:
      return 'Mild retinal changes associated with diabetic retinopathy.';
    case 2:
      return 'Moderate retinal changes associated with diabetic retinopathy.';
    case 3:
      return 'More advanced retinal changes associated with diabetic retinopathy.';
    case 4:
      return 'Advanced disease pattern associated with proliferative diabetic retinopathy.';
    default:
      return 'Model classification for the uploaded retinal image.';
  }
}

function formatConfidence(value: number): string {
  return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : '—';
}

export default function ExplanationViewer({
  originalImage,
  hasResult,
  prediction,
  retinalStructure,
  explanationImage,
}: Props) {
  const [camError, setCamError] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    setCamError(false);
  }, [explanationImage]);

  if (!hasResult) return null;

  const confidencePct = prediction ? formatConfidence(prediction.confidence) : '—';
  const referableText = prediction
    ? prediction.referable_dr
      ? 'Yes — model grade is 2 or higher'
      : 'No — model grade is below 2'
    : '—';

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ScanEye className="w-4 h-4 text-teal-700" />
          <h2 className="text-sm font-semibold text-slate-800">Explainable AI</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1.5">
          Understand what the model predicted, where it focused, and what the visual explanation means.
        </p>
      </div>

      <div className="p-5">
        {/* Simple explanation banner */}
        <div className="rounded-lg border border-teal-100 bg-teal-50/70 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-teal-100 flex items-center justify-center shrink-0">
              <CircleHelp className="w-4 h-4 text-teal-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-900">What is Explainable AI?</p>
              <p className="text-sm text-teal-950 mt-1 leading-relaxed">
                Explainable AI means showing not only <span className="font-semibold">what</span> the AI predicted,
                but also giving people understandable information about <span className="font-semibold">how it arrived there</span>.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-teal-900">
                <span className="px-2 py-1 rounded-full bg-white border border-teal-100">Retinal image</span>
                <ArrowDown className="w-3 h-3" />
                <span className="px-2 py-1 rounded-full bg-white border border-teal-100">AI prediction</span>
                <ArrowDown className="w-3 h-3" />
                <span className="px-2 py-1 rounded-full bg-white border border-teal-100">Attention map</span>
                <ArrowDown className="w-3 h-3" />
                <span className="px-2 py-1 rounded-full bg-white border border-teal-100">Human review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">AI prediction</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {prediction ? `Grade ${prediction.grade} — ${prediction.grade_name}` : '—'}
            </p>
            {prediction && (
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{getSimpleGradeDescription(prediction.grade)}</p>
            )}
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Model confidence</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{confidencePct}</p>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              Model probability for the selected class; not a guarantee that the prediction is correct.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Referable DR</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {prediction ? (prediction.referable_dr ? 'Yes' : 'No') : '—'}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{referableText}</p>
          </div>
        </div>

        {/* Images */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Where did the AI look?</h3>
              <p className="text-[11px] text-slate-500 mt-1">The second image is the Grad-CAM explanation for the current prediction.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Original Fundus Image</h4>
              </div>
              {originalImage ? (
                <button
                  onClick={() => setLightbox(originalImage)}
                  className="block w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-900 hover:ring-2 hover:ring-teal-500 transition-all"
                  aria-label="Open original fundus image"
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
                <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Grad-CAM Attention Map</h4>
              </div>
              {!camError && explanationImage ? (
                <button
                  onClick={() => setLightbox(explanationImage)}
                  className="block w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-900 hover:ring-2 hover:ring-teal-500 transition-all"
                  aria-label="Open Grad-CAM attention map"
                >
                  <img
                    src={explanationImage}
                    alt="Grad-CAM heatmap showing model attention"
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
        </div>

        {/* Legend + explanation */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">How to read the AI map</h3>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <span className="w-12 h-3 rounded-full bg-gradient-to-r from-blue-500 via-yellow-300 to-red-600" aria-hidden="true" />
                <span><span className="font-semibold text-slate-700">Red / yellow:</span> stronger contribution to the prediction.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 h-3 rounded-full bg-slate-300" aria-hidden="true" />
                <span><span className="font-semibold text-slate-700">Blue / low intensity:</span> weaker contribution.</span>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
              The highlighted regions show where the model focused when making this prediction. They are not automatically confirmed lesions.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-700" />
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Why this result?</h3>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              {prediction
                ? getGradeExplanation(prediction.grade, prediction.grade_name)
                : 'The visualization below shows where the model focused most strongly when producing its prediction.'}
            </p>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Higher-intensity regions in the Grad-CAM overlay indicate areas that contributed more strongly to the model prediction.
            </p>
          </div>
        </div>

        {/* Supporting image-analysis evidence */}
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Supporting image-analysis evidence</h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            These are outputs from the prototype's separate retinal-structure analysis. They provide additional context for human review; they are not independent clinical findings.
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-700">Blood vessels</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {retinalStructure?.vessels?.analyzed ? 'Prototype vessel analysis completed.' : 'Not available in this result.'}
              </p>
              {retinalStructure?.vessels?.analyzed && (
                <p className="mt-1 text-[11px] font-medium text-slate-700">
                  Candidate vessel density: {(retinalStructure.vessels.density * 100).toFixed(1)}%
                </p>
              )}
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-700">Optic disc</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {retinalStructure?.optic_disc?.detected ? 'Localized by the prototype image-analysis module.' : 'Not confidently localized.'}
              </p>
              {retinalStructure?.optic_disc?.detected && (
                <p className="mt-1 text-[11px] font-medium text-slate-700">
                  Confidence: {(retinalStructure.optic_disc.confidence * 100).toFixed(0)}%
                </p>
              )}
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-700">Fovea</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {retinalStructure?.fovea?.estimated ? 'Estimated location from the prototype geometry module.' : 'Not available in this result.'}
              </p>
              {retinalStructure?.fovea?.estimated && (
                <p className="mt-1 text-[11px] font-medium text-slate-700">
                  Confidence: {(retinalStructure.fovea.confidence * 100).toFixed(0)}%
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Safety / clinical context */}
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-900">Important interpretation note</p>
              <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                This is an AI-assisted screening prototype. Grad-CAM explains model attention but does not prove a lesion or establish a medical diagnosis.
                A qualified healthcare professional should review the complete screening result.
              </p>
            </div>
          </div>
        </div>

        {/* DR severity guide */}
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">DR severity guide</h3>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {[
              ['0', 'No DR'],
              ['1', 'Mild'],
              ['2', 'Moderate'],
              ['3', 'Severe'],
              ['4', 'Proliferative DR'],
            ].map(([grade, label]) => (
              <div
                key={grade}
                className={`rounded-md border px-3 py-2 ${
                  prediction?.grade === Number(grade)
                    ? 'border-teal-300 bg-white ring-1 ring-teal-200'
                    : 'border-slate-200 bg-white/60'
                }`}
              >
                <p className="text-[11px] font-bold text-slate-700">Grade {grade}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded retinal image"
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
