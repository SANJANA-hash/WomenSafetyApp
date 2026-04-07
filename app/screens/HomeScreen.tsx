import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import * as SMS from 'expo-sms';
import { useEffect, useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import SOSButton from '../components/SOSButton';

export default function HomeScreen({ onLogout }: { onLogout?: () => void }) {
  const handleSOS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for SOS.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

      const saved = await AsyncStorage.getItem('trustedContacts');
      const contacts = saved ? JSON.parse(saved) : [];

      if (contacts.length === 0) {
        Alert.alert(
          'No Contacts',
          'Please add trusted contacts first before using SOS!',
          [{ text: 'OK' }]
        );
        return;
      }

      const phoneNumbers = contacts.map((c: any) => c.phone);
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync(
          phoneNumbers,
          `🚨 EMERGENCY ALERT! I need help!\nMy location: ${mapsLink}`
        );
      } else {
        Alert.alert('SMS not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not send SOS. Please try again.');
    }
  };

  const lastShake = useRef(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(300);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (acceleration > 2.5 && now - lastShake.current > 3000) {
        lastShake.current = now;
        handleSOS();
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Women Safety App</Text>

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <Text style={styles.subheader}>You are protected 🛡️</Text>

      <View style={styles.sosContainer}>
        <SOSButton onPress={handleSOS} />
      </View>

      <View style={styles.shakeBadge}>
        <Text style={styles.shakeText}>📳 Shake your phone to trigger SOS!</Text>
      </View>

      <Text style={styles.hint}>
        Press SOS to instantly alert your trusted contacts with your location
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff0f3',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#c0392b',
  },
  subheader: {
    fontSize: 15,
    color: '#888',
    marginTop: 6,
    marginBottom: 60,
  },
  sosContainer: {
    marginVertical: 40,
  },
  hint: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 30,
  },
  shakeBadge: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    width: '100%',
    marginTop: 20,
  },
  shakeText: {
    fontSize: 13,
    color: '#c0392b',
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#fff0f3',
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: '600',
  },
});