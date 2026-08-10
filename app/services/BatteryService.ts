import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Battery from "expo-battery";
import * as Location from "expo-location";

export interface BatteryStatus {
  batteryLevel: number;
  isCharging: boolean;
  survivalMode: boolean;
}

export async function getBatteryStatus(): Promise<BatteryStatus> {
  const level = await Battery.getBatteryLevelAsync();
  const state = await Battery.getBatteryStateAsync();

  return {
    batteryLevel: Math.round(level * 100),
    isCharging: state === Battery.BatteryState.CHARGING,
    survivalMode:
      Math.round(level * 100) <= 10 && state !== Battery.BatteryState.CHARGING,
  };
}

export async function saveLastKnownLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") return;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    await AsyncStorage.setItem(
      "lastKnownLocation",
      JSON.stringify({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.log("Error saving location:", error);
  }
}
