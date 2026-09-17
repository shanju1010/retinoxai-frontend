import { Activity } from 'lucide-react';
import SystemStatus from './SystemStatus';
import type { HealthStatus } from '@/types/api';

export default function Header({ status }: { status: HealthStatus }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-teal-700">
              <Activity className="w-4.5 h-4.5 text-white" strokeWidth={2.2} size={18} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-800 leading-tight tracking-tight">
                RETINOXAI
              </h1>
              <p className="text-[11px] text-slate-500 leading-tight">
                AI-assisted retinal screening
              </p>
            </div>
          </div>
          <SystemStatus status={status} />
        </div>
      </div>
    </header>
  );
}
