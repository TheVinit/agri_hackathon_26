import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function NodeCard({ node }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'green': return '#4CAF50';
      case 'amber': return '#FFB300';
      case 'red': return '#E53935';
      default: return '#9E9E9E';
    }
  };

  return (
    <Card style={[styles.card, { borderTopColor: getStatusColor(node.status) }]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.nodeLabel}>{node.labelLine1}</Text>
            <Text style={styles.nodeLabelSub}>{node.labelLine2}</Text>
          </View>
          <MaterialCommunityIcons 
            name="checkbox-blank-circle" 
            size={12} 
            color={getStatusColor(node.status)} 
          />
        </View>

        <View style={styles.dataRow}>
          <MaterialCommunityIcons name="water-percent" size={20} color="#2196F3" />
          <View style={styles.labelCol}>
            <Text style={styles.nodeTextEn}>Moisture</Text>
            <Text style={styles.nodeTextHi}>नमी</Text>
          </View>
          <Text style={styles.valueText}>{node.moisture}%</Text>
        </View>

        <View style={styles.dataRow}>
          <MaterialCommunityIcons name="lightning-bolt-outline" size={20} color="#FFB300" />
          <View style={styles.labelCol}>
            <Text style={styles.nodeTextEn}>Soil EC</Text>
            <Text style={styles.nodeTextHi}>ईसी (नमक)</Text>
          </View>
          <Text style={styles.valueText}>{node.ec}</Text>
        </View>

        <View style={styles.dataRow}>
          <MaterialCommunityIcons name="thermometer" size={20} color="#F44336" />
          <View style={styles.labelCol}>
            <Text style={styles.nodeTextEn}>Temp.</Text>
            <Text style={styles.nodeTextHi}>तापमान</Text>
          </View>
          <Text style={styles.valueText}>{node.temperature}°C</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 16,
    elevation: 4,
    backgroundColor: '#fff',
    borderTopWidth: 4,
    borderRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  nodeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#37474F',
  },
  nodeLabelSub: {
    fontSize: 12,
    color: '#78909C',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  labelCol: {
    flex: 1,
    marginLeft: 8,
  },
  nodeTextEn: {
    fontSize: 14,
    fontWeight: '600',
    color: '#546E7A',
  },
  nodeTextHi: {
    fontSize: 11,
    color: '#78909C',
    marginTop: -2,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#263238',
  },
});
