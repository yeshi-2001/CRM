import { useState } from 'react';
import { Text, Group, Select, Button, Box, Notification, Stack } from '@mantine/core';
import { IconGitBranch } from '@tabler/icons-react';
import { LEAD_STATUSES } from '../../utils/constants';
import { useLeadHistory, STATUS_HEX } from '../../hooks/usePipelineHistory';
import { leadService } from '../../services/leadService';
import { formatDate, formatTime } from '../../utils/formatters';

const CARD = {
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #f0f0f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  padding: 24,
};

function TimelineEntry({ entry, isLast, isFirst }) {
  const color = STATUS_HEX[entry.to] || '#6b7280';
  return (
    <div style={{ display: 'flex', gap: 14, position: 'relative' }}>
      {/* Connecting line */}
      {!isLast && (
        <div style={{
          position: 'absolute', left: 5, top: 16, bottom: -4,
          width: 2, background: '#f0f0f0', zIndex: 0,
        }} />
      )}

      {/* Dot */}
      <div style={{
        width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
        marginTop: 5, zIndex: 1,
        background: isLast ? color : `${color}70`,
        boxShadow: isLast ? `0 0 0 4px ${color}18` : 'none',
        transition: 'all 0.2s ease',
      }} />

      {/* Content */}
      <div style={{ paddingBottom: isLast ? 0 : 18, flex: 1 }}>
        <Group gap={8} align="center" wrap="nowrap">
          <Text fz={13} fw={600} c="#111827">{entry.to}</Text>
          {isFirst && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
              background: 'rgba(91,124,74,0.1)', color: '#5B7C4A',
              border: '1px solid rgba(91,124,74,0.2)',
            }}>Created</span>
          )}
          {isLast && !isFirst && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
              background: `${color}12`, color: color,
              border: `1px solid ${color}25`,
            }}>Current</span>
          )}
        </Group>
        <Text fz={11} c="#9ca3af" mt={2}>
          {formatDate(entry.changedAt)} · {formatTime(entry.changedAt)} · {entry.changedBy}
        </Text>
      </div>
    </div>
  );
}

export function PipelineTimeline({ lead, currentUser, onStatusChange }) {
  const { history, addEntry } = useLeadHistory(lead.id);
  const [nextStage, setNextStage] = useState('');
  const [moving,    setMoving]    = useState(false);
  const [toast,     setToast]     = useState(null);

  const otherStages = LEAD_STATUSES.filter(s => s !== lead.status);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleMove = async () => {
    if (!nextStage) return;
    setMoving(true);
    try {
      await leadService.update(lead.id, { ...lead, status: nextStage });
      addEntry(lead.status, nextStage, currentUser);
      setNextStage('');
      showToast(`Lead moved to ${nextStage} ✓`);
      if (onStatusChange) onStatusChange(nextStage);
    } catch {
      showToast('Failed to move lead');
    } finally {
      setMoving(false);
    }
  };

  return (
    <>
      <Box style={CARD}>
        {/* Header */}
        <Group gap={10} mb={20}>
          <Box style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(91,124,74,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconGitBranch size={16} color="#5B7C4A" />
          </Box>
          <Box>
            <Text fw={700} fz={15} c="#111827">Pipeline Journey</Text>
            <Text fz={11} c="#9ca3af">{history.length} stage{history.length !== 1 ? 's' : ''} recorded</Text>
          </Box>
        </Group>

        {/* Timeline */}
        {history.length === 0 ? (
          <Text fz={12} c="#9ca3af" py={8}>No history recorded yet.</Text>
        ) : (
          <Stack gap={0}>
            {history.map((entry, i) => (
              <TimelineEntry
                key={entry.id}
                entry={entry}
                isFirst={i === 0}
                isLast={i === history.length - 1}
              />
            ))}
          </Stack>
        )}

        {/* Move stage */}
        <Box style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Text fz={12} fw={500} c="#6b7280" mb={10}>Move to stage:</Text>
          <Group gap={8} wrap="nowrap">
            <Select
              size="xs"
              placeholder="Select stage..."
              data={otherStages}
              value={nextStage}
              onChange={setNextStage}
              style={{ flex: 1 }}
              styles={{
                input: { fontSize: 12, borderRadius: 8, borderColor: '#e5e7eb', transition: 'border-color 0.2s' },
              }}
            />
            <Button
              size="xs"
              disabled={!nextStage || moving}
              loading={moving}
              onClick={handleMove}
              style={{
                background: nextStage ? '#5B7C4A' : '#e5e7eb',
                color: nextStage ? '#fff' : '#9ca3af',
                borderRadius: 8, fontWeight: 600, fontSize: 12,
                flexShrink: 0, transition: 'all 0.2s',
                boxShadow: nextStage ? '0 1px 3px rgba(91,124,74,0.3)' : 'none',
              }}
              onMouseEnter={(e) => { if (nextStage) e.currentTarget.style.background = '#4a6130'; }}
              onMouseLeave={(e) => { if (nextStage) e.currentTarget.style.background = '#5B7C4A'; }}
            >
              Move
            </Button>
          </Group>
        </Box>
      </Box>

      {/* Toast */}
      {toast && (
        <Notification
          color="green"
          onClose={() => setToast(null)}
          withCloseButton
          radius={12}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            minWidth: 260, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            border: '1px solid rgba(91,124,74,0.2)',
          }}
        >
          {toast}
        </Notification>
      )}
    </>
  );
}
