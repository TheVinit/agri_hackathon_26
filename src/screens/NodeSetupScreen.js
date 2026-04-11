// src/screens/NodeSetupScreen.js
// Virtual IoT Node Setup — shown once after first-time onboarding
// Farmer picks how many nodes, names each zone, assigns crop
// These become "VIRTUAL" nodes in Dashboard until real hardware syncs
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, TextInput, Platform, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';
import { useLang } from '../context/LanguageContext';

const { width: W } = Dimensions.get('window');

const ZONE_NAMES = {
  hi: ['उत्तरी खेत', 'दक्षिणी खेत', 'पूर्वी खेत', 'पश्चिमी खेत', 'मुख्य खेत', 'बगीचा', 'नर्सरी', 'सिंचाई क्षेत्र'],
  en: ['North Field', 'South Field', 'East Field', 'West Field', 'Main Plot', 'Orchard', 'Nursery', 'Irrigation Zone'],
  mr: ['उत्तर शेत', 'दक्षिण शेत', 'पूर्व शेत', 'पश्चिम शेत', 'मुख्य शेत', 'बाग', 'रोपवाटिका', 'सिंचन क्षेत्र'],
};

const CROPS = [
  { id: 'wheat',     labelHi: 'गेहूं',   labelEn: 'Wheat',     labelMr: 'गहू',      icon: 'barley',          color: '#F59E0B' },
  { id: 'rice',      labelHi: 'धान',     labelEn: 'Rice',      labelMr: 'भात',      icon: 'rice',            color: '#10B981' },
  { id: 'cotton',    labelHi: 'कपास',    labelEn: 'Cotton',    labelMr: 'कापूस',    icon: 'leaf-circle',     color: '#6B7280' },
  { id: 'soybean',   labelHi: 'सोयाबीन', labelEn: 'Soybean',   labelMr: 'सोयाबीन',  icon: 'sprout',          color: '#059669' },
  { id: 'sugarcane', labelHi: 'गन्ना',   labelEn: 'Sugarcane', labelMr: 'ऊस',       icon: 'grass',           color: '#84CC16' },
  { id: 'maize',     labelHi: 'मक्का',   labelEn: 'Maize',     labelMr: 'मका',      icon: 'corn',            color: '#EAB308' },
  { id: 'tomato',    labelHi: 'टमाटर',  labelEn: 'Tomato',    labelMr: 'टोमॅटो',   icon: 'fruit-cherries',  color: '#EF4444' },
  { id: 'onion',     labelHi: 'प्याज',   labelEn: 'Onion',     labelMr: 'कांदा',    icon: 'food-variant',    color: '#A855F7' },
];

const NODE_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

// Step definitions
const STEPS = ['intro', 'count', 'configure', 'preview'];

export default function NodeSetupScreen({ onComplete, farmerData }) {
  const { lang, t } = useLang();
  const [step, setStep] = useState(0);
  const [nodeCount, setNodeCount] = useState(4);
  const [nodes, setNodes] = useState([]);
  const [editingIdx, setEditingIdx] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const getCropLabel = (c) => lang === 'hi' ? c.labelHi : lang === 'mr' ? c.labelMr : c.labelEn;
  const getZoneNames = () => ZONE_NAMES[lang] || ZONE_NAMES.en;

  // Initialize nodes when count changes
  useEffect(() => {
    const zones = getZoneNames();
    const existing = nodes.length;
    if (nodeCount > existing) {
      const newNodes = Array.from({ length: nodeCount - existing }, (_, i) => ({
        id: existing + i + 1,
        name: zones[existing + i] || `Zone ${existing + i + 1}`,
        crop: farmerData?.primaryCrop || 'wheat',
        area: '1',
        irrigationType: 'drip',
      }));
      setNodes(prev => [...prev, ...newNodes]);
    } else {
      setNodes(prev => prev.slice(0, nodeCount));
    }
  }, [nodeCount]);

  const fadeTransition = (cb) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  const goNext = () => {
    if (step >= STEPS.length - 1) {
      onComplete(nodes);
      return;
    }
    fadeTransition(() => setStep(s => s + 1));
  };
  const goBack = () => {
    if (step === 0) return;
    fadeTransition(() => setStep(s => s - 1));
  };

  const updateNode = (idx, key, val) => {
    setNodes(prev => prev.map((n, i) => i === idx ? { ...n, [key]: val } : n));
  };

  const renderStep = () => {
    switch (STEPS[step]) {
      case 'intro':     return <IntroStep t={t} />;
      case 'count':     return <CountStep t={t} nodeCount={nodeCount} setNodeCount={setNodeCount} />;
      case 'configure': return <ConfigureStep t={t} lang={lang} nodes={nodes} updateNode={updateNode} editingIdx={editingIdx} setEditingIdx={setEditingIdx} crops={CROPS} getCropLabel={getCropLabel} getZoneNames={getZoneNames} />;
      case 'preview':   return <PreviewStep t={t} lang={lang} nodes={nodes} getCropLabel={getCropLabel} crops={CROPS} farmerData={farmerData} />;
      default: return null;
    }
  };

  const canProceed = () => {
    if (STEPS[step] === 'configure') return nodes.every(n => n.name.trim().length > 0);
    return true;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="router-wireless" size={22} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t('नोड सेटअप', 'Node Setup', 'नोड सेटअप')}</Text>
          <Text style={styles.headerSub}>{t('अपना IoT नेटवर्क बनाएं', 'Build your IoT network', 'तुमचे IoT नेटवर्क तयार करा')}</Text>
        </View>
        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          <Text style={styles.stepIndicatorTxt}>{step + 1}/{STEPS.length}</Text>
        </View>
      </LinearGradient>

      {/* Progress dots */}
      <View style={styles.progressRow}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.progDot, i < step && styles.progDone, i === step && styles.progActive]} />
        ))}
      </View>

      {/* Step content */}
      <Animated.View style={[styles.stepWrap, { opacity: fadeAnim }]}>
        <ScrollView contentContainerStyle={styles.stepScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {renderStep()}
        </ScrollView>
      </Animated.View>

      {/* Navigation */}
      <View style={styles.navBar}>
        {step > 0
          ? <TouchableOpacity style={styles.backBtn} onPress={goBack}>
              <MaterialCommunityIcons name="arrow-left" size={18} color={COLORS.textMuted} />
              <Text style={styles.backTxt}>{t('वापस', 'Back', 'मागे')}</Text>
            </TouchableOpacity>
          : <View style={{ flex: 1 }} />}
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed() && styles.nextDisabled]}
          onPress={goNext}
          disabled={!canProceed()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={step === STEPS.length - 1 ? ['#059669', '#34D399'] : [COLORS.primary, COLORS.primaryLight]}
            style={styles.nextGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <MaterialCommunityIcons
              name={step === STEPS.length - 1 ? 'check-circle' : 'arrow-right'}
              size={18} color="#fff"
            />
            <Text style={styles.nextTxt}>
              {step === STEPS.length - 1
                ? t('डैशबोर्ड खोलें', 'Open Dashboard', 'डॅशबोर्ड उघडा')
                : t('आगे', 'Next', 'पुढे')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Step 1: Intro ─────────────────────────────────────────────────────────────
function IntroStep({ t }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bounceAnim, { toValue: -8, duration: 1000, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ])).start();
  }, []);

  const BENEFITS = [
    { icon: 'leak',            color: '#3B82F6', title: t('सटीक निगरानी', 'Precision Monitoring', 'अचूक निरीक्षण'),   desc: t('सेंसर स्तर का डेटा', 'Sensor-level granular data', 'सेन्सर-स्तरीय डेटा') },
    { icon: 'waves',           color: '#EF4444', title: t('स्मार्ट सिंचाई', 'Smart Irrigation', 'स्मार्ट सिंचन'),     desc: t('पानी की 40% बचत', 'Save 40% more water', '40% पाणी वाचवा') },
    { icon: 'shield-check',    color: '#10B981', title: t('फसल सुरक्षा', 'Crop Shield', 'पीक सुरक्षा'),          desc: t('बीमारी से बचाव', 'Protect against diseases', 'रोगांपासून संरक्षण') },
    { icon: 'chart-ppf',       color: '#F59E0B', title: t('अधिक पैदावार', 'Yield Boost', 'उत्पन्न वाढ'),           desc: t('डेटा संचालित खेती', 'Data-driven farming', 'डेटा-आधारित शेती') },
  ];

  return (
    <View style={is.container}>
      <View style={is.imageHero}>
        <Image 
          source={{ uri: 'file:///C:/Users/vinit/.gemini/antigravity/brain/38e42d14-2f76-47e2-8818-b8b38053b5a5/farm_zone_landscape_1775913882209.png' }} 
          style={is.heroImage} 
          resizeMode="cover"
        />
        <LinearGradient colors={['transparent', COLORS.background]} style={is.heroOverlay} />
        <Animated.View style={[is.floatingIcon, { transform: [{ translateY: bounceAnim }] }]}>
          <MaterialCommunityIcons name="integrated-circuit-chip" size={32} color="#fff" />
        </Animated.View>
      </View>

      <Text style={is.title}>{t('तकनीकी क्रांति की शुरुआत', 'Begin Your Digital Revolution', 'तंत्रज्ञान क्रांतीची सुरुवात')}</Text>
      <Text style={is.sub}>{t(
        'आपका अपना वायरलेस सेंसर नेटवर्क तैयार करने का समय आ गया है। चलिए वर्चुअल नोड्स से शुरुआत करें।',
        'Time to activate your private wireless sensor mesh. Let\'s begin by defining your virtual nodes.',
        'तुमचे खाजगी वायरलेस सेन्सर नेटवर्क सक्रिय करण्याची वेळ आली आहे.'
      )}</Text>

      <View style={is.benefitGrid}>
        {BENEFITS.map((b, i) => (
          <View key={i} style={is.benefitCard}>
            <View style={[is.benefitIcon, { backgroundColor: b.color + '15' }]}>
              <MaterialCommunityIcons name={b.icon} size={20} color={b.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={is.benefitTitle}>{b.title}</Text>
              <Text style={is.benefitDesc}>{b.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const is = StyleSheet.create({
  container: { paddingTop: 0, alignItems: 'center' },
  imageHero: { width: '100%', height: 200, borderRadius: 24, overflow: 'hidden', marginBottom: 24, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  floatingIcon: { position: 'absolute', top: '40%', alignSelf: 'center', width: 64, height: 64, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.premium },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 12, paddingHorizontal: 10 },
  sub: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 20 },
  benefitGrid: { width: '100%', gap: 12, marginBottom: 20 },
  benefitCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: COLORS.divider, gap: 14 },
  benefitIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  benefitTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  benefitDesc: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
});

// ── Step 2: Choose Node Count ─────────────────────────────────────────────────
function CountStep({ t, nodeCount, setNodeCount }) {
  return (
    <View style={cs.container}>
      <View style={cs.headerSection}>
        <View style={cs.iconBubble}>
          <MaterialCommunityIcons name="expansion-card-variant" size={32} color={COLORS.primary} />
        </View>
        <Text style={cs.title}>{t('कितने नोड लगाने हैं?', 'Sensor Deployment Scale', 'किती नोड लावायचे?')}</Text>
        <Text style={cs.sub}>{t('अपनी क्षमता चुनें — प्रत्येक नोड आपके खेत के एक निश्चित हिस्से की निगरानी करेगा।', 'Select your scale — each node represents an independent monitoring zone in your field.', 'प्रत्येक नोड आपल्या शेताच्या एका निश्चित भागाचे निरीक्षण करेल.')}</Text>
      </View>

      <View style={cs.grid}>
        {NODE_COUNT_OPTIONS.map(n => (
          <TouchableOpacity
            key={n}
            style={[cs.card, nodeCount === n && cs.cardActive]}
            onPress={() => setNodeCount(n)}
            activeOpacity={0.8}
          >
            <Text style={[cs.cardNum, nodeCount === n && cs.cardNumActive]}>{n}</Text>
            <Text style={[cs.cardLabel, nodeCount === n && cs.cardLabelActive]}>
              {n === 1 ? t('ज़ोन', 'Zone', 'झोन') : t('ज़ोन', 'Zones', 'झोन')}
            </Text>
            {nodeCount === n && (
              <View style={cs.checkMark}>
                <MaterialCommunityIcons name="check" size={10} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={cs.coverageCard}>
        <LinearGradient colors={[COLORS.primary + '10', COLORS.primary + '05']} style={cs.coverageGrad}>
          <MaterialCommunityIcons name="map-check" size={20} color={COLORS.primary} />
          <Text style={cs.coverageTxt}>
            {t(
              `${nodeCount} ज़ोन ≈ लगभग ${nodeCount * 1.5}—${nodeCount * 2.5} हेक्टेयर की डिजिटल फेंसिंग`,
              `${nodeCount} active nodes represent digital fencing for ${nodeCount * 1.5}—${nodeCount * 2.5} hectares`,
              `${nodeCount} नोड ≈ जवळपास ${nodeCount * 1.5}—${nodeCount * 2.5} हेक्टरचे निरीक्षण`
            )}
          </Text>
        </LinearGradient>
      </View>
      
      {/* Zone Preview instead of a Map */}
      <ZonePreview count={nodeCount} t={t} />
    </View>
  );
}

function ZonePreview({ count, t }) {
  return (
    <View style={zp.container}>
      <Text style={zp.title}>{t('नेटवर्क टोपोलॉजी रिव्यू', 'Network Topology Preview', 'नेटवर्क टोपोलॉजी पुनरावलोकन')}</Text>
      <View style={zp.grid}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} style={zp.card}>
            <View style={zp.cardIdx}><Text style={zp.cardIdxTxt}>{i + 1}</Text></View>
            <View style={zp.cardBody}>
              <View style={zp.signalBar}>
                <View style={[zp.signalDot, { backgroundColor: COLORS.success }]} />
                <Text style={zp.signalTxt}>Virtual</Text>
              </View>
              <Text style={zp.zoneName}>Zone {i + 1}</Text>
            </View>
            <MaterialCommunityIcons name="wifi-star" size={20} color={COLORS.primary + '80'} />
          </View>
        ))}
      </View>
    </View>
  );
}

const zp = StyleSheet.create({
  container: { marginTop: 24, paddingVertical: 16 },
  title: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, textAlign: 'center' },
  grid: { gap: 8 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: COLORS.divider, gap: 12 },
  cardIdx: { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.divider },
  cardIdxTxt: { fontSize: 14, fontWeight: '900', color: COLORS.textSecondary },
  cardBody: { flex: 1 },
  signalBar: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  signalDot: { width: 6, height: 6, borderRadius: 3 },
  signalTxt: { fontSize: 8, fontWeight: '800', color: COLORS.textSecondary, textTransform: 'uppercase' },
  zoneName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
});

const cs = StyleSheet.create({
  container: { paddingTop: 10 },
  headerSection: { alignItems: 'center', marginBottom: 24 },
  iconBubble: { width: 68, height: 68, borderRadius: 24, backgroundColor: COLORS.primaryPale, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 24 },
  card: { width: W * 0.2, height: W * 0.2, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.divider, ...SHADOWS.soft },
  cardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryPale },
  cardNum: { fontSize: 24, fontWeight: '900', color: COLORS.textMuted },
  cardNumActive: { color: COLORS.primary },
  cardLabel: { fontSize: 9, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase' },
  cardLabelActive: { color: COLORS.primary },
  checkMark: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  coverageCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.primary + '20' },
  coverageGrad: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  coverageTxt: { flex: 1, fontSize: 12, fontWeight: '700', color: COLORS.primary, lineHeight: 16 },
});

// ── Step 3: Configure Each Node ───────────────────────────────────────────────
function ConfigureStep({ t, lang, nodes, updateNode, editingIdx, setEditingIdx, crops, getCropLabel, getZoneNames }) {
  const IRRIGATION_TYPES = [
    { id: 'drip',      icon: 'water',         label: t('ड्रिप', 'Drip', 'ड्रिप') },
    { id: 'sprinkler', icon: 'shower',         label: t('स्प्रिंकलर', 'Sprinkler', 'स्प्रिंकलर') },
    { id: 'flood',     icon: 'waves',          label: t('बाढ़', 'Flood', 'पूर') },
    { id: 'none',      icon: 'water-off',      label: t('वर्षा आधारित', 'Rain-fed', 'पावसाधारित') },
  ];

  const editNode = editingIdx < nodes.length ? nodes[editingIdx] : null;

  return (
    <View style={cfg.container}>
      <Text style={cfg.title}>{t('नोड कॉन्फ़िगर करें', 'Configure Nodes', 'नोड कॉन्फिगर करा')}</Text>
      <Text style={cfg.sub}>{t('प्रत्येक नोड का नाम और फसल सेट करें', 'Set name and crop for each node', 'प्रत्येक नोडचे नाव आणि पीक सेट करा')}</Text>

      {/* Node selector tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={cfg.tabScroll} contentContainerStyle={cfg.tabs}>
        {nodes.map((n, i) => {
          const crop = crops.find(c => c.id === n.crop);
          return (
            <TouchableOpacity
              key={i}
              style={[cfg.tab, editingIdx === i && cfg.tabActive]}
              onPress={() => setEditingIdx(i)}
              activeOpacity={0.8}
            >
              <View style={[cfg.tabDot, { backgroundColor: crop?.color || COLORS.primary }]} />
              <Text style={[cfg.tabTxt, editingIdx === i && cfg.tabTxtActive]}>N{i + 1}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Editor for selected node */}
      {editNode && (
        <View style={cfg.editor}>
          <View style={cfg.editorHeader}>
            <View style={cfg.nodeNumBadge}>
              <Text style={cfg.nodeNumBadgeTxt}>N{editingIdx + 1}</Text>
            </View>
            <Text style={cfg.editorTitle}>{t('नोड की जानकारी', 'Node Details', 'नोडची माहिती')}</Text>
          </View>

          {/* Zone name */}
          <Text style={cfg.fieldLabel}>{t('क्षेत्र का नाम', 'Zone Identification', 'क्षेत्राचे नाव')}</Text>
          <View style={cfg.nameRow}>
            <View style={cfg.nameInput}>
              <MaterialCommunityIcons name="identifier" size={16} color={COLORS.primary} />
              <TextInput
                style={cfg.nameInputTxt}
                value={editNode.name}
                onChangeText={v => updateNode(editingIdx, 'name', v)}
                placeholder={t('जैसे: गेंहू का खेत', 'e.g. Wheat Sector Alpha', 'उदा: उत्तर शेत')}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>
          {/* Quick name chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
            {getZoneNames().map((z, i) => (
              <TouchableOpacity key={i} style={cfg.nameChip} onPress={() => updateNode(editingIdx, 'name', z)}>
                <Text style={cfg.nameChipTxt}>{z}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Crop */}
          <Text style={cfg.fieldLabel}>{t('फसल', 'Crop', 'पीक')}</Text>
          <View style={cfg.cropGrid}>
            {crops.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[cfg.cropChip, editNode.crop === c.id && cfg.cropChipActive, editNode.crop === c.id && { borderColor: c.color }]}
                onPress={() => updateNode(editingIdx, 'crop', c.id)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name={c.icon} size={16} color={editNode.crop === c.id ? c.color : COLORS.textMuted} />
                <Text style={[cfg.cropChipTxt, editNode.crop === c.id && { color: c.color }]}>
                  {getCropLabel(c)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Area */}
          <Text style={cfg.fieldLabel}>{t('क्षेत्रफल (एकड़)', 'Area (Acres)', 'क्षेत्रफळ (एकर)')}</Text>
          <View style={cfg.areaRow}>
            {['0.5', '1', '1.5', '2', '3', '5'].map(a => (
              <TouchableOpacity
                key={a}
                style={[cfg.areaChip, editNode.area === a && cfg.areaChipActive]}
                onPress={() => updateNode(editingIdx, 'area', a)}
              >
                <Text style={[cfg.areaChipTxt, editNode.area === a && cfg.areaChipTxtActive]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Irrigation */}
          <Text style={cfg.fieldLabel}>{t('सिंचाई प्रकार', 'Irrigation Type', 'सिंचन प्रकार')}</Text>
          <View style={cfg.irrigRow}>
            {IRRIGATION_TYPES.map(ir => (
              <TouchableOpacity
                key={ir.id}
                style={[cfg.irrigChip, editNode.irrigationType === ir.id && cfg.irrigChipActive]}
                onPress={() => updateNode(editingIdx, 'irrigationType', ir.id)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name={ir.icon} size={16} color={editNode.irrigationType === ir.id ? COLORS.primary : COLORS.textMuted} />
                <Text style={[cfg.irrigChipTxt, editNode.irrigationType === ir.id && cfg.irrigChipTxtActive]}>{ir.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* All nodes mini summary */}
      <View style={cfg.allNodes}>
        <Text style={cfg.allNodesTitle}>{t('सभी नोड', 'All Nodes', 'सर्व नोड')}</Text>
        {nodes.map((n, i) => {
          const crop = crops.find(c => c.id === n.crop);
          const complete = n.name.trim().length > 0;
          return (
            <TouchableOpacity key={i} style={[cfg.nodeRow, editingIdx === i && cfg.nodeRowActive]} onPress={() => setEditingIdx(i)}>
              <View style={[cfg.nodeRowDot, { backgroundColor: complete ? (crop?.color || COLORS.primary) : COLORS.textMuted }]} />
              <Text style={cfg.nodeRowNum}>N{i + 1}</Text>
              <Text style={cfg.nodeRowName}>{n.name || t('नाम नहीं', 'Unnamed', 'नाव नाही')}</Text>
              <MaterialCommunityIcons name={crop?.icon || 'sprout'} size={14} color={crop?.color || COLORS.textMuted} />
              <Text style={[cfg.nodeRowCrop, { color: crop?.color || COLORS.textMuted }]}>{getCropLabel(crop || crops[0])}</Text>
              <MaterialCommunityIcons name={complete ? 'check-circle' : 'circle-outline'} size={16} color={complete ? COLORS.success : COLORS.textMuted} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const cfg = StyleSheet.create({
  container: { paddingTop: 12 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 18 },
  tabScroll: { marginBottom: 16 },
  tabs: { gap: 8, paddingHorizontal: 2, paddingVertical: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.divider },
  tabActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryPale },
  tabDot: { width: 8, height: 8, borderRadius: 4 },
  tabTxt: { fontSize: 13, fontWeight: '800', color: COLORS.textMuted },
  tabTxtActive: { color: COLORS.primary },
  editor: { backgroundColor: COLORS.surface, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.premium, marginBottom: 16 },
  editorHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  nodeNumBadge: { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  nodeNumBadgeTxt: { fontSize: 14, fontWeight: '900', color: '#fff' },
  editorTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  nameRow: { marginBottom: 8 },
  nameInput: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surfaceLight, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: COLORS.divider },
  nameInputTxt: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '600' },
  nameChip: { backgroundColor: COLORS.surfaceLight, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, borderWidth: 1, borderColor: COLORS.divider },
  nameChipTxt: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  cropGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  cropChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.divider, backgroundColor: COLORS.surfaceLight },
  cropChipActive: { backgroundColor: COLORS.primaryPale },
  cropChipTxt: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  areaRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  areaChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.divider, backgroundColor: COLORS.surfaceLight },
  areaChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryPale },
  areaChipTxt: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  areaChipTxtActive: { color: COLORS.primary },
  irrigRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  irrigChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.divider, backgroundColor: COLORS.surfaceLight },
  irrigChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryPale },
  irrigChipTxt: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  irrigChipTxtActive: { color: COLORS.primary },
  allNodes: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.divider },
  allNodesTitle: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  nodeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  nodeRowActive: { backgroundColor: COLORS.primaryPale, marginHorizontal: -4, paddingHorizontal: 4, borderRadius: 10 },
  nodeRowDot: { width: 8, height: 8, borderRadius: 4 },
  nodeRowNum: { fontSize: 12, fontWeight: '900', color: COLORS.textSecondary, width: 24 },
  nodeRowName: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.text },
  nodeRowCrop: { fontSize: 12, fontWeight: '700' },
});

// ── Step 4: Preview / Confirm ─────────────────────────────────────────────────
function PreviewStep({ t, lang, nodes, getCropLabel, crops, farmerData }) {
  const scaleAnims = useRef(nodes.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    nodes.forEach((_, i) => {
      Animated.spring(scaleAnims[i] || new Animated.Value(0), {
        toValue: 1, delay: i * 80, tension: 80, friction: 8, useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <View style={pv.container}>
      <MaterialCommunityIcons name="check-decagram" size={52} color={COLORS.success} style={{ alignSelf: 'center', marginBottom: 12 }} />
      <Text style={pv.title}>{t('आपका नेटवर्क तैयार है!', 'Your Network is Ready!', 'तुमचे नेटवर्क तयार आहे!')}</Text>
      <Text style={pv.sub}>{t(
        `${nodes.length} वर्चुअल नोड कॉन्फ़िगर हो गए। जव असली सेंसर लगेंगे, लाइव डेटा दिखने लगेगा।`,
        `${nodes.length} virtual node${nodes.length > 1 ? 's' : ''} configured. Live data will flow in when sensors are installed.`,
        `${nodes.length} व्हर्च्युअल नोड कॉन्फिगर झाले. सेन्सर लागल्यावर थेट डेटा येईल.`
      )}</Text>

      {/* Farm summary card */}
      <View style={pv.summaryCard}>
        <LinearGradient colors={[COLORS.primary + '15', COLORS.primaryLight + '10']} style={pv.summaryGrad}>
          <View style={pv.summaryRow}>
            <MaterialCommunityIcons name="account" size={16} color={COLORS.primary} />
            <Text style={pv.summaryTxt}>{farmerData?.name || t('किसान', 'Farmer', 'शेतकरी')}</Text>
          </View>
          <View style={pv.summaryRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.primary} />
            <Text style={pv.summaryTxt}>{farmerData?.locationName || farmerData?.village || t('खेत', 'Farm', 'शेत')}</Text>
          </View>
          <View style={pv.summaryRow}>
            <MaterialCommunityIcons name="router-wireless" size={16} color={COLORS.primary} />
            <Text style={pv.summaryTxt}>{nodes.length} {t('वर्चुअल नोड', 'Virtual Nodes', 'व्हर्च्युअल नोड')}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Node preview cards */}
      <View style={pv.nodeGrid}>
        {nodes.map((n, i) => {
          const crop = crops.find(c => c.id === n.crop) || crops[0];
          const anim = scaleAnims[i] || new Animated.Value(1);
          return (
            <Animated.View key={i} style={[pv.nodeCard, { transform: [{ scale: anim }] }]}>
              <LinearGradient colors={[crop.color + '18', crop.color + '08']} style={pv.nodeCardGrad}>
                <View style={[pv.nodeCardIcon, { backgroundColor: crop.color + '25' }]}>
                  <MaterialCommunityIcons name={crop.icon} size={22} color={crop.color} />
                </View>
                <View style={pv.nodeCardBody}>
                  <View style={pv.nodeCardTop}>
                    <Text style={pv.nodeCardNum}>N{i + 1}</Text>
                    <View style={pv.virtualBadge}>
                      <MaterialCommunityIcons name="cloud-outline" size={10} color={COLORS.primary} />
                      <Text style={pv.virtualBadgeTxt}>{t('वर्चुअल', 'Virtual', 'व्हर्च्युअल')}</Text>
                    </View>
                  </View>
                  <Text style={pv.nodeCardName}>{n.name}</Text>
                  <Text style={[pv.nodeCardCrop, { color: crop.color }]}>{getCropLabel(crop)}</Text>
                  <Text style={pv.nodeCardArea}>{n.area} {t('एकड़', 'Acres', 'एकर')} · {n.irrigationType}</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          );
        })}
      </View>

      <View style={pv.infoBox}>
        <MaterialCommunityIcons name="lightbulb-on" size={18} color={COLORS.warning} />
        <Text style={pv.infoTxt}>{t(
          'डैशबोर्ड में "VIRTUAL" दिखेगा जब तक असली सेंसर कनेक्ट नहीं होते',
          'Dashboard shows "VIRTUAL" status until real sensors connect',
          'खरे सेन्सर जोडेपर्यंत "VIRTUAL" दाखवेल'
        )}</Text>
      </View>
    </View>
  );
}

const pv = StyleSheet.create({
  container: { paddingTop: 12 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 19 },
  summaryCard: { borderRadius: 18, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: COLORS.primary + '30' },
  summaryGrad: { padding: 16, gap: 8 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryTxt: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  nodeGrid: { gap: 10, marginBottom: 16 },
  nodeCard: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.soft },
  nodeCardGrad: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  nodeCardIcon: { width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  nodeCardBody: { flex: 1 },
  nodeCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  nodeCardNum: { fontSize: 12, fontWeight: '900', color: COLORS.textSecondary },
  virtualBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.primaryPale, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  virtualBadgeTxt: { fontSize: 9, fontWeight: '800', color: COLORS.primary },
  nodeCardName: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  nodeCardCrop: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  nodeCardArea: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', textTransform: 'capitalize' },
  infoBox: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: '#FFFBEB', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FEF3C7' },
  infoTxt: { flex: 1, fontSize: 13, color: '#92400E', fontWeight: '600', lineHeight: 18 },
});

// ── Root styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, paddingTop: Platform.OS === 'ios' ? 54 : 24 },
  headerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 1 },
  stepIndicator: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  stepIndicatorTxt: { fontSize: 12, fontWeight: '900', color: '#fff' },
  progressRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingVertical: 10 },
  progDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.divider },
  progDone: { backgroundColor: COLORS.primary + '50' },
  progActive: { backgroundColor: COLORS.primary },
  stepWrap: { flex: 1 },
  stepScroll: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, paddingBottom: Platform.OS === 'ios' ? 30 : 14, borderTopWidth: 1, borderTopColor: COLORS.divider, backgroundColor: COLORS.surface },
  backBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  backTxt: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  nextBtn: { flex: 2, borderRadius: 16, overflow: 'hidden', ...SHADOWS.glass },
  nextDisabled: { opacity: 0.45 },
  nextGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 17 },
  nextTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
