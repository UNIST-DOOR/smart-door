/**
 * Smart Door Manager App
 * 대학교 기숙사 BLE 도어락 제어 앱
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { DoorControlScreen } from './src/screens/control/DoorControlScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // 스플래시 화면 표시
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {isLoggedIn ? (
        <DoorControlScreen onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
