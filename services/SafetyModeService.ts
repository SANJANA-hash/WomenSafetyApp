import AsyncStorage from '@react-native-async-storage/async-storage';

const SAFETY_MODE_KEY = 'safetyMode';

export async function getSafetyMode(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(SAFETY_MODE_KEY);
    return value === 'true';
  } catch (error) {
    console.log('Error reading safety mode:', error);
    return false;
  }
}

export async function setSafetyMode(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(
      SAFETY_MODE_KEY,
      enabled ? 'true' : 'false'
    );
  } catch (error) {
    console.log('Error saving safety mode:', error);
  }
}