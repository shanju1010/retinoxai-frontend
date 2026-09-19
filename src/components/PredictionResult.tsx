import { Info, Stethoscope } from 'lucide-react';
import type { Prediction } from '@/types/api';

interface Props {
  prediction: Prediction;
}

const GRADE_COLORS: Record<number, string> = {
  0: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  1: 'bg-teal-50 text-teal-700 border-teal-200',
  2: 'bg-amber-50 text-amber-700 border-amber-200',
  3: 'bg-orange-50 text-orange-700 border-orange-200',
  4: 'bg-rose-50 text-rose-700 border-rose-200',
};

const GRADE_GUIDE = [
  ['0', 'No DR'],
  ['1', 'Mild NPDR'],
  ['2', 'Moderate NPDR'],
  ['3', 'Severe NPDR'],
  ['4', 'Proliferative DR'],
] as const;

export default function PredictionResult({ prediction }: Props) {
  const gradeColor = GRADE_COLORS[prediction.grade] || 'bg-slate-50 text-slate-700 border-slate-200';
  const confidencePct = (prediction.confidence * 100).toFixed(1);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-teal-700" />
          <h2 className="text-sm font-semibold text-slate-800">AI Screening Result</h2>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">DR Grade</p>
          <div className={`inline-flex items-baseline gap-2 px-4 py-2.5 rounded-md border ${gradeColor}`}>
            <span className="text-2xl font-bold tabular-nums leading-none">{prediction.grade}</span>
            <span className="text-sm font-semibold leading-none">— {prediction.grade_name}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-md">
            <p className="text-xs font-medium text-slate-500 mb-1">Confidence</p>
            <p className="text-lg font-semibold text-slate-800 tabular-nums">{confidencePct}%</p>
          </div>
          <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-md">
            <p className="text-xs font-medium text-slate-500 mb-1">Referable DR</p>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block w-2 h-2 rounded-full ${prediction.referable_dr ? 'bg-rose-500' : 'bg-emerald-500'}`}
                aria-hidden="true"
              />
              <span className="text-lg font-semibold text-slate-800">
                {prediction.referable_dr ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
          <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-teal-700" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">International DR severity guide</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            {GRADE_GUIDE.map(([grade, label]) => (
              <div key={grade} className="px-3 py-2.5">
                <p className="text-xs font-bold text-slate-700">{grade}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="px-3.5 py-2.5 bg-amber-50/60 border-t border-slate-200">
            <p className="text-[11px] text-slate-700">
              <span className="font-semibold">Referable DR threshold:</span> Grade 2 or above in this prototype.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
