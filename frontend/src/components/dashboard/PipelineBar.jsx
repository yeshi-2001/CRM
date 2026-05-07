import { Paper, Text, Group, Box } from '@mantine/core';

const SEGMENTS = [
  { key: 'new',           label: 'New',           color: '#8bae66' },
  { key: 'contacted',     label: 'Contacted',     color: '#4a7c59' },
  { key: 'qualified',     label: 'Qualified',     color: '#d97706' },
  { key: 'proposal_sent', label: 'Proposal Sent', color: '#9333ea' },
  { key: 'won',           label: 'Won',           color: '#16a34a' },
  { key: 'lost',          label: 'Lost',          color: '#dc2626' },
];

export function PipelineBar({ stats }) {
  const total = stats?.total || 1;

  return (
    <Paper p="lg" radius="lg" style={{ background: '#fff', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
      <Group justify="space-between" mb="md">
        <Text fw={700} fz={15} c="#111827">Pipeline Breakdown</Text>
        <Text fz={12} c="#6b7280">{stats?.total ?? 0} total leads</Text>
      </Group>

      {/* Segmented bar with value labels inside */}
      <Box style={{ display: 'flex', height: 36, borderRadius: 8, overflow: 'hidden', gap: 2 }}>
        {SEGMENTS.map(({ key, color }) => {
          const count = stats?.[key] || 0;
          const pct   = (count / total) * 100;
          if (pct === 0) return null;
          return (
            <Box
              key={key}
              style={{
                width: `${pct}%`, backgroundColor: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'width 0.4s ease',
              }}
              title={`${key}: ${count} (${pct.toFixed(1)}%)`}
            >
              {pct >= 8 && (
                <Text fz={11} fw={700} c="#fff">{count}</Text>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Legend */}
      <Group mt="md" gap="lg" wrap="wrap">
        {SEGMENTS.map(({ key, label, color }) => {
          const count = stats?.[key] || 0;
          const pct   = ((count / total) * 100).toFixed(0);
          return (
            <Group key={key} gap={6}>
              <Box style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
              <Text fz={12} c="#374151" fw={500}>{label}</Text>
              <Text fz={12} c="#9ca3af">{count} ({pct}%)</Text>
            </Group>
          );
        })}
      </Group>
    </Paper>
  );
}
