import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const STATUS_HEX = {
  New:            '#6b7280',
  Contacted:      '#3b82f6',
  Qualified:      '#f97316',
  'Proposal Sent':'#9333ea',
  Won:            '#16a34a',
  Lost:           '#dc2626',
};

// ── Seed realistic history via API on first visit ─────────────────────────────
const PROGRESSIONS = {
  New:            [{ to: 'New', daysAgo: 30 }],
  Contacted:      [{ to: 'New', daysAgo: 30 }, { to: 'Contacted', daysAgo: 24 }],
  Qualified:      [{ to: 'New', daysAgo: 40 }, { to: 'Contacted', daysAgo: 34 }, { to: 'Qualified', daysAgo: 26 }],
  'Proposal Sent':[{ to: 'New', daysAgo: 50 }, { to: 'Contacted', daysAgo: 44 }, { to: 'Qualified', daysAgo: 36 }, { to: 'Proposal Sent', daysAgo: 22 }],
  Won:            [{ to: 'New', daysAgo: 60 }, { to: 'Contacted', daysAgo: 54 }, { to: 'Qualified', daysAgo: 46 }, { to: 'Proposal Sent', daysAgo: 32 }, { to: 'Won', daysAgo: 10 }],
  Lost:           [{ to: 'New', daysAgo: 45 }, { to: 'Contacted', daysAgo: 39 }, { to: 'Qualified', daysAgo: 31 }, { to: 'Lost', daysAgo: 18 }],
};

export async function initPipelineHistory(leads) {
  for (const lead of leads) {
    try {
      const { data: existing } = await api.get(`/api/leads/${lead.id}/history`);
      if (existing.length === 0) {
        const steps = PROGRESSIONS[lead.status] || PROGRESSIONS.New;
        for (let i = 0; i < steps.length; i++) {
          const date = new Date();
          date.setDate(date.getDate() - steps[i].daysAgo);
          await api.post(`/api/leads/${lead.id}/history`, {
            from_status: i === 0 ? null : steps[i - 1].to,
            to_status:   steps[i].to,
            changed_by:  lead.assigned_to || 'Admin',
            changed_at:  date.toISOString(),
          });
        }
      }
    } catch { /* skip if lead history already exists */ }
  }
}

// ── React hook ────────────────────────────────────────────────────────────────
export function useLeadHistory(leadId) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/leads/${leadId}/history`);
      // Normalize DB field names to match component expectations
      setHistory(data.map(h => ({
        id:        h.id,
        from:      h.from_status,
        to:        h.to_status,
        changedBy: h.changed_by,
        changedAt: h.changed_at,
      })));
    } catch { setHistory([]); }
    finally { setLoading(false); }
  }, [leadId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const addEntry = async (from, to, changedBy) => {
    try {
      const { data } = await api.post(`/api/leads/${leadId}/history`, {
        from_status: from,
        to_status:   to,
        changed_by:  changedBy,
      });
      setHistory(prev => [...prev, {
        id:        data.id,
        from:      data.from_status,
        to:        data.to_status,
        changedBy: data.changed_by,
        changedAt: data.changed_at,
      }]);
    } catch { /* silent */ }
  };

  return { history, loading, addEntry, refetch: fetchHistory };
}

// ── Dashboard analytics (calculated from DB data) ─────────────────────────────
export async function calcAvgTimeToClose() {
  try {
    const { data: leads } = await api.get('/api/leads');
    const days = [];
    for (const lead of leads) {
      const { data: history } = await api.get(`/api/leads/${lead.id}/history`);
      const first = history[0];
      const won   = [...history].reverse().find(h => h.to_status === 'Won');
      if (first && won) {
        const diff = (new Date(won.changed_at) - new Date(first.changed_at)) / 86400000;
        if (diff >= 0) days.push(diff);
      }
    }
    return days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : null;
  } catch { return null; }
}

export async function calcStageVelocity() {
  try {
    const { data: leads } = await api.get('/api/leads');
    const totals = {};
    const counts = {};
    for (const lead of leads) {
      const { data: history } = await api.get(`/api/leads/${lead.id}/history`);
      for (let i = 0; i < history.length - 1; i++) {
        const stage = history[i].to_status;
        const days  = (new Date(history[i + 1].changed_at) - new Date(history[i].changed_at)) / 86400000;
        if (days >= 0) { totals[stage] = (totals[stage] || 0) + days; counts[stage] = (counts[stage] || 0) + 1; }
      }
    }
    let maxStage = null, maxAvg = 0;
    Object.keys(totals).forEach(s => { const avg = totals[s] / counts[s]; if (avg > maxAvg) { maxAvg = avg; maxStage = s; } });
    return maxStage;
  } catch { return null; }
}
