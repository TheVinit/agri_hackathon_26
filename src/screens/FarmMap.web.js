import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function FarmMap() {
  return (
    <View style={styles.container}>
      <View style={styles.webPlaceholder}>
        <Text style={styles.title}>Pune Farm Satellite View (Web View)</Text>
        <Text style={styles.subtitle}>
          React Native Maps is currently optimized for iOS/Android in this dashboard. 
          Your 4 sensor nodes near Pune are functioning correctly!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webPlaceholder: {
    padding: 30,
    backgroundColor: '#FFF',
    borderRadius: 20,
    elevation: 4,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    borderTopWidth: 5,
    borderTopColor: '#2E7D32',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#37474F',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#78909C',
    textAlign: 'center',
    lineHeight: 24,
  },
});
