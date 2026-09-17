import type { HealthStatus } from '@/types/api';

const STATUS_CONFIG: Record<HealthStatus, { label: string; dotClass: string; textClass: string }> = {
  checking: { label: 'Checking...', dotClass: 'bg-amber-400 animate-pulse', textClass: 'text-slate-500' },
  ready: { label: 'System Ready', dotClass: 'bg-emerald-500', textClass: 'text-slate-700' },
  unavailable: { label: 'Service Unavailable', dotClass: 'bg-rose-500', textClass: 'text-slate-700' },
};

export default function SystemStatus({ status }: { status: HealthStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200">
      <span
        className={`inline-block w-2 h-2 rounded-full ${cfg.dotClass}`}
        aria-hidden="true"
      />
      <span className={`text-xs font-medium ${cfg.textClass}`}>{cfg.label}</span>
    </div>
  );
}
