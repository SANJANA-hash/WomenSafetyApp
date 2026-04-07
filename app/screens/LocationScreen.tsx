import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
    Alert, ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

export default function LocationScreen() {
  const [location, setLocation] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const mapRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(getLocation, 5000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isTracking]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc.coords);

      // Get address from coordinates
      const addressResult = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (addressResult.length > 0) {
        setAddress(addressResult[0]);
      }

      // Update time
      const now = new Date();
      setLastUpdated(
        `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      );

      // Move map to current location
      if (mapRef.current && loc.coords) {
        mapRef.current.animateToRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not get location.');
    }
  };

  const formatAddress = () => {
    if (!address) return 'Fetching address...';
    const parts = [
      address.name,
      address.street,
      address.district,
      address.city,
      address.region,
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Live Location</Text>
      <Text style={styles.subheader}>Your real-time location tracking</Text>

      {/* Map */}
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
              description={formatAddress()}
            />
            <Circle
              center={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              radius={50}
              fillColor="rgba(231, 76, 60, 0.15)"
              strokeColor="rgba(231, 76, 60, 0.5)"
              strokeWidth={2}
            />
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>📍 Loading map...</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.infoScroll} showsVerticalScrollIndicator={false}>
        {/* Address Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📍 Current Address</Text>
          <Text style={styles.infoValue}>{formatAddress()}</Text>
          {lastUpdated ? (
            <Text style={styles.updatedText}>Last updated: {lastUpdated}</Text>
          ) : null}
        </View>

        {/* Coordinates Card */}
        {location && (
          <View style={styles.coordsCard}>
            <View style={styles.coordItem}>
              <Text style={styles.coordLabel}>Latitude</Text>
              <Text style={styles.coordValue}>
                {location.latitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.coordItem}>
              <Text style={styles.coordLabel}>Longitude</Text>
              <Text style={styles.coordValue}>
                {location.longitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.coordItem}>
              <Text style={styles.coordLabel}>Accuracy</Text>
              <Text style={styles.coordValue}>
                ±{Math.round(location.accuracy || 0)}m
              </Text>
            </View>
          </View>
        )}

        {/* Buttons */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={getLocation}
        >
          <Text style={styles.refreshText}>🔄 Refresh Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.trackButton,
            isTracking && styles.trackButtonActive
          ]}
          onPress={() => setIsTracking(!isTracking)}
        >
          <Text style={styles.trackButtonText}>
            {isTracking ? '⏹ Stop Live Tracking' : '▶ Start Live Tracking'}
          </Text>
        </TouchableOpacity>

        {isTracking && (
          <View style={styles.trackingBadge}>
            <Text style={styles.trackingBadgeText}>
              🟢 Live tracking active — updating every 5 seconds
            </Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            💡 Use live tracking when travelling alone. Your location updates
            automatically so your trusted contacts can check on you anytime.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff0f3',
    paddingTop: 60,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#c0392b',
    paddingHorizontal: 20,
  },
  subheader: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  mapContainer: {
    height: 240,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginBottom: 14,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#aaa',
  },
  infoScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  infoTitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    lineHeight: 22,
  },
  updatedText: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 6,
  },
  coordsCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  coordItem: {
    flex: 1,
    alignItems: 'center',
  },
  coordLabel: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 4,
  },
  coordValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  refreshButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e74c3c',
    borderRadius: 30,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },
  refreshText: {
    color: '#e74c3c',
    fontSize: 15,
    fontWeight: 'bold',
  },
  trackButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  trackButtonActive: {
    backgroundColor: '#c0392b',
  },
  trackButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  trackingBadge: {
    backgroundColor: '#eafaf1',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  trackingBadgeText: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    marginBottom: 30,
  },
  infoBoxText: {
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
  },
});