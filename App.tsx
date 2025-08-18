/**
 * Smart Door Manager App
 * 대학교 기숙사 BLE 도어락 제어 앱
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { DoorControlScreen } from './src/screens/control/DoorControlScreen';

// 사용자 정보 타입 정의
interface UserInfo {
  username: string;
  name: string;
  room: string;
  building: string;
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleLogin = (user: UserInfo) => {
    setUserInfo(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUserInfo(null);
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
        <DoorControlScreen onLogout={handleLogout} userInfo={userInfo} />
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
