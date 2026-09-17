import { User } from 'lucide-react';

interface Props {
  patientId: string;
  onPatientIdChange: (value: string) => void;
  screeningDate: string;
}

export default function PatientInformation({ patientId, onPatientIdChange, screeningDate }: Props) {
  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-teal-700" />
          <h2 className="text-sm font-semibold text-slate-800">Patient Information</h2>
        </div>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="patient-id" className="block text-xs font-medium text-slate-600 mb-1.5">
            Patient ID
          </label>
          <input
            id="patient-id"
            type="text"
            value={patientId}
            onChange={(e) => onPatientIdChange(e.target.value)}
            placeholder="Enter patient ID"
            className="w-full px-3 py-2 text-sm text-slate-800 border border-slate-300 rounded-md
              focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600
              placeholder:text-slate-400 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="screening-date" className="block text-xs font-medium text-slate-600 mb-1.5">
            Screening Date
          </label>
          <input
            id="screening-date"
            type="text"
            value={screeningDate}
            readOnly
            className="w-full px-3 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md"
          />
        </div>
      </div>
    </section>
  );
}
