export const LABELS: Record<number, string> = {
  0: 'Corn - Common Rust',
  1: 'Corn - Gray Leaf Spot',
  2: 'Corn - Healthy',
  3: 'Corn - Northern Leaf Blight',
  4: 'Invalid',
  5: 'Potato - Early Blight',
  6: 'Potato - Late Blight',
  7: 'Potato - Healthy',
  8: 'Rice - Brown Spot',
  9: 'Rice - Healthy',
  10: 'Rice - Hispa',
  11: 'Rice - Leaf Blast',
  12: 'Wheat - Brown Rust',
  13: 'Wheat - Healthy',
  14: 'Wheat - Yellow Rust',
};

export interface ModelPrediction {
  label: string;
  confidence: number;
  isValid: boolean;
}

export function getTopResult(cpuData: Float32Array): ModelPrediction {
  let maxIdx = 0;
  let maxVal = cpuData[0];

  for (let i = 1; i < cpuData.length; i++) {
    if (cpuData[i] > maxVal) {
      maxVal = cpuData[i];
      maxIdx = i;
    }
  }

  return {
    label: LABELS[maxIdx],
    confidence: Math.round(maxVal * 100),
    isValid: maxIdx !== 4, // index 4 is "Invalid"
  };
}