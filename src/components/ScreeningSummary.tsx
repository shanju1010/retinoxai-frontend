import { ClipboardList } from 'lucide-react';
import type { Prediction, QualityMetrics as QualityMetricsType } from '@/types/api';

interface Props {
  patientId: string;
  screeningDate: string;
  quality: QualityMetricsType | null;
  prediction: Prediction | null;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800 text-right">{value}</span>
    </div>
  );
}

export default function ScreeningSummary({ patientId, screeningDate, quality, prediction }: Props) {
  if (!prediction || !quality) return null;

  const qualityLabel = quality.acceptable ? 'Acceptable' : 'Retake Recommended';
  const confidencePct = (prediction.confidence * 100).toFixed(1);

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-teal-700" />
          <h2 className="text-sm font-semibold text-slate-800">Screening Summary</h2>
        </div>
      </div>
      <div className="p-5">
        <Row label="Patient ID" value={patientId || '—'} />
        <Row label="Screening Date" value={screeningDate} />
        <Row label="Image Quality" value={qualityLabel} />
        <Row label="DR Grade" value={`${prediction.grade} — ${prediction.grade_name}`} />
        <Row label="Confidence" value={`${confidencePct}%`} />
        <Row label="Referable DR" value={prediction.referable_dr ? 'Yes' : 'No'} />
      </div>
    </section>
  );
}
