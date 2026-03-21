import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useScanAnalysis } from '@/services/useScanAnalysis';

export default function Scan() {
  const [selectedCrop, setSelectedCrop] = useState<'Rice' | 'Corn' | 'Potato' | 'Wheat'>('Rice');
  const [growthRate, setGrowthRate] = useState('Flowering / Reproductive');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const { analyze, localLoading, isReady, status } = useScanAnalysis(imageUri, selectedCrop);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionWrap}>
        <Text style={styles.permissionText}>Camera permission is required.</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const onSnap = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    if (photo?.uri) setImageUri(photo.uri);
  };

  const onPickFromAlbum = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: false,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const onToggleFlash = () => {
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  const onFlip = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.onlineText}>ONLINE | Zamboanga del Norte | 5:00 A.M.</Text>
      <Text style={styles.logoText}>Farm AI</Text>

      <View style={styles.cameraWrap}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} flash={flash} />
        <Pressable style={styles.flipChip} onPress={onFlip}>
          <Text style={styles.flipText}>Flip</Text>
        </Pressable>
      </View>

      <View style={styles.actionBar}>
        <Pressable style={styles.actionButton} onPress={onToggleFlash}>
          <Text style={styles.actionButtonText}>{flash === 'off' ? 'Flash' : 'Flash On'}</Text>
        </Pressable>

        <Pressable style={styles.snapButton} onPress={onSnap}>
          <Text style={styles.snapText}>SNAP</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={onPickFromAlbum}>
          <Text style={styles.actionButtonText}>Album</Text>
        </Pressable>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.inputLabel}>CROP TYPE</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={selectedCrop}
            onValueChange={(itemValue) => setSelectedCrop(itemValue)}
            style={styles.picker}
            dropdownIconColor="#2A1450"
          >
            <Picker.Item label="Rice (Palay)" value="Rice" />
            <Picker.Item label="Corn" value="Corn" />
            <Picker.Item label="Potato" value="Potato" />
            <Picker.Item label="Wheat" value="Wheat" />
          </Picker>
        </View>

        <Text style={styles.inputLabel}>GROWTH RATE</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={growthRate}
            onValueChange={(itemValue) => setGrowthRate(itemValue)}
            style={styles.picker}
            dropdownIconColor="#2A1450"
          >
            <Picker.Item label="Flowering / Reproductive" value="Flowering / Reproductive" />
            <Picker.Item label="Vegetative" value="Vegetative" />
            <Picker.Item label="Maturity" value="Maturity" />
          </Picker>
        </View>

        <Pressable
          onPress={analyze}
          disabled={!imageUri || !isReady || localLoading}
          style={[
            styles.analyzeButton,
            (!imageUri || !isReady || localLoading) && styles.analyzeButtonDisabled,
          ]}
        >
          <Text style={styles.analyzeButtonText}>
            {!imageUri ? 'Take or pick an image first' : isReady ? 'Analyze' : 'Loading model...'}
          </Text>
        </Pressable>

        {localLoading && <ActivityIndicator size="small" style={{ marginTop: 8 }} color="#CDB9EE" />}
        <Text style={styles.statusText}>Server Status: {status}</Text>
      </View>
    </View>
  );
}

const colors = {
  background: '#140A2B',
  card: '#2E1D4B',
  cardDark: '#201238',
  primary: '#33D16A',
  textPrimary: '#F7F2FF',
  textMuted: '#CDB9EE',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 18,
    paddingHorizontal: 12,
  },
  permissionWrap: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  permissionText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  permissionButtonText: {
    color: '#083116',
    fontSize: 16,
    fontWeight: '800',
  },
  onlineText: {
    color: '#B17CF8',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '800',
  },
  logoText: {
    color: colors.primary,
    fontSize: 62,
    lineHeight: 64,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  cameraWrap: {
    height: 360,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.cardDark,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  flipChip: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(20,10,43,0.72)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  flipText: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  actionBar: {
    marginTop: 10,
    backgroundColor: '#2A1044',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    width: 82,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#0A371B',
    fontSize: 16,
    fontWeight: '900',
  },
  snapButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#3A205D',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
  },
  snapText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  formSection: {
    marginTop: 8,
    backgroundColor: '#1A0D34',
    borderRadius: 8,
    padding: 10,
  },
  inputLabel: {
    color: '#8E53D6',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 6,
  },
  pickerWrap: {
    backgroundColor: '#E3FFE8',
    borderRadius: 2,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    color: '#2A1450',
    fontWeight: '800',
  },
  analyzeButton: {
    marginTop: 4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  analyzeButtonDisabled: {
    opacity: 0.45,
  },
  analyzeButtonText: {
    color: '#0A371B',
    fontWeight: '900',
    fontSize: 16,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

