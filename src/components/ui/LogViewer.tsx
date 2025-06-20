import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { LogMessage } from '../../types/door';
import { formatTimestamp } from '../../utils/helpers';

interface LogViewerProps {
  logs: LogMessage[];
  maxHeight?: number;
}

export const LogViewer: React.FC<LogViewerProps> = ({ 
  logs, 
  maxHeight = 300 
}) => {
  const getLogColor = (level: LogMessage['level']) => {
    switch (level) {
      case 'error': return '#FF3B30';
      case 'warning': return '#FF9500';
      case 'success': return '#34C759';
      case 'info':
      default:
        return '#000000';
    }
  };

  const renderLogItem = (item: LogMessage) => (
    <View key={item.id} style={styles.logItem}>
      <Text style={styles.timestamp}>
        {formatTimestamp(item.timestamp)}
      </Text>
      <Text style={[styles.message, { color: getLogColor(item.level) }]}>
        {item.message}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { maxHeight }]}>
      <ScrollView
        showsVerticalScrollIndicator={true}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        nestedScrollEnabled={true}
      >
        {logs.map(renderLogItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 8,
  },
  logItem: {
    marginBottom: 4,
    paddingVertical: 2,
  },
  timestamp: {
    fontSize: 10,
    color: '#8E8E93',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'monospace',
  },
}); 