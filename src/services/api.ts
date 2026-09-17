import type {
  HealthResponse,
  ScreenResponse,
} from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return (await res.json()) as HealthResponse;
}

export async function predictFundusImage(file: File): Promise<ScreenResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (res.status === 422) {
    throw new Error('The submitted image could not be processed. Please upload a valid fundus image.');
  }
  if (res.status === 500) {
    throw new Error('Unable to complete screening. Please try again with a valid fundus image.');
  }
  if (!res.ok) {
    throw new Error('Screening service returned an error. Please try again.');
  }

  const data = await res.json();
  if (!data || typeof data.status !== 'string') {
    throw new Error('Received an unexpected response from the screening service.');
  }
  return data as ScreenResponse;
}

export function getExplanationImageUrl(): string {
  return `${BASE_URL}/explanation/latest`;
}

export { BASE_URL };
