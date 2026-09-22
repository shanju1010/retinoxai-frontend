export interface HealthResponse {
  status: string;
  device: string;
  model: string;
  checkpoint_exists: boolean;
}

export interface Prediction {
  grade: number;
  grade_name: string;
  confidence: number;
  referable_dr: boolean;
}

export interface QualityMetrics {
  acceptable: boolean;
  quality_score: number;
  sharpness: number;
  brightness: number;
  contrast: number;
  reasons: string[];
}

export interface RetinalStructure {
  vessels: {
    analyzed: boolean;
    candidate_pixels: number;
    density: number;
  };
  optic_disc: {
    detected: boolean;
    center_x: number;
    center_y: number;
    radius: number;
    confidence: number;
  };
  fovea: {
    estimated: boolean;
    center_x: number;
    center_y: number;
    confidence: number;
    method: string;
  };
}

export interface PredictionOutputs {
  gradcam: string;
  enhanced_image: string;
  retinal_structure: string;
}

export interface PredictionResponse {
  status: 'ok';
  prediction: Prediction;
  quality: QualityMetrics;
  retinal_structure: RetinalStructure;
  outputs: PredictionOutputs;
  note: string;
}

export interface RetakeResponse {
  status: 'retake';
  message: string;
  quality: QualityMetrics;
}

export type ScreenResponse = PredictionResponse | RetakeResponse;

export type HealthStatus = 'checking' | 'ready' | 'unavailable';
export type ReviewStatus = 'pending' | 'reviewed' | 'reevaluation';

export const DR_GRADES: Record<number, string> = {
  0: 'No DR',
  1: 'Mild',
  2: 'Moderate',
  3: 'Severe',
  4: 'Proliferative DR',
};
