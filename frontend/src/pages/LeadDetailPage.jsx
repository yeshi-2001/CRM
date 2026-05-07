import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Text, SimpleGrid, Group, Button, Alert, Stack, Box, Badge, Avatar } from '@mantine/core';
import { IconEdit, IconBuilding, IconMail, IconPhone, IconUser, IconTag, IconCurrencyDollar, IconCalendar, IconClock } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { leadService } from '../services/leadService';
import { useAuth } from '../hooks/useAuth';
import { LeadStatusBadge } from '../components/leads/LeadStatusBadge';
import { LeadNotes } from '../components/leads/LeadNotes';
import { LeadForm } from '../components/leads/LeadForm';
import { PipelineTimeline } from '../components/leads/PipelineTimeline';
import { formatCurrency, formatDate } from '../utils/formatters';
import { initPipelineHistory } from '../hooks/usePipelineHistory';

const CARD = {
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #f0f0f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  padding: 24,
};

function DetailField({ label, value, icon: Icon }) {
  return (
    <Box style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      {Icon && (
        <Box style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(91,124,74,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <Icon size={15} color="#5B7C4A" />
        </Box>
      )}
      <Box>
        <Text fz={11} fw={600} c="#9ca3af" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={2}>{label}</Text>
        <Text fz={13} fw={500} c="#111827">{value || '—'}</Text>
      </Box>
    </Box>
  );
}

export function LeadDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [lead,  setLead]  = useState(null);
  const [error, setError] = useState(null);
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);

  const fetchLead = async () => {
    try {
      const data = await leadService.getById(id);
      setLead(data);
      const all = await leadService.getAll();
      initPipelineHistory(all);
    } catch {
      setError('Failed to load lead');
    }
  };

  useEffect(() => { fetchLead(); }, [id]);

  if (error) return <Alert color="red" variant="light">{error}</Alert>;
  if (!lead)  return <Text c="dimmed">Loading...</Text>;

  const initials = lead.lead_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Box style={{ background: '#F8F9FC', minHeight: '100vh', padding: 32, fontFamily: 'Inter, sans-serif' }}>

      {/* Back button */}
      <Button
        variant="subtle"
        onClick={() => navigate('/leads')}
        mb="lg"
        style={{ color: '#5B7C4A', fontWeight: 500, fontSize: 13, padding: '6px 12px', borderRadius: 8, transition: 'all 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(91,124,74,0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        Back to Leads
      </Button>

      <Grid gutter={24}>
        {/* LEFT — 65% */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap={20}>

            {/* Lead header card */}
            <Box style={CARD}>
              <Group justify="space-between" mb={24} align="flex-start">
                <Group gap={16}>
                  <Avatar size={52} radius={14} style={{ background: 'linear-gradient(135deg, #5B7C4A, #7a9e5a)', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                    {initials}
                  </Avatar>
                  <Box>
                    <Text fw={700} fz={20} c="#111827" style={{ lineHeight: 1.3 }}>{lead.lead_name}</Text>
                    <Group gap={8} mt={4}>
                      <LeadStatusBadge status={lead.status} />
                      {lead.company_name && (
                        <Text fz={13} c="#6b7280">{lead.company_name}</Text>
                      )}
                    </Group>
                  </Box>
                </Group>
                <Button
                  size="sm"
                  leftSection={<IconEdit size={14} />}
                  onClick={openForm}
                  style={{
                    background: '#5B7C4A', color: '#fff', borderRadius: 10,
                    fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(91,124,74,0.3)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#4a6130'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#5B7C4A'}
                >
                  Edit Lead
                </Button>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={20}>
                <DetailField label="Company"     value={lead.company_name} icon={IconBuilding} />
                <DetailField label="Email"       value={lead.email}        icon={IconMail} />
                <DetailField label="Phone"       value={lead.phone}        icon={IconPhone} />
                <DetailField label="Lead Source" value={lead.lead_source}  icon={IconTag} />
                <DetailField label="Assigned To" value={lead.assigned_to}  icon={IconUser} />
                <DetailField label="Deal Value"  value={formatCurrency(lead.deal_value)} icon={IconCurrencyDollar} />
                <DetailField label="Created"     value={formatDate(lead.created_at)}     icon={IconCalendar} />
                <DetailField label="Last Updated" value={formatDate(lead.updated_at)}    icon={IconClock} />
              </SimpleGrid>
            </Box>

            {/* Pipeline Timeline */}
            <PipelineTimeline
              lead={lead}
              currentUser={user?.name || 'Admin'}
              onStatusChange={(newStatus) => setLead(prev => ({ ...prev, status: newStatus }))}
            />
          </Stack>
        </Grid.Col>

        {/* RIGHT — 35% */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Box style={CARD}>
            <LeadNotes leadId={lead.id} currentUser={user?.name || 'Unknown'} />
          </Box>
        </Grid.Col>
      </Grid>

      <LeadForm
        opened={formOpened}
        onClose={closeForm}
        lead={lead}
        onSuccess={() => { fetchLead(); closeForm(); }}
      />
    </Box>
  );
}
