import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Battery from 'expo-battery';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function BatteryScreen() {
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [autoAlertEnabled, setAutoAlertEnabled] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(20);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    loadBatteryInfo();
    const interval = setInterval(loadBatteryInfo, 10000); // check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkAndAlert();
  }, [batteryLevel, autoAlertEnabled]);

  const loadBatteryInfo = async () => {
    try {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();
      setBatteryLevel(Math.round(level * 100));
      setIsCharging(state === Battery.BatteryState.CHARGING);
    } catch (e) {
      console.log('Battery error:', e);
    }
  };

  const checkAndAlert = async () => {
    if (
      autoAlertEnabled &&
      batteryLevel > 0 &&
      batteryLevel <= alertThreshold &&
      !isCharging &&
      !alertSent
    ) {
      setAlertSent(true);
      await sendLowBatteryAlert();
    }
    // Reset alert sent flag when battery goes above threshold
    if (batteryLevel > alertThreshold) {
      setAlertSent(false);
    }
  };

  const sendLowBatteryAlert = async () => {
    try {
      Alert.alert(
        '🔋 Low Battery Alert!',
        `Battery is at ${batteryLevel}%. Sending alert to your trusted contacts!`
      );

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

      const saved = await AsyncStorage.getItem('trustedContacts');
      const contacts = saved ? JSON.parse(saved) : [];

      if (contacts.length === 0) return;

      const phoneNumbers = contacts.map((c: any) => c.phone);
      const isAvailable = await SMS.isAvailableAsync();

      if (isAvailable) {
        await SMS.sendSMSAsync(
          phoneNumbers,
          `🔋 LOW BATTERY ALERT!\nMy phone battery is at ${batteryLevel}% and may switch off soon.\nMy last known location: ${mapsLink}\nPlease check on me!`
        );
      }
    } catch (e) {
      console.log('Error sending low battery alert:', e);
    }
  };

  const getBatteryColor = () => {
    if (batteryLevel > 50) return '#27ae60';
    if (batteryLevel > 20) return '#f39c12';
    return '#e74c3c';
  };

  const getBatteryEmoji = () => {
    if (isCharging) return '⚡';
    if (batteryLevel > 50) return '🔋';
    if (batteryLevel > 20) return '🪫';
    return '🔴';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Battery Monitor</Text>
      <Text style={styles.subheader}>
        Auto-alerts contacts when battery is critically low
      </Text>

      {/* Battery Display */}
      <View style={styles.batteryCard}>
        <Text style={styles.batteryEmoji}>{getBatteryEmoji()}</Text>
        <Text style={[styles.batteryPercent, { color: getBatteryColor() }]}>
          {batteryLevel}%
        </Text>
        <Text style={styles.batteryStatus}>
          {isCharging ? '⚡ Charging' : 'Not Charging'}
        </Text>

        {/* Battery Bar */}
        <View style={styles.batteryBarContainer}>
          <View
            style={[
              styles.batteryBarFill,
              {
                width: `${batteryLevel}%` as any,
                backgroundColor: getBatteryColor(),
              },
            ]}
          />
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadBatteryInfo}
        >
          <Text style={styles.refreshText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Auto Alert Toggle */}
      <View style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Auto Alert</Text>
            <Text style={styles.settingDesc}>
              Send SOS when battery drops below {alertThreshold}%
            </Text>
          </View>
          <Switch
            value={autoAlertEnabled}
            onValueChange={setAutoAlertEnabled}
            trackColor={{ false: '#ddd', true: '#e74c3c' }}
            thumbColor={autoAlertEnabled ? 'white' : '#aaa'}
          />
        </View>
      </View>

      {/* Threshold Options */}
      <View style={styles.settingCard}>
        <Text style={styles.settingTitle}>Alert Threshold</Text>
        <Text style={styles.settingDesc}>Send alert when battery is below:</Text>
        <View style={styles.thresholdRow}>
          {[10, 15, 20, 25, 30].map(val => (
            <TouchableOpacity
              key={val}
              style={[
                styles.thresholdButton,
                alertThreshold === val && styles.thresholdButtonActive,
              ]}
              onPress={() => {
                setAlertThreshold(val);
                setAlertSent(false);
              }}
            >
              <Text style={[
                styles.thresholdText,
                alertThreshold === val && styles.thresholdTextActive,
              ]}>
                {val}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Test Button */}
      <TouchableOpacity
        style={styles.testButton}
        onPress={sendLowBatteryAlert}
      >
        <Text style={styles.testButtonText}>🧪 Test Low Battery Alert</Text>
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 This feature ensures your contacts are notified even if your phone
          is about to die and you cannot manually send an SOS.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff0f3',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#c0392b',
  },
  subheader: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
    marginBottom: 20,
  },
  batteryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  batteryEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  batteryPercent: {
    fontSize: 52,
    fontWeight: 'bold',
  },
  batteryStatus: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    marginBottom: 16,
  },
  batteryBarContainer: {
    width: '100%',
    height: 14,
    backgroundColor: '#eee',
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 14,
  },
  batteryBarFill: {
    height: '100%',
    borderRadius: 7,
  },
  refreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#fff0f3',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  refreshText: {
    color: '#e74c3c',
    fontSize: 13,
    fontWeight: '600',
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  settingDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    marginBottom: 10,
  },
  thresholdRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  thresholdButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
  },
  thresholdButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  thresholdText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  thresholdTextActive: {
    color: 'white',
  },
  testButton: {
    backgroundColor: '#fff0f3',
    borderWidth: 2,
    borderColor: '#e74c3c',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonText: {
    color: '#e74c3c',
    fontSize: 15,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  infoText: {
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
  },
});