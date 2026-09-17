import type { QualityMetrics as QualityMetricsType } from '@/types/api';

interface Props {
  quality: QualityMetricsType;
}

function MetricBar({ label, value, max, unit }: { label: string; value: number; max: number; unit?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs font-semibold text-slate-800 tabular-nums">
          {value.toFixed(2)}{unit && <span className="text-slate-400 font-normal ml-0.5">{unit}</span>}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-600 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function QualityMetrics({ quality }: Props) {
  return (
    <div className="space-y-3">
      <MetricBar label="Quality Score" value={quality.quality_score} max={1} />
      <MetricBar label="Sharpness" value={quality.sharpness} max={100} />
      <MetricBar label="Brightness" value={quality.brightness} max={255} />
      <MetricBar label="Contrast" value={quality.contrast} max={100} />
    </div>
  );
}
