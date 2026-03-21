export type Farm = {
  id: string;
  name: string;
};

type FarmPhoto = {
  uri: string;
  label?: string;
  analysis?: string;
  createdAt: number;
};

const initialFarms: Farm[] = [
  { id: 'lower-field', name: 'Lower field' },
  { id: 'north-plot', name: 'North plot' },
];

let farms: Farm[] = [...initialFarms];
let selectedFarmId: string | null = initialFarms[0].id;
const farmPhotosById: Record<string, FarmPhoto[]> = {};

for (const farm of initialFarms) {
  farmPhotosById[farm.id] = [];
}

export async function getFarms(): Promise<Farm[]> {
  return [...farms];
}

export async function addFarm(name: string): Promise<Farm> {
  const trimmedName = name.trim();
  const farm: Farm = {
    id: `${trimmedName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    name: trimmedName,
  };
  farms = [...farms, farm];
  farmPhotosById[farm.id] = [];
  selectedFarmId = farm.id;
  return farm;
}

export async function getSelectedFarmId(): Promise<string | null> {
  return selectedFarmId;
}

export async function setSelectedFarmId(farmId: string): Promise<void> {
  selectedFarmId = farmId;
}

export async function getFarmPhotos(
  farmId: string
): Promise<Array<{ uri: string; label?: string; analysis?: string; createdAt: number }>> {
  return [...(farmPhotosById[farmId] ?? [])].sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveFarmPhoto(params: {
  farmId: string;
  uri: string;
  label?: string;
  analysis?: string;
}): Promise<void> {
  const { farmId, uri, label, analysis } = params;
  if (!farmPhotosById[farmId]) {
    farmPhotosById[farmId] = [];
  }

  farmPhotosById[farmId].push({
    uri,
    label,
    analysis,
    createdAt: Date.now(),
  });
}
