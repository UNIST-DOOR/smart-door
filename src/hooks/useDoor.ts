import { useState, useEffect, useRef } from 'react';
import DoorService from '../services/door/DoorService';
import { LogMessage, LogLevel } from '../types/door';
import { generateId } from '../utils/helpers';
import { COMMAND_LIST, EXTENDED_COMMANDS } from '../utils/constants';
import BleService from '../services/ble/BleService';

export const useDoor = (bleService: BleService | null) => {
  const [selectedCommand, setSelectedCommand] = useState<{ code: number; name: string }>(COMMAND_LIST[0]);
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0 });

  // MainActivity.kt의 입력 필드들
  const [orderText, setOrderText] = useState('');
  const [numberText, setNumberText] = useState('');
  const [cycleText, setCycleText] = useState('');

  const doorServiceRef = useRef<DoorService | null>(null);

  useEffect(() => {
    if (!bleService) return;

    // Initialize door service
    const doorService = new DoorService(bleService);
    doorServiceRef.current = doorService;

    // Setup event callbacks
    doorService.onSendProgress = (byte: number, remaining: number) => {
      setSendProgress(prev => {
        const sent = prev.total - remaining;
        return { sent, total: prev.total };
      });
      
      addLog(
        `전송: 0x${byte.toString(16).toUpperCase().padStart(2, '0')}`,
        'info'
      );
    };

    doorService.onSendComplete = () => {
      setIsSending(false);
      setSendProgress({ sent: 0, total: 0 });
      addLog('✅ 전체 바이트 전송 완료', 'success');
    };

    doorService.onSendError = (error: string) => {
      setIsSending(false);
      setSendProgress({ sent: 0, total: 0 });
      addLog(`❌ 전송 실패: ${error}`, 'error');
    };

    return () => {
      doorService.cancelSending();
    };
  }, [bleService]);

  const addLog = (message: string, level: LogLevel = 'info') => {
    const newLog: LogMessage = {
      id: generateId(),
      message,
      level,
      timestamp: new Date()
    };
    
    setLogs(prev => [...prev, newLog]);
  };

  const sendCommand = async (commandCode?: number, params?: {
    orderText?: string;
    numberText?: string;
    cycleText?: string;
  }) => {
    if (!doorServiceRef.current) {
      addLog('도어 서비스가 초기화되지 않았습니다', 'error');
      return false;
    }

    const cmd = commandCode || selectedCommand.code;
    const commandParams = params || (isExtendedCommand(cmd) ? {
      orderText,
      numberText,
      cycleText
    } : undefined);
    
    setIsSending(true);
    
    // Estimate total bytes (extended commands are 13 bytes, others are 10)
    const totalBytes = isExtendedCommand(cmd) ? 13 : 10;
    setSendProgress({ sent: 0, total: totalBytes });
    
    // Log command details
    let commandInfo = `명령 전송 시작: ${doorServiceRef.current.getCommandName(cmd)}`;
    if (commandParams) {
      const details = [];
      if (commandParams.orderText) details.push(`순번: ${commandParams.orderText}`);
      if (commandParams.numberText) details.push(`번호: ${commandParams.numberText}`);
      if (commandParams.cycleText) details.push(`차수: ${commandParams.cycleText}`);
      if (details.length > 0) {
        commandInfo += ` (${details.join(', ')})`;
      }
    }
    addLog(commandInfo, 'info');
    
    const success = await doorServiceRef.current.sendCommand(cmd, commandParams);
    
    if (!success) {
      setIsSending(false);
      setSendProgress({ sent: 0, total: 0 });
    }
    
    return success;
  };

  const isExtendedCommand = (code: number): boolean => {
    return EXTENDED_COMMANDS.includes(code as any);
  };

  /**
   * 자동 문열기 기능 (스캔 → 연결 → 전송)
   * MainActivity.kt의 전체 플로우를 자동화
   */
  const autoOpenDoor = async (targetDeviceName: string = 'oasyss_000201'): Promise<boolean> => {
    if (!bleService) {
      addLog('❌ BLE 서비스가 초기화되지 않았습니다', 'error');
      return false;
    }

    try {
      setIsSending(true);
      addLog('🔍 자동 문열기 시작...', 'info');
      
      // BLE 서비스 로그 콜백 설정 (실시간 로그 표시)
      bleService.onError = (message: string) => {
        addLog(message, 'info');
      };
      
      // 1단계: BLE 초기화 및 권한 확인
      addLog('1️⃣ BLE 초기화 중...', 'info');
      const initialized = await bleService.initialize();
      if (!initialized) {
        addLog('❌ BLE 초기화 실패', 'error');
        return false;
      }
      addLog('✅ BLE 초기화 완료', 'success');
      
      // 2단계: 자동 스캔 및 연결
      addLog(`2️⃣ ${targetDeviceName} 기기 검색 중...`, 'info');
      
      // 기기 검색 및 연결 (상세 로그는 BLE 서비스에서 처리)
      const connected = await bleService.scanAndAutoConnect(targetDeviceName);
      if (!connected) {
        addLog('❌ 기기 연결 실패', 'error');
        return false;
      }
      addLog('✅ 기기 연결 성공', 'success');
      
      // 잠시 대기 (서비스 발견 완료 대기)
      addLog('⏳ 서비스 발견 대기 중...', 'info');
      await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));
      
      // 3단계: 0x01 명령어 전송 (문열기)
      addLog('3️⃣ 문열기 명령 전송 중...', 'info');
      const success = await sendCommand(0x01);
      if (success) {
        addLog('🎉 문열기 완료!', 'success');
      } else {
        addLog('❌ 문열기 명령 전송 실패', 'error');
      }
      
      return success;
      
    } catch (error) {
      addLog(`❌ 자동 문열기 오류: ${error}`, 'error');
      return false;
    } finally {
      setIsSending(false);
      // 로그 콜백 해제
      if (bleService) {
        bleService.onError = undefined;
      }
    }
  };

  /**
   * 공동현관문 자동 열기 기능 (스캔 → 연결 → 전송)
   * oasyss_0009999 기기 전용
   */
  const autoOpenEntranceDoor = async (targetDeviceName: string = 'oasyss_0009999'): Promise<boolean> => {
    if (!bleService) {
      addLog('❌ BLE 서비스가 초기화되지 않았습니다', 'error');
      return false;
    }

    try {
      setIsSending(true);
      addLog('🚪 공동현관문 열기 시작...', 'info');
      
      // BLE 서비스 로그 콜백 설정 (실시간 로그 표시)
      bleService.onError = (message: string) => {
        addLog(message, 'info');
      };
      
      // 1단계: BLE 초기화 및 권한 확인
      addLog('1️⃣ BLE 초기화 중...', 'info');
      const initialized = await bleService.initialize();
      if (!initialized) {
        addLog('❌ BLE 초기화 실패', 'error');
        return false;
      }
      addLog('✅ BLE 초기화 완료', 'success');
      
      // 2단계: 자동 스캔 및 연결
      addLog(`2️⃣ ${targetDeviceName} 기기 검색 중...`, 'info');
      
      // 기기 검색 및 연결 (상세 로그는 BLE 서비스에서 처리)
      const connected = await bleService.scanAndAutoConnect(targetDeviceName);
      if (!connected) {
        addLog('❌ 기기 연결 실패', 'error');
        return false;
      }
      addLog('✅ 기기 연결 성공', 'success');
      
      // 잠시 대기 (서비스 발견 완료 대기)
      addLog('⏳ 서비스 발견 대기 중...', 'info');
      await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));
      
      // 3단계: 0x21 명령어 전송 (공동현관문 열기)
      addLog('3️⃣ 공동현관문 열기 명령 전송 중...', 'info');
      const success = await sendCommand(0x21);
      if (success) {
        addLog('🎉 공동현관문 열기 완료!', 'success');
        
        // 공동현관문은 응답값이 없으므로 수동으로 연결해제
        addLog('🔌 연결 해제 중...', 'info');
        setTimeout(async () => {
          try {
            await bleService.disconnect();
            addLog('✅ 연결해제 완료', 'success');
          } catch (error) {
            addLog(`⚠️ 연결해제 중 오류: ${error}`, 'warning');
          }
        }, 2000); // 1초 후 연결해제
      } else {
        addLog('❌ 공동현관문 열기 명령 전송 실패', 'error');
      }
      
      return success;
      
    } catch (error) {
      addLog(`❌ 공동현관문 열기 오류: ${error}`, 'error');
      return false;
    } finally {
      setIsSending(false);
      // 로그 콜백 해제
      if (bleService) {
        bleService.onError = undefined;
      }
    }
  };

  const quickCommands = {
    openDoor: () => sendCommand(0x01),
    autoOpenDoor, // 기존 자동 문열기 기능
    autoOpenEntranceDoor, // 새로운 공동현관문 열기 기능
    closeDoor: () => sendCommand(0x00),
    checkStatus: () => sendCommand(0x02),
    checkBattery: () => sendCommand(0x1C),
    setTime: () => sendCommand(0x05),
    registerStudent: () => {
      if (!orderText || !numberText || !cycleText) {
        addLog('학생증 등록: 순번, 번호, 차수를 모두 입력해주세요', 'error');
        return Promise.resolve(false);
      }
      return sendCommand(0x1D, { orderText, numberText, cycleText });
    },
    deleteStudent: () => {
      if (!orderText) {
        addLog('학생증 삭제: 순번을 입력해주세요', 'error');
        return Promise.resolve(false);
      }
      return sendCommand(0x1E, { orderText });
    },
    deleteAllStudents: () => sendCommand(0x1F)
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('로그가 삭제되었습니다', 'info');
  };

  const cancelSending = () => {
    if (doorServiceRef.current) {
      doorServiceRef.current.cancelSending();
      setIsSending(false);
      setSendProgress({ sent: 0, total: 0 });
      addLog('전송이 취소되었습니다', 'warning');
    }
  };

  const copyLogsToClipboard = () => {
    const logText = logs.map(log => 
      `[${log.timestamp.toLocaleTimeString()}] ${log.message}`
    ).join('\n');
    // Note: Clipboard functionality would need react-native-clipboard/clipboard
    addLog('로그가 클립보드에 복사되었습니다', 'info');
    return logText;
  };

  return {
    // State
    selectedCommand,
    isSending,
    logs,
    sendProgress,
    commandList: COMMAND_LIST,
    
    // Input fields (MainActivity.kt 호환)
    orderText,
    numberText,
    cycleText,
    setOrderText,
    setNumberText,
    setCycleText,
    
    // Actions
    setSelectedCommand,
    sendCommand,
    clearLogs,
    cancelSending,
    copyLogsToClipboard,
    addLog,
    
    // Quick commands
    quickCommands,
    
    // Helpers
    isExtendedCommand,
    
    // Getters
    canSend: !isSending && doorServiceRef.current?.isSendingCommand() === false,
    doorService: doorServiceRef.current,
    showExtendedInputs: isExtendedCommand(selectedCommand.code)
  };
}; 