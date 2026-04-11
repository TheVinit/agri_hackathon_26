// src/screens/NotificationsScreen.js
// Beautiful notification center — inbox-style, full-page
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';
import { useLang } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationsScreen({ navigation }) {
  const { lang, t } = useLang();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const getTitle = (n) => lang === 'hi' ? n.titleHi : lang === 'mr' ? n.titleMr : n.title;
  const getBody  = (n) => lang === 'hi' ? n.bodyHi  : lang === 'mr' ? n.bodyMr  : n.body;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        {navigation && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.text} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t('सूचनाएं', 'Notifications', 'सूचना')}</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} {t('अपठित', 'unread', 'न वाचलेल्या')}</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
            <Text style={styles.markAllTxt}>{t('सब पढ़ें', 'Mark all read', 'सर्व वाचा')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="bell-sleep" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyTxt}>{t('कोई सूचना नहीं', 'No notifications', 'कोणतीही सूचना नाही')}</Text>
          </View>
        ) : (
          notifications.map((n, i) => (
            <TouchableOpacity
              key={n.id}
              style={[styles.card, !n.read && styles.cardUnread]}
              onPress={() => markRead(n.id)}
              activeOpacity={0.85}
            >
              {/* Icon */}
              <View style={[styles.iconWrap, { backgroundColor: n.color + '18' }]}>
                <MaterialCommunityIcons name={n.icon} size={22} color={n.color} />
              </View>

              {/* Content */}
              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <Text style={[styles.cardTitle, !n.read && styles.cardTitleUnread]}>
                    {getTitle(n)}
                  </Text>
                  <Text style={styles.cardTime}>{n.time}</Text>
                </View>
                <Text style={styles.cardBody} numberOfLines={2}>{getBody(n)}</Text>
              </View>

              {/* Unread dot */}
              {!n.read && <View style={[styles.unreadDot, { backgroundColor: n.color }]} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingVertical: 14,
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
    ...SHADOWS.soft,
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.primary, fontWeight: '700', marginTop: 2 },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.primaryPale, borderRadius: 10 },
  markAllTxt: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  list: { padding: 16, gap: 10 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 14 },
  emptyTxt: { fontSize: 16, fontWeight: '700', color: COLORS.textMuted },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: COLORS.divider,
    ...SHADOWS.soft,
    position: 'relative',
  },
  cardUnread: { borderColor: COLORS.primary + '30', backgroundColor: COLORS.primaryPale },
  iconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  cardContent: { flex: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, flex: 1 },
  cardTitleUnread: { fontWeight: '900', color: COLORS.text },
  cardTime: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginLeft: 8 },
  cardBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, fontWeight: '500' },
  unreadDot: { position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 4 },
});
