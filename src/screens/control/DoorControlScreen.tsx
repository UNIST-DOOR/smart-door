import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { useBLE } from '../../hooks/useBLE';
import { useDoor } from '../../hooks/useDoor';
import { styles } from './DoorControlScreen.styles';

interface DoorControlScreenProps {
  onLogout: () => void;
}

export const DoorControlScreen: React.FC<DoorControlScreenProps> = ({ onLogout }) => {
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  
  const {
    isConnected,
    bleService,
    isInitialized,
  } = useBLE();

  const {
    isSending,
    quickCommands,
  } = useDoor(bleService);

  // 현재 날짜/시간 포맷팅
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours > 12 ? 'PM' : 'AM'} ${hours > 12 ? String(hours - 12).padStart(2, '0') : String(hours).padStart(2, '0')}:${minutes}`;
  };

  const handleOpenDoor = async () => {
    // 햅틱 피드백 (안전하게 실행)
    try {
      Vibration.vibrate(50);
    } catch (error) {
      // 권한 없거나 애뮬레이터일 때 무시
    }
    
    try {
      // BLE 서비스 초기화 대기 (최대 5초)
      if (!isInitialized || !bleService) {
        console.log('BLE 초기화 대기 중...');
        
        // 최대 5초 동안 초기화 완료 대기
        for (let i = 0; i < 50; i++) {
          if (isInitialized && bleService) {
            break;
          }
          await new Promise(resolve => setTimeout(() => resolve(undefined), 100));
        }
        
        // 여전히 초기화되지 않았으면 오류
        if (!isInitialized || !bleService) {
          Alert.alert('오류', 'BLE 서비스 초기화에 실패했습니다.');
          return;
        }
      }

      // 자동 문열기 실행 (스캔 → 연결 → 전송)
      const success = await quickCommands.autoOpenDoor('oasyss_000201');
      
      if (success) {
        setIsDoorOpen(true);
        Alert.alert('성공', '문이 열렸습니다!');
        // 3초 후 상태 초기화
        setTimeout(() => setIsDoorOpen(false), 3000);
      } else {
        Alert.alert('실패', '문열기에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      Alert.alert('오류', `문열기 중 오류가 발생했습니다: ${error}`);
    }
  };



  const handleFrontDoorOpen = async () => {
    // 햅틱 피드백 (안전하게 실행)
    try {
      Vibration.vibrate(50);
    } catch (error) {
      // 권한 없거나 애뮬레이터일 때 무시
    }
    
    try {
      // BLE 서비스 초기화 대기 (최대 5초)
      if (!isInitialized || !bleService) {
        console.log('BLE 초기화 대기 중...');
        
        // 최대 5초 동안 초기화 완료 대기
        for (let i = 0; i < 50; i++) {
          if (isInitialized && bleService) {
            break;
          }
          await new Promise(resolve => setTimeout(() => resolve(undefined), 100));
        }
        
        // 여전히 초기화되지 않았으면 오류
        if (!isInitialized || !bleService) {
          Alert.alert('오류', 'BLE 서비스 초기화에 실패했습니다.');
          return;
        }
      }

      // 공동현관문 자동 열기 실행 (스캔 → 연결 → 전송)
      const success = await quickCommands.autoOpenEntranceDoor('oasyss_0009999');
      
      if (success) {
        Alert.alert('성공', '공동현관문이 열렸습니다!');
      } else {
        Alert.alert('실패', '공동현관문 열기에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      Alert.alert('오류', `공동현관문 열기 중 오류가 발생했습니다: ${error}`);
    }
  };

  const handleInquiry = () => {
    Alert.alert(
      '문의하기',
      '고객센터: 1588-0000\n운영시간: 09:00 ~ 18:00',
      [
        { text: '취소', style: 'cancel' },
        { text: '전화하기', onPress: () => {
          // 실제 앱에서는 Linking.openURL('tel:1588-0000') 사용
          Alert.alert('전화', '전화 앱으로 이동합니다.');
        }}
      ]
    );
  };

  const checkInDate = formatDate(new Date(2025, 5, 7, 6, 0)); // 2025-01-07 AM 06:00
  const checkOutDate = formatDate(new Date(2025, 5, 31, 12, 0)); // 2025-01-31 PM 12:00

  // 로그아웃 처리
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', onPress: onLogout, style: 'destructive' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.helpButton} onPress={handleLogout}>
          <Text style={styles.helpText}>?</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image 
            source={require('../../assets/unist.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, {backgroundColor: isConnected ? '#2ECC71' : '#E74C3C'}]} />
          <Text style={styles.statusText}>{isConnected ? '연결됨' : '연결 안됨'}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Room Info */}
        <View style={styles.roomSection}>
          <View style={styles.roomNumberContainer}>
            <Text style={styles.roomPrefix}>Room </Text>
            <Text style={styles.roomNumber}>301동 201호</Text>
          </View>
          
          <View style={styles.timeInfo}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>CHECK-IN</Text>
              <Text style={styles.timeValue}>{checkInDate}</Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>CHECK-OUT</Text>
              <Text style={styles.timeValue}>{checkOutDate}</Text>
            </View>
          </View>
        </View>

        {/* Main Door Button */}
        <View style={styles.mainButtonSection}>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleOpenDoor}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator size="large" color="#1B365D" />
            ) : (
              <View style={styles.lockIcon}>
                <Text style={styles.lockIconText}>🔓</Text>
              </View>
            )}
            <Text style={styles.mainButtonText}>
              {isSending ? '여는중' : isDoorOpen ? '열렸습니다' : '문열림'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.instructionText}>
            Click the button to open the door
          </Text>
          <Text style={styles.instructionTextKr}>
            버튼을 클릭하여 문을 열어주세요
          </Text>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity 
            style={styles.frontDoorButton}
            onPress={handleFrontDoorOpen}
          >
            <View style={styles.buttonIcon}>
              <Text style={styles.buttonIconText}>🏢</Text>
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.bottomButtonText}>공동현관문 열기</Text>
              <Text style={styles.bottomButtonSubText}>Open Front Door</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.frontDoorButton}
            onPress={handleInquiry}
          >
            <View style={styles.buttonIcon}>
              <Text style={styles.buttonIconText}>📞</Text>
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.bottomButtonText}>문의하기</Text>
              <Text style={styles.bottomButtonSubText}>Contact Us</Text>
            </View>
          </TouchableOpacity>
        </View>


      </ScrollView>
    </View>
  );
};

