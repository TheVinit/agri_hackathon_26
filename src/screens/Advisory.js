import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Surface, Text, IconButton, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { advisory } from '../mockData';

export default function Advisory() {
  const cards = [
    {
      id: 'irrigation',
      title: advisory.irrigation.titleEn,
      subtitle: advisory.irrigation.title,
      text: advisory.irrigation.textEn,
      hiText: advisory.irrigation.text,
      color: '#2196F3',
      icon: 'water-sync',
    },
    {
      id: 'nutrients',
      title: advisory.nutrients.titleEn,
      subtitle: advisory.nutrients.title,
      text: advisory.nutrients.textEn,
      hiText: advisory.nutrients.text,
      color: '#FB8C00',
      icon: 'leaf-circle',
    },
    {
      id: 'nextCrop',
      title: advisory.nextCrop.titleEn,
      subtitle: advisory.nextCrop.title,
      text: advisory.nextCrop.textEn,
      hiText: advisory.nextCrop.text,
      color: '#43A047',
      icon: 'sprout-outline',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.topInfo}>Daily Agricultural Advisory</Text>
      
      {cards.map((item) => (
        <Surface key={item.id} style={styles.surface}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
              <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
            </View>
            <View style={styles.titleBox}>
              <Text style={styles.titleEn}>{item.title}</Text>
              <Text style={styles.titleHi}>{item.subtitle}</Text>
            </View>
            <TouchableOpacity style={styles.audioAction} onPress={() => console.log('play audio')}>
              <MaterialCommunityIcons name="volume-high" size={26} color="#455A64" />
            </TouchableOpacity>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.textBox}>
            <Text style={styles.textEn}>{item.text}</Text>
            <Text style={styles.textHi}>{item.hiText}</Text>
          </View>
        </Surface>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
  },
  topInfo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#90A4AE',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  surface: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBox: {
    flex: 1,
    marginLeft: 15,
  },
  titleEn: {
    fontSize: 18,
    fontWeight: '700',
    color: '#263238',
  },
  titleHi: {
    fontSize: 14,
    color: '#78909C',
    fontWeight: '600',
  },
  audioAction: {
    padding: 10,
    backgroundColor: '#ECEFF1',
    borderRadius: 30,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F8E9',
    marginBottom: 14,
  },
  textBox: {
    paddingLeft: 4,
  },
  textEn: {
    fontSize: 16,
    lineHeight: 22,
    color: '#455A64',
    marginBottom: 10,
  },
  textHi: {
    fontSize: 16,
    lineHeight: 22,
    color: '#546E7A',
    fontWeight: '500',
  },
});
