import React, { useState } from 'react';
import { View, Text, Button, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useModel } from '@/services/useModel';

export default function Scan() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const { runInference, loading, isReady } = useModel();

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const res = await ImagePicker.launchCameraAsync();

    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
      setResult(null);
    }
  };

  const analyze = async () => {
    if (!imageUri) return;

    try {
      const output = await runInference(imageUri);
      console.log('Model output:', output);
      setResult(output);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Take Photo" onPress={takePhoto} />
      <Button title="Pick Image" onPress={pickImage} />

      {imageUri && (
        <>
          <Image
            source={{ uri: imageUri }}
            style={{ width: 200, height: 200, marginTop: 20 }}
          />
          <Button
            title={isReady ? 'Analyze' : 'Loading Model...'}
            onPress={analyze}
            disabled={!isReady}
          />
        </>
      )}

      {loading && <ActivityIndicator size="large" />}

      {result && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            Result: {result.label}
          </Text>
          <Text>
            Confidence: {(result.confidence * 100).toFixed(2)}%
          </Text>
        </View>
      )}

    </View>
  );
}

