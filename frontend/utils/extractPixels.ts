import * as ImageManipulator from 'expo-image-manipulator';
import jpegjs from 'jpeg-js';

const INPUT_SIZE = 64;

export async function extractPixels(imageUri: string): Promise<Float32Array> {
  // Resize image
  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: INPUT_SIZE, height: INPUT_SIZE } }],
    { base64: true, format: ImageManipulator.SaveFormat.JPEG }
  );

  // Decode base64 to Uint8Array
  const base64 = manipulated.base64!;
  const binaryString = atob(base64);
  const jpegBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    jpegBytes[i] = binaryString.charCodeAt(i);
  }

  // Decode JPEG to raw RGBA pixels
  const { width, height, data: rgba } = jpegjs.decode(jpegBytes, { useTArray: true });

  console.log('decoded image size:', width, height);
  console.log('first 20 rgba:', Array.from(rgba.slice(0, 20)));

  // Convert RGBA to CHW float32 with ImageNet normalization
  const pixelCount = INPUT_SIZE * INPUT_SIZE;
  const float32 = new Float32Array(3 * pixelCount);

  for (let i = 0; i < pixelCount; i++) {
    const r = rgba[i * 4] / 255;
    const g = rgba[i * 4 + 1] / 255;
    const b = rgba[i * 4 + 2] / 255;
    // rgba[i * 4 + 3] is alpha — ignored

    float32[i] = (r - 0.485) / 0.229;
    float32[i + pixelCount] = (g - 0.456) / 0.224;
    float32[i + pixelCount * 2] = (b - 0.406) / 0.225;
  }

  return float32;
}