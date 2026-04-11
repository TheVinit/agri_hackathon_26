// src/services/groq.js
// Groq AI Service — Dynamic farm intelligence engine

const GROQ_API_KEY = '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';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL        = 'llama-3.3-70b-versatile';

// ── Core API call ──────────────────────────────────────────────────────
async function groqChat(messages, { temperature = 0.5, maxTokens = 600 } = {}) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, messages, temperature, max_tokens: maxTokens }),
  });
  if (!res.ok) throw new Error(`Groq API error ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() || '';
}

// ── Parse JSON response safely ─────────────────────────────────────────
function safeParseJSON(raw, fallback) {
  try { return JSON.parse(raw); } catch {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return fallback;
}

// ── 1. Proactive Farm Analysis (called on AI screen open) ──────────────
// Analyzes live sensor data and returns immediate, actionable advice
export async function analyzeFarmNow({ nodes = [], npk = {}, lang = 'hi', farmerName = '', location = '' }) {
  const langName = lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English';

  const nodesSummary = nodes.map(n => `Node ${n.node_id}(${n.name||'Field'}): moisture=${n.moisture ?? 'offline'}%, temp=${n.temperature ?? '--'}°C, status=${n.status}`).join('; ');
  const npkSummary = npk ? `N=${npk.N}, P=${npk.P}, K=${npk.K}, pH=${npk.pH}` : 'Not available';

  const avgMoisture = nodes.filter(n => n.moisture != null).reduce((s, n, _, a) => s + n.moisture / a.length, 0);
  const criticalNodes = nodes.filter(n => n.moisture != null && n.moisture < 35);
  const offlineNodes = nodes.filter(n => n.status === 'offline' || n.status === 'virtual');

  const messages = [
    {
      role: 'system',
      content: `You are AgriPulse AI, an expert agricultural advisor for Indian farmers. You speak ${langName}.
You have REAL sensor data from the farmer's field. Analyze it and give immediate, specific, actionable advice.
Be conversational, warm, and use simple language a rural farmer understands.

RESPOND IN EXACTLY THIS JSON FORMAT (no markdown, no extra text):
{
  "greeting": "Personalized greeting in ${langName} (max 1 sentence)",
  "alert": "Most urgent action needed right now in ${langName} (null if farm is fine)",
  "alertLevel": "critical|warning|ok",
  "summary": "One clear paragraph assessment of the farm in ${langName}",
  "actions": [
    {"emoji": "💧", "title": "Action title", "detail": "Specific step to take", "priority": "high|medium|low"}
  ],
  "dynamicSuggestions": ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
}
- actions: 3-4 most important actions based on ACTUAL sensor readings
- dynamicSuggestions: 5 SMART questions the farmer should ask RIGHT NOW based on this specific farm data
- All text must be in ${langName}`,
    },
    {
      role: 'user',
      content: `Farmer: ${farmerName} | Location: ${location}
Live sensor data: ${nodesSummary}
Average moisture: ${avgMoisture.toFixed(0)}%
Critical nodes (moisture < 35%): ${criticalNodes.length} nodes
Offline/Virtual nodes: ${offlineNodes.length} nodes
NPK: ${npkSummary}
Current time: ${new Date().toLocaleTimeString('en-IN')} IST`,
    },
  ];

  const raw = await groqChat(messages, { temperature: 0.6, maxTokens: 800 });
  return safeParseJSON(raw, {
    greeting: lang === 'hi' ? 'नमस्ते! आपके खेत का विश्लेषण हो रहा है...' : 'Hello! Analyzing your farm data...',
    alert: null, alertLevel: 'ok',
    summary: raw,
    actions: [],
    dynamicSuggestions: [],
  });
}

// ── 2. Interactive Q&A with full farm context ──────────────────────────
export async function askFarmerAI({ question, lang = 'hi', farmContext = {}, history = [] }) {
  const langName = lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English';

  const nodesSummary = (farmContext.nodes || [])
    .map(n => `Node ${n.node_id}(${n.name||'Field'}): moisture=${n.moisture ?? 'N/A'}%, temp=${n.temperature ?? '--'}°C, EC=${n.ec ?? '--'}, status=${n.status}`)
    .join('\n');

  const systemMsg = {
    role: 'system',
    content: `You are AgriPulse AI, a warm, expert agricultural advisor for Indian farmers. ALWAYS respond in ${langName}.

LIVE FARM DATA:
Farmer: ${farmContext.farmerName || 'Farmer'} | Location: ${farmContext.location || 'India'}
Health Score: ${farmContext.healthScore || 'N/A'}/100
Nodes:\n${nodesSummary || 'No sensor data'}
NPK: N=${farmContext.npk?.N || '--'}, P=${farmContext.npk?.P || '--'}, K=${farmContext.npk?.K || '--'}, pH=${farmContext.npk?.pH || '--'}
Primary Crop: ${farmContext.primaryCrop || 'Unknown'} | Land: ${farmContext.landSize || '--'}
Season: ${farmContext.season || '--'} | Soil: ${farmContext.soilType || '--'}

RESPONSE FORMAT (JSON only, no markdown):
{
  "text": "Your response in ${langName}. Be specific using the real sensor numbers above. Give actionable steps.",
  "visual": null
}
OR with a visual card:
{
  "text": "Response...",
  "visual": {
    "type": "tip|alert|data|crop|weather",
    "title": "Card title in ${langName}",
    "detail": "Card detail in ${langName}",
    "icon": "material-icon-name",
    "color": "#hexcolor",
    "data": null
  }
}

RULES:
- Always use the ACTUAL sensor numbers in your response  
- Give step-by-step instructions when needed
- If moisture < 35%: urgently recommend irrigation
- If temp > 32°C: suggest shade/cooling measures
- Reference specific nodes by name/number
- Be concise (3-4 sentences max for main text)
- Use emojis sparingly for clarity`,
  };

  const historyMsgs = history.slice(-6).map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));

  const messages = [systemMsg, ...historyMsgs, { role: 'user', content: question }];
  const raw = await groqChat(messages, { temperature: 0.65, maxTokens: 500 });
  return safeParseJSON(raw, { text: raw, visual: null });
}

// ── 3. Extract farmer profile from voice ──────────────────────────────
export async function extractFarmerProfile(transcript, lang = 'hi') {
  const messages = [
    {
      role: 'system',
      content: `Extract farmer registration details from spoken ${lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English'} text.
Return ONLY valid JSON: { "name": "", "phone": "", "village": "", "district": "", "primaryCrop": "" }
- primaryCrop: one of: wheat, rice, cotton, soybean, sugarcane, maize, tomato, onion
- phone: digits only, empty if not mentioned
- Empty string "" for missing fields. NO explanation outside JSON.`,
    },
    { role: 'user', content: `Transcript: "${transcript}"` },
  ];
  const raw = await groqChat(messages, { temperature: 0.1, maxTokens: 200 });
  return safeParseJSON(raw, {});
}

// ── 4. Extract farm history from voice ────────────────────────────────
export async function extractFarmHistory(transcript, lang = 'hi') {
  const messages = [
    {
      role: 'system',
      content: `Extract farm history from spoken text. Return ONLY valid JSON:
{ "landSize": "", "season": "", "soilType": "", "cropHistory": [] }
- landSize: "< 1 Acre"|"1–2 Acres"|"2–5 Acres"|"5–10 Acres"|"10+ Acres"
- season: "Kharif (Jun–Oct)"|"Rabi (Oct–Mar)"|"Zaid (Mar–Jun)"|"Year-Round"
- soilType: "Black (Kali Mitti)"|"Red"|"Sandy Loam"|"Clay"|"Alluvial"
- cropHistory: array of crop names. NO explanation outside JSON.`,
    },
    { role: 'user', content: `Transcript: "${transcript}"` },
  ];
  const raw = await groqChat(messages, { temperature: 0.1, maxTokens: 200 });
  return safeParseJSON(raw, {});
}

// ── 5. TTS prompts for onboarding ─────────────────────────────────────
export function getOnboardingPrompt(step, lang = 'hi') {
  const prompts = {
    profile: {
      hi: 'नमस्ते! मैं AgriPulse हूँ। कृपया अपना नाम, गाँव और मुख्य फसल बोलें।',
      en: 'Hello! I am AgriPulse. Please tell me your name, village, and main crop.',
      mr: 'नमस्कार! मी AgriPulse आहे. कृपया नाव, गाव आणि मुख्य पीक सांगा.',
    },
    location: {
      hi: 'अब मुझे आपके खेत की लोकेशन चाहिए। GPS बटन दबाएं।',
      en: 'Now I need your farm location. Press the GPS button below.',
      mr: 'आता शेताचे स्थान हवे. GPS बटण दाबा.',
    },
    history: {
      hi: 'बहुत अच्छा! अब बताएं — जमीन कितनी बड़ी है, पिछले साल क्या उगाया था?',
      en: 'Great! Now tell me — how big is your land and what crops did you grow before?',
      mr: 'छान! आता सांगा — जमीन किती आहे आणि आधी कोणती पिके घेतली?',
    },
  };
  return prompts[step]?.[lang] || prompts[step]?.hi || '';
}
