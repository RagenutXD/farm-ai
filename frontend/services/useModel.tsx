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

  // 🔹 Load model
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

  // 🔹 Preprocess (YOLO-style)
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

    // ✅ YOLO normalization (just /255)
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

  const parseClassifier = (output: any) => {
  const key = Object.keys(output)[0];
  const data = output[key].data as Float32Array;

  let maxIdx = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i] > data[maxIdx]) {
      maxIdx = i;
    }
  }

  return {
    label: CLASS_MAP[maxIdx],
    confidence: data[maxIdx],
  };
};


  // 🔹 Run inference
  const runInference = async (imageUri: string) => {
    if (!session) throw new Error('Model not loaded');

    setLoading(true);

    try {
      const inputData = await preprocess(imageUri);

      const tensor = new Tensor('float32', inputData, [
        1,
        3,
        INPUT_SIZE,
        INPUT_SIZE,
      ]);

      const feeds: Record<string, Tensor> = {};
      feeds[session.inputNames[0]] = tensor;

      const output = await session.run(feeds);
      const prediction = parseClassifier(output);  // 👈 replace parseYOLO
      return prediction;
    } catch (e) {
      console.error('Inference error:', e);
      throw e;
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
