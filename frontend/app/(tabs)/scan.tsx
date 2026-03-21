import React, { useState } from 'react';
import { View, Text, Button, Image, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useImagePicker } from '@/services/useImagePicker';
import { useScanAnalysis } from '@/services/useScanAnalysis';

export default function Scan() {
  const [selectedCrop, setSelectedCrop] = useState<'Rice' | 'Corn' | 'Potato' | 'Wheat'>('Rice');

  const { imageUri, pickImage, takePhoto, permission, requestPermission } = useImagePicker();
  const { analyze, localLoading, isReady, status } = useScanAnalysis(imageUri, selectedCrop);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View>
        <Text>Permission needed</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Crop Dropdown */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Select Crop:</Text>
      <Picker
        selectedValue={selectedCrop}
        onValueChange={(itemValue) => setSelectedCrop(itemValue)}
        style={{ height: 50, width: 200, marginBottom: 20 }}
      >
        <Picker.Item label="Rice" value="Rice" />
        <Picker.Item label="Corn" value="Corn" />
        <Picker.Item label="Potato" value="Potato" />
        <Picker.Item label="Wheat" value="Wheat" />
      </Picker>

      {/* Image buttons */}
      <Button title="Take Photo" onPress={takePhoto} />
      <Button title="Pick Image" onPress={pickImage} />

      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginTop: 20 }} />
          <Button
            title={isReady ? 'Analyze' : 'Loading Model...'}
            onPress={analyze}
            disabled={!isReady || localLoading}
          />
        </>
      )}

      {localLoading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      <Text style={{ marginTop: 20 }}>Server Status: {status}</Text>
    </View>
  );
}

