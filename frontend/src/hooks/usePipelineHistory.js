import { useState, useEffect } from 'react';

const STORAGE_KEY = 'crm_pipeline_history';

const STATUS_HEX = {
  New:            '#6b7280',
  Contacted:      '#3b82f6',
  Qualified:      '#f97316',
  'Proposal Sent':'#9333ea',
  Won:            '#16a34a',
  Lost:           '#dc2626',
};

// ── Storage helpers ───────────────────────────────────────────────────────────
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveHistory(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Seed realistic history for existing leads ─────────────────────────────────
function seedHistory(leads) {
  const history = {};
  const PROGRESSIONS = {
    New:            [{ to: 'New', daysAgo: 30 }],
    Contacted:      [{ to: 'New', daysAgo: 30 }, { to: 'Contacted', daysAgo: 24 }],
    Qualified:      [{ to: 'New', daysAgo: 40 }, { to: 'Contacted', daysAgo: 34 }, { to: 'Qualified', daysAgo: 26 }],
    'Proposal Sent':[{ to: 'New', daysAgo: 50 }, { to: 'Contacted', daysAgo: 44 }, { to: 'Qualified', daysAgo: 36 }, { to: 'Proposal Sent', daysAgo: 22 }],
    Won:            [{ to: 'New', daysAgo: 60 }, { to: 'Contacted', daysAgo: 54 }, { to: 'Qualified', daysAgo: 46 }, { to: 'Proposal Sent', daysAgo: 32 }, { to: 'Won', daysAgo: 10 }],
    Lost:           [{ to: 'New', daysAgo: 45 }, { to: 'Contacted', daysAgo: 39 }, { to: 'Qualified', daysAgo: 31 }, { to: 'Lost', daysAgo: 18 }],
  };
  const USERS = ['Sarah Chen', 'Mike Torres', 'Priya Nair', 'Admin User'];

  leads.forEach(lead => {
    const steps = PROGRESSIONS[lead.status] || PROGRESSIONS.New;
    const user  = lead.assigned_to || USERS[Math.floor(Math.random() * USERS.length)];
    history[lead.id] = steps.map((step, i) => {
      const date = new Date();
      date.setDate(date.getDate() - step.daysAgo);
      return {
        id:        `seed-${lead.id}-${i}`,
        from:      i === 0 ? null : steps[i - 1].to,
        to:        step.to,
        changedBy: i === 0 ? 'Admin User' : user,
        changedAt: date.toISOString(),
      };
    });
  });
  saveHistory(history);
  return history;
}

// ── Public API ────────────────────────────────────────────────────────────────
export function initPipelineHistory(leads) {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) seedHistory(leads);
}

export function getLeadHistory(leadId) {
  return loadHistory()[String(leadId)] || [];
}

export function appendHistory(leadId, from, to, changedBy) {
  const history = loadHistory();
  const key = String(leadId);
  if (!history[key]) history[key] = [];
  history[key].push({
    id:        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    from,
    to,
    changedBy,
    changedAt: new Date().toISOString(),
  });
  saveHistory(history);
}

// ── Dashboard analytics ───────────────────────────────────────────────────────
export function calcAvgTimeToClose() {
  const history = loadHistory();
  const days = [];
  Object.values(history).forEach(entries => {
    const first = entries[0];
    const won   = [...entries].reverse().find(e => e.to === 'Won');
    if (first && won) {
      const diff = (new Date(won.changedAt) - new Date(first.changedAt)) / 86400000;
      if (diff >= 0) days.push(diff);
    }
  });
  if (days.length === 0) return null;
  return Math.round(days.reduce((a, b) => a + b, 0) / days.length);
}

export function calcStageVelocity() {
  const history = loadHistory();
  const stageTotals = {};
  const stageCounts = {};

  Object.values(history).forEach(entries => {
    for (let i = 0; i < entries.length - 1; i++) {
      const stage = entries[i].to;
      const days  = (new Date(entries[i + 1].changedAt) - new Date(entries[i].changedAt)) / 86400000;
      if (days >= 0) {
        stageTotals[stage] = (stageTotals[stage] || 0) + days;
        stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      }
    }
  });

  let maxStage = null;
  let maxAvg   = 0;
  Object.keys(stageTotals).forEach(stage => {
    const avg = stageTotals[stage] / stageCounts[stage];
    if (avg > maxAvg) { maxAvg = avg; maxStage = stage; }
  });
  return maxStage;
}

// ── React hook ────────────────────────────────────────────────────────────────
export function useLeadHistory(leadId) {
  const [history, setHistory] = useState(() => getLeadHistory(leadId));

  const refresh = () => setHistory(getLeadHistory(leadId));

  const addEntry = (from, to, changedBy) => {
    appendHistory(leadId, from, to, changedBy);
    refresh();
  };

  return { history, addEntry, refresh };
}

export { STATUS_HEX };
