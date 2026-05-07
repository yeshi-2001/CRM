import { useState } from 'react';
import { Table, ActionIcon, Group, Center, Text, Anchor, Box, LoadingOverlay, Badge } from '@mantine/core';
import { IconPencil, IconTrash, IconHistory } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { LeadStatusBadge } from './LeadStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getLeadHistory, STATUS_HEX } from '../../hooks/usePipelineHistory';

const FIELD_LABELS = {
  status:      'Status',
  lead_source: 'Lead Source',
  assigned_to: 'Assigned To',
  company_name:'Company',
  lead_name:   'Lead Name',
  deal_value:  'Deal Value',
};

function groupLeads(leads, field) {
  if (!field) return null;
  const map = {};
  leads.forEach(lead => {
    const key = lead[field] || '(None)';
    if (!map[key]) map[key] = [];
    map[key].push(lead);
  });
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

// ── Inline history panel ──────────────────────────────────────────────────────
function HistoryPanel({ leadId }) {
  const history = getLeadHistory(leadId);
  if (history.length === 0) {
    return <Text fz={11} c="dimmed" p="xs">No history recorded.</Text>;
  }
  return (
    <Box p="xs">
      {history.map((entry, i) => {
        const color = STATUS_HEX[entry.to] || '#6b7280';
        return (
          <Group key={entry.id} gap={8} mb={6} wrap="nowrap">
            <Box style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <Text fz={11} fw={600} c="#374151" style={{ minWidth: 100 }}>{entry.to}</Text>
            <Text fz={11} c="#9ca3af">{formatDate(entry.changedAt)}</Text>
            <Text fz={11} c="#9ca3af">· {entry.changedBy}</Text>
          </Group>
        );
      })}
    </Box>
  );
}

// ── Lead row ──────────────────────────────────────────────────────────────────
function LeadRow({ lead, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <>
      <Table.Tr>
        <Table.Td>
          <Anchor onClick={() => navigate(`/leads/${lead.id}`)} style={{ cursor: 'pointer', color: '#628141' }}>
            <Group gap={6} wrap="nowrap" align="center" className="lead-name-cell">
              <span>{lead.lead_name}</span>
              <Text component="span" fz="xs" c="#8BAE66" style={{ opacity: 0, transition: 'opacity 0.15s' }} className="lead-note-hint">
                + Add Note
              </Text>
            </Group>
          </Anchor>
        </Table.Td>
        <Table.Td>{lead.company_name || '—'}</Table.Td>
        <Table.Td><LeadStatusBadge status={lead.status} /></Table.Td>
        <Table.Td>{lead.lead_source || '—'}</Table.Td>
        <Table.Td>{lead.assigned_to || '—'}</Table.Td>
        <Table.Td>{formatCurrency(lead.deal_value)}</Table.Td>
        <Table.Td>{formatDate(lead.updated_at)}</Table.Td>
        <Table.Td>
          <Group gap={4}>
            <ActionIcon
              variant="subtle"
              color={historyOpen ? 'green' : 'gray'}
              title="Pipeline history"
              onClick={() => setHistoryOpen(v => !v)}
            >
              <IconHistory size={15} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="forest" onClick={() => onEdit(lead)}>
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={() => onDelete(lead)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>

      {/* Inline history expand */}
      {historyOpen && (
        <Table.Tr>
          <Table.Td colSpan={8} style={{ background: '#f9fafb', padding: 0 }}>
            <Box style={{ borderLeft: '3px solid #628141', margin: '0 8px 4px 8px', borderRadius: '0 4px 4px 0' }}>
              <HistoryPanel leadId={lead.id} />
            </Box>
          </Table.Td>
        </Table.Tr>
      )}
    </>
  );
}

// ── Main LeadTable ────────────────────────────────────────────────────────────
export function LeadTable({ leads, loading, onEdit, onDelete, groupField }) {
  const groups = groupLeads(leads, groupField);

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} zIndex={10} overlayProps={{ blur: 2 }} />
      {leads.length === 0 && !loading ? (
        <Center py="xl">
          <Text c="dimmed">No leads match your filters</Text>
        </Center>
      ) : (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead style={{ backgroundColor: '#628141' }}>
            <Table.Tr>
              {['Lead Name', 'Company', 'Status', 'Source', 'Assigned To', 'Deal Value', 'Last Updated', 'Actions'].map(h => (
                <Table.Th key={h} style={{ color: '#fff' }}>{h}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {groups ? (
              groups.map(([groupValue, groupLeads]) => (
                <>
                  <Table.Tr key={`group-${groupValue}`}>
                    <Table.Td colSpan={8} style={{ background: 'rgba(98,129,65,0.08)', padding: '8px 12px', borderTop: '2px solid rgba(98,129,65,0.2)' }}>
                      <Group gap={8}>
                        <Text fz={12} fw={700} c="#628141" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {FIELD_LABELS[groupField] || groupField}: {groupValue}
                        </Text>
                        <Badge size="xs" color="green" variant="light">{groupLeads.length}</Badge>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                  {groupLeads.map(lead => (
                    <LeadRow key={lead.id} lead={lead} onEdit={onEdit} onDelete={onDelete} />
                  ))}
                </>
              ))
            ) : (
              leads.map(lead => (
                <LeadRow key={lead.id} lead={lead} onEdit={onEdit} onDelete={onDelete} />
              ))
            )}
          </Table.Tbody>
        </Table>
      )}
    </Box>
  );
}
