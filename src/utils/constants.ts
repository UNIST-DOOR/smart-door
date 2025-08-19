// BLE Service & Characteristic UUIDs (from MainActivity.kt BleUUID.kt)
export const BLE_UUIDS = {
  // 기본 UUID (수정불가)
  BASIC_UUID: '00002902-0000-1000-8000-00805f9b34fb',
  
  // 메인 UUID (데이터 송수신용)
  MAIN_UUID: '8c2e1f04-37b3-4e4e-8c1a-f2d57ab8c3b6',
  
  // 알림(모듈<->앱) 제어 UUID
  NOTIFY_UUID: 'a7c384d0-5fc2-41a1-bf3a-1a8d0fc167be',
  
  // 도어락 제어 UUID
  COMMAND_UUID: 'c5bd6ef7-94ab-4ac6-a2dc-9235d7aa22cd',
  
  // (옵션) 대체 서비스와 특성 UUID (BLE 모듈 테스트용) - MainActivity.kt에서 실제 사용
  ALT_SERVICE_UUID: 'd4e5df25-f713-4ed9-9983-7db4f4452c94',
  ALT_CHAR_UUID: 'd79f1ad1-97ec-4c14-955d-10662e1f6fca',
  ALT_NOTI_SERVICE: 'd4e5df25-f713-4ed9-9983-7db4f4452c94',
  ALT_NOTI_Characteristic: 'd79f1ad1-97ec-4c14-955d-10662e1f6fca'
} as const;

// Door Control Commands (from MainActivity.kt - 0x01~0x1F)
export const DOOR_COMMANDS = {
  // 기본 명령어들 (0x01~0x1C)
  BASIC_CONTROL: 0x01,
  GENERAL_2: 0x02,
  GENERAL_3: 0x03,
  GENERAL_4: 0x04,
  TIME_SETTING: 0x05,
  USE_CONTROL_SET: 0x06,
  USE_CONTROL_RELEASE: 0x07,
  MANUAL_LOCK_MODE: 0x08,
  MANUAL_LOCK_RELEASE: 0x09,
  BLE_OPEN: 0x0A,
  BLE_AUTH_CHANGE: 0x0B,
  NUMBER_TIME_SETTING: 0x0C,
  FACTORY_RESET: 0x0D,
  SUPER_ADMIN_CHANGE: 0x0E,
  TOUCH_PASSWORD_4: 0x0F,
  BLE_CLOSE: 0x10,
  RECENT_EVENT: 0x11,
  MUTE_SET: 0x12,
  MUTE_RELEASE: 0x13,
  DOOR_OPEN_EVENT: 0x14,
  CARD_SETTING: 0x15,
  CARD_SETTING_VIEW: 0x16,
  MANAGER_PASSWORD: 0x17,
  MAID_PASSWORD: 0x18,
  PASSWORD_USER_CHECK: 0x19,
  TOUCH_PASSWORD_DYNAMIC: 0x1A,
  PASSWORD_MODE_CHECK: 0x1B,
  BATTERY_CHECK: 0x1C,
  
  // 확장 명령어들 (0x1D, 0x1E, 0x1F) - 13바이트 패킷 사용
  STUDENT_REGISTER: 0x1D,
  STUDENT_DELETE: 0x1E,  
  STUDENT_ALL_DELETE: 0x1F
} as const;

// Command List for UI (from MainActivity.kt commandList)
export const COMMAND_LIST = Array.from({ length: 31 }, (_, i) => ({
  code: i + 1, // 0x01 ~ 0x1F
  name: `0x${(i + 1).toString(16).toUpperCase().padStart(2, '0')}`
}));

// Extended commands that require 13-byte packets and additional inputs
export const EXTENDED_COMMANDS = [0x1D, 0x1E, 0x1F] as const;

// App Settings
export const APP_CONFIG = {
  DEVICE_NAME_PREFIX: 'unist',
  SCAN_TIMEOUT: 8000,
  CONNECTION_TIMEOUT: 5000,
  MAX_RETRY_COUNT: 3,
  BYTE_SEND_DELAY: 50,    // Delay between bytes (ms)
  RETRY_DELAY: 100        // Delay before retry (ms)
} as const; 