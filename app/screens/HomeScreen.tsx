import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer } from "expo-audio";
import * as Location from "expo-location";
import * as SMS from "expo-sms";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import EmergencyTools from "../components/EmergencyTools";
import FakeCallOverlay from "../components/FakeCallOverlay";
import SOSButton from "../components/SOSButton";

import {
  getLastKnownLocation,
  saveLastKnownLocation,
} from "../../services/BatteryService";

export default function HomeScreen({ onLogout }: { onLogout?: () => void }) {
  const [fakeCallVisible, setFakeCallVisible] = useState(false);
  const [sirenPlaying, setSirenPlaying] = useState(false);

  const sirenPlayer = useAudioPlayer(
    require("../../assets/sounds/emergency-siren.mp3"),
  );

  const handleSOS = async () => {
    try {
      const saved = await AsyncStorage.getItem("trustedContacts");

      const contacts = saved ? JSON.parse(saved) : [];

      if (contacts.length === 0) {
        Alert.alert(
          "No Trusted Contacts",
          "Please add trusted contacts before using SOS.",
        );
        return;
      }

      let locationMessage = "";

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          const { latitude, longitude } = location.coords;

          const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

          locationMessage = `Current location:\n${mapsLink}`;

          await saveLastKnownLocation();
        }
      } catch (locationError) {
        console.log("Current location unavailable. Using last known location.");
      }

      if (!locationMessage) {
        const lastLocation = await getLastKnownLocation();

        if (lastLocation) {
          const mapsLink = `https://maps.google.com/?q=${lastLocation.latitude},${lastLocation.longitude}`;

          locationMessage =
            `Last known location:\n${mapsLink}\n\n` +
            `Location recorded:\n${new Date(
              lastLocation.timestamp,
            ).toLocaleString()}`;
        }
      }

      if (!locationMessage) {
        locationMessage =
          `Location currently unavailable.\n` +
          `Please contact me immediately.`;
      }

      const phoneNumbers = contacts.map((c: any) => c.phone);

      const isAvailable = await SMS.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert(
          "SMS Not Available",
          "SMS service is not available on this device.",
        );
        return;
      }

      const message =
        `EMERGENCY ALERT!\n\n` +
        `I may need immediate help.\n\n` +
        `${locationMessage}`;

      await SMS.sendSMSAsync(phoneNumbers, message);

      Alert.alert(
        "SOS Sent",
        "Emergency alert has been sent to your trusted contacts.",
      );
    } catch (error) {
      console.log("SOS Error:", error);

      Alert.alert(
        "SOS Error",
        "Could not send the emergency alert. Please try again.",
      );
    }
  };

  const handleSiren = () => {
    if (sirenPlaying) {
      sirenPlayer.pause();
      sirenPlayer.seekTo(0);
      setSirenPlaying(false);
    } else {
      sirenPlayer.seekTo(0);
      sirenPlayer.play();
      setSirenPlaying(true);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Safe Her</Text>

      <View style={styles.sosContainer}>
        <SOSButton onPress={handleSOS} />
      </View>

      <EmergencyTools
        onFakeCall={() => setFakeCallVisible(true)}
        onSiren={handleSiren}
        sirenPlaying={sirenPlaying}
      />

      <FakeCallOverlay
        visible={fakeCallVisible}
        onClose={() => setFakeCallVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff0f3",
    alignItems: "center",
    paddingTop: 110,
    paddingHorizontal: 20,
  },

  header: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#b52b2b",
    letterSpacing: 1,
    marginTop: 80,
  },

  sosContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 95,
  },

  logoutButton: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "#fff0f3",
    borderWidth: 1.5,
    borderColor: "#e74c3c",
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },

  logoutText: {
    color: "#c0392b",
    fontSize: 14,
    fontWeight: "600",
  },
});
