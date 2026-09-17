import { Info } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
      <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
      <p className="text-xs text-slate-500 leading-relaxed">
        RETINOXAI is an AI-assisted screening prototype and is not a clinical diagnostic system.
        Results should be reviewed by a qualified healthcare professional.
      </p>
    </div>
  );
}
