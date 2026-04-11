const CLOUD_RUN_URL = 'https://agri-hackathon-26-58884879245.europe-west1.run.app';

// ── Core API call (Now using your Cloud Run Backend!) ──────────────────
async function groqChat(messages, { temperature = 0.5, maxTokens = 600 } = {}) {
  const res = await fetch(`${CLOUD_RUN_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      messages, 
      temperature, 
      max_tokens: maxTokens 
    }),
  });
  if (!res.ok) throw new Error(`Backend error ${res.status}`);
  const data = await res.json();
  return data.response || data.choices?.[0]?.message?.content || '';
}

// ── Parse JSON response safely ─────────────────────────────────────────
function safeParseJSON(raw, fallback) {
  try { return JSON.parse(raw); } catch {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return fallback;
}

// ── 1. Proactive Farm Analysis ─────────────────────────────────────────
export async function analyzeFarmNow({ nodes = [], npk = {}, lang = 'hi', farmerName = '', location = '' }) {
  const langName = lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English';
  const nodesSummary = nodes.map(n => `Node ${n.node_id}: moisture=${n.moisture ?? 'offline'}%`).join(', ');
  
  const avgMoisture = nodes.length > 0 ? nodes.reduce((acc, n) => acc + (n.moisture || 0), 0) / nodes.length : 0;
  const criticalNodes = nodes.filter(n => (n.moisture || 0) < 35 && n.status !== 'offline');
  const offlineNodes = nodes.filter(n => n.status === 'offline' || n.status === 'virtual');
  const npkSummary = `N:${npk.N || 0}, P:${npk.P || 0}, K:${npk.K || 0}, pH:${npk.pH || 0}`;

  const messages = [
    {
      role: 'system',
      content: `You are AgriPulse AI, an expert agricultural advisor for Indian farmers. 
IMPORTANT: Your response MUST be entirely in ${langName}. Do not use English words for technical terms if a ${langName} word exists.
You have REAL sensor data from the farmer's field. Analyze it and give immediate, specific, actionable advice.
Be conversational, warm, and use simple language a rural farmer understands.

RESPOND IN EXACTLY THIS JSON FORMAT (no markdown, no extra text):
{
  "greeting": "Personalized greeting in ${langName} (max 1 sentence)",
  "alert": "Most urgent action needed right now in ${langName} (null if farm is fine)",
  "alertLevel": "critical|warning|ok",
  "summary": "One clear paragraph assessment of the farm in ${langName}",
  "actions": [
    {"emoji": "💧", "title": "Action title in ${langName}", "detail": "Specific step to take in ${langName}", "priority": "high|medium|low"}
  ],
  "dynamicSuggestions": ["Question 1 in ${langName}?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
}
- actions: 3-4 most important actions based on ACTUAL sensor readings
- dynamicSuggestions: 5 SMART questions the farmer should ask RIGHT NOW based on this specific farm data
- MANDATORY: All text fields must be in ${langName}.`,
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
    }
  ];

  const raw = await groqChat(messages, { temperature: 0.6, maxTokens: 800 });
  return safeParseJSON(raw, {
    greeting: lang === 'hi' ? 'नमस्ते! आपके खेत का विश्लेषण हो रहा है...' : lang === 'mr' ? 'नमस्कार! तुमच्या शेताचे विश्लेषण होत आहे...' : 'Hello! Analyzing your farm data...',
    alert: null, alertLevel: 'ok',
    summary: raw,
    actions: [],
    dynamicSuggestions: [],
  });
}

// ── 2. Interactive Q&A ────────────────────────────────────────────────
export async function askFarmerAI({ question, lang = 'hi', farmContext = {}, history = [] }) {
  const langName = lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English';
  const systemMsg = {
    role: 'system',
    content: `You are AgriPulse AI, an expert agricultural advisor. 
    IMPORTANT: You MUST respond entirely in ${langName}. 
    Do NOT use English words for technical terms if a ${langName} equivalent exists.
    Current Farm Context: ${JSON.stringify(farmContext)}. 
    
    Return EXACTLY this JSON structure: 
    { 
      "text": "Your helpful response in ${langName} (use warm, supportive tone)", 
      "visual": null 
    }`
  };

  const historyMsgs = history.slice(-6).map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));

  const messages = [systemMsg, ...historyMsgs, { role: 'user', content: question }];
  const raw = await groqChat(messages, { temperature: 0.6, maxTokens: 500 });
  return safeParseJSON(raw, { text: raw });
}
