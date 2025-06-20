import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Vibration,
} from 'react-native';
// 간단한 아이콘 사용
import { styles } from './LoginScreen.styles';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // 햅틱 피드백
    try {
      Vibration.vibrate(50);
    } catch (error) {
      // 권한 없거나 애뮬레이터일 때 무시
    }

    if (!username.trim() || !password.trim()) {
      Alert.alert('입력 오류', '아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 로그인 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 하드코딩된 로그인 로직: ID=101, 비밀번호=101
      if (username === '101' && password === '101') {
        Alert.alert('로그인 성공', '환영합니다! 101호님', [
          { text: '확인', onPress: () => {
            onLogin(); // 메인 화면으로 이동
          }}
        ]);
      } else {
        Alert.alert('로그인 실패', '아이디 또는 비밀번호가 올바르지 않습니다.\n(ID: 101, 비밀번호: 101)');
      }
    } catch (error) {
      Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      '비밀번호 찾기',
      '관리자에게 문의하여 비밀번호를 재설정하세요.\n\n고객센터: 1588-0000',
      [
        { text: '취소', style: 'cancel' },
        { text: '문의하기', onPress: () => {
          // 전화 앱 연동 또는 문의 화면으로 이동
          Alert.alert('문의', '고객센터로 연결됩니다.');
        }}
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#ED6A5E" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.welcomeTitle}>Smart Door Manager</Text>
          <Text style={styles.welcomeSubtitle}>스마트 도어락 관리 시스템</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>아이디</Text>
            <TextInput
              style={styles.textInput}
              placeholder="아이디를 입력하세요"
              placeholderTextColor="#A0A0A0"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>비밀번호</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>
                  {showPassword ? '🙈' : '👁'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>로그인 중...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>비밀번호를 잊으셨나요?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>UNIST Smart Door System</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}; 