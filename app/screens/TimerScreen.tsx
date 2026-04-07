import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';

export default function TimerScreen() {
  const [selectedMinutes, setSelectedMinutes] = useState(30);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<any>(null);

  const timerOptions = [5, 10, 15, 30, 60];

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            triggerAutoSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const startTimer = () => {
    setTimeLeft(selectedMinutes * 60);
    setIsRunning(true);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(0);
    Alert.alert('✅ You are Safe!', 'Timer cancelled. Glad you are okay!');
  };

  const triggerAutoSOS = async () => {
    try {
      Alert.alert(
        '🚨 Auto SOS Triggered!',
        'You did not check in. Sending emergency alert now!'
      );

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

      const saved = await AsyncStorage.getItem('trustedContacts');
      const contacts = saved ? JSON.parse(saved) : [];

      if (contacts.length === 0) {
        Alert.alert('No Contacts', 'Add trusted contacts to use this feature!');
        return;
      }

      const phoneNumbers = contacts.map((c: any) => c.phone);
      const isAvailable = await SMS.isAvailableAsync();

      if (isAvailable) {
        await SMS.sendSMSAsync(
          phoneNumbers,
          `🚨 SAFETY TIMER ALERT!\nI set a safety timer and did not check in.\nI may need help! My location: ${mapsLink}`
        );
      }
    } catch (e) {
      Alert.alert('Error', 'Could not send auto SOS');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const totalSeconds = selectedMinutes * 60;
  const progress = timeLeft > 0 ? (timeLeft / totalSeconds) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Safety Timer</Text>
      <Text style={styles.subheader}>
        Set a timer — if you don't check in, SOS is sent automatically
      </Text>

      {/* Timer Display */}
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>
          {isRunning ? formatTime(timeLeft) : `${selectedMinutes}:00`}
        </Text>
        <Text style={styles.timerLabel}>
          {isRunning ? 'Time Remaining' : 'Duration'}
        </Text>
        {isRunning && (
          <Text style={styles.progressText}>{Math.round(progress)}% remaining</Text>
        )}
      </View>

      {/* Timer Options — only show when not running */}
      {!isRunning && (
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsLabel}>Select Duration (minutes):</Text>
          <View style={styles.optionsRow}>
            {timerOptions.map(min => (
              <TouchableOpacity
                key={min}
                style={[
                  styles.optionButton,
                  selectedMinutes === min && styles.optionButtonActive,
                ]}
                onPress={() => setSelectedMinutes(min)}
              >
                <Text style={[
                  styles.optionText,
                  selectedMinutes === min && styles.optionTextActive,
                ]}>
                  {min}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      {!isRunning ? (
        <TouchableOpacity style={styles.startButton} onPress={startTimer}>
          <Text style={styles.startButtonText}>▶ Start Timer</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.safeButton} onPress={stopTimer}>
          <Text style={styles.safeButtonText}>✅ I'm Safe — Cancel Timer</Text>
        </TouchableOpacity>
      )}

      {/* Info box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Use this when travelling alone at night or going to an unfamiliar place.
          If you don't press "I'm Safe" in time, your trusted contacts will be alerted automatically.
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
    alignItems: 'center',
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
    marginBottom: 30,
    textAlign: 'center',
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    borderWidth: 4,
    borderColor: '#e74c3c',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 46,
    fontWeight: 'bold',
    color: '#c0392b',
  },
  timerLabel: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#e74c3c',
    marginTop: 4,
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  optionsLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  optionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    elevation: 2,
  },
  optionButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  optionText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  optionTextActive: {
    color: 'white',
  },
  startButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 30,
    elevation: 4,
    marginBottom: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  safeButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 4,
    marginBottom: 20,
  },
  safeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
  },
});