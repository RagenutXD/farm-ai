import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { addFarm, getFarms, setSelectedFarmId, type Farm } from '@/services/farmStore';

const colors = {
  background: '#140A2B',
  card: '#2E1D4B',
  cardMuted: '#5E4784',
  primary: '#33D16A',
  primaryDark: '#1FA451',
  textPrimary: '#F7F2FF',
  textMuted: '#CDB9EE',
  danger: '#B81818',
  whiteCard: '#FDFBFF',
  whiteCardText: '#2A1450',
};

export default function Dashboard() {
  const router = useRouter();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmIdState] = useState<string | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newFarmName, setNewFarmName] = useState('');

  useEffect(() => {
    const loadFarms = async () => {
      const allFarms = await getFarms();
      setFarms(allFarms);
      if (allFarms.length > 0) {
        const initialFarmId = allFarms[0].id;
        setSelectedFarmIdState(initialFarmId);
        await setSelectedFarmId(initialFarmId);
      }
    };
    void loadFarms();
  }, []);

  const selectedFarm = useMemo(
    () => farms.find((farm) => farm.id === selectedFarmId) ?? null,
    [farms, selectedFarmId]
  );

  const onSelectFarm = async (farm: Farm) => {
    setSelectedFarmIdState(farm.id);
    await setSelectedFarmId(farm.id);
    router.push({ pathname: '/field', params: { farmId: farm.id } });
  };

  const onAddFarm = async () => {
    if (!newFarmName.trim()) return;
    const farm = await addFarm(newFarmName);
    const allFarms = await getFarms();
    setFarms(allFarms);
    setSelectedFarmIdState(farm.id);
    setNewFarmName('');
    setAddModalVisible(false);
    router.push({ pathname: '/field', params: { farmId: farm.id } });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.onlineText}>ONLINE | Zamboanga del Norte | 5:00 A.M.</Text>
        <Text style={styles.logoText}>Farm AI</Text>
        <Text style={styles.greetingText}>
          GOOD MORNING, {selectedFarm?.name?.toUpperCase() ?? 'FARMER'}!
        </Text>

        <Text style={styles.sectionTitle}>MY FARMS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.farmRow}>
          {farms.map((farm) => (
            <TouchableOpacity
              key={farm.id}
              activeOpacity={0.85}
              onPress={() => onSelectFarm(farm)}
              style={[
                styles.farmCard,
                selectedFarmId === farm.id && { borderColor: colors.primary, borderWidth: 2 },
              ]}
            >
              <View style={styles.farmCardImage} />
              <Text style={styles.farmCardLabel}>{farm.name}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setAddModalVisible(true)}
            style={[styles.farmCard, styles.addFarmCard]}
          >
            <Text style={styles.addFarmPlus}>+</Text>
            <Text style={styles.farmCardLabel}>Add farm</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity
          style={styles.scanButton}
          activeOpacity={0.9}
          onPress={() => router.push('/scan')}
        >
          <Text style={styles.scanButtonText}>SCAN MY CROP</Text>
        </TouchableOpacity>

        <View style={styles.bottomCards}>
          <View style={[styles.infoCard, { backgroundColor: colors.danger }]}>
            <Text style={styles.infoSmall}>TOP THREAT</Text>
            <Text style={styles.infoLarge}>BPH . HIGH</Text>
            <Text style={styles.infoSmall}>{selectedFarm?.name ?? 'No farm selected'}</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.whiteCard }]}>
            <Text style={[styles.infoSmall, { color: colors.whiteCardText }]}>LAST SCAN</Text>
            <Text style={[styles.infoLarge, { color: colors.whiteCardText }]}>2 days ago</Text>
            <Text style={[styles.infoSmall, { color: colors.whiteCardText }]}>
              {selectedFarm?.name ?? 'No farm selected'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create New Farm</Text>
            <TextInput
              style={styles.modalInput}
              value={newFarmName}
              onChangeText={setNewFarmName}
              placeholder="Farm name"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setAddModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={onAddFarm} style={styles.createButton}>
                <Text style={styles.createButtonText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
  },
  onlineText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  logoText: {
    color: colors.primary,
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 46,
  },
  greetingText: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 8,
  },
  farmRow: {
    gap: 12,
    paddingVertical: 4,
  },
  farmCard: {
    width: 120,
    borderRadius: 12,
    backgroundColor: colors.card,
    padding: 8,
  },
  farmCardImage: {
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.cardMuted,
    marginBottom: 8,
  },
  farmCardLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  addFarmCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3F2A60',
  },
  addFarmPlus: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: '300',
    marginBottom: 4,
  },
  scanButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 14,
    borderWidth: 4,
    borderColor: colors.primaryDark,
    paddingVertical: 14,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#09351A',
    fontSize: 28,
    fontWeight: '900',
  },
  bottomCards: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  infoCard: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
  },
  infoSmall: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  infoLarge: {
    color: colors.textPrimary,
    fontWeight: '900',
    fontSize: 28,
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  modalInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.textMuted,
    color: colors.textPrimary,
    paddingHorizontal: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  createButtonText: {
    color: '#0A371B',
    fontWeight: '900',
  },
});
