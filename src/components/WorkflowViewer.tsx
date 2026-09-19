import { useMemo } from 'react';
import { CheckCircle2, Image as ImageIcon, Sparkles, Stethoscope } from 'lucide-react';

import type { Prediction, QualityMetrics } from '@/types/api';
import { getEnhancedImageUrl, getExplanationImageUrl } from '@/services/api';

interface Props {
  originalImage: string | null;
  quality: QualityMetrics;
  prediction: Prediction;
}

function StepImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-900">
      <img
        src={src}
        alt={alt}
        className="w-full h-40 object-contain"
      />
    </div>
  );
}

export default function WorkflowViewer({ originalImage, quality, prediction }: Props) {
  const stamp = useMemo(
    () => Date.now(),
    [originalImage, prediction.grade, prediction.confidence]
  );
  const enhancedUrl = `${getEnhancedImageUrl()}?t=${stamp}`;
  const gradCamUrl = `${getExplanationImageUrl()}?t=${stamp}`;

  const steps = [
    {
      number: '01',
      title: 'Image Acquisition',
      description: 'Original fundus image received from the screening workstation.',
      icon: ImageIcon,
      content: originalImage ? (
        <StepImage src={originalImage} alt="Original uploaded fundus image" />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
          No image available
        </div>
      ),
      footer: 'Input image',
    },
    {
      number: '02',
      title: 'Quality Assessment',
      description: 'Focus, illumination, contrast and image adequacy are checked before inference.',
      icon: CheckCircle2,
      content: originalImage ? (
        <div className="relative">
          <StepImage src={originalImage} alt="Fundus image used for quality assessment" />
          <div className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
            {quality.acceptable ? 'ACCEPTABLE' : 'RETAKE'}
          </div>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
          Quality image unavailable
        </div>
      ),
      footer: `Score ${quality.quality_score.toFixed(2)} · Sharpness ${quality.sharpness.toFixed(1)}`,
    },
    {
      number: '03',
      title: 'Adaptive Enhancement',
      description: 'CLAHE-based enhancement and preprocessing prepare the image for AI inference.',
      icon: Sparkles,
      content: (
        <StepImage
          src={enhancedUrl}
          alt="Enhanced fundus image after preprocessing"
        />
      ),
      footer: 'Enhanced inference image',
    },
    {
      number: '04',
      title: 'AI Inference + XAI',
      description: 'EfficientNet-B0 predicts DR severity and Grad-CAM provides an attention map for review.',
      icon: Stethoscope,
      content: (
        <div className="space-y-2">
          <StepImage
            src={gradCamUrl}
            alt="Grad-CAM explanation for the AI prediction"
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Grade</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-800">
                {prediction.grade} — {prediction.grade_name}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Confidence</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-800">
                {(prediction.confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      ),
      footer: prediction.referable_dr ? 'Referable DR: Yes' : 'Referable DR: No',
    },
  ];

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Retinal Image Processing Workflow</h2>
        <p className="text-xs text-slate-500 mt-1.5">
          Visual trace of the screening pipeline from image acquisition through AI inference.
        </p>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-50 border border-teal-100 text-xs font-bold text-teal-700">
                    {step.number}
                  </span>
                  <Icon className="w-4 h-4 text-teal-700" aria-hidden="true" />
                  <p className="text-xs font-semibold text-slate-800">{step.title}</p>
                </div>

                {step.content}

                <p className="mt-2.5 text-[10px] font-medium text-slate-500">
                  {step.footer}
                </p>

                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-4 rounded-md border border-teal-100 bg-teal-50/60 px-3.5 py-2.5 text-[11px] text-teal-900/80">
          The workflow uses the same screening image and inference outputs already shown in the sections above; it is a visual trace of the prototype pipeline, not a separate diagnostic model.
        </div>
      </div>
    </section>
  );
}
