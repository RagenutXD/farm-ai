import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { getFarmPhotos, getFarms, getSelectedFarmId } from '@/services/farmStore';

const colors = {
  background: '#140A2B',
  card: '#2E1D4B',
  textPrimary: '#F7F2FF',
  textMuted: '#CDB9EE',
};

type FarmPhoto = {
  uri: string;
  label?: string;
  analysis?: string;
  createdAt: number;
};

export default function Field() {
  const { farmId } = useLocalSearchParams<{ farmId?: string }>();
  const [farmName, setFarmName] = useState('Farm');
  const [photos, setPhotos] = useState<FarmPhoto[]>([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const chosenFarmId = farmId ?? (await getSelectedFarmId()) ?? '';
        if (!chosenFarmId) return;
        const [allFarms, images] = await Promise.all([getFarms(), getFarmPhotos(chosenFarmId)]);
        const farm = allFarms.find((item) => item.id === chosenFarmId);
        setFarmName(farm?.name ?? 'Farm');
        setPhotos(images);
      };
      void load();
    }, [farmId])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{farmName}</Text>
      <Text style={styles.subtitle}>Photos for this farm</Text>

      <ScrollView contentContainerStyle={styles.grid}>
        {photos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No photos yet. Scan a crop and save the image to this farm in Analytics.
            </Text>
          </View>
        ) : (
          photos.map((photo, index) => (
            <View key={`${photo.uri}-${index}`} style={styles.photoCard}>
              <Image source={{ uri: photo.uri }} style={styles.photo} />
              <Text style={styles.photoLabel}>{photo.label ?? 'Scanned crop'}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 14,
  },
  grid: {
    gap: 12,
    paddingBottom: 20,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
  },
  emptyStateText: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },
  photoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 220,
  },
  photoLabel: {
    color: colors.textPrimary,
    padding: 10,
    fontSize: 15,
    fontWeight: '700',
  },
});