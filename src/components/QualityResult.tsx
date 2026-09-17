import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { QualityMetrics as QualityMetricsType } from '@/types/api';
import QualityMetrics from './QualityMetrics';

interface Props {
  message: string;
  quality: QualityMetricsType;
  onRetake: () => void;
}

export default function QualityResult({ message, quality, onRetake }: Props) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-slate-800">Image Quality Check</h2>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md mb-4">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
          <span className="text-sm font-semibold text-amber-800">Retake Recommended</span>
        </div>
        <p className="text-sm text-slate-600 mb-4">{message}</p>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Quality Metrics</h3>
          <QualityMetrics quality={quality} />
        </div>

        {quality.reasons.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Issues Detected</h3>
            <ul className="space-y-1.5">
              {quality.reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={onRetake}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white
              bg-teal-700 rounded-md hover:bg-teal-800 transition-colors
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600"
          >
            <RefreshCw className="w-4 h-4" />
            Upload Clearer Image
          </button>
        </div>
      </div>
    </div>
  );
}
