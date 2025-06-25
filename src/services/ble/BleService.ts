import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { Buffer } from 'buffer';
import { BLE_UUIDS, APP_CONFIG } from '../../utils/constants';
import { BleDevice, BleConnectionState } from '../../types/ble';
import { isTargetDevice } from '../../utils/helpers';

class BleService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private commandCharacteristic: Characteristic | null = null;
  private notifyCharacteristic: Characteristic | null = null;
  
  // Event callbacks
  public onDeviceFound?: (device: BleDevice) => void;
  public onConnectionStateChange?: (state: BleConnectionState) => void;
  public onDataReceived?: (data: string) => void;
  public onError?: (error: string) => void;

  constructor() {
    this.manager = new BleManager();
  }

  /**
   * Request BLE permissions for Android
   */
  async requestBlePermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need explicit BLE permissions
    }

    try {
      // Android 12+ 새로운 권한들
      if (Platform.Version >= 31) {
        const bluetoothScanGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          {
            title: 'Bluetooth Scan Permission',
            message: 'BLE 스캔을 위해 블루투스 권한이 필요합니다.',
            buttonNegative: '취소',
            buttonPositive: '확인',
          }
        );

        const bluetoothConnectGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          {
            title: 'Bluetooth Connect Permission',
            message: 'BLE 연결을 위해 블루투스 권한이 필요합니다.',
            buttonNegative: '취소',
            buttonPositive: '확인',
          }
        );

        if (bluetoothScanGranted !== PermissionsAndroid.RESULTS.GRANTED ||
            bluetoothConnectGranted !== PermissionsAndroid.RESULTS.GRANTED) {
          this.onError?.('블루투스 권한이 거부되었습니다');
          return false;
        }
      }

      // 위치 권한 (모든 Android 버전)
      const locationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'BLE 스캔을 위해 위치 권한이 필요합니다.',
          buttonNegative: '취소',
          buttonPositive: '확인',
        }
      );

      if (locationGranted !== PermissionsAndroid.RESULTS.GRANTED) {
        this.onError?.('위치 권한이 거부되었습니다. BLE 스캔을 위해 필요합니다.');
        return false;
      }

      return true;
    } catch (error) {
      this.onError?.(`권한 요청 실패: ${error}`);
      return false;
    }
  }

  /**
   * Initialize BLE manager and check permissions
   */
  async initialize(): Promise<boolean> {
    try {
      // 권한 요청
      const permissionsGranted = await this.requestBlePermissions();
      if (!permissionsGranted) {
        return false;
      }

      const state = await this.manager.state();
      if (state !== 'PoweredOn') {
        this.onError?.('Bluetooth is not powered on');
        return false;
      }
      return true;
    } catch (error) {
      this.onError?.(`BLE initialization failed: ${error}`);
      return false;
    }
  }

  /**
   * Start scanning for target devices (from MainActivity.kt startScan())
   */
  async startScan(): Promise<void> {
    try {
      await this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          this.onError?.(`Scan error: ${error.message}`);
          return;
        }

        if (device && isTargetDevice(device.name, APP_CONFIG.DEVICE_NAME_PREFIX)) {
          const bleDevice: BleDevice = {
            id: device.id,
            name: device.name,
            rssi: device.rssi || undefined
          };
          this.onDeviceFound?.(bleDevice);
        }
      });

      // Auto stop scan after timeout
      setTimeout(() => {
        this.stopScan();
      }, APP_CONFIG.SCAN_TIMEOUT);

    } catch (error) {
      this.onError?.(`Failed to start scan: ${error}`);
    }
  }

  /**
   * 자동 스캔 및 연결 (oasyss_000201 기기 자동 찾기)
   * 문열림 버튼용 원클릭 기능
   */
  async scanAndAutoConnect(targetDeviceName: string = 'oasyss_000201'): Promise<boolean> {
    try {
      // 이미 연결되어 있으면 성공 반환
      if (this.isConnected()) {
        return true;
      }

      // 기존 연결 정리
      if (this.connectedDevice) {
        this.connectedDevice = null;
        this.commandCharacteristic = null;
        this.notifyCharacteristic = null;
      }

      // 기존 스캔 중지 (안전장치)
      this.stopScan();

      return new Promise((resolve, reject) => {
        let found = false;
        
        // 스캔 시작
        this.manager.startDeviceScan(null, null, async (error, device) => {
          if (error) {
            this.stopScan();
            this.onError?.(`❌ 스캔 오류: ${error.message}`);
            reject(new Error(`스캔 오류: ${error.message}`));
            return;
          }

          // 목표 기기 찾음
          if (device && device.name === targetDeviceName && !found) {
            found = true;
            this.stopScan();
            
            try {
              // 자동 연결 시도
              const connected = await this.connectToDevice(device.id);
              
              if (connected) {
                this.onConnectionStateChange?.({
                  isConnected: true,
                  device: {
                    id: device.id,
                    name: device.name,
                    rssi: device.rssi || undefined
                  },
                  isScanning: false,
                  isServiceDiscovered: true
                });
                resolve(true);
              } else {
                this.onError?.(`❌ 연결 실패: ${device.name}`);
                reject(new Error('연결 실패'));
              }
            } catch (connectError) {
              this.onError?.(`❌ 연결 예외: ${connectError}`);
              reject(new Error(`연결 오류: ${connectError}`));
            }
          }
        });

        // 타임아웃 설정 (8초)
        setTimeout(() => {
          if (!found) {
            this.stopScan();
            this.onError?.(`⏰ 기기를 찾을 수 없습니다: ${targetDeviceName}`);
            reject(new Error(`기기를 찾을 수 없습니다: ${targetDeviceName}`));
          }
        }, 8000);
      });

    } catch (error) {
      this.onError?.(`❌ 자동 연결 실패: ${error}`);
      return false;
    }
  }

  /**
   * Stop BLE scanning
   */
  stopScan(): void {
    this.manager.stopDeviceScan();
  }

  /**
   * Connect to selected device (from MainActivity.kt connectToDevice())
   */
  async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      // 기존 연결 정리
      if (this.connectedDevice) {
        this.connectedDevice = null;
        this.commandCharacteristic = null;
        this.notifyCharacteristic = null;
      }
      
      // 연결 시도
      const device = await this.manager.connectToDevice(deviceId, {
        timeout: 8000
      });
      
      this.connectedDevice = device;

      // Discover services and characteristics
      await device.discoverAllServicesAndCharacteristics();
      
      // 실제 기기에서 MAIN_UUID 서비스 사용
      const services = await device.services();
      
      // MAIN_UUID 서비스 직접 찾기
      const service = services.find(s => s.uuid.toLowerCase() === BLE_UUIDS.MAIN_UUID.toLowerCase());
      
      if (!service) {
        this.onError?.(`❌ 서비스를 찾을 수 없습니다: MAIN_UUID`);
        return false;
      }

      // Get characteristics
      const characteristics = await service.characteristics();
      
      // MAIN_UUID 서비스: 별도의 명령/알림 특성 사용
      const commandChar = characteristics.find(c => c.uuid.toLowerCase() === BLE_UUIDS.COMMAND_UUID.toLowerCase());
      const notifyChar = characteristics.find(c => c.uuid.toLowerCase() === BLE_UUIDS.NOTIFY_UUID.toLowerCase());
      
      if (!commandChar) {
        this.onError?.(`❌ 명령 특성을 찾을 수 없습니다`);
        return false;
      }
      
      // 전송용과 수신용 특성 설정
      this.commandCharacteristic = commandChar;
      this.notifyCharacteristic = notifyChar || commandChar; // 알림 특성이 없으면 명령 특성 사용

      // Enable notifications
      try {
        await this.notifyCharacteristic!.monitor((error, characteristic) => {
          if (error) {
            return;
          }
          
          if (characteristic?.value) {
            // Convert base64 to hex string for display
            const buffer = Buffer.from(characteristic.value, 'base64');
            const hexString = Array.from(buffer)
              .map(byte => byte.toString(16).toUpperCase().padStart(2, '0'))
              .join(' ');
            this.onDataReceived?.(hexString);
            
            // 0x81 응답코드 받으면 자동 연결 해제
            if (buffer.length > 1 && buffer[1] === 0x81) {
              setTimeout(() => {
                this.disconnect();
              }, 500); // 0.5초 후 연결 해제
            }
          }
        });
      } catch (notifyError) {
        // 알림 실패해도 연결은 성공으로 처리 (명령 전송은 가능)
      }

      this.onConnectionStateChange?.({
        isConnected: true,
        device: {
          id: device.id,
          name: device.name
        },
        isScanning: false,
        isServiceDiscovered: true
      });
      
      return true;

    } catch (error) {
      this.onError?.(`❌ 연결 실패: ${error}`);
      this.connectedDevice = null;
      this.commandCharacteristic = null;
      this.notifyCharacteristic = null;
      return false;
    }
  }

  /**
   * Send byte array to device (from MainActivity.kt writeCharacteristic)
   * MainActivity.kt는 바이트 배열 전체를 한번에 전송
   */
  async sendByteArray(bytes: number[]): Promise<boolean> {
    if (!this.commandCharacteristic || !this.connectedDevice) {
      this.onError?.('기기가 연결되지 않았거나 특성을 사용할 수 없습니다');
      return false;
    }

    try {
      const buffer = Buffer.from(bytes);
      const base64Data = buffer.toString('base64');
      
      await this.commandCharacteristic.writeWithoutResponse(base64Data);
      return true;
    } catch (error) {
      this.onError?.(`전송 실패: ${error}`);
      return false;
    }
  }

  /**
   * Send single byte to device (기존 방식 유지)
   */
  async sendByte(byte: number): Promise<boolean> {
    return this.sendByteArray([byte]);
  }

  /**
   * Disconnect from current device
   */
  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
        this.connectedDevice = null;
        this.commandCharacteristic = null;
        this.notifyCharacteristic = null;
        
        this.onConnectionStateChange?.({
          isConnected: false,
          device: null,
          isScanning: false,
          isServiceDiscovered: false
        });
      } catch (error) {
        this.onError?.(`연결 해제 실패: ${error}`);
      }
    }
  }

  /**
   * Check if currently connected to a device
   */
  isConnected(): boolean {
    return this.connectedDevice !== null && this.commandCharacteristic !== null;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopScan();
    this.disconnect();
    this.manager.destroy();
  }
}

export default BleService; 