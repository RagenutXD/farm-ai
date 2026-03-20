import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View>
        <Text>Camera access is needed to continue.</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const snap = await cameraRef.current.takePictureAsync({ base64: true });
    if (snap) {
      setPhoto(snap.uri);
      setResult(null);
    }
  };

  const analyzePhoto = async () => {
    if (!photo) return;
    setAnalyzing(true);
    try {
      // TODO: Replace with your AI API call.
      // const snap = await cameraRef.current.takePictureAsync({ base64: true });
      // const response = await fetch("https://api.anthropic.com/v1/messages", { ... });
      // const data = await response.json();
      // setResult(data.content[0].text);

      await new Promise((r) => setTimeout(r, 1500)); // simulated delay
      setResult("AI analysis will appear here.");
    } finally {
      setAnalyzing(false);
    }
  };

  const retake = () => {
    setPhoto(null);
    setResult(null);
  };

  if (photo) {
    return (
      <View>
        <Image source={{ uri: photo }} style={{ width: "100%", height: 400 }} />
        {result ? (
          <View>
            <Text>{result}</Text>
            <TouchableOpacity onPress={retake}>
              <Text>Take Another</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <TouchableOpacity onPress={retake}>
              <Text>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={analyzePhoto} disabled={analyzing}>
              {analyzing ? <ActivityIndicator /> : <Text>Analyze</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
      <TouchableOpacity onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}>
        <Text>Flip</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={takePicture}>
        <Text>Take Photo</Text>
      </TouchableOpacity>
    </CameraView>
  );
}
