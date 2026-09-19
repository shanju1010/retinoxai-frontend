import { useState, useEffect, useCallback } from 'react';
import { Microscope } from 'lucide-react';

import Header from '@/components/Header';
import PatientInformation from '@/components/PatientInformation';
import ImageUploader from '@/components/ImageUploader';
import QualityResult from '@/components/QualityResult';
import PredictionResult from '@/components/PredictionResult';
import QualityMetrics from '@/components/QualityMetrics';
import ExplanationViewer from '@/components/ExplanationViewer';
import ScreeningSummary from '@/components/ScreeningSummary';
import ClinicalReview from '@/components/ClinicalReview';
import Disclaimer from '@/components/Disclaimer';

import { checkHealth, predictFundusImage } from '@/services/api';
import type {
  HealthStatus,
  ReviewStatus,
  Prediction,
  QualityMetrics as QualityMetricsType,
  ScreenResponse,
} from '@/types/api';

function formatScreeningDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isPredictionResponse(res: ScreenResponse): res is Extract<ScreenResponse, { status: 'ok' }> {
  return res.status === 'ok';
}

function isRetakeResponse(res: ScreenResponse): res is Extract<ScreenResponse, { status: 'retake' }> {
  return res.status === 'retake';
}

export default function App() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('checking');
  const [patientId, setPatientId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [qualityData, setQualityData] = useState<QualityMetricsType | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [retakeMessage, setRetakeMessage] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('pending');

  const screeningDate = formatScreeningDate();

  // Health check on mount
  useEffect(() => {
    let cancelled = false;
    setHealthStatus('checking');
    checkHealth()
      .then(() => {
        if (!cancelled) setHealthStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setHealthStatus('unavailable');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const resetResults = useCallback(() => {
    setQualityData(null);
    setPrediction(null);
    setRetakeMessage(null);
    setHasResult(false);
    setReviewStatus('pending');
    setError(null);
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      resetResults();
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    },
    [resetResults]
  );

  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setImagePreview(null);
    resetResults();
  }, [resetResults]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) {
      setError('Please upload a fundus image before analysis.');
      return;
    }
    if (healthStatus !== 'ready') {
      setError('Screening service is currently unavailable. Please make sure the screening service is running and try again.');
      return;
    }

    setLoading(true);
    setError(null);
    resetResults();

    try {
      const res = await predictFundusImage(selectedFile);

      if (isRetakeResponse(res)) {
        setQualityData(res.quality);
        setRetakeMessage(res.message);
      } else if (isPredictionResponse(res)) {
        setQualityData(res.quality);
        setPrediction(res.prediction);
        setHasResult(true);
      } else {
        setError('Received an unexpected response from the screening service.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to complete screening. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedFile, healthStatus, resetResults]);

  const handleRetake = useCallback(() => {
    handleFileRemove();
  }, [handleFileRemove]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header status={healthStatus} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1.5">
            <Microscope className="w-5 h-5 text-teal-700" />
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">New Retinal Screening</h1>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            Upload a fundus image to assess image quality and perform AI-assisted diabetic retinopathy screening.
          </p>
        </div>

        {healthStatus === 'unavailable' && (
          <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg">
            <p className="text-sm text-rose-700">
              Screening service is currently unavailable. Please make sure the screening service is running and try again.
            </p>
          </div>
        )}

        {/* Two-column layout: left = input, right = results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="space-y-5">
            <PatientInformation
              patientId={patientId}
              onPatientIdChange={setPatientId}
              screeningDate={screeningDate}
            />
            <ImageUploader
              selectedFile={selectedFile}
              imagePreview={imagePreview}
              loading={loading}
              error={error}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onAnalyze={handleAnalyze}
            />
          </div>

          <div className="space-y-5">
            {retakeMessage && qualityData && !prediction && (
              <QualityResult
                message={retakeMessage}
                quality={qualityData}
                onRetake={handleRetake}
              />
            )}

            {prediction && (
              <PredictionResult prediction={prediction} />
            )}

            {qualityData && prediction && (
              <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-800">Image Quality</h2>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${qualityData.acceptable ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {qualityData.acceptable ? 'Acceptable' : 'Below threshold'}
                    </span>
                  </div>
                  <QualityMetrics quality={qualityData} />
                </div>
              </section>
            )}

            {!prediction && !retakeMessage && !loading && (
              <div className="bg-white rounded-lg border border-dashed border-slate-300 p-10 text-center">
                <p className="text-sm text-slate-400">
                  Upload a fundus image and click <span className="font-medium text-slate-500">Analyze Image</span> to begin screening.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Full-width sections below */}
        {hasResult && prediction && (
          <div className="space-y-5">
            <ExplanationViewer originalImage={imagePreview} hasResult={hasResult} prediction={prediction} />

            <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-800">Retinal Image Processing Workflow</h2>
                <p className="text-xs text-slate-500 mt-1.5">Image quality control and enhancement steps used before AI inference.</p>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    ['01', 'Image Acquisition', 'Fundus image uploaded for screening'],
                    ['02', 'Quality Assessment', 'Focus, illumination and image adequacy checked'],
                    ['03', 'Adaptive Enhancement', 'CLAHE-based contrast enhancement and preprocessing'],
                    ['04', 'AI Inference', 'EfficientNet-B0 predicts DR severity 0–4'],
                  ].map(([step, title, description]) => (
                    <div key={step} className="relative rounded-md border border-slate-200 bg-slate-50 p-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-50 border border-teal-100 text-xs font-bold text-teal-700">{step}</span>
                      <p className="mt-3 text-xs font-semibold text-slate-800">{title}</p>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ScreeningSummary
                patientId={patientId}
                screeningDate={screeningDate}
                quality={qualityData}
                prediction={prediction}
              />
              <div className="space-y-5">
                <ClinicalReview
                  status={reviewStatus}
                  onConfirm={() => setReviewStatus('reviewed')}
                  onReevaluation={() => setReviewStatus('reevaluation')}
                />
                <Disclaimer />
              </div>
            </div>
          </div>
        )}

        {(retakeMessage || loading) && !hasResult && (
          <div className="mt-5">
            <Disclaimer />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-[11px] text-slate-400 text-center">
            RETINOXAI — Quality-Aware &amp; Explainable Diabetic Retinopathy Screening · Prototype
          </p>
        </div>
      </footer>
    </div>
  );
}
