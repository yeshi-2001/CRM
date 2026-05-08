import { useEffect, useState, useCallback } from 'react';
import {
  SimpleGrid, Paper, Text, Alert, Stack, Group,
  Box, Avatar, Progress, Table, Skeleton, Button, Badge, Select,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconTrendingUp, IconCurrencyDollar } from '@tabler/icons-react';
import api from '../services/api';
import { StatCard } from '../components/dashboard/StatCard';
import { PipelineBar } from '../components/dashboard/PipelineBar';
import { LeadStatusBadge } from '../components/leads/LeadStatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calcAvgTimeToClose, calcStageVelocity } from '../hooks/usePipelineHistory';

// ── Monthly bar chart ─────────────────────────────────────────────────────────
function MonthlyChart({ data }) {
  if (!data || data.length === 0) return (
    <Box py="xl" style={{ textAlign: 'center' }}>
      <Text fz={12} c="#9ca3af">No data for the last 6 months</Text>
    </Box>
  );
  const maxTotal = Math.max(...data.map(d => d.total), 1);

  return (
    <Box>
      <Group gap="lg" mb="lg">
        <Group gap={6}>
          <Box style={{ width: 12, height: 12, borderRadius: 3, background: '#628141' }} />
          <Text fz={12} c="#6b7280" fw={500}>Total Leads</Text>
        </Group>
        <Group gap={6}>
          <Box style={{ width: 12, height: 12, borderRadius: 3, background: '#16a34a' }} />
          <Text fz={12} c="#6b7280" fw={500}>Won</Text>
        </Group>
      </Group>
      <Group gap={12} align="flex-end" style={{ height: 160 }}>
        {data.map((d) => {
          const totalH = Math.round((d.total / maxTotal) * 130);
          const wonH   = Math.round((d.won   / maxTotal) * 130);
          return (
            <Box key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Text fz={11} c="#628141" fw={700}>{d.total}</Text>
              <Box style={{ width: '100%', display: 'flex', gap: 3, alignItems: 'flex-end', height: 130 }}>
                <Box style={{
                  flex: 1, height: totalH, background: 'linear-gradient(180deg, #8bae66, #628141)',
                  borderRadius: '4px 4px 0 0', minHeight: d.total > 0 ? 6 : 0,
                  boxShadow: '0 2px 6px rgba(98,129,65,0.3)',
                }} />
                <Box style={{
                  flex: 1, height: wonH, background: 'linear-gradient(180deg, #22c55e, #16a34a)',
                  borderRadius: '4px 4px 0 0', minHeight: d.won > 0 ? 6 : 0,
                  boxShadow: '0 2px 6px rgba(22,163,74,0.3)',
                }} />
              </Box>
              <Text fz={10} c="#9ca3af" ta="center" style={{ whiteSpace: 'nowrap' }}>{d.month}</Text>
            </Box>
          );
        })}
      </Group>
    </Box>
  );
}

// ── Salesperson row ───────────────────────────────────────────────────────────
function SalespersonRow({ person, maxValue, rank }) {
  const pct      = maxValue > 0 ? (parseFloat(person.won_value) / maxValue) * 100 : 0;
  const initials = person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isTop    = rank === 0;

  return (
    <Box
      p="sm" mb="xs" style={{
        borderRadius: 10,
        background: isTop ? 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))' : '#fafafa',
        border: isTop ? '1px solid rgba(251,191,36,0.4)' : '1px solid #f0f0f0',
        transition: 'all 0.15s',
      }}
    >
      <Group justify="space-between" mb={6}>
        <Group gap={10}>
          <Box style={{ position: 'relative' }}>
            <Avatar size={34} radius="xl" style={{
              background: isTop ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#628141',
              color: '#fff', fontWeight: 700, fontSize: 12,
            }}>
              {initials}
            </Avatar>
            {isTop && (
              <Box style={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16, borderRadius: '50%',
                background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: '#fff', fontWeight: 800,
              }}>
                #1
              </Box>
            )}
          </Box>
          <Box>
            <Text fz={13} fw={700} c="#111827">{person.name}</Text>
            <Text fz={11} c="#9ca3af">{person.won_leads} won · {person.total_leads} total leads</Text>
          </Box>
        </Group>
        <Box style={{ textAlign: 'right' }}>
          <Text fz={14} fw={800} c={isTop ? '#d97706' : '#16a34a'}>{formatCurrency(person.won_value)}</Text>
          <Text fz={10} c="#9ca3af">won value</Text>
        </Box>
      </Group>
      <Progress
        value={pct} size={5} radius="xl"
        color={isTop ? 'yellow' : 'green'}
        style={{ background: '#e5e7eb' }}
      />
    </Box>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export function DashboardPage() {
  const navigate = useNavigate();
  const [stats,       setStats]       = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [topSales,    setTopSales]    = useState([]);
  const [monthly,     setMonthly]     = useState([]);
  const [avgClose,    setAvgClose]    = useState(null);
  const [stageVel,    setStageVel]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r, t, m] = await Promise.allSettled([
        api.get('/api/dashboard/stats'),
        api.get('/api/dashboard/recent-leads'),
        api.get('/api/dashboard/top-sales'),
        api.get('/api/dashboard/monthly'),
      ]);
      if (s.status === 'fulfilled') setStats(s.value.data);
      if (r.status === 'fulfilled') setRecentLeads(r.value.data);
      if (t.status === 'fulfilled') setTopSales(t.value.data);
      if (m.status === 'fulfilled') setMonthly(m.value.data);
      if (s.status === 'rejected') setError('Failed to load dashboard stats');
      // Fetch analytics async separately
      calcAvgTimeToClose().then(setAvgClose).catch(() => {});
      calcStageVelocity().then(setStageVel).catch(() => {});
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    window.addEventListener('focus', fetchAll);
    return () => window.removeEventListener('focus', fetchAll);
  }, [fetchAll]);

  if (error) return <Alert color="red" variant="light">{error}</Alert>;

  const maxWonValue = Math.max(...topSales.map(s => parseFloat(s.won_value)), 1);

  return (
    <Stack gap="xl" px="xl" py="lg">

      {/* ── Page header with date filter ── */}
      <Group justify="space-between" align="center">
        <Box>
          <Text fw={800} fz={22} c="#111827">Sales Dashboard</Text>
          <Text fz={13} c="#9ca3af" mt={2}>Track your pipeline and team performance</Text>
        </Box>
        <Select
          size="xs"
          defaultValue="all"
          data={[
            { value: 'all',    label: 'All Time'     },
            { value: '30',     label: 'Last 30 Days' },
            { value: 'month',  label: 'This Month'   },
          ]}
          style={{ width: 140 }}
          styles={{ input: { fontSize: 12, borderRadius: 8 } }}
        />
      </Group>

      {/* ── KPI stat cards ── */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        {loading
          ? Array(7).fill(0).map((_, i) => <Skeleton key={i} height={90} radius="lg" />)
          : <>
              <StatCard label="Total Leads"   value={stats?.total         ?? '—'} />
              <StatCard label="New"           value={stats?.new           ?? '—'} />
              <StatCard label="Contacted"     value={stats?.contacted     ?? '—'} />
              <StatCard label="Qualified"     value={stats?.qualified     ?? '—'} />
              <StatCard label="Won"           value={stats?.won           ?? '—'} />
              <StatCard label="Lost"          value={stats?.lost          ?? '—'} />
              <StatCard label="Proposal Sent" value={stats?.proposal_sent ?? '—'} />
            </>
        }
      </SimpleGrid>

      {/* ── Value cards ── */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Paper p="lg" radius="lg" style={{
          background: 'linear-gradient(135deg, #3a5a20, #628141)',
          boxShadow: '0 4px 20px rgba(98,129,65,0.4)',
          color: '#fff',
        }}>
          {loading ? <Skeleton height={50} /> : (
            <Group justify="space-between" align="flex-start">
              <Box>
                <Text fz={12} c="rgba(255,255,255,0.7)" fw={500} mb={4} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Total Pipeline Value
                </Text>
                <Text fz={28} fw={800} c="#fff">{stats ? formatCurrency(stats.total_deal_value) : '—'}</Text>
                <Text fz={11} c="rgba(255,255,255,0.6)" mt={4}>All active leads combined</Text>
              </Box>
              <Box style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10 }}>
                <IconTrendingUp size={24} color="#fff" />
              </Box>
            </Group>
          )}
        </Paper>

        <Paper p="lg" radius="lg" style={{
          background: 'linear-gradient(135deg, #15803d, #16a34a)',
          boxShadow: '0 4px 20px rgba(22,163,74,0.35)',
          color: '#fff',
        }}>
          {loading ? <Skeleton height={50} /> : (
            <Group justify="space-between" align="flex-start">
              <Box>
                <Text fz={12} c="rgba(255,255,255,0.7)" fw={500} mb={4} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Total Won Value
                </Text>
                <Text fz={28} fw={800} c="#fff">{stats ? formatCurrency(stats.won_deal_value) : '—'}</Text>
                <Text fz={11} c="rgba(255,255,255,0.6)" mt={4}>Closed deals revenue</Text>
              </Box>
              <Box style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10 }}>
                <IconCurrencyDollar size={24} color="#fff" />
              </Box>
            </Group>
          )}
        </Paper>
      </SimpleGrid>

      {/* ── Pipeline bar ── */}
      {loading ? <Skeleton height={100} radius="lg" /> : <PipelineBar stats={stats} />}

      {/* ── Pipeline analytics stat cards ── */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Paper p="md" radius="lg" style={{ background: '#fff', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0', borderTop: '3px solid #628141' }}>
          <Text fz={11} fw={600} c="#9ca3af" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={4}>Avg. Time to Close</Text>
          <Text fz={26} fw={800} c="#628141">
            {avgClose !== null ? `${avgClose} days` : '—'}
          </Text>
          <Text fz={11} c="#9ca3af" mt={2}>Average days from created to Won</Text>
        </Paper>
        <Paper p="md" radius="lg" style={{ background: '#fff', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0', borderTop: '3px solid #d97706' }}>
          <Text fz={11} fw={600} c="#9ca3af" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }} mb={4}>Stage Velocity</Text>
          <Text fz={18} fw={800} c="#d97706">
            {stageVel ? `Most time in: ${stageVel}` : '—'}
          </Text>
          <Text fz={11} c="#9ca3af" mt={2}>Stage where leads spend the most time</Text>
        </Paper>
      </SimpleGrid>

      {/* ── Monthly chart + Top salespeople ── */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">

        <Paper p="lg" radius="lg" style={{ background: '#fff', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
          <Group justify="space-between" mb="lg">
            <Box>
              <Text fw={700} fz={15} c="#111827">Monthly Leads</Text>
              <Text fz={12} c="#9ca3af">Last 6 months</Text>
            </Box>
          </Group>
          {loading ? <Skeleton height={160} radius="md" /> : <MonthlyChart data={monthly} />}
        </Paper>

        <Paper p="lg" radius="lg" style={{ background: '#fff', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
          <Group justify="space-between" mb="lg">
            <Box>
              <Text fw={700} fz={15} c="#111827">Top Salespeople</Text>
              <Text fz={12} c="#9ca3af">Ranked by won value</Text>
            </Box>
            <Badge size="sm" color="yellow" variant="light">🏆 Leaderboard</Badge>
          </Group>
          {loading
            ? Array(3).fill(0).map((_, i) => <Skeleton key={i} height={60} radius="md" mb="xs" />)
            : topSales.length === 0
              ? <Text fz={12} c="#9ca3af">No data yet</Text>
              : topSales.map((p, i) => (
                  <SalespersonRow key={p.name} person={p} maxValue={maxWonValue} rank={i} />
                ))
          }
        </Paper>
      </SimpleGrid>

      {/* ── Recent leads ── */}
      <Paper p="lg" radius="lg" style={{ background: '#fff', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
        <Group justify="space-between" mb="lg">
          <Box>
            <Text fw={700} fz={15} c="#111827">Recent Leads</Text>
            <Text fz={12} c="#9ca3af">Latest 5 leads added</Text>
          </Box>
          <Button
            size="xs" variant="light" color="green"
            onClick={() => navigate('/leads')}
            style={{ fontWeight: 600, borderRadius: 8 }}
          >
            View all
          </Button>
        </Group>

        {loading ? (
          <Skeleton height={140} radius="md" />
        ) : recentLeads.length === 0 ? (
          <Text fz={12} c="#9ca3af">No leads yet</Text>
        ) : (
          <Table highlightOnHover style={{ fontSize: 13 }}>
            <Table.Thead>
              <Table.Tr style={{ background: '#f9fafb' }}>
                {['Lead Name', 'Company', 'Status', 'Deal Value', 'Assigned To', 'Created'].map(h => (
                  <Table.Th key={h} style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    {h}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {recentLeads.map(lead => (
                <Table.Tr
                  key={lead.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <Table.Td>
                    <Group gap={8}>
                      <Avatar size={28} radius="xl" style={{ background: '#628141', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                        {lead.lead_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Text fz={13} fw={600} c="#111827">{lead.lead_name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td><Text fz={12} c="#6b7280">{lead.company_name || '—'}</Text></Table.Td>
                  <Table.Td><LeadStatusBadge status={lead.status} /></Table.Td>
                  <Table.Td><Text fz={13} fw={600} c="#111827">{formatCurrency(lead.deal_value)}</Text></Table.Td>
                  <Table.Td><Text fz={12} c="#6b7280">{lead.assigned_to || '—'}</Text></Table.Td>
                  <Table.Td><Text fz={12} c="#9ca3af">{formatDate(lead.created_at)}</Text></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

    </Stack>
  );
}
