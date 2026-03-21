import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { getFarms, getSelectedFarmId, saveFarmPhoto, setSelectedFarmId, type Farm } from '@/services/farmStore';

export default function Analytics() {
  const { imageUri, label, analysis } = useLocalSearchParams();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmIdState] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadFarms = async () => {
      const allFarms = await getFarms();
      const activeFarmId = (await getSelectedFarmId()) ?? allFarms[0]?.id ?? '';
      setFarms(allFarms);
      setSelectedFarmIdState(activeFarmId);
    };
    void loadFarms();
  }, []);

  const selectedFarmName = useMemo(
    () => farms.find((farm) => farm.id === selectedFarmId)?.name ?? 'None',
    [farms, selectedFarmId]
  );

  const onSaveToFarm = async () => {
    if (!imageUri || !selectedFarmId) return;
    setIsSaving(true);
    try {
      await saveFarmPhoto({
        farmId: selectedFarmId,
        uri: imageUri as string,
        label: label as string | undefined,
        analysis: analysis as string | undefined,
      });
      await setSelectedFarmId(selectedFarmId);
      Alert.alert('Saved', `Photo saved to ${selectedFarmName}.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analysis Result</Text>

      <Image
        source={{ uri: imageUri as string }}
        style={styles.preview}
      />

      <Text style={styles.bodyText}>Result: {label}</Text>

      <Text style={styles.bodyText}>
        {analysis ? analysis : 'You need to be online to get an analysis'}
      </Text>

      <Text style={styles.sectionTitle}>Save image to farm</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={selectedFarmId} onValueChange={(value) => setSelectedFarmIdState(value)}>
          {farms.map((farm) => (
            <Picker.Item key={farm.id} label={farm.name} value={farm.id} />
          ))}
        </Picker>
      </View>

      <Pressable
        onPress={onSaveToFarm}
        disabled={isSaving || !selectedFarmId || !imageUri}
        style={[styles.saveButton, (isSaving || !selectedFarmId || !imageUri) && styles.saveButtonDisabled]}
      >
        <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save to selected farm'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#140A2B',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 16,
    color: '#F7F2FF',
  },
  preview: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 18,
    color: '#F7F2FF',
    marginBottom: 10,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '800',
    color: '#CDB9EE',
  },
  pickerWrap: {
    borderRadius: 10,
    backgroundColor: '#2E1D4B',
    marginBottom: 14,
    overflow: 'hidden',
  },
  saveButton: {
    borderRadius: 10,
    backgroundColor: '#33D16A',
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonText: {
    color: '#0A371B',
    fontWeight: '900',
    fontSize: 16,
  },
});