import { useModel } from '@/services/useModel';
import { useServerCheck } from '@/services/useServerCheck';
import { useRouter } from 'expo-router';

export function useScanAnalysis(imageUri: string | null, selectedCrop: any) {
  const router = useRouter();
  const { runInference, loading: localLoading, isReady } = useModel();
  const { status, check } = useServerCheck('https://google.com'); // using a random link to check rn

  const analyzeLocally = async () => {
    if (!imageUri) return;
    try {
      const output = await runInference(imageUri, selectedCrop);
      router.push({
        pathname: '/analytics',
        params: { imageUri, label: output.label },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const analyzeGemini = async () => {
    // Placeholder for Gemini analysis
  };

  const analyze = async () => {
    const ok = await check();
    if (!ok) analyzeLocally();
    else analyzeGemini();
  };

  return { analyze, localLoading, isReady, status };
}