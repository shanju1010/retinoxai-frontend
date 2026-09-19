import { ClipboardList, Download } from 'lucide-react';
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

  const downloadReport = () => {
    const report = [
      'RETINOXAI — RETINAL SCREENING REPORT',
      '=====================================',
      '',
      `Patient ID: ${patientId || 'Not provided'}`,
      `Screening Date: ${screeningDate}`,
      '',
      'IMAGE QUALITY',
      `Status: ${qualityLabel}`,
      `Quality Score: ${quality.quality_score.toFixed(2)}`,
      `Sharpness: ${quality.sharpness.toFixed(2)}`,
      `Brightness: ${quality.brightness.toFixed(2)}`,
      `Contrast: ${quality.contrast.toFixed(2)}`,
      quality.reasons.length ? `Notes: ${quality.reasons.join('; ')}` : 'Notes: None',
      '',
      'AI SCREENING RESULT',
      `DR Grade: ${prediction.grade} — ${prediction.grade_name}`,
      `Model Confidence: ${confidencePct}%`,
      `Referable DR: ${prediction.referable_dr ? 'Yes' : 'No'}`,
      '',
      'EXPLAINABILITY',
      'Grad-CAM attention map generated for model interpretation.',
      'Highlighted regions indicate areas that contributed more strongly to the model prediction.',
      '',
      'CLINICAL NOTE',
      'This is an AI-assisted screening prototype. The output is intended to support, not replace, qualified clinical review.',
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `RETINOXAI-${patientId || 'screening'}-report.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-semibold text-slate-800">Screening Summary</h2>
          </div>
          <button
            type="button"
            onClick={downloadReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download Report
          </button>
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
