import { EXTENDED_COMMANDS, APP_CONFIG } from '../../utils/constants';
import { calculateChecksum, getCurrentTimeComponents, parseNumberText, parseHexInput } from '../../utils/helpers';
import { SendQueueItem } from '../../types/door';
import BleService from '../ble/BleService';

interface CommandParams {
  orderText?: string;
  numberText?: string;
  cycleText?: string;
}

class DoorService {
  private bleService: BleService;
  private sendQueue: SendQueueItem[] = [];
  private isSending: boolean = false;
  
  // Event callbacks
  public onSendProgress?: (byte: number, remaining: number) => void;
  public onSendComplete?: () => void;
  public onSendError?: (error: string) => void;

  constructor(bleService: BleService) {
    this.bleService = bleService;
  }

  /**
   * Generate command data based on command code (완전한 MainActivity.kt 구현)
   */
  private generateCommandData(command: number, params?: CommandParams): number[] {
    const commandByte = command & 0xFF;
    
    // 13바이트 확장 패킷이 필요한 명령어들
    const isExtended = (EXTENDED_COMMANDS as readonly number[]).includes(command);
    const dataSize = isExtended ? 13 : 10;
    const data = new Array(dataSize).fill(0);
    
    // 공통 헤더
    data[0] = 0xCC;
    data[1] = commandByte;
    data[2] = 0x00;

    // MainActivity.kt의 when 문 완전 복제 (명령어 표 기준)
    switch (commandByte) {
      case 0x00: {
        // 원격 도어락 닫힘 - aPW1~aPW4 (관리자 비밀번호)
        data[3] = 0x00;
        data[4] = 0x00;
        data[5] = 0x01;        // aPW1
        data[6] = 0x02;        // aPW2
        data[7] = 0x03;        // aPW3
        data[8] = 0x04;        // aPW4
        break;
      }
      
      case 0x01: {
        // 원격 도어락 열림 - aPW1~aPW4 (관리자 비밀번호)
        data[3] = 0x00;        // Delay Time
        data[4] = 0x00;
        data[5] = 0x01;        // aPW1
        data[6] = 0x02;        // aPW2
        data[7] = 0x03;        // aPW3
        data[8] = 0x04;        // aPW4
        break;
      }
      
      case 0x02: {
        // 원격 도어락 상태 확인 - abPW1~abPW4 (관리자/BLE 비밀번호)
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x03:
      case 0x04: {
        // 예약된 명령어 - 기본 10바이트 패킷
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x06: {
        // 사용통제 설정 (카드,번호,스마트폰BLE) - aPW1~aPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x07: {
        // 사용통제 해제 (카드,번호,스마트폰BLE) - aPW1~aPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x08: {
        // 수동잠김모드 설정 - abPW1~abPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x09: {
        // 자동잠김모드 설정 - abPW1~abPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x0A: {
        // 스마트폰BLE로 도어락 문열림 - bPW1~bPW4 (BLE 비밀번호)
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x0B: {
        // 스마트폰 인증번호 설정변경 - bPW1~bPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x0D: {
        // 공장 출하시 상태로 초기화 - aPW1~aPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x0E: {
        // 슈퍼관리자 인증번호 설정변경 - aPW1~aPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x0F: {
        // 터치패드 비밀번호 설정변경(4자리) - tPW1~tPW4 (터치패드 비밀번호)
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x10: {
        // 스마트폰BLE로 도어락 문닫기 - bPW1~bPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x11: {
        // 원격 최근발생 이벤트 요청 - abPW1~abPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x12: {
        // 무음 설정: 도어록에서 소리가 나지 않음 - abPW1~abPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x13: {
        // 무음 해제: 도어록에서 소리가 발생됨 - abPW1~abPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x14: {
        // 실제 문열린 이벤트: 실제 문이 열렸던 시간 요청 - abPW1~abPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x15: {
        // 카드관련 도어락 셋팅: 호텔코드(3) + 도어락ID(2) + 층번호(1)
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x16: {
        // 카드관련 도어락 셋팅 값 조회 - aPW1~aPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x17: {
        // 터치패드 매니저비밀번호 설정변경 - tPW1~tPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x18: {
        // 터치패드 메이드비밀번호 설정변경 - tPW1~tPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x19: {
        // 비밀번호 사용자구분 확인 - 사용자구분 + tPW1~tPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x1A: {
        // 터치패드 비밀번호 설정변경(8자리) - 설정 + tPW1~tPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x1B: {
        // 터치패드 비밀번호 모드 확인 - 설정값 + tPW1~tPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x1C: {
        // 배터리 잔량 확인 - tPW1~tPW4
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x21: {
        // 공동현관문 열기 - 특별 오픈신호 (9바이트)
        data[0] = 0xCC;        // 고정 헤더
        data[1] = 0x21;        // 명령어 코드
        data[2] = 0x01;        // 특별 신호
        data[3] = 0x00;
        data[4] = 0x00;
        data[5] = 0x00;
        data[6] = 0x00;
        data[7] = 0x00;
        data[8] = 0x00;
        break;
      }
      
      case 0x05: {
        // 현재시간 설정 - Year, Month, Date, Hour, Min
        const time = getCurrentTimeComponents();
        data[3] = 0x00;
        data[4] = time.year;
        data[5] = time.month;
        data[6] = time.date;
        data[7] = time.hour;
        data[8] = time.min;
        break;
      }
      
      case 0x0C: {
        // 번호키 사용가능시간 세팅 - Year, Month, Date, Hour, Min
        const time = getCurrentTimeComponents();
        data[3] = 0x00;
        data[4] = time.year;
        data[5] = time.month;
        data[6] = time.date;
        data[7] = time.hour;
        data[8] = time.min;
        break;
      }
      
      case 0x1D: {
        // 13바이트 확장 패킷 - 카드 등록 (학생증 등록)
        // 순번 + 번호1~번호7 + 차수 + sum(1:12)
        const order = parseHexInput(params?.orderText || '', 0xFF);
        const numbers = parseNumberText(params?.numberText || '');
        const cycle = parseHexInput(params?.cycleText || '', 0xFF);
        
        data[3] = order;       // 순번
        for (let i = 0; i < 7; i++) {
          data[4 + i] = numbers[i];  // 번호1~번호7
        }
        data[11] = cycle;      // 차수
        break;
      }
      
      case 0x1E: {
        // 13바이트 확장 패킷 - 학생증 도어 제어 삭제
        // 순번 + 0x00(9바이트) + sum(1:12)
        const order = parseHexInput(params?.orderText || '', 0xFF);
        data[3] = order;       // 삭제할 학생증 순번
        for (let i = 4; i <= 11; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      case 0x1F: {
        // 13바이트 확장 패킷 - 학생증 전체 삭제
        // 모든 데이터 0x00 + sum(1:12)
        for (let i = 3; i <= 11; i++) {
          data[i] = 0x00;
        }
        break;
      }
      
      default: {
        // 알 수 없는 명령어 - 기본 패킷
        for (let i = 3; i <= 8; i++) {
          data[i] = 0x00;
        }
        break;
      }
    }

    // 체크섬 계산 (마지막 바이트 제외한 모든 바이트의 합)
    const checksumIndex = dataSize - 1;
    data[checksumIndex] = calculateChecksum(data, checksumIndex);
    
    return data;
  }

  /**
   * Send command with parameters (from MainActivity.kt)
   */
  async sendCommand(command: number, params?: CommandParams): Promise<boolean> {
    if (!this.bleService.isConnected()) {
      this.onSendError?.('Device not connected');
      return false;
    }

    if (this.isSending) {
      this.onSendError?.('Another command is already being sent');
      return false;
    }

    try {
      const data = this.generateCommandData(command, params);
      
      // Clear queue and add new data
      this.sendQueue = [];
      data.forEach(byte => {
        this.sendQueue.push({
          byte,
          retryCount: 0
        });
      });

      this.isSending = true;
      await this.sendNextByte();
      
      return true;
    } catch (error) {
      this.onSendError?.(`Failed to send command: ${error}`);
      return false;
    }
  }

  /**
   * Send next byte in queue (from MainActivity.kt sendNextByte)
   */
  private async sendNextByte(): Promise<void> {
    if (this.sendQueue.length === 0) {
      this.isSending = false;
      this.onSendComplete?.();
      return;
    }

    const queueItem = this.sendQueue.shift()!;
    const success = await this.bleService.sendByte(queueItem.byte);
    
    if (success) {
      this.onSendProgress?.(queueItem.byte, this.sendQueue.length);
      
      // Continue with next byte after delay
      setTimeout(() => {
        this.sendNextByte();
      }, APP_CONFIG.BYTE_SEND_DELAY);
      
    } else {
      // Retry logic
      if (queueItem.retryCount < APP_CONFIG.MAX_RETRY_COUNT) {
        queueItem.retryCount++;
        this.sendQueue.unshift(queueItem); // Put back at front
        
        setTimeout(() => {
          this.sendNextByte();
        }, APP_CONFIG.RETRY_DELAY);
        
      } else {
        this.isSending = false;
        this.onSendError?.(`Failed to send byte: 0x${queueItem.byte.toString(16).toUpperCase()}`);
      }
    }
  }

  /**
   * Get command name for display
   */
  getCommandName(code: number): string {
    return `0x${code.toString(16).toUpperCase().padStart(2, '0')}`;
  }

  /**
   * Check if extended command (requires 13-byte packet)
   */
  isExtendedCommand(code: number): boolean {
    return (EXTENDED_COMMANDS as readonly number[]).includes(code);
  }

  /**
   * Check if currently sending
   */
  isSendingCommand(): boolean {
    return this.isSending;
  }

  /**
   * Cancel current sending operation
   */
  cancelSending(): void {
    this.sendQueue = [];
    this.isSending = false;
  }

  /**
   * Quick command methods (명령어 표 기준)
   */
  async openDoor(): Promise<boolean> {
    // 0x01: 원격 도어락 열림
    return this.sendCommand(0x01);
  }

  async closeDoor(): Promise<boolean> {
    // 0x00: 원격 도어락 닫힘
    return this.sendCommand(0x00);
  }

  async checkStatus(): Promise<boolean> {
    // 0x02: 원격 도어락 상태 확인
    return this.sendCommand(0x02);
  }

  async checkBattery(): Promise<boolean> {
    // 0x1C: 배터리 잔량 확인
    return this.sendCommand(0x1C);
  }

  async setTime(): Promise<boolean> {
    // 0x05: 현재시간 설정
    return this.sendCommand(0x05);
  }

  async registerStudent(orderText: string, numberText: string, cycleText: string): Promise<boolean> {
    // 0x1D: 카드 등록 (학생증 등록) - 13바이트 확장 패킷
    return this.sendCommand(0x1D, { orderText, numberText, cycleText });
  }

  async deleteStudent(orderText: string): Promise<boolean> {
    // 0x1E: 학생증 도어 제어 삭제 - 13바이트 확장 패킷
    return this.sendCommand(0x1E, { orderText });
  }

  async deleteAllStudents(): Promise<boolean> {
    // 0x1F: 학생증 전체 삭제 - 13바이트 확장 패킷
    return this.sendCommand(0x1F);
  }
}

export default DoorService; 