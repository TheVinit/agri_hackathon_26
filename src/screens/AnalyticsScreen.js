import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, TEXT_STYLES, CARD, SPACING, RADIUS, SHADOWS, GAPS } from '../theme';
import NPKBar from '../components/NPKBar';
import EmptyState from '../components/EmptyState';

const screenWidth = Dimensions.get("window").width;

import { useLang } from '../context/LanguageContext';

const screenWidth = Dimensions.get("window").width;

export default function AnalyticsScreen({ navigation }) {
  const { t } = useLang();
  // Mock data for charts
  const moistureData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      { data: [65, 68, 62, 60, 58, 65, 68], color: (opacity = 1) => `rgba(11, 138, 68, ${opacity})`, strokeWidth: 2 }, // North - Green
      { data: [55, 52, 48, 45, 42, 50, 55], color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, strokeWidth: 2 }, // South - Red
      { data: [70, 72, 68, 65, 68, 70, 75], color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, strokeWidth: 2 }, // East - Blue
      { data: [60, 58, 55, 60, 62, 65, 60], color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, strokeWidth: 2 }  // West - Amber
    ],
    legend: [t('उत्तर', 'North', 'उत्तर'), t('दक्षिण', 'South', 'दक्षिण'), t('पूर्व', 'East', 'पूर्व'), t('पश्चिम', 'West', 'पश्चिम')]
  };

  const activityLog = [
    { icon: 'water', color: COLORS.primary, text: t("सिंचाई शुरू - उत्तर क्षेत्र", "Irrigation triggered — Zone North", "सिंचन सुरू - उत्तर क्षेत्र"), time: t("2 घंटे पहले", "2h ago", "2 तासांपूर्वी") },
    { icon: 'flask-outline', color: COLORS.secondary, text: t("NPK टेस्ट पूरा हुआ", "NPK Test completed", "NPK चाचणी पूर्ण झाली"), time: t("1 दिन पहले", "1d ago", "1 दिवसापूर्वी") },
    { icon: 'alert-outline', color: COLORS.danger, text: t("कम नमी अलर्ट - दक्षिण क्षेत्र", "Low moisture alert — Zone South", "कमी ओलावा अलर्ट - दक्षिण क्षेत्र"), time: t("1 दिन पहले", "1d ago", "1 दिवसापूर्वी") },
    { icon: 'robot-outline', color: COLORS.primary, text: t("सलाह अपडेट की गई", "Advisory updated", "सल्ला अद्यतनित केला"), time: t("2 दिन पहले", "2d ago", "2 दिवसांपूर्वी") },
    { icon: 'wifi', color: COLORS.textSecondary, text: t("सेंसर नोड 3 फिर से जुड़ा", "Sensor node 3 reconnected", "सेंसर नोड 3 पुन्हा जोडला"), time: t("3 दिन पहले", "3d ago", "3 दिवसांपूर्वी") }
  ];

  const tempData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [27, 28, 31, 30, 29, 28, 27],
        color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
        strokeWidth: 3
      }
    ]
  };

  const chartConfig = {
    backgroundColor: COLORS.surface,
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    color: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: COLORS.surface
    }
  };

  const MetricCard = ({ title, value, icon, iconColor, trend, trendColor }) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
        <View style={[styles.trendBadge, { backgroundColor: trendColor + '15' }]}>
          <Text style={[TEXT_STYLES.small, { color: trendColor, fontWeight: '700' }]}>{trend}</Text>
        </View>
      </View>
      <Text style={[TEXT_STYLES.h2, styles.metricValue]}>{value}</Text>
      <Text style={[TEXT_STYLES.small, styles.metricTitle]}>{title}</Text>
    </View>
  );

  const ActivityItem = ({ icon, color, text, time }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={[TEXT_STYLES.body, styles.activityText]}>{text}</Text>
        <Text style={[TEXT_STYLES.small, styles.activityTime]}>{time}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={TEXT_STYLES.h2}>{t('खेत विश्लेषण', 'Farm Analytics', 'शेती विश्लेषण')}</Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.textMuted, marginTop: 4 }]}>{t('पिछले 7 दिन • क्षेत्र A', 'Last 7 days • Zone A', 'मागील 7 दिवस • क्षेत्र A')}</Text>
        </View>
        <View style={styles.dateBadge}>
          <Text style={[TEXT_STYLES.small, { color: COLORS.primary, fontWeight: '700' }]}>{t('यह सप्ताह', 'This Week', 'हा आठवडा')}</Text>
        </View>
      </View>

      {/* Section 1 - Summary Grid */}
      <View style={styles.grid}>
        <MetricCard title={t("औसत नमी", "Soil Moisture avg", "सरासरी ओलावा")} value="68%" icon="water-percent" iconColor={COLORS.primary} trend="↑" trendColor={COLORS.primary} />
        <MetricCard title={t("औसत तापमान", "Temperature avg", "सरासरी तापमान")} value="29°C" icon="thermometer" iconColor={COLORS.warning} trend="→" trendColor={COLORS.warning} />
        <MetricCard title={t("NPK स्वास्थ्य", "NPK Health", "NPK आरोग्य")} value={t("अच्छा", "Good", "चांगले")} icon="leaf" iconColor={COLORS.success} trend="✓" trendColor={COLORS.success} />
        <MetricCard title={t("इस सप्ताह के अलर्ट", "Alerts this week", "या आठवड्यातील अलर्ट")} value="2" icon="alert-outline" iconColor={COLORS.danger} trend="⚠" trendColor={COLORS.danger} />
      </View>

      {/* Section 2 - Moisture Trend */}
      <View style={styles.section}>
        <Text style={[TEXT_STYLES.h4, styles.sectionTitle]}>{t('मिट्टी की नमी (%)', 'Soil Moisture (%)', 'जमिनीतील ओलावा (%)')}</Text>
        <View style={styles.chartCard}>
          <LineChart
            data={moistureData}
            width={screenWidth - SPACING.xl * 2 - 32} // padding adjustments
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={false}
          />
          <View style={[styles.insightChip, { backgroundColor: COLORS.primaryPale }]}>
            <Text style={[TEXT_STYLES.small, { color: COLORS.primary }]}>💧 {t('आज दक्षिण क्षेत्र को पानी की जरूरत है', 'Zone South needs water today', 'आज दक्षिण क्षेत्राला पाण्याची गरज आहे')}</Text>
          </View>
        </View>
      </View>

      {/* Section 3 - Temperature Trend */}
      <View style={styles.section}>
        <Text style={[TEXT_STYLES.h4, styles.sectionTitle]}>{t('तापमान (°C)', 'Temperature (°C)', 'तापमान (°C)')}</Text>
        <View style={styles.chartCard}>
          <LineChart
            data={tempData}
            width={screenWidth - SPACING.xl * 2 - 32}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
            }}
            bezier
            style={styles.chart}
          />
          <View style={[styles.insightChip, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[TEXT_STYLES.small, { color: COLORS.warning }]}>🌡 {t('बुधवार को भीषण गर्मी - सिंचाई जाँच लें', 'Peak heat on Wednesday — check irrigation', 'बुधवारी प्रचंड उष्णता - सिंचन तपासा')}</Text>
          </View>
        </View>
      </View>

      {/* Section 4 - Latest NPK Reading */}
      <View style={styles.section}>
        <Text style={[TEXT_STYLES.h4, styles.sectionTitle]}>{t('नवीनतम NPK रीडिंग', 'Latest NPK Reading', 'नवीनतम NPK रीडिंग')}</Text>
        <View style={styles.npkWrapper}>
          <NPKBar npkValues={{ N: 45, P: 28, K: 60, pH: 6.8 }} />
          <View style={styles.npkFooter}>
            <Text style={[TEXT_STYLES.small, { color: COLORS.textMuted }]}>{t('पिछली जांच: 2 दिन पहले', 'Last tested: 2 days ago', 'शेवटची चाचणी: 2 दिवसांपूर्वी')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('NPKTestMore')}>
              <Text style={[TEXT_STYLES.h4, { color: COLORS.primary }]}>{t('नया टेस्ट करें →', 'Run New Test →', 'नवीन चाचणी करा →')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Section 5 - Activity Log */}
      <View style={[styles.section, { paddingBottom: 100 }]}>
        <Text style={[TEXT_STYLES.h4, styles.sectionTitle]}>{t('हालिया गतिविधि', 'Recent Activity', 'अलीकडील क्रियाकलाप')}</Text>
        {activityLog.length > 0 ? (
          <View style={styles.activityCard}>
            {activityLog.map((item, index) => (
              <React.Fragment key={index}>
                <ActivityItem icon={item.icon} color={item.color} text={item.text} time={item.time} />
                {index < activityLog.length - 1 && <View style={styles.activityDivider} />}
              </React.Fragment>
            ))}
          </View>
        ) : (
          <EmptyState 
            emoji="📈" 
            title="कोई गतिविधि नहीं" 
            subtitle="पिछले 7 दिनों में कोई डेटा दर्ज नहीं किया गया।" 
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    ...SHADOWS.soft,
  },
  dateBadge: {
    backgroundColor: COLORS.primaryPale,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  grid: {
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 12,
    padding: 24,
  },
  metricCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.card,
  },
  metricHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 12,
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  metricValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: 4,
  },
  metricTitle: {
    ...TEXT_STYLES.tiny,
    color: COLORS.textMuted,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase', 
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.card,
  },
  chart: {
    marginVertical: 8,
    borderRadius: RADIUS.lg,
  },
  insightChip: {
    marginTop: 16,
    padding: 12,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  npkWrapper: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.card,
  },
  npkFooter: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginTop: 20, 
    paddingTop: 16, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.divider,
  },
  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.card,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center', 
    paddingVertical: 12,
  },
  activityIcon: {
    width: 40,
    height: 40, 
    borderRadius: 20,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    ...TEXT_STYLES.bodySemi,
    color: COLORS.text, 
    fontSize: 14,
  },
  activityTime: {
    ...TEXT_STYLES.tiny,
    color: COLORS.textMuted, 
    marginTop: 2,
  },
  activityDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 56,
  },
});
