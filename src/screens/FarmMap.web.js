import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme';

// Web fallback for FarmMap — shows zone info without native maps
export default function FarmMap() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🗺</Text>
        <Text style={styles.title}>खेत का नक्शा</Text>
        <Text style={styles.sub}>Farm Map (Mobile App Only)</Text>
        <Text style={styles.desc}>
          नक्शा केवल मोबाइल ऐप पर दिखता है।{'\n'}
          Map is available on iOS/Android only.
        </Text>
        <View style={styles.zones}>
          {['⬆️ उत्तर (North)', '⬇️ दक्षिण (South)', '➡️ पूर्व (East)', '⬅️ पश्चिम (West)'].map((z, i) => (
            <View key={i} style={styles.zone}>
              <Text style={styles.zoneText}>{z}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 30, width: '100%', maxWidth: 480, alignItems: 'center', borderTopWidth: 5, borderTopColor: COLORS.primary },
  emoji: { fontSize: 50, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.primary, marginBottom: 4 },
  sub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
  desc: { fontSize: 15, color: COLORS.text, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  zones: { width: '100%' },
  zone: { backgroundColor: COLORS.primaryPale, borderRadius: 10, padding: 12, marginBottom: 8 },
  zoneText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
});
