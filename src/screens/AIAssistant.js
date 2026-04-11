// src/screens/AIAssistant.js
// World-class interactive AI assistant for farmers
// Auto-analyzes farm data on open → proactive, specific, dynamic advice
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Animated, Platform, ActivityIndicator,
  KeyboardAvoidingView, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';
import { useLang } from '../context/LanguageContext';
import { analyzeFarmNow, askFarmerAI } from '../services/groq';
import { speak, stopSpeaking } from '../services/tts';
import { startListening, stopListening, getRecognitionLang, isVoiceSupported } from '../services/voiceCommand';
import { getDashboard, computeHealthScore } from '../services/api';

const FARM_ID = 'farm_001';
const { width: W } = Dimensions.get('window');

// ── Animated typing dots ───────────────────────────────────────────────────────
function TypingIndicator() {
  const anims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const loops = anims.map((a, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 160),
        Animated.timing(a, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.delay(480 - i * 160),
      ]))
    );
    Animated.parallel(loops).start();
    return () => loops.forEach(l => l.stop());
  }, []);
  return (
    <View style={styles.thinkingRow}>
      <View style={styles.aiAvatarSmall}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.aiAvatarGrad}>
          <MaterialCommunityIcons name="robot-happy" size={14} color="#fff" />
        </LinearGradient>
      </View>
      <View style={styles.thinkingBubble}>
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
          {anims.map((a, i) => (
            <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ── User message bubble ────────────────────────────────────────────────────────
function UserBubble({ text, time }) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 120, friction: 8, useNativeDriver: true }),
      Animated.timing(opacAnim,  { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.userRow, { opacity: opacAnim, transform: [{ translateX: slideAnim }] }]}>
      <LinearGradient colors={[COLORS.primary, '#10B981']} style={styles.userBubble} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.userText}>{text}</Text>
        <Text style={styles.bubbleTime}>{time}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

// ── AI message bubble ──────────────────────────────────────────────────────────
function AIBubble({ text, visual, time, onSpeak, isAlert }) {
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 100, friction: 9, useNativeDriver: true }),
      Animated.timing(opacAnim,  { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const visColor = visual?.color || COLORS.primary;

  return (
    <Animated.View style={[styles.aiRow, { opacity: opacAnim, transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.aiAvatarSmall}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.aiAvatarGrad}>
          <MaterialCommunityIcons name="robot-happy" size={14} color="#fff" />
        </LinearGradient>
      </View>
      <View style={[styles.aiBubble, isAlert && { borderLeftWidth: 3, borderLeftColor: COLORS.danger }]}>
        <Text style={styles.aiText}>{text}</Text>

        {visual && (
          <View style={[styles.visualCard, { borderLeftColor: visColor }]}>
            <View style={styles.visualCardHead}>
              <View style={[styles.visualCardIconWrap, { backgroundColor: visColor + '18' }]}>
                <MaterialCommunityIcons name={visual.icon || 'information'} size={16} color={visColor} />
              </View>
              <Text style={[styles.visualCardTitle, { color: visColor }]}>{visual.title}</Text>
            </View>
            {visual.detail && <Text style={styles.visualCardDetail}>{visual.detail}</Text>}
          </View>
        )}

        <View style={styles.aiBubbleFooter}>
          <Text style={styles.bubbleTime}>{time}</Text>
          <TouchableOpacity onPress={onSpeak} style={styles.speakIconBtn}>
            <MaterialCommunityIcons name="volume-high" size={13} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Farm Health Mini Dashboard (shown in AI screen) ───────────────────────────
function FarmContextBar({ farmData, lang }) {
  if (!farmData) return null;
  const nodes = farmData.nodes || [];
  const healthScore = farmData.healthScore || 0;
  const criticals = nodes.filter(n => n.moisture != null && n.moisture < 35).length;
  const avgMoisture = nodes.filter(n => n.moisture != null).length > 0
    ? Math.round(nodes.filter(n => n.moisture != null).reduce((s, n) => s + n.moisture, 0) / nodes.filter(n => n.moisture != null).length)
    : '--';

  const hColor = healthScore >= 75 ? COLORS.success : healthScore >= 50 ? COLORS.warning : COLORS.danger;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contextBar} contentContainerStyle={styles.contextBarContent}>
      <View style={[styles.contextChip, { borderColor: hColor + '40' }]}>
        <MaterialCommunityIcons name="heart-pulse" size={13} color={hColor} />
        <Text style={[styles.contextChipTxt, { color: hColor }]}>{healthScore}/100</Text>
      </View>
      <View style={styles.contextChip}>
        <MaterialCommunityIcons name="water-percent" size={13} color={COLORS.primary} />
        <Text style={styles.contextChipTxt}>{avgMoisture}% {lang === 'hi' ? 'नमी' : lang === 'mr' ? 'ओलावा' : 'Moisture'}</Text>
      </View>
      <View style={[styles.contextChip, criticals > 0 && { borderColor: COLORS.danger + '40' }]}>
        <MaterialCommunityIcons name="alert-circle" size={13} color={criticals > 0 ? COLORS.danger : COLORS.success} />
        <Text style={[styles.contextChipTxt, { color: criticals > 0 ? COLORS.danger : COLORS.success }]}>
          {criticals > 0 
            ? `${criticals} ${lang === 'hi' ? 'ज़ोन गंभीर' : lang === 'mr' ? 'झोन गंभीर' : 'zones critical'}` 
            : (lang === 'hi' ? 'सब ठीक' : lang === 'mr' ? 'सर्व ठीक' : 'All good')}
        </Text>
      </View>
      <View style={styles.contextChip}>
        <MaterialCommunityIcons name="access-point" size={13} color={COLORS.primary} />
        <Text style={styles.contextChipTxt}>{nodes.length} {lang === 'hi' ? 'नोड' : lang === 'mr' ? 'नोड' : 'nodes'}</Text>
      </View>
    </ScrollView>
  );
}

// ── Proactive Analysis card (shown on first load) ─────────────────────────────
function AnalysisCard({ analysis, lang, onSuggest, onStartVoice, listening }) {
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(true);
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      Animated.timing(opacAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const alertColor = analysis.alertLevel === 'critical' ? COLORS.danger : analysis.alertLevel === 'warning' ? COLORS.warning : COLORS.success;

  return (
    <Animated.View style={[styles.analysisCard, { opacity: opacAnim, transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient colors={[COLORS.primaryPale, '#FFFFFF']} style={styles.analysisGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>

        {/* Header */}
        <View style={styles.analysisHead}>
          <View style={styles.analysisHeadLeft}>
            <View style={styles.analysisAvatarLarge}>
              <LinearGradient colors={[COLORS.primary, '#10B981']} style={styles.analysisAvatarGrad}>
                <MaterialCommunityIcons name="robot-happy" size={22} color="#fff" />
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.analysisName}>AgriPulse AI</Text>
              <Text style={styles.analysisLive}>● {lang === 'hi' ? 'लाइव विश्लेषण' : lang === 'mr' ? 'थेट विश्लेषण' : 'Live Analysis'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setExpanded(e => !e)}>
            <MaterialCommunityIcons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Alert banner */}
        {analysis.alert && (
          <View style={[styles.analysisAlert, { borderColor: alertColor + '40', backgroundColor: alertColor + '10' }]}>
            <MaterialCommunityIcons name={analysis.alertLevel === 'critical' ? 'alert' : 'alert-circle-outline'} size={16} color={alertColor} />
            <Text style={[styles.analysisAlertTxt, { color: alertColor }]}>{analysis.alert}</Text>
          </View>
        )}

        {expanded && (
          <>
            {/* Summary */}
            <Text style={styles.analysisSummary}>{analysis.summary}</Text>

            {/* Action items */}
            {analysis.actions?.length > 0 && (
              <View style={styles.actionsWrap}>
                {analysis.actions.map((a, i) => (
                  <View key={i} style={[styles.actionItem, { borderLeftColor: a.priority === 'high' ? COLORS.danger : a.priority === 'medium' ? COLORS.warning : COLORS.success }]}>
                    <Text style={styles.actionEmoji}>{a.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionTitle}>{a.title}</Text>
                      <Text style={styles.actionDetail}>{a.detail}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Big Prominent Voice Button */}
        <TouchableOpacity 
          style={[styles.bigVoiceBtn, listening && { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)' }]} 
          onPress={onStartVoice}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name={listening ? 'microphone' : 'microphone-outline'} size={28} color={listening ? '#EF4444' : COLORS.primary} />
          <Text style={[styles.bigVoiceBtnTxt, listening && { color: '#EF4444' }]}>
            {listening 
              ? (lang === 'hi' ? 'बोल रहे हैं (रोकने के लिए दबाएं)...' : lang === 'mr' ? 'बोलत आहात...' : 'Listening (tap to stop)...')
              : (lang === 'hi' ? 'सवाल पूछने के लिए माइक दबाएं' : lang === 'mr' ? 'प्रश्न विचारण्यासाठी माईक दाबा' : 'Tap Mic to Ask a Question')}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

// ── Dynamic suggestion chips ──────────────────────────────────────────────────
function SuggestionChips({ suggestions, onTap, lang }) {
  if (!suggestions?.length) return null;
  return (
    <View style={styles.suggestWrap}>
      <Text style={styles.suggestLabel}>
        {lang === 'hi' ? '💡 स्मार्ट सवाल' : lang === 'mr' ? '💡 स्मार्ट प्रश्न' : '💡 Smart Questions'}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4, paddingHorizontal: 2 }}>
        {suggestions.map((s, i) => (
          <TouchableOpacity key={i} style={styles.suggestChip} onPress={() => onTap(s)} activeOpacity={0.8}>
            <Text style={styles.suggestTxt}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Voice waveform visualizer ─────────────────────────────────────────────────
function VoiceWave({ active }) {
  const bars = Array.from({ length: 5 }, () => useRef(new Animated.Value(0.3)).current);
  useEffect(() => {
    if (!active) { bars.forEach(b => b.setValue(0.3)); return; }
    const anims = bars.map((b, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 80),
        Animated.timing(b, { toValue: 1, duration: 200 + i * 40, useNativeDriver: false }),
        Animated.timing(b, { toValue: 0.3, duration: 200 + i * 40, useNativeDriver: false }),
      ]))
    );
    Animated.parallel(anims).start();
    return () => anims.forEach(a => a.stop());
  }, [active]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height: 20 }}>
      {bars.map((b, i) => (
        <Animated.View key={i} style={{
          width: 3, borderRadius: 2,
          backgroundColor: '#fff',
          height: b.interpolate({ inputRange: [0.3, 1], outputRange: [6, 18] }),
        }} />
      ))}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AIAssistant({ route, navigation }) {
  const { lang, t } = useLang();
  const initialQuestion = route?.params?.initialQuestion;
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [thinking,     setThinking]     = useState(false);
  const [listening,    setListening]    = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [farmData,     setFarmData]     = useState(null);
  const [analysis,     setAnalysis]     = useState(null);
  const [suggestions,  setSuggestions]  = useState([]);
  const keyboardInput = useRef(null);
  const [autoSpeak,    setAutoSpeak]    = useState(true);
  const scrollRef  = useRef(null);
  const inputRef   = useRef(null);
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const pulseLoop  = useRef(null);

  const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // ── Load farm data + run proactive analysis ──────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await getDashboard(FARM_ID);
        const enriched = { ...data, healthScore: computeHealthScore(data?.nodes || []) };
        setFarmData(enriched);

        // Run AI analysis with real data
        const result = await analyzeFarmNow({
          nodes:       data?.nodes || [],
          npk:         data?.npk || {},
          lang,
          farmerName:  data?.farmerName || '',
          location:    data?.location || '',
        });

        setAnalysis(result);
        setSuggestions(result.dynamicSuggestions || []);

        if (initialQuestion) {
          // If we came from voice modal with a question, send it!
          setTimeout(() => sendMessage(initialQuestion), 400);
        } else if (result.greeting && autoSpeak) {
          // Otherwise do normal greeting
          setTimeout(() => speak(result.greeting, lang), 400);
        }
      } catch (e) {
        console.warn('[AI] Init failed:', e.message);
        setAnalysis({ greeting: t('नमस्ते!', 'Hello!', 'नमस्कार!'), summary: t('खेत डेटा लोड हो रहा है...', 'Loading farm data...', 'शेत डेटा लोड होत आहे...'), alert: null, alertLevel: 'ok', actions: [], dynamicSuggestions: [] });
      }
      setLoading(false);
    };
    init();
    return () => stopSpeaking();
  }, [lang]);

  const scrollToEnd = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

  // ── Send message ──────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const q = text?.trim();
    if (!q || thinking) return;

    const userMsg = { id: Date.now(), role: 'user', text: q, time: now() };
    setMessages(prev => { const next = [...prev, userMsg]; return next; });
    setInput('');
    setThinking(true);
    scrollToEnd();

    try {
      const resp = await askFarmerAI({
        question:    q,
        lang,
        farmContext: farmData,
        history:     messages,
      });

      const aiMsg = { id: Date.now() + 1, role: 'ai', text: resp.text, visual: resp.visual, time: now() };
      setMessages(prev => [...prev, aiMsg]);

      if (autoSpeak && resp.text) speak(resp.text, lang);
    } catch (e) {
      const errText = lang === 'hi' ? 'माफ करें, कुछ गड़बड़ हुई। फिर कोशिश करें।' : lang === 'mr' ? 'क्षमस्व, काहीतरी चूक झाली. पुन्हा प्रयत्न करा.' : 'Sorry, something went wrong. Please try again.';
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: errText, visual: null, time: now() }]);
    }
    setThinking(false);
    scrollToEnd();
  }, [thinking, lang, farmData, messages, autoSpeak]);

  // ── Voice input ───────────────────────────────────────────────────────
  const startVoice = () => {
    if (!isVoiceSupported()) { 
      // FALLBACK FOR EXPO GO: Use the system keyboard's microphone!
      if (keyboardInput.current) {
        keyboardInput.current.focus();
        // Visual feedback
        const msg = lang === 'hi' 
          ? 'कीबोर्ड माइक का उपयोग करें' 
          : 'Use keyboard mic';
        alert(msg);
      }
      return; 
    }
    setListening(true);
    pulseLoop.current = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,   duration: 500, useNativeDriver: true }),
    ]));
    pulseLoop.current.start();
    startListening({
      lang: getRecognitionLang(lang),
      onResult: ({ transcript }) => { stopVoice(); if (transcript.trim()) sendMessage(transcript); },
      onError:  () => stopVoice(),
      onEnd:    stopVoice,
    });
  };

  const stopVoice = () => {
    stopListening(); setListening(false);
    pulseLoop.current?.stop(); pulseAnim.setValue(1);
  };

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center', gap: 16 }]}>
        <View style={styles.analysisAvatarLarge}>
          <LinearGradient colors={[COLORS.primary, '#10B981']} style={styles.analysisAvatarGrad}>
            <MaterialCommunityIcons name="robot-happy" size={32} color="#fff" />
          </LinearGradient>
        </View>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textMuted }}>
          {t('खेत का विश्लेषण हो रहा है...', 'Analyzing your farm...', 'शेताचे विश्लेषण होत आहे...')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* ── Header ── */}
      <View style={styles.header}>
        {navigation?.canGoBack?.() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.text} />
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <LinearGradient colors={[COLORS.primary, '#10B981']} style={styles.headerAvatarGrad}>
              <MaterialCommunityIcons name="robot-happy" size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AgriPulse AI</Text>
            <Text style={styles.headerSub}>
              {thinking
                ? t('सोच रहा हूँ...', 'Thinking...', 'विचार करत आहे...')
                : t('AI कृषि सहायक', 'AI Farm Expert', 'AI कृषी तज्ञ')}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerActionBtn, autoSpeak && { backgroundColor: COLORS.primaryPale }]}
            onPress={() => { setAutoSpeak(v => !v); if (autoSpeak) stopSpeaking(); }}
          >
            <MaterialCommunityIcons name={autoSpeak ? 'volume-high' : 'volume-off'} size={18} color={autoSpeak ? COLORS.primary : COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Farm context bar ── */}
      <FarmContextBar farmData={farmData} lang={lang} />

      {/* ── Messages ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.msgs}
        contentContainerStyle={styles.msgsContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToEnd}
      >
        {/* Proactive analysis card */}
        {analysis && <AnalysisCard analysis={analysis} lang={lang} onSuggest={sendMessage} onStartVoice={listening ? stopVoice : startVoice} listening={listening} />}

        {/* Dynamic suggestions (shown above messages) */}
        {messages.length === 0 && suggestions.length > 0 && (
          <SuggestionChips suggestions={suggestions} onTap={sendMessage} lang={lang} />
        )}

        {/* Message thread */}
        {messages.map(m => m.role === 'user'
          ? <UserBubble key={m.id} text={m.text} time={m.time} />
          : <AIBubble
              key={m.id}
              text={m.text}
              visual={m.visual}
              time={m.time}
              isAlert={m.visual?.type === 'alert'}
              onSpeak={() => { stopSpeaking(); speak(m.text, lang); }}
            />
        )}
        {thinking && <TypingIndicator />}

        {/* Suggestions after first exchange */}
        {messages.length > 0 && !thinking && suggestions.length > 0 && (
          <SuggestionChips suggestions={suggestions} onTap={sendMessage} lang={lang} />
        )}
      </ScrollView>

      {/* ── Input bar ── */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ backgroundColor: COLORS.surface }} // Ensure it stays opaque and visible
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Listening banner */}
        {listening && (
          <View style={styles.listeningBanner}>
            <VoiceWave active={listening} />
            <Text style={styles.listeningTxt}>{t('बोलें...', 'Speak now...', 'बोला...')}</Text>
            <TouchableOpacity onPress={stopVoice} style={styles.stopBtn}>
              <Text style={styles.stopBtnTxt}>{t('रोकें', 'Stop', 'थांबा')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputBar}>
          {/* Mic */}
          <Animated.View style={{ transform: [{ scale: listening ? pulseAnim : new Animated.Value(1) }] }}>
            <TouchableOpacity
              style={[styles.micBtn, listening && styles.micBtnActive]}
              onPress={listening ? stopVoice : startVoice}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={listening ? ['#EF4444', '#DC2626'] : [COLORS.primary, '#10B981']}
                style={styles.micGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name={listening ? 'microphone' : 'microphone-outline'} size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Text input */}
          <TextInput
            ref={keyboardInput}
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder={listening
              ? t('सुन रहा हूँ...', 'Listening...', 'ऐकत आहे...')
              : t('कुछ भी पूछें...', 'Ask anything...', 'काहीही विचारा...')}
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
            editable={!listening && !thinking}
            multiline
            maxLength={300}
          />

          {/* Send */}
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || thinking) && styles.sendBtnOff]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || thinking}
          >
            {thinking
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : <MaterialCommunityIcons name="send-circle" size={36} color={input.trim() ? COLORS.primary : COLORS.border} />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
    ...SHADOWS.soft,
  },
  headerBack: { padding: 6 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { position: 'relative' },
  headerAvatarGrad: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  onlineDot: { position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.surface },
  headerTitle: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  headerSub: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 6 },
  headerActionBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surfaceLight },

  // Context bar
  contextBar: { maxHeight: 44, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  contextBarContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: 'center' },
  contextChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.primaryPale, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary + '20' },
  contextChipTxt: { fontSize: 11, fontWeight: '800', color: COLORS.primary },

  // Messages
  msgs: { flex: 1 },
  msgsContent: { padding: 16, paddingBottom: 8, gap: 12 },

  // Analysis card
  analysisCard: { marginBottom: 4, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.primary + '25', ...SHADOWS.premium },
  analysisGrad: { padding: 18 },
  analysisHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  analysisHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  analysisAvatarLarge: { width: 48, height: 48, borderRadius: 15 },
  analysisAvatarGrad: { flex: 1, borderRadius: 15, justifyContent: 'center', alignItems: 'center', ...SHADOWS.glass },
  analysisName: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  analysisLive: { fontSize: 11, fontWeight: '700', color: COLORS.success },
  analysisAlert: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1 },
  analysisAlertTxt: { flex: 1, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  analysisSummary: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21, marginBottom: 14 },
  actionsWrap: { gap: 8, marginBottom: 12 },
  actionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, borderLeftWidth: 3 },
  actionEmoji: { fontSize: 18, marginTop: 1 },
  actionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  actionDetail: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  
  bigVoiceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, marginTop: 14, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, borderWidth: 2, borderColor: COLORS.primary + '50' },
  bigVoiceBtnTxt: { fontSize: 14, fontWeight: '800', color: COLORS.primary },

  // Suggestions
  suggestWrap: { gap: 6 },
  suggestLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 2 },
  suggestChip: { backgroundColor: COLORS.surface, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: COLORS.primary + '35', ...SHADOWS.soft, maxWidth: W * 0.72 },
  suggestTxt: { fontSize: 13, fontWeight: '700', color: COLORS.primary, lineHeight: 18 },

  // User bubble
  userRow: { alignItems: 'flex-end' },
  userBubble: { maxWidth: '82%', borderRadius: 20, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 11 },
  userText: { color: '#fff', fontSize: 15, fontWeight: '500', lineHeight: 22 },

  // AI bubble
  aiRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  thinkingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  aiAvatarSmall: { width: 28, height: 28, borderRadius: 9, overflow: 'hidden', flexShrink: 0 },
  aiAvatarGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  aiBubble: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 20, borderBottomLeftRadius: 4,
    paddingHorizontal: 14, paddingVertical: 12, maxWidth: '90%',
    ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.divider,
  },
  aiText: { fontSize: 14, color: COLORS.text, lineHeight: 21, fontWeight: '500' },
  aiBubbleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  speakIconBtn: { padding: 4 },
  thinkingBubble: { backgroundColor: COLORS.surface, borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: COLORS.divider },
  typingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.primary + 'AA' },

  // Visual card
  visualCard: { marginTop: 10, backgroundColor: COLORS.surfaceLight, borderRadius: 12, padding: 12, borderLeftWidth: 3 },
  visualCardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  visualCardIconWrap: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  visualCardTitle: { fontSize: 13, fontWeight: '800', flex: 1 },
  visualCardDetail: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },

  // Time
  bubbleTime: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },

  // Listening banner
  listeningBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12,
  },
  listeningTxt: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 14 },
  stopBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  stopBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.divider,
    ...SHADOWS.soft,
  },
  micBtn: { borderRadius: 22, overflow: 'hidden' },
  micBtnActive: { ...SHADOWS.glass },
  micGrad: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  textInput: {
    flex: 1, backgroundColor: COLORS.surfaceLight, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: COLORS.text,
    maxHeight: 100, borderWidth: 1.5, borderColor: COLORS.divider, fontWeight: '500',
    lineHeight: 20,
  },
  sendBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  sendBtnOff: { opacity: 0.4 },
});
