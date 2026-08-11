import { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';

interface Props {
  onPress: () => void;
}

export default function SOSButton({ onPress }: Props) {
  const [isSliding, setIsSliding] = useState(false);

  const slideX = useRef(new Animated.Value(0)).current;

  const TRIGGER_DISTANCE = -150;

  const triggerSOS = () => {
    Vibration.vibrate(500);
    onPress();
  };

  const resetSlider = () => {
    Animated.spring(slideX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    setIsSliding(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        setIsSliding(true);
      },

      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          slideX.setValue(
            Math.max(gestureState.dx, -170)
          );
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx <= TRIGGER_DISTANCE) {
          triggerSOS();
        }

        resetSlider();
      },

      onPanResponderTerminate: () => {
        resetSlider();
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View
        style={styles.slider}
        {...panResponder.panHandlers}
      >
        {/* SOS icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.siren}>🚨</Text>
        </View>

        {/* SOS text */}
        <View style={styles.textContainer}>
          <Text style={styles.sosText}>
            SOS
          </Text>

          <Text style={styles.emergencyText}>
            Emergency Alert
          </Text>
        </View>

        {/* Arrows */}
        <View style={styles.arrows}>
          <Text style={styles.arrowText}>‹‹‹</Text>
        </View>

        {/* Sliding knob */}
        <Animated.View
          style={[
            styles.sliderThumb,
            {
              transform: [
                {
                  translateX: slideX,
                },
              ],
            },
          ]}
        >
          <Text style={styles.arrow}>
            ←
          </Text>
        </Animated.View>
      </View>

      <Text style={styles.instruction}>
        {isSliding
          ? 'Keep sliding left'
          : 'Press and slide left to send an emergency alert'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '88%',
    alignItems: 'center',
  },

  slider: {
    width: '100%',
    height: 76,
    backgroundColor: '#e74c3c',
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#c0392b',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 8,

    position: 'relative',
    overflow: 'hidden',

    elevation: 8,

    shadowColor: '#e74c3c',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  siren: {
    fontSize: 27,
  },

  textContainer: {
    marginLeft: 12,
  },

  sosText: {
    color: 'white',
    fontSize: 27,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  emergencyText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginTop: -2,
  },

  arrows: {
    position: 'absolute',
    right: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  sliderThumb: {
    position: 'absolute',
    right: 7,

    width: 60,
    height: 60,
    borderRadius: 30,

    backgroundColor: 'white',

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 5,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  arrow: {
    color: '#e74c3c',
    fontSize: 28,
    fontWeight: 'bold',
  },

  instruction: {
    color: '#888',
    fontSize: 12,
    marginTop: 14,
    textAlign: 'center',
  },
});