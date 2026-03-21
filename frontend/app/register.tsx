import React, { useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { registerWithPhone, setCurrentUserLocation } from '@/services/auth';

const colors = {
  background: '#140A2B',
  card: '#331C52',
  textPrimary: '#F7F2FF',
  textMuted: '#9A6DE3',
  primary: '#33D16A',
  inputBg: '#E3FFE8',
  inputText: '#2A1450',
};

const Register = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!phoneNumber.trim() || !fullName.trim()) {
      Alert.alert('Missing fields', 'Please fill phone number and full name.');
      return;
    }

    setLoading(true);
    try {
      await registerWithPhone({
        phoneNumber: phoneNumber.trim(),
        fullName: fullName.trim(),
        pincode: pincode.trim(),
      });

      let permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (permission.granted) {
        try {
          const current = await Location.getCurrentPositionAsync({});
          await setCurrentUserLocation({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          });
        } catch {
          Alert.alert('Location unavailable', 'We could not get your current location right now.');
        }
      } else {
        Alert.alert(
          'Location permission needed',
          'Location was not granted. You can enable it later in Settings.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }

      router.replace('/');
    } catch (error) {
      Alert.alert('Register failed', error instanceof Error ? error.message : 'Unable to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoBox}>
        <Image source={require('../assets/images/icon.png')} style={styles.logoImage} resizeMode="cover" />
      </View>
      <Text style={styles.title}>Create Account</Text>

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

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>FULL NAME</Text>
        <View style={styles.inputRow}>
          <Ionicons name="person" size={22} color={colors.textPrimary} />
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            placeholder="Juan Dela Cruz"
            placeholderTextColor="#7B6D9B"
          />
        </View>
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>PINCODE</Text>
        <View style={styles.inputRow}>
          <Ionicons name="key" size={22} color={colors.textPrimary} />
          <TextInput
            value={pincode}
            onChangeText={setPincode}
            style={styles.input}
            keyboardType="numeric"
            secureTextEntry
            placeholder="••••"
            placeholderTextColor="#7B6D9B"
          />
        </View>
      </View>

      <Pressable style={[styles.submitButton, loading && { opacity: 0.5 }]} onPress={onRegister} disabled={loading}>
        <Text style={styles.submitText}>{loading ? 'Creating...' : 'Create Account'}</Text>
      </Pressable>

      <Pressable onPress={() => router.replace('/login')}>
        <Text style={styles.bottomText}>
          Already have an account? <Text style={styles.linkText}>Sign in</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 26, paddingTop: 48, paddingBottom: 40 },
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
  title: { color: colors.primary, fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  fieldWrap: { marginBottom: 12 },
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
    marginTop: 16,
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

export default Register;