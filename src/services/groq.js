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
  
  const messages = [
    {
      role: 'system',
      content: `You are AgriPulse AI. Speak ${langName}. Analyze farm data and return JSON:
      {
        "greeting": "Greeting in ${langName}",
        "alert": "Urgent alert (null if ok)",
        "alertLevel": "critical|warning|ok",
        "summary": "Short summary in ${langName}",
        "actions": [{"emoji": "💧", "title": "Title", "detail": "Detail", "priority": "high"}],
        "dynamicSuggestions": ["Q1", "Q2", "Q3", "Q4", "Q5"]
      }`
    },
    { role: 'user', content: `Data: ${nodesSummary}, NPK: ${JSON.stringify(npk)}` }
  ];

  const raw = await groqChat(messages, { temperature: 0.6, maxTokens: 800 });
  return safeParseJSON(raw, { summary: raw });
}

// ── 2. Interactive Q&A ────────────────────────────────────────────────
export async function askFarmerAI({ question, lang = 'hi', farmContext = {}, history = [] }) {
  const langName = lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English';
  const systemMsg = {
    role: 'system',
    content: `You are AgriPulse AI. Respond in ${langName}. Use the following context: ${JSON.stringify(farmContext)}. 
    Return JSON: { "text": "Answer", "visual": null }`
  };

  const historyMsgs = history.slice(-6).map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));

  const messages = [systemMsg, ...historyMsgs, { role: 'user', content: question }];
  const raw = await groqChat(messages, { temperature: 0.6, maxTokens: 500 });
  return safeParseJSON(raw, { text: raw });
}
