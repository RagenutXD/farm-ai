import * as FileSystem from 'expo-file-system/legacy';

const SESSION_FILE = `${FileSystem.documentDirectory}farm_ai_session.json`;
const USERS_FILE = `${FileSystem.documentDirectory}farm_ai_users.json`;

export type AuthUser = {
  id: string;
  phoneNumber: string;
  name: string;
  location?: { latitude: number; longitude: number } | null;
  pincode?: string | null;
};

type RegisterPayload = {
  phoneNumber: string;
  fullName: string;
  pincode: string;
};

async function readUsers(): Promise<AuthUser[]> {
  const info = await FileSystem.getInfoAsync(USERS_FILE);
  if (!info.exists) return [];
  const raw = await FileSystem.readAsStringAsync(USERS_FILE);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AuthUser[];
  } catch {
    return [];
  }
}

async function writeUsers(users: AuthUser[]): Promise<void> {
  await FileSystem.writeAsStringAsync(USERS_FILE, JSON.stringify(users));
}

async function writeSession(user: AuthUser): Promise<void> {
  await FileSystem.writeAsStringAsync(SESSION_FILE, JSON.stringify(user));
}

export async function registerWithPhone(payload: RegisterPayload): Promise<AuthUser> {
  const users = await readUsers();
  const phoneNumber = payload.phoneNumber.trim();
  const fullName = payload.fullName.trim();
  const pincode = payload.pincode.trim();

  const exists = users.some((u) => u.phoneNumber === phoneNumber);
  if (exists) {
    throw new Error('Phone already registered');
  }

  const user: AuthUser = {
    id: `user-${Date.now()}`,
    phoneNumber,
    name: fullName || 'Farmer',
    pincode: pincode || null,
    location: null,
  };

  await writeUsers([...users, user]);
  await writeSession(user);
  return user;
}

export async function loginWithPhone(phoneNumber: string): Promise<AuthUser> {
  const users = await readUsers();
  const user = users.find((u) => u.phoneNumber === phoneNumber.trim());
  if (!user) {
    throw new Error('User not found');
  }
  await writeSession(user);
  return user;
}

export async function setCurrentUserLocation(location: { latitude: number; longitude: number }): Promise<void> {
  const session = await getCurrentSession();
  if (!session) return;

  const updatedSession: AuthUser = { ...session, location };
  await writeSession(updatedSession);

  const users = await readUsers();
  const updatedUsers = users.map((u) => (u.id === session.id ? { ...u, location } : u));
  await writeUsers(updatedUsers);
}

export async function getCurrentSession(): Promise<AuthUser | null> {
  const info = await FileSystem.getInfoAsync(SESSION_FILE);
  if (!info.exists) return null;
  const raw = await FileSystem.readAsStringAsync(SESSION_FILE);
  if (!raw) return null;
  return JSON.parse(raw) as AuthUser;
}

export async function logout(): Promise<void> {
  const info = await FileSystem.getInfoAsync(SESSION_FILE);
  if (info.exists) {
    await FileSystem.deleteAsync(SESSION_FILE, { idempotent: true });
  }
}
