import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type CallState = 'setup' | 'incoming' | 'active';

export default function FakeCallOverlay({
  visible,
  onClose,
}: Props) {
  const [callState, setCallState] =
    useState<CallState>('setup');

  const [callDuration, setCallDuration] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const player = useAudioPlayer(
    require('../../assets/sounds/fake-call-ringtone.mp3')
  );

  useEffect(() => {
    if (!visible) {
      resetCall();
    }
  }, [visible]);

  useEffect(() => {
    if (callState === 'active') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callState]);

  const startIncomingCall = () => {
    setCallState('incoming');

    try {
      player.loop = true;
      player.play();
    } catch (error) {
      console.log('Ringtone error:', error);
    }
  };

  const acceptCall = () => {
    try {
      player.pause();
    } catch (error) {
      console.log('Ringtone stop error:', error);
    }

    setCallDuration(0);
    setCallState('active');
  };

  const declineCall = () => {
    stopRingtone();
    resetCall();
    onClose();
  };

  const endCall = () => {
    stopRingtone();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    resetCall();
    onClose();
  };

  const stopRingtone = () => {
    try {
      player.pause();
    } catch (error) {
      console.log('Ringtone stop error:', error);
    }
  };

  const resetCall = () => {
    stopRingtone();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setCallState('setup');
    setCallDuration(0);
  };

  const scheduleCall = (seconds: number) => {
    setTimeout(() => {
      startIncomingCall();
    }, seconds * 1000);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={endCall}
    >
      <View style={styles.container}>

        {/* SETUP SCREEN */}
        {callState === 'setup' && (
          <View style={styles.setupScreen}>

            <Ionicons
              name="call"
              size={58}
              color="#777"
              style={styles.setupIcon}
            />

            <Text style={styles.setupTitle}>
              Quick Fake Call
            </Text>

            <Text style={styles.sectionTitle}>
              Start the call
            </Text>

            <TouchableOpacity
              style={styles.startNowButton}
              onPress={startIncomingCall}
              activeOpacity={0.8}
            >
              <Ionicons
                name="call"
                size={30}
                color="#27ae60"
              />

              <Text style={styles.startNowText}>
                Start Now
              </Text>

              <Ionicons
                name="chevron-forward"
                size={25}
                color="#999"
              />
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.line} />
            </View>

            <Text style={styles.sectionTitle}>
              Call me in...
            </Text>

            <View style={styles.delayRow}>
              {[5, 10, 30].map(seconds => (
                <TouchableOpacity
                  key={seconds}
                  style={styles.delayButton}
                  onPress={() => scheduleCall(seconds)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.delayNumber}>
                    {seconds}
                  </Text>

                  <Text style={styles.delayLabel}>
                    sec
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>

          </View>
        )}

        {/* INCOMING CALL */}
        {callState === 'incoming' && (
          <View style={styles.callScreen}>

            <Text style={styles.callType}>
              Incoming call
            </Text>

            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                M
              </Text>
            </View>

            <Text style={styles.contactName}>
              Mom
            </Text>

            <Text style={styles.phoneType}>
              Mobile
            </Text>

            <View style={styles.callActions}>

              <View style={styles.actionItem}>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={declineCall}
                >
                  <Ionicons
                    name="call"
                    size={36}
                    color="white"
                    style={{
                      transform: [{ rotate: '135deg' }],
                    }}
                  />
                </TouchableOpacity>

                <Text style={styles.actionLabel}>
                  Decline
                </Text>
              </View>

              <View style={styles.actionItem}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={acceptCall}
                >
                  <Ionicons
                    name="call"
                    size={36}
                    color="white"
                  />
                </TouchableOpacity>

                <Text style={styles.actionLabel}>
                  Accept
                </Text>
              </View>

            </View>

          </View>
        )}

        {/* ACTIVE CALL */}
        {callState === 'active' && (
          <View style={styles.callScreen}>

            <Text style={styles.callType}>
              Mobile
            </Text>

            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                M
              </Text>
            </View>

            <Text style={styles.contactName}>
              Mom
            </Text>

            <Text style={styles.duration}>
              {formatDuration(callDuration)}
            </Text>

            <View style={styles.activeActions}>

              <View style={styles.actionItem}>
                <TouchableOpacity
                  style={styles.smallAction}
                >
                  <Ionicons
                    name="mic-off"
                    size={28}
                    color="white"
                  />
                </TouchableOpacity>

                <Text style={styles.actionLabel}>
                  Mute
                </Text>
              </View>

              <View style={styles.actionItem}>
                <TouchableOpacity
                  style={styles.smallAction}
                >
                  <Ionicons
                    name="volume-high"
                    size={28}
                    color="white"
                  />
                </TouchableOpacity>

                <Text style={styles.actionLabel}>
                  Speaker
                </Text>
              </View>

              <View style={styles.actionItem}>
                <TouchableOpacity
                  style={styles.smallAction}
                >
                  <Ionicons
                    name="keypad"
                    size={28}
                    color="white"
                  />
                </TouchableOpacity>

                <Text style={styles.actionLabel}>
                  Keypad
                </Text>
              </View>

            </View>

            <View style={styles.endCallContainer}>
              <TouchableOpacity
                style={styles.endCallButton}
                onPress={endCall}
              >
                <Ionicons
                  name="call"
                  size={30}
                  color="white"
                  style={{
                    transform: [{ rotate: '135deg' }],
                  }}
                />
              </TouchableOpacity>
            </View>

          </View>
        )}

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },

  setupScreen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
  },

  setupIcon: {
    alignSelf: 'center',
    marginBottom: 20,
  },

  setupTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 55,
  },

  sectionTitle: {
    color: '#aaa',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },

  startNowButton: {
    height: 120,
    backgroundColor: '#202020',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    gap: 20,
  },

  startNowText: {
    flex: 1,
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },

  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },

  orText: {
    color: '#999',
    fontSize: 18,
    marginHorizontal: 15,
  },

  delayRow: {
    flexDirection: 'row',
    gap: 14,
  },

  delayButton: {
    flex: 1,
    height: 130,
    backgroundColor: '#202020',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },

  delayNumber: {
    color: 'white',
    fontSize: 42,
    fontWeight: '500',
  },

  delayLabel: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 4,
  },

  cancelButton: {
    alignSelf: 'center',
    marginTop: 45,
    padding: 15,
  },

  cancelText: {
    color: '#aaa',
    fontSize: 20,
  },

  callScreen: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },

  callType: {
    color: '#aaa',
    fontSize: 18,
    marginBottom: 55,
  },

  avatar: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#777',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarLetter: {
    color: 'white',
    fontSize: 82,
    fontWeight: '300',
  },

  contactName: {
    color: 'white',
    fontSize: 46,
    fontWeight: '400',
    marginTop: 38,
  },

  phoneType: {
    color: '#999',
    fontSize: 19,
    marginTop: 8,
  },

  duration: {
    color: '#999',
    fontSize: 20,
    marginTop: 12,
  },

  callActions: {
    position: 'absolute',
    bottom: 110,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 60,
  },

  activeActions: {
    position: 'absolute',
    bottom: 190,
    flexDirection: 'row',
    gap: 50,
  },

  actionItem: {
    alignItems: 'center',
  },

  declineButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ef493e',
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#27ae60',
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallAction: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionLabel: {
    color: '#999',
    fontSize: 17,
    marginTop: 12,
  },

  endCallContainer: {
  position: 'absolute',
  bottom: 55,
  alignItems: 'center',
},

  endCallButton: {
  width: 82,
  height: 82,
  borderRadius: 41,
  backgroundColor: '#ef493e',
  alignItems: 'center',
  justifyContent: 'center',
},
});