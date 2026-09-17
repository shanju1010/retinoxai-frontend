import { ClipboardCheck } from 'lucide-react';
import type { ReviewStatus } from '@/types/api';

interface Props {
  status: ReviewStatus;
  onConfirm: () => void;
  onReevaluation: () => void;
}

const STATUS_LABELS: Record<ReviewStatus, { label: string; color: string }> = {
  pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  reviewed: { label: 'Reviewed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  reevaluation: { label: 'Needs Re-evaluation', color: 'bg-rose-100 text-rose-700 border-rose-200' },
};

export default function ClinicalReview({ status, onConfirm, onReevaluation }: Props) {
  const cfg = STATUS_LABELS[status];
  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-teal-700" />
          <h2 className="text-sm font-semibold text-slate-800">Clinical Review</h2>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Reviewer Decision</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border ${cfg.color}`}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
              {status === 'pending' ? 'Pending' : cfg.label}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onConfirm}
            disabled={status === 'reviewed'}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white
              bg-teal-700 rounded-md hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600"
          >
            Confirm Review
          </button>
          <button
            onClick={onReevaluation}
            disabled={status === 'reevaluation'}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700
              border border-slate-300 rounded-md hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400
              disabled:cursor-not-allowed transition-colors
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
          >
            Needs Re-evaluation
          </button>
        </div>

        <p className="mt-3 text-[11px] text-slate-400">
          Prototype workflow — no clinical record is created.
        </p>
      </div>
    </section>
  );
}
