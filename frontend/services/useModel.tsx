import { useEffect, useState } from 'react';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { Asset } from 'expo-asset';
import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';

const INPUT_SIZE = 224;

// Your class labels
const CLASS_MAP = [
  'Corn___Common_Rust',
  'Corn___Gray_Leaf_Spot',
  'Corn___Healthy',
  'Corn___Northern_Leaf_Blight',
  'Invalid',
  'Potato Early blight',
  'Potato Late blight',
  'Potato healthy',
  'Rice___Brown_Spot',
  'Rice___Healthy',
  'Rice___Hispa',
  'Rice___Leaf_Blast',
  'Wheat___Brown_Rust',
  'Wheat___Healthy',
  'Wheat___Yellow_Rust',
];

export function useModel() {
  const [session, setSession] = useState<InferenceSession | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const asset = Asset.fromModule(require('../assets/best.onnx'));
        await asset.downloadAsync();

        const sess = await InferenceSession.create(asset.localUri!);
        setSession(sess);

        console.log('Model loaded');
        console.log('Inputs:', sess.inputNames);
        console.log('Outputs:', sess.outputNames);
      } catch (e) {
        console.error('Model load error:', e);
      }
    };

    loadModel();
  }, []);

  const preprocess = async (uri: string) => {
    const img = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: INPUT_SIZE, height: INPUT_SIZE } }],
      { base64: true, format: ImageManipulator.SaveFormat.JPEG }
    );

    if (!img.base64) throw new Error('No base64');

    const raw = atob(img.base64);
    const buffer = new Uint8Array(raw.length);

    for (let i = 0; i < raw.length; i++) {
      buffer[i] = raw.charCodeAt(i);
    }

    const decoded = jpeg.decode(buffer, { useTArray: true });
    const { data, width, height } = decoded;

    const floatData = new Float32Array(1 * 3 * width * height);
    const size = width * height;

    // normalization thing
    for (let i = 0; i < size; i++) {
      const r = data[i * 4] / 255;
      const g = data[i * 4 + 1] / 255;
      const b = data[i * 4 + 2] / 255;

      floatData[i] = r;
      floatData[i + size] = g;
      floatData[i + 2 * size] = b;
    }

    return floatData;
  };

    const parseClassifierWithCrop = (
    output: any,
    selectedCrop: 'Rice' | 'Corn' | 'Potato' | 'Wheat'
  ) => {
    const key = Object.keys(output)[0];
    const data = output[key].data as Float32Array;

    let maxIdx = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i] > data[maxIdx]) maxIdx = i;
    }

    if (CLASS_MAP[maxIdx] === 'Invalid') {
      return {
        label: 'Invalid',
        confidence: data[maxIdx],
      };
    }

    // Step 2: Filter classes by selected crop
    const cropClasses: { index: number; score: number }[] = [];

    data.forEach((score, idx) => {
      if (CLASS_MAP[idx].startsWith(selectedCrop)) {
        cropClasses.push({ index: idx, score });
      }
    });

    // Step 3: Pick the highest among the filtered crop classes
    if (cropClasses.length === 0) {
      return {
        label: 'Invalid',
        confidence: 0,
      };
    }

    cropClasses.sort((a, b) => b.score - a.score);
    const best = cropClasses[0];

    return {
      label: CLASS_MAP[best.index],
      confidence: best.score,
    };
  };

  const runInference = async (imageUri: string, cropType: 'Rice' | 'Corn' | 'Potato' | 'Wheat') => {
    if (!session) throw new Error('Model not loaded');

    setLoading(true);
    try {
      const inputData = await preprocess(imageUri);

      const tensor = new Tensor('float32', inputData, [1, 3, INPUT_SIZE, INPUT_SIZE]);
      const feeds: Record<string, Tensor> = {};
      feeds[session.inputNames[0]] = tensor;

      const output = await session.run(feeds);

      // Use new parser with crop filtering
      const prediction = parseClassifierWithCrop(output, cropType);

      return prediction;
    } finally {
      setLoading(false);
    }
  };

  return {
    runInference,
    loading,
    isReady: !!session,
  };
}
