import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BatteryScreen from './screens/BatteryScreen';
import ContactsScreen from './screens/ContactsScreen';
import HomeScreen from './screens/HomeScreen';
import LocationScreen from './screens/LocationScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import SplashScreen from './screens/SplashScreen';
import TimerScreen from './screens/TimerScreen';

type Screen = 'splash' | 'login' | 'register' | 'app';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') {
        setScreen('app');
      }
    } catch (e) {
      console.log('Error checking login');
    }
  };

  const handleSplashFinish = () => {
    setScreen('login');
  };

  const handleLogin = () => {
    setScreen('app');
  };

  const handleRegister = () => {
    setScreen('app');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    setScreen('login');
  };

  if (screen === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (screen === 'login') {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onGoToRegister={() => setScreen('register')}
      />
    );
  }

  if (screen === 'register') {
    return (
      <RegisterScreen
        onRegister={handleRegister}
        onGoToLogin={() => setScreen('login')}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {activeTab === 'home' && <HomeScreen onLogout={handleLogout} />}
        {activeTab === 'location' && <LocationScreen />}
        {activeTab === 'timer' && <TimerScreen />}
        {activeTab === 'battery' && <BatteryScreen />}
        {activeTab === 'contacts' && <ContactsScreen />}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'home' && styles.activeTab]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={styles.tabIcon}>🛡️</Text>
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.activeLabel]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'location' && styles.activeTab]}
          onPress={() => setActiveTab('location')}
        >
          <Text style={styles.tabIcon}>📍</Text>
          <Text style={[styles.tabLabel, activeTab === 'location' && styles.activeLabel]}>Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'timer' && styles.activeTab]}
          onPress={() => setActiveTab('timer')}
        >
          <Text style={styles.tabIcon}>⏱️</Text>
          <Text style={[styles.tabLabel, activeTab === 'timer' && styles.activeLabel]}>Timer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'battery' && styles.activeTab]}
          onPress={() => setActiveTab('battery')}
        >
          <Text style={styles.tabIcon}>🔋</Text>
          <Text style={[styles.tabLabel, activeTab === 'battery' && styles.activeLabel]}>Battery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
          onPress={() => setActiveTab('contacts')}
        >
          <Text style={styles.tabIcon}>👥</Text>
          <Text style={[styles.tabLabel, activeTab === 'contacts' && styles.activeLabel]}>Contacts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 20,
    paddingTop: 10,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#e74c3c',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 2,
  },
  activeLabel: {
    color: '#e74c3c',
    fontWeight: '600',
  },
});