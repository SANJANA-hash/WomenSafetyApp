import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onFakeCall: () => void;
  onSiren: () => void;
  sirenPlaying?: boolean;
}

export default function EmergencyTools({
  onFakeCall,
  onSiren,
  sirenPlaying = false,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Tools</Text>

      <View style={styles.toolsRow}>
        {/* Emergency Siren */}
        <TouchableOpacity
          style={styles.toolCard}
          onPress={onSiren}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name={sirenPlaying ? 'volume-high' : 'volume-high-outline'}
              size={30}
              color="#e74c3c"
            />
          </View>

          <Text style={styles.toolTitle}>
            {sirenPlaying ? 'Stop Siren' : 'Emergency Siren'}
          </Text>
        </TouchableOpacity>

        {/* Fake Call */}
        <TouchableOpacity
          style={styles.toolCard}
          onPress={onFakeCall}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name="call-outline"
              size={30}
              color="#27ae60"
            />
          </View>

          <Text style={styles.toolTitle}>Fake Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 30,
  },

  title: {
    fontSize: 21,
    fontWeight: '700',
    color: '#b8322a',
    marginBottom: 14,
  },

  toolsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  toolCard: {
    flex: 1,
    height: 130,
    backgroundColor: 'white',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  toolTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});