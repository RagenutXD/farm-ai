import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { loginWithPhone } from '@/services/auth';

const colors = {
  background: '#140A2B',
  card: '#331C52',
  textPrimary: '#F7F2FF',
  textMuted: '#9A6DE3',
  primary: '#33D16A',
  inputBg: '#E3FFE8',
  inputText: '#2A1450',
};

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Missing phone number', 'Please enter your phone number.');
      return;
    }

    setLoading(true);
    try {
      await loginWithPhone(phoneNumber.trim());
      router.replace('/dashboard');
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Image source={require('../assets/images/icon.png')} style={styles.logoImage} resizeMode="cover" />
      </View>
      <Text style={styles.title}>Login</Text>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>PHONE NUMBER</Text>
        <View style={styles.inputRow}>
          <Ionicons name="call" size={22} color={colors.textPrimary} />
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            keyboardType="phone-pad"
            placeholder="09XXXXXXXXX"
            placeholderTextColor="#7B6D9B"
          />
        </View>
      </View>

      <Pressable style={[styles.submitButton, loading && { opacity: 0.5 }]} onPress={onLogin} disabled={loading}>
        <Text style={styles.submitText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </Pressable>

      <Pressable onPress={() => router.replace('/register')}>
        <Text style={styles.bottomText}>
          Don&apos;t have an account? <Text style={styles.linkText}>Create account</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 26, paddingTop: 72 },
  logoBox: {
    alignSelf: 'center',
    width: 138,
    height: 138,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#271546',
    marginBottom: 10,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: { color: colors.primary, fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  fieldWrap: { marginBottom: 14 },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 4, marginLeft: 34 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: colors.inputBg,
    color: colors.inputText,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 2,
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: { color: '#E8FDEB', fontSize: 20, fontWeight: '900' },
  bottomText: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  linkText: {
    color: '#D4B8FF',
    textDecorationLine: 'underline',
  },
});
