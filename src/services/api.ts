import type {
  HealthResponse,
  ScreenResponse,
} from '@/types/api';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Keep uploads below Vercel's 4.5 MB Function request payload limit.
const MAX_UPLOAD_BYTES = 3.8 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

// Images returned directly by /predict.
// This avoids depending on Vercel function-instance memory.
let latestGradcamImage: string | null = null;
let latestEnhancedImage: string | null = null;
let latestRetinalStructureImage: string | null = null;
let imageRevision = 0;

type ScreeningResponseWithOutputs = ScreenResponse & {
  outputs?: {
    gradcam?: string;
    enhanced_image?: string;
    retinal_structure?: string;
  };
};


function clearLatestOutputImages(): void {
  latestGradcamImage = null;
  latestEnhancedImage = null;
  latestRetinalStructureImage = null;
}


function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error('The selected image could not be read.'),
      );
    };

    image.src = url;
  });
}


function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              'Could not prepare the image for upload.',
            ),
          );
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      quality,
    );
  });
}


async function optimizeUploadImage(
  file: File,
): Promise<File> {
  if (file.size <= MAX_UPLOAD_BYTES) {
    return file;
  }

  const image = await loadImage(file);

  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION /
      Math.max(
        image.naturalWidth,
        image.naturalHeight,
      ),
  );

  const width = Math.max(
    1,
    Math.round(image.naturalWidth * scale),
  );

  const height = Math.max(
    1,
    Math.round(image.naturalHeight * scale),
  );

  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error(
      'Could not prepare the image for upload.',
    );
  }

  context.fillStyle = '#ffffff';
  context.fillRect(
    0,
    0,
    width,
    height,
  );

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  context.drawImage(
    image,
    0,
    0,
    width,
    height,
  );

  let quality = JPEG_QUALITY;

  let blob = await canvasToBlob(
    canvas,
    quality,
  );

  while (
    blob.size > MAX_UPLOAD_BYTES &&
    quality > 0.55
  ) {
    quality -= 0.07;

    blob = await canvasToBlob(
      canvas,
      quality,
    );
  }

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      'The image is too large to upload. Please choose a smaller fundus image.',
    );
  }

  return new File(
    [blob],
    `${file.name.replace(/\.[^.]+$/, '')}-optimized.jpg`,
    {
      type: 'image/jpeg',
      lastModified: Date.now(),
    },
  );
}


export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(
    `${BASE_URL}/health`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!res.ok) {
    throw new Error(
      `Health check failed: ${res.status}`,
    );
  }

  return (await res.json()) as HealthResponse;
}


export async function predictFundusImage(
  file: File,
): Promise<ScreenResponse> {

  clearLatestOutputImages();

  const uploadFile =
    await optimizeUploadImage(file);

  const formData = new FormData();

  formData.append(
    'file',
    uploadFile,
  );

  let res: Response;

  try {
    res = await fetch(
      `${BASE_URL}/predict`,
      {
        method: 'POST',
        body: formData,
      },
    );
  } catch {
    throw new Error(
      'Could not reach the screening service. Please check your internet connection and try again.',
    );
  }

  if (res.status === 413) {
    throw new Error(
      'The image is too large for the cloud screening service. Please choose a smaller image.',
    );
  }

  if (res.status === 422) {
    throw new Error(
      'The submitted image could not be processed. Please upload a valid fundus image.',
    );
  }

  if (res.status === 500) {
    throw new Error(
      'Unable to complete screening. Please try again with a valid fundus image.',
    );
  }

  if (!res.ok) {
    throw new Error(
      'Screening service returned an error. Please try again.',
    );
  }

  const data =
    (await res.json()) as ScreeningResponseWithOutputs;

  if (
    !data ||
    typeof data.status !== 'string'
  ) {
    throw new Error(
      'Received an unexpected response from the screening service.',
    );
  }

  if (
    data.status === 'ok' &&
    data.outputs
  ) {
    latestGradcamImage =
      data.outputs.gradcam ?? null;

    latestEnhancedImage =
      data.outputs.enhanced_image ?? null;

    latestRetinalStructureImage =
      data.outputs.retinal_structure ?? null;

    imageRevision += 1;
  }

  return data;
}


function decorateDataUrl(
  cached: string | null,
  fallbackPath: string,
): string {

  if (cached) {
    // Fragment is ignored when the browser reads the data URL.
    // Existing UI code may append "?t=..." after this fragment,
    // so it remains a valid image URL.
    return `${cached}#retinoxai-${imageRevision}`;
  }

  return `${BASE_URL}${fallbackPath}`;
}


export function getExplanationImageUrl(): string {
  return decorateDataUrl(
    latestGradcamImage,
    '/explanation/latest',
  );
}


export function getRetinalStructureImageUrl(): string {
  return decorateDataUrl(
    latestRetinalStructureImage,
    '/retinal-structure/latest',
  );
}


export function getEnhancedImageUrl(): string {
  return decorateDataUrl(
    latestEnhancedImage,
    '/enhanced/latest',
  );
}


export { BASE_URL };
