import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#ED6A5E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? ((StatusBar.currentHeight || 0) + 10) : 10,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  helpButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: 'bold',
  },
  headerCenter: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotOn: {
    backgroundColor: '#2ECC71',
  },
  statusDotOff: {
    backgroundColor: '#E74C3C',
  },
  statusText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
  },

  content: {
    flex: 1,
    backgroundColor: '#ED6A5E',
  },
  roomSection: {
    backgroundColor: '#ED6A5E',
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
  },
  roomNumberContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  roomPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  roomNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timeInfo: {
    width: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  mainButtonSection: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#ED6A5E',
  },
  mainButton: {
    width: 200,
    height: 170,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 30,
  },
  lockIcon: {
    marginBottom: 15,
  },
  lockIconText: {
    fontSize: 35,
  },
  mainButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#001A53',
  },
  instructionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 3,
  },
  instructionTextKr: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  bottomButtons: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: '#ED6A5E',
    gap: 12,
  },
  frontDoorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 15,
  },
  buttonIconText: {
    fontSize: 20,
  },
  buttonTextContainer: {
    flex: 1,
  },
  bottomButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
  },
  bottomButtonSubText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7F8C8D',
    marginTop: 2,
  },
  // Debug Log Section
  logSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  logActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  logActionBtn: {
    backgroundColor: '#EDF2F7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  logActionText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 50,
    backgroundColor: '#ED6A5E',
  },
}); 