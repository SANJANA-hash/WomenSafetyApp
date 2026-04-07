import { Alert, Pressable, StyleSheet, Text, Vibration } from 'react-native';
interface Props {
  onPress: () => void;
}

export default function SOSButton({ onPress }: Props) {
  const handlePress = () => {
    Vibration.vibrate(500);
    Alert.alert(
      '🚨 SOS Alert',
      'Sending emergency alert to your trusted contacts!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'SEND NOW', onPress: onPress, style: 'destructive' },
      ]
    );
  };

  return (
    <Pressable style={styles.button} onPress={handlePress}>
      <Text style={styles.text}>SOS</Text>
      <Text style={styles.subtext}>Hold for Emergency</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    borderWidth: 6,
    borderColor: '#c0392b',
  },
  text: {
    fontSize: 52,
    fontWeight: 'bold',
    color: 'white',
  },
  subtext: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
  },
});