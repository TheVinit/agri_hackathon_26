// src/services/api.js — Smart Advisory Engine + Supabase with graceful demo fallback

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// ── Lazy Supabase client ──────────────────────────────────────────────────
let _supabase = null;
function getSupabase() {
  if (_supabase) return _supabase;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const { createClient } = require('@supabase/supabase-js');
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _supabase;
  } catch (e) {
    console.warn('[API] Supabase init failed, using demo mode:', e.message);
    return null;
  }
}

export const getAdminSupabase = getSupabase;

// ── Fallback/Demo Data (for robust demo if hardware API sleeps) ────────
const DEMO_NODES = [
  { node_id: 1, moisture: 68, temperature: 24.5, humidity: 45, ec: 1.2, battery: 92, status: 'ok' },
  { node_id: 2, moisture: 72, temperature: 25.0, humidity: 42, ec: 1.1, battery: 85, status: 'ok' },
  { node_id: 3, moisture: 38, temperature: 27.3, humidity: 38, ec: 1.5, battery: 48, status: 'warning' },
  { node_id: 4, moisture: null, temperature: null, humidity: null, ec: null, battery: 0, status: 'offline' },
];

const DEMO_NPK = { N: 42, P: 18, K: 65, pH: 6.8 };

// ── Farm Health Score (0-100) ─────────────────────────────────────────────
export function computeHealthScore(nodes) {
  if (!nodes || nodes.length === 0) return 0;
  let score = 100;
  const activeNodes = nodes.filter(n => n.status !== 'offline');
  if (activeNodes.length === 0) return 0;
  
  activeNodes.forEach(n => {
    if (n.moisture < 20)       score -= 20;
    else if (n.moisture < 35)  score -= 10;
    if (n.temperature > 36)    score -= 12;
    else if (n.temperature > 32) score -= 5;
    if (n.ec > 3.0)            score -= 10;
    else if (n.ec > 2.0)       score -= 5;
    if (n.battery < 15)        score -= 8;
    else if (n.battery < 30)   score -= 3;
  });
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ── Smart Advisory Engine ─────────────────────────────────────────────────
export function computeAdvisory(nodes = [], npk = DEMO_NPK) {
  if (!nodes || nodes.length === 0) {
    nodes = DEMO_NODES; // Auto-fallback for advisory if strictly empty
  }
  const activeNodes = nodes.filter(n => n.status !== 'offline');
  if (activeNodes.length === 0) {
    // If all nodes are offline, advisory should reflect that
    return { 
      irrigation: { severity: 'warning', textEn: '⚠️ All nodes are offline. Check connection.', textHindi: '⚠️ सभी नोड ऑफलाइन हैं। कनेक्शन जाँचें।', textMr: '⚠️ सर्व नोड्स ऑफलाइन आहेत. कनेक्शन तपासा.' },
      temperature: { severity: 'info', textEn: 'Temperature data unavailable.', textHindi: 'तापमान डेटा उपलब्ध नहीं है।' },
      nutrients: { severity: 'info', textEn: 'Nutrient data unavailable.', textHindi: 'पोषक तत्व डेटा उपलब्ध नहीं है।' },
      nextCrop: { severity: 'info', textEn: 'Crop recommendation unavailable.', textHindi: 'फसल सलाह उपलब्ध नहीं है।' }
    };
  }

  const criticalNodes = activeNodes.filter(n => n.moisture < 25);
  const warningNodes  = activeNodes.filter(n => n.moisture >= 25 && n.moisture < 40);
  const hotNodes      = activeNodes.filter(n => n.temperature > 32);
  const avgMoisture   = Math.round(activeNodes.reduce((s, n) => s + n.moisture, 0) / activeNodes.length);
  const avgTemp       = (activeNodes.reduce((s, n) => s + n.temperature, 0) / activeNodes.length).toFixed(1);
  const highEC        = activeNodes.filter(n => n.ec > 2.0);

  // ─ Irrigation Advisory ─
  let irrigation;
  if (criticalNodes.length > 0) {
    const ids = criticalNodes.map(n => `Node ${n.node_id}`).join(', ');
    irrigation = {
      decision: 'irrigate_now',
      severity: 'critical',
      actionItems: [
        `Irrigate ${ids} for 45 minutes immediately`,
        'Check drip/sprinkler nozzles for blockage',
        'Monitor moisture every 2 hours today',
      ],
      textHindi: `🚨 ${ids} में नमी गंभीर स्तर पर है (${criticalNodes.map(n=>n.moisture+'%').join(', ')}). तुरंत 45 मिनट सिंचाई करें। ड्रिप नोजल की जाँच करें।`,
      textEn:    `🚨 Critical moisture in ${ids} (${criticalNodes.map(n=>n.moisture+'%').join(', ')}). Irrigate for 45 minutes immediately. Check drip nozzles.`,
      textMr:    `🚨 ${ids} मध्ये ओलावा गंभीर पातळीवर (${criticalNodes.map(n=>n.moisture+'%').join(', ')}). तात्काळ 45 मिनिटे सिंचन करा.`,
      dataContext: `Avg moisture: ${avgMoisture}% across ${nodes.length} nodes`,
    };
  } else if (warningNodes.length > 0) {
    const ids = warningNodes.map(n => `Node ${n.node_id}`).join(', ');
    irrigation = {
      decision: 'irrigate_soon',
      severity: 'warning',
      actionItems: [
        `Schedule irrigation for ${ids} within 24 hours`,
        'Increase monitoring frequency to twice daily',
      ],
      textHindi: `${ids} में नमी कम हो रही है (${warningNodes.map(n=>n.moisture+'%').join(', ')}). अगले 24 घंटों में सिंचाई करें।`,
      textEn:    `Moisture declining in ${ids} (${warningNodes.map(n=>n.moisture+'%').join(', ')}). Schedule irrigation within 24 hours.`,
      textMr:    `${ids} मध्ये ओलावा कमी होत आहे. 24 तासांत सिंचन करा.`,
      dataContext: `Avg moisture: ${avgMoisture}% — below optimal`,
    };
  } else {
    irrigation = {
      decision: 'ok',
      severity: 'good',
      actionItems: ['No irrigation needed today', 'Check again after 2 days'],
      textHindi: `सभी ${nodes.length} क्षेत्रों में नमी उत्तम है। औसत: ${avgMoisture}%. आज सिंचाई की जरूरत नहीं।`,
      textEn:    `Moisture is optimal across all ${nodes.length} zones. Average: ${avgMoisture}%. No irrigation needed today.`,
      textMr:    `सर्व ${nodes.length} क्षेत्रांत ओलावा उत्तम आहे. सरासरी: ${avgMoisture}%. आज सिंचन नको.`,
      dataContext: `All nodes above 40% — system healthy`,
    };
  }

  // ─ Temperature Advisory ─
  let temperature;
  if (hotNodes.length > 0) {
    const ids = hotNodes.map(n => `Node ${n.node_id} (${n.temperature}°C)`).join(', ');
    temperature = {
      severity: 'warning',
      actionItems: [
        'Provide shade nets over affected zones',
        'Increase irrigation frequency during peak heat (12–3 PM)',
        'Avoid pesticide spraying during hot hours',
      ],
      textHindi: `${ids} में तापमान अधिक है। दोपहर 12-3 बजे सिंचाई बढ़ाएं। शेड नेट लगाएं।`,
      textEn:    `High temp detected in ${ids}. Increase irrigation 12–3 PM. Deploy shade nets.`,
      textMr:    `${ids} मध्ये तापमान जास्त आहे. दुपारी 12-3 वाजता सिंचन वाढवा.`,
      dataContext: `Peak temp: ${Math.max(...hotNodes.map(n => n.temperature))}°C`,
    };
  } else {
    temperature = {
      severity: 'good',
      actionItems: ['Temperature is ideal for crop growth', 'Continue normal farm operations'],
      textHindi: `सभी क्षेत्रों में तापमान आदर्श है। औसत: ${avgTemp}°C. फसल वृद्धि के लिए अनुकूल परिस्थितियाँ।`,
      textEn:    `Temperature is ideal across all zones. Average: ${avgTemp}°C. Great conditions for crop growth.`,
      textMr:    `सर्व क्षेत्रांत तापमान आदर्श आहे. सरासरी: ${avgTemp}°C. पीक वाढीसाठी अनुकूल.`,
      dataContext: `Avg temp: ${avgTemp}°C — within safe range`,
    };
  }

  // ─ Nutrient Advisory ─
  const deficits = [];
  const actions  = [];
  if (npk.N < 50) { deficits.push(`N: ${npk.N}`); actions.push('Apply 50kg Urea per hectare'); }
  if (npk.P < 25) { deficits.push(`P: ${npk.P}`); actions.push('Apply 25kg DAP per hectare'); }
  if (npk.K < 50) { deficits.push(`K: ${npk.K}`); actions.push('Apply 20kg MOP per hectare'); }
  if (highEC.length > 0) actions.push(`Flush ${highEC.map(n=>'Node '+n.node_id).join(', ')} with fresh water — EC too high`);

  let nutrients;
  if (deficits.length > 0) {
    nutrients = {
      status: 'low',
      severity: 'warning',
      actionItems: actions,
      textHindi: `मिट्टी में ${deficits.join(', ')} की कमी है। ${actions.slice(0,2).map(a=>'• '+a).join('. ')}`,
      textEn:    `Soil deficient in ${deficits.join(', ')}. ${actions.slice(0,2).join('. ')}.`,
      textMr:    `जमिनीत ${deficits.join(', ')} ची कमतरता आहे. ${actions.slice(0,2).join('. ')}.`,
      dataContext: `N:${npk.N} P:${npk.P} K:${npk.K} pH:${npk.pH}`,
    };
  } else {
    nutrients = {
      status: 'ok',
      severity: 'good',
      actionItems: ['All nutrients at optimal levels', `Maintain current fertilization schedule`],
      textHindi: `मिट्टी के सभी पोषक तत्व उत्तम स्तर पर हैं। N:${npk.N} P:${npk.P} K:${npk.K} pH:${npk.pH}`,
      textEn:    `All soil nutrients are at optimal levels. N:${npk.N} P:${npk.P} K:${npk.K} pH:${npk.pH}`,
      textMr:    `मातीतील सर्व पोषक घटक उत्तम पातळीवर. N:${npk.N} P:${npk.P} K:${npk.K} pH:${npk.pH}`,
      dataContext: `N:${npk.N} P:${npk.P} K:${npk.K} pH:${npk.pH}`,
    };
  }

  // ─ Next Crop Recommendation ─
  const month = new Date().getMonth(); // 0=Jan
  let crop = 'Soybean';
  let cropHi = 'सोयाबीन';
  let cropMr = 'सोयाबीन';
  if (month >= 9 && month <= 12) { crop = 'Wheat'; cropHi = 'गेहूं'; cropMr = 'गहू'; }
  else if (month >= 1 && month <= 3) { crop = 'Chickpea / Chana'; cropHi = 'चना'; cropMr = 'हरभरा'; }
  else if (month >= 4 && month <= 5) { crop = 'Maize'; cropHi = 'मक्का'; cropMr = 'मका'; }

  const nextCrop = {
    crop,
    severity: 'info',
    actionItems: [
      `Prepare seed beds for ${crop} cultivation`,
      'Add 2 tonnes/hectare organic compost before sowing',
      `pH ${npk.pH} is ${npk.pH >= 6 && npk.pH <= 7.5 ? 'ideal' : 'needs correction'} for ${crop}`,
    ],
    textHindi: `मिट्टी (pH ${npk.pH}) और मौसम के आधार पर ${cropHi} की खेती उत्तम रहेगी। बुआई से पहले 2 टन/हेक्टेयर जैविक खाद मिलाएं।`,
    textEn:    `Based on soil pH (${npk.pH}) and season, ${crop} is recommended. Add 2 tonnes/ha organic compost before sowing.`,
    textMr:    `माती (pH ${npk.pH}) आणि हंगामावर आधारित ${cropMr} ची शिफारस. पेरणीआधी 2 टन/हेक्टर सेंद्रिय खत घाला.`,
    dataContext: `pH ${npk.pH} | Season: ${month < 6 ? 'Kharif' : 'Rabi'}`,
  };

  return { irrigation, temperature, nutrients, nextCrop, generatedAt: new Date().toISOString() };
}

// ── API Functions ────────────────────────────────────────────────────────

const API_BASE_URL = 'https://agri-hackathon-26.onrender.com';

function buildEmptyResponse(farmId, errorMsg) {
  return {
    data: {
      farmId,
      farmerName: 'रामराव शिंदे',
      location:   'Pune, MH',
      nodes:      [],
      npk:        DEMO_NPK,
      alerts:     [],
      dataSource: 'Error',
      lastSync:   new Date().toISOString(),
    },
    error: errorMsg || 'Unable to load data',
  };
}

export const getDashboard = async (farmId) => {
  const supabase = getSupabase();
  let farmerName = 'रामराव शिंदे';
  let location = 'Pune, MH';

  if (supabase) {
    try {
      const { data: farm } = await supabase.from('farms').select('*').eq('id', farmId).single();
      if (farm) {
        farmerName = farm.farmer_name || farmerName;
        location = farm.location || location;
      }
    } catch (e) {
      console.warn('[API] Supabase farm fetch failed:', e.message);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/sensors/${farmId}`);
    if (!response.ok) {
      throw new Error(`Render API responded with status: ${response.status}`);
    }
    const apiData = await response.json();

    const nodes = (apiData.nodes && apiData.nodes.length > 0) ? apiData.nodes : DEMO_NODES;
    const finalNodes = nodes.map(live => {
      const isMissingData = live.moisture === null || live.moisture === undefined || 
                           live.temperature === null || live.temperature === undefined;
      return {
        ...live,
        status: isMissingData ? 'offline' : 
                live.moisture < 20 ? 'critical' : 
                live.moisture < 35 ? 'warning' : 'ok'
      };
    });

    const alerts = finalNodes
      .filter(n => n.moisture < 25)
      .map(n => ({ node_id: n.node_id, type: 'moisture', severity: 'high', message: 'Low moisture critical!' }));

    return {
      data: {
        farmId: apiData.farm_id || farmId,
        farmerName,
        location,
        nodes: finalNodes,
        npk: apiData.npk_soil_actual || DEMO_NPK,
        alerts,
        dataSource: (apiData.nodes && apiData.nodes.length > 0) ? 'Live' : 'Demo (Fallback)',
        lastSync: apiData.recorded_at || new Date().toISOString(),
      },
      error: null,
    };
  } catch (error) {
    console.warn('[API] Dashboard fetch failed:', error.message);
    
    // Fallback fully to DEMO_NODES so the UI never crashes/breaks
    const finalNodes = DEMO_NODES.map(live => ({
      ...live,
      status: live.moisture < 20 ? 'critical' : live.moisture < 35 ? 'warning' : 'ok'
    }));
    
    const alerts = finalNodes
      .filter(n => n.moisture < 25)
      .map(n => ({ node_id: n.node_id, type: 'moisture', severity: 'high', message: 'Low moisture critical!' }));

    return {
      data: {
        farmId,
        farmerName,
        location,
        nodes: finalNodes,
        npk: DEMO_NPK,
        alerts,
        dataSource: 'Demo (Fallback)',
        lastSync: new Date().toISOString(),
      },
      error: null
    };
  }
};

export const getTodayAdvisory = async (farmId, nodes, npk) => {
  let finalNodes = nodes;
  let finalNpk = npk;

  if (!finalNodes || !finalNpk) {
    const dashboardRes = await getDashboard(farmId);
    if (dashboardRes.data && dashboardRes.data.nodes.length > 0) {
      finalNodes = dashboardRes.data.nodes;
      finalNpk = dashboardRes.data.npk;
    } else {
      // Fallback if API fails or returns no nodes
      finalNodes = [];
      finalNpk = DEMO_NPK;
    }
  }

  const advisory = computeAdvisory(finalNodes, finalNpk);
  return { data: advisory, error: null };
};

export const postNPKReading = async (farmId, payload) => {
  const supabase = getSupabase();
  if (!supabase) return { data: { id: 'demo', ...payload }, error: null }; // silent demo success
  const { data, error } = await supabase.from('npk_readings').insert({
    farm_id: farmId, ...payload, created_at: new Date().toISOString()
  });
  return { data, error: error?.message || null };
};

export const onBoardFarmer = async (farmerData) => {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: 'Demo mode' };
  return await supabase.from('farmers').insert([farmerData]);
};
