// src/services/api.js — Supabase API Service
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aekmiuxibmfjiakhkkrc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFla21pdXhpYm1mamlha2hra3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjk5MTYsImV4cCI6MjA5MTQwNTkxNn0.iwbzLIGx2fEKhbdn7Wxrk7ssJpfCjrxu-47ee3mWye0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── API Functions ─────────────────────────────────────────────

export const getDashboard = async (farmId) => {
  try {
    // 1. Get farm details
    const { data: farm } = await supabase.from('farms').select('*').eq('id', farmId).single();
    
    // 2. Get latest sensor data (nodes 1-4)
    const { data: rawNodes } = await supabase.from('sensor_data')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false })
      .limit(4);

    const nodes = rawNodes || [];

    // Fallback Dummy Data if empty
    const dummyNodes = [
      { node_id: 1, moisture: 68, temperature: 24.5, ec: 1.2, battery: 92 },
      { node_id: 2, moisture: 72, temperature: 25.0, ec: 1.1, battery: 85 },
      { node_id: 3, moisture: 55, temperature: 27.3, ec: 1.5, battery: 48 },
      { node_id: 4, moisture: 18, temperature: 31.7, ec: 2.8, battery: 12 },
    ];

    const finalNodes = [1, 2, 3, 4].map(id => {
      const live = nodes.find(n => n.node_id === id);
      return live || dummyNodes.find(d => d.node_id === id);
    });

    const alerts = [];
    finalNodes.forEach(n => {
      if (n.moisture < 20) alerts.push({ message: 'Low moisture critical!' });
    });

    return {
      data: {
        farmId,
        farmerName: farm?.farmer_name || 'रामराव शिंदे',
        nodes: finalNodes,
        alerts,
      },
      error: null
    };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getTodayAdvisory = async (farmId) => {
  // Using static premium localized responses
  return {
    data: {
      irrigation: { status: 'low', textHindi: 'पानी की सख्त जरूरत है। 45 मिनट के लिए सिंचाई करें।', textEn: 'Water is critically needed. Irrigate for 45 mins.' },
      nutrients:  { status: 'ok', textHindi: 'खाद का स्तर ठीक है।', textEn: 'Fertilizer levels optimal.' },
      nextCrop:   { crop: 'Soybean', textHindi: 'अगली फसल: सोयाबीन', textEn: 'Next Crop: Soybean' }
    },
    error: null
  };
};

export const onBoardFarmer = async (farmerData) => {
  return await supabase.from('farmers').insert([farmerData]);
};
