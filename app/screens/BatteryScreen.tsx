import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Battery from "expo-battery";
import * as Location from "expo-location";
import * as SMS from "expo-sms";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getSafetyMode, setSafetyMode } from "../../services/SafetyModeService";

export default function BatteryScreen() {
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [isCharging, setIsCharging] = useState(false);

  const [safetyMode, setSafetyModeState] = useState(false);
  const [autoAlertEnabled, setAutoAlertEnabled] = useState(true);

  // Fixed warning level
  const alertThreshold = 20;

  const [warningShown, setWarningShown] = useState(false);
  const [criticalAlertShown, setCriticalAlertShown] = useState(false);

  useEffect(() => {
    loadInitialData();

    const interval = setInterval(() => {
      loadBatteryInfo();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkAndAlert();
  }, [batteryLevel, autoAlertEnabled, safetyMode, isCharging]);

  const loadInitialData = async () => {
    await loadBatteryInfo();
    await loadSafetyMode();
  };

  const loadBatteryInfo = async () => {
    try {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();

      setBatteryLevel(Math.round(level * 100));
      setIsCharging(state === Battery.BatteryState.CHARGING);
    } catch (error) {
      console.log("Battery error:", error);
    }
  };

  const loadSafetyMode = async () => {
    const enabled = await getSafetyMode();
    setSafetyModeState(enabled);
  };

  const toggleSafetyMode = async (enabled: boolean) => {
    setSafetyModeState(enabled);

    await setSafetyMode(enabled);

    setWarningShown(false);
    setCriticalAlertShown(false);

    if (enabled) {
      Alert.alert(
        "🛡️ Safety Mode Activated",
        "Battery emergency monitoring is now active.",
      );
    } else {
      Alert.alert(
        "Safety Mode Disabled",
        "Battery-based emergency monitoring has been turned off.",
      );
    }
  };

  const toggleEmergencyMonitoring = (enabled: boolean) => {
    setAutoAlertEnabled(enabled);

    setWarningShown(false);
    setCriticalAlertShown(false);
  };

  const checkAndAlert = () => {
    if (batteryLevel <= 0 || isCharging) {
      return;
    }

    // Normal mode:
    // Low battery never causes an emergency.
    if (!safetyMode) {
      if (batteryLevel > alertThreshold) {
        setWarningShown(false);
        setCriticalAlertShown(false);
      }

      return;
    }

    // Safety Mode + monitoring OFF
    if (!autoAlertEnabled) {
      return;
    }

    // Warning level: 20%
    if (batteryLevel <= alertThreshold && batteryLevel > 10 && !warningShown) {
      setWarningShown(true);

      Alert.alert(
        "🔋 Battery Low",
        `Your battery is at ${batteryLevel}%. Safety Mode is active. Please charge your phone if possible.`,
        [
          {
            text: "I'm Safe",
            style: "default",
          },
        ],
      );
    }

    // Critical level: 10%
    if (batteryLevel <= 10 && !criticalAlertShown) {
      setCriticalAlertShown(true);

      Alert.alert(
        "⚠️ Critical Battery",
        `Your battery is at ${batteryLevel}%. Your phone may switch off soon.`,
        [
          {
            text: "I'm Safe",
            style: "cancel",
          },
          {
            text: "SEND ALERT",
            style: "destructive",
            onPress: sendLowBatteryAlert,
          },
        ],
      );
    }

    // Reset once battery goes above warning level
    if (batteryLevel > alertThreshold) {
      setWarningShown(false);
      setCriticalAlertShown(false);
    }
  };

  const sendLowBatteryAlert = async () => {
    try {
      let mapsLink = "Location unavailable";

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          const { latitude, longitude } = location.coords;

          mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        } catch (locationError) {
          console.log("Could not get current location");

          const savedLocation = await AsyncStorage.getItem("lastKnownLocation");

          if (savedLocation) {
            const lastLocation = JSON.parse(savedLocation);

            mapsLink = `https://maps.google.com/?q=${lastLocation.latitude},${lastLocation.longitude}`;
          }
        }
      }

      const saved = await AsyncStorage.getItem("trustedContacts");

      const contacts = saved ? JSON.parse(saved) : [];

      if (contacts.length === 0) {
        Alert.alert(
          "No Trusted Contacts",
          "Please add trusted contacts before using emergency alerts.",
        );

        return;
      }

      const phoneNumbers = contacts.map((contact: any) => contact.phone);

      const isAvailable = await SMS.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert("SMS Unavailable", "SMS is not available on this device.");

        return;
      }

      await SMS.sendSMSAsync(
        phoneNumbers,
        `🔋 CRITICAL BATTERY ALERT!

Safety Mode was active and my phone battery is critically low at ${batteryLevel}%.

My last known location:
${mapsLink}

Please check on me.`,
      );

      Alert.alert("🚨 Alert Sent", "Your trusted contacts have been notified.");
    } catch (error) {
      console.log("Low battery alert error:", error);

      Alert.alert("Alert Failed", "Could not send the emergency alert.");
    }
  };

  const testBatteryAlert = async (level: number) => {
    await AsyncStorage.setItem("testBatteryLevel", level.toString());

    setBatteryLevel(level);
    setWarningShown(false);
    setCriticalAlertShown(false);
  };

  const getBatteryColor = () => {
    if (batteryLevel > 50) {
      return "#27ae60";
    }

    if (batteryLevel > 20) {
      return "#f39c12";
    }

    return "#e74c3c";
  };

  const getBatteryEmoji = () => {
    if (isCharging) {
      return "⚡";
    }

    if (batteryLevel > 50) {
      return "🔋";
    }

    if (batteryLevel > 20) {
      return "🪫";
    }

    return "🔴";
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={styles.header}>Battery Safety</Text>

      {/* Safety Mode */}
      <View style={styles.safetyCard}>
        <View style={styles.safetyInfo}>
          <Text style={styles.safetyTitle}>🛡️ Safety Mode</Text>

          <Text style={styles.safetyDescription}>
            Activate this before travelling alone. Battery emergency monitoring
            will only work while Safety Mode is active.
          </Text>
        </View>

        <Switch
          value={safetyMode}
          onValueChange={toggleSafetyMode}
          trackColor={{
            false: "#ddd",
            true: "#e74c3c",
          }}
          thumbColor="white"
        />
      </View>

      {/* Battery Card */}
      <View style={styles.batteryCard}>
        <Text style={styles.batteryEmoji}>{getBatteryEmoji()}</Text>

        <Text
          style={[
            styles.batteryPercent,
            {
              color: getBatteryColor(),
            },
          ]}
        >
          {batteryLevel}%
        </Text>

        <Text style={styles.batteryStatus}>
          {isCharging ? "⚡ Charging" : "Not Charging"}
        </Text>

        {/* Battery Bar */}
        <View style={styles.batteryBarContainer}>
          <View
            style={[
              styles.batteryBarFill,
              {
                width: `${batteryLevel}%`,
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

      {/* Emergency Monitoring */}
      <View style={styles.monitoringCard}>
        <View style={styles.monitoringInfo}>
          <Text style={styles.monitoringTitle}>
            🚨 Battery Emergency Monitoring
          </Text>

          <Text style={styles.monitoringDescription}>
            Only active when Safety Mode is ON
          </Text>
        </View>

        <Switch
          value={autoAlertEnabled}
          onValueChange={toggleEmergencyMonitoring}
          trackColor={{
            false: "#ddd",
            true: "#e74c3c",
          }}
          thumbColor="white"
        />
      </View>

      {/* Developer Test */}
      <View style={styles.testContainer}>
        <Text style={styles.testTitle}>🧪 Developer Test</Text>

        <Text style={styles.testDescription}>
          Simulate battery levels without draining your phone.
        </Text>

        <View style={styles.testRow}>
          <TouchableOpacity
            style={styles.testLevelButton}
            onPress={() => testBatteryAlert(50)}
          >
            <Text style={styles.testLevelText}>50%</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testLevelButton}
            onPress={() => testBatteryAlert(20)}
          >
            <Text style={styles.testLevelText}>20%</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testCriticalButton}
            onPress={() => testBatteryAlert(10)}
          >
            <Text style={styles.testCriticalText}>10%</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff0f3",
  },

  contentContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#c0392b",
    marginBottom: 16,
  },

  /* Safety Mode */

  safetyCard: {
    backgroundColor: "#fff7f8",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3cccc",
  },

  safetyInfo: {
    flex: 1,
    marginRight: 10,
  },

  safetyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#c0392b",
  },

  safetyDescription: {
    fontSize: 12,
    color: "#888",
    lineHeight: 18,
    marginTop: 5,
  },

  /* Battery */

  batteryCard: {
    backgroundColor: "white",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  batteryEmoji: {
    fontSize: 38,
    marginBottom: 3,
  },

  batteryPercent: {
    fontSize: 44,
    fontWeight: "bold",
  },

  batteryStatus: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    marginBottom: 12,
  },

  batteryBarContainer: {
    width: "100%",
    height: 11,
    backgroundColor: "#eee",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },

  batteryBarFill: {
    height: "100%",
    borderRadius: 6,
  },

  refreshButton: {
    paddingVertical: 7,
    paddingHorizontal: 22,
    backgroundColor: "#fff5f5",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#e74c3c",
  },

  refreshText: {
    color: "#e74c3c",
    fontSize: 13,
    fontWeight: "600",
  },

  /* Emergency Monitoring */

  monitoringCard: {
    backgroundColor: "#fff7f8",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3cccc",
  },

  monitoringInfo: {
    flex: 1,
    marginRight: 10,
  },

  monitoringTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },

  monitoringDescription: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },

  /* Developer Test */

  testContainer: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  testTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },

  testDescription: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    marginBottom: 14,
  },

  testRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  testLevelButton: {
    backgroundColor: "#f2f2f2",
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },

  testLevelText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "bold",
  },

  testCriticalButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },

  testCriticalText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
