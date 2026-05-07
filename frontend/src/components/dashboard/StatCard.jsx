import { Paper, Text, Box } from '@mantine/core';

const ACCENT_MAP = {
  'Total Leads':   { color: '#628141', bg: 'rgba(98,129,65,0.08)'   },
  'New':           { color: '#7a9e5a', bg: 'rgba(122,158,90,0.08)'  },
  'Contacted':     { color: '#4a7c59', bg: 'rgba(74,124,89,0.08)'   },
  'Qualified':     { color: '#d97706', bg: 'rgba(217,119,6,0.08)'   },
  'Won':           { color: '#16a34a', bg: 'rgba(22,163,74,0.1)'    },
  'Lost':          { color: '#dc2626', bg: 'rgba(220,38,38,0.08)'   },
  'Proposal Sent': { color: '#b45309', bg: 'rgba(180,83,9,0.08)'    },
};

export function StatCard({ label, value }) {
  const accent = ACCENT_MAP[label] || { color: '#628141', bg: 'rgba(98,129,65,0.08)' };

  return (
    <Paper
      p="md" radius="lg"
      style={{
        background: '#fff',
        boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
        borderTop: `3px solid ${accent.color}`,
        border: '1px solid #f0f0f0',
        borderTopWidth: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box>
        <Box style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: accent.bg, borderRadius: 10,
          padding: '2px 10px', marginBottom: 8,
        }}>
          <Text fz={26} fw={800} c={accent.color} style={{ lineHeight: 1.2 }}>{value}</Text>
        </Box>
        <Text fz={12} fw={500} c="#6b7280" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Text>
      </Box>
    </Paper>
  );
}
