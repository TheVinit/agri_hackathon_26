import { useLang } from '../context/LanguageContext';

const MOCK_ALERTS = [
  {
    id: '1',
    severity: 'critical',
    titleHi: '🚨 दक्षिण क्षेत्र — नमी गंभीर रूप से कम (18%)',
    titleEn: '🚨 Zone South — Moisture critically low (18%)',
    titleMr: '🚨 दक्षिण क्षेत्र — ओलावा गंभीररीत्या कमी (18%)',
    messageHi: 'तुरंत सिंचाई करें',
    messageEn: 'Irrigate immediately', 
    messageMr: 'तातडीने सिंचन करा',
    timeHi: '1 घंटा पहले',
    timeEn: '1h ago',
    timeMr: '1 तासापूर्वी',
    action: { labelHi: 'सलाह देखें', labelEn: 'Open Advisory', labelMr: 'सल्ला पहा', route: 'Advisory' }
  },
  {
    id: '2',
    severity: 'warning',
    titleHi: '⚠ तापमान बढ़ा — उत्तर क्षेत्र (38°C)',
    titleEn: '⚠ Temperature spike — Zone North (38°C)',
    titleMr: '⚠ तापमान वाढले — उत्तर क्षेत्र (38°C)',
    messageHi: 'बारीकी से निगरानी करें',
    messageEn: 'Monitor closely',
    messageMr: 'बारीक लक्ष ठेवा',
    timeHi: '3 घंटे पहले',
    timeEn: '3h ago',
    timeMr: '3 तासांपूर्वी',
    action: { labelHi: 'नक्शा देखें', labelEn: 'View Map', labelMr: 'नकाशा पहा', route: 'Map' }
  },
];

export default function AlertsScreen({ navigation }) {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState('All');

  const filteredAlerts = MOCK_ALERTS.filter(alert => {
    if (filter === 'All') return true;
    if (filter === 'Critical' && alert.severity === 'critical') return true;
    if (filter === 'Warnings' && alert.severity === 'warning') return true;
    return false;
  });

  const getBorderColor = (severity) => {
    switch (severity) {
      case 'critical': return '#E53935'; // Red
      case 'warning': return '#FF6B35'; // Orange
      case 'info': return COLORS.primary; // Green
      default: return COLORS.divider;
    }
  };

  const FilterPill = ({ label, translated }) => (
    <TouchableOpacity 
      style={[styles.filterPill, filter === label && styles.filterPillActive]}
      onPress={() => setFilter(label)}
    >
      <Text style={[TEXT_STYLES.small, styles.filterText, filter === label && styles.filterTextActive]}>
        {translated}
      </Text>
    </TouchableOpacity>
  );

  const renderAlert = ({ item }) => {
    const title = lang === 'hi' ? item.titleHi : lang === 'mr' ? item.titleMr : item.titleEn;
    const msg = lang === 'hi' ? item.messageHi : lang === 'mr' ? item.messageMr : item.messageEn;
    const time = lang === 'hi' ? item.timeHi : lang === 'mr' ? item.timeMr : item.timeEn;
    const actionLabel = item.action ? (lang === 'hi' ? item.action.labelHi : lang === 'mr' ? item.action.labelMr : item.action.labelEn) : '';

    return (
      <View style={[styles.alertCard, { borderLeftColor: getBorderColor(item.severity) }]}>
        <Text style={[TEXT_STYLES.h4, styles.alertTitle]}>{title}</Text>
        <Text style={[TEXT_STYLES.body, styles.alertMessage]}>{msg}</Text>
        
        <View style={styles.alertFooter}>
          <Text style={[TEXT_STYLES.small, styles.timeText]}>{time}</Text>
          
          {item.action && (
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => navigation.navigate(item.action.route)}
            >
              <Text style={[TEXT_STYLES.h4, styles.actionBtnText]}>{actionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={TEXT_STYLES.h2}>{t('अलर्ट', 'Alerts', 'सूचना')}</Text>
        <View style={styles.bellContainer}>
          <MaterialCommunityIcons name="bell-outline" size={28} color={COLORS.text} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <FilterPill label="All" translated={t('सभी', 'All', 'सर्व')} />
          <FilterPill label="Critical" translated={t('गंभीर', 'Critical', 'गंभीर')} />
          <FilterPill label="Warnings" translated={t('चेतावनी', 'Warnings', 'चेतावणी')} />
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredAlerts}
        keyExtractor={item => item.id}
        renderItem={renderAlert}
        contentContainerStyle={[styles.listContent, filteredAlerts.length === 0 && { flex: 1, justifyContent: 'center' }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState 
            emoji="📭" 
            title="कोई अलर्ट नहीं" 
            subtitle="आपके पास कोई नया अलर्ट नहीं है।" 
          />
        }
      />
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  bellContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  filterRow: {
    marginBottom: SPACING.md,
  },
  filterScroll: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  filterPillActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.surfaceCard || '#FFF',
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 100, // accommodate bottom tab nav
  },
  alertCard: {
    ...CARD,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    paddingLeft: SPACING.xl - 4, // Adjust padding for border width
  },
  alertTitle: {
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  alertMessage: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    color: COLORS.textMuted,
  },
  actionBtn: {
    backgroundColor: COLORS.primaryPale,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
  },
  actionBtnText: {
    color: COLORS.primary,
  },
});
