import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Battery from 'expo-battery';
import * as Location from 'expo-location';

export interface BatteryStatus {
  batteryLevel: number;
  isCharging: boolean;
  survivalMode: boolean;
}

export async function getBatteryStatus(): Promise<BatteryStatus> {
  const testBattery =
    await AsyncStorage.getItem('testBatteryLevel');

  let batteryLevel: number;
  let isCharging: boolean;

  if (testBattery !== null) {
    batteryLevel = Number(testBattery);

    const state =
      await Battery.getBatteryStateAsync();

    isCharging =
      state === Battery.BatteryState.CHARGING;
  } else {
    const level =
      await Battery.getBatteryLevelAsync();

    const state =
      await Battery.getBatteryStateAsync();

    batteryLevel = Math.round(level * 100);

    isCharging =
      state === Battery.BatteryState.CHARGING;
  }

  return {
    batteryLevel,
    isCharging,
    survivalMode:
      batteryLevel <= 10 && !isCharging,
  };
}

export async function saveLastKnownLocation() {
  try {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return;
    }

    const location =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

    await AsyncStorage.setItem(
      'lastKnownLocation',
      JSON.stringify({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date().toISOString(),
      })
    );

    console.log('Last known location saved');
  } catch (error) {
    console.log(
      'Error saving last known location:',
      error
    );
  }
}

export async function getLastKnownLocation() {
  try {
    const saved =
      await AsyncStorage.getItem(
        'lastKnownLocation'
      );

    if (!saved) {
      return null;
    }

    return JSON.parse(saved);
  } catch (error) {
    console.log(
      'Error reading last known location:',
      error
    );

    return null;
  }
}