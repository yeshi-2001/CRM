import { useState, useEffect, useMemo } from 'react';
import { Stack, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useLeads } from '../hooks/useLeads';
import { leadService } from '../services/leadService';
import { LeadTable } from '../components/leads/LeadTable';
import { DataToolbar } from '../components/leads/DataToolbar';
import { LeadForm } from '../components/leads/LeadForm';
import { ConfirmModal } from '../components/common/ConfirmModal';

export function LeadsPage() {
  const [clientFilters,    setClientFilters]    = useState([]);
  const [filterLogic,      setFilterLogic]      = useState('AND');
  const [debouncedFilters, setDebouncedFilters] = useState({});
  const [serverParams,     setServerParams]     = useState({});
  const [hiddenStatuses,   setHiddenStatuses]   = useState([]);
  const [groupField,       setGroupField]       = useState('');
  const [sortConfig,       setSortConfig]       = useState(null);
  const [selectedLead,     setSelectedLead]     = useState(null);
  const [deleteTarget,     setDeleteTarget]     = useState(null);
  const [deleteError,      setDeleteError]      = useState(null);

  const [formOpened,    { open: openForm,    close: closeForm    }] = useDisclosure(false);
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

  const handleFiltersChange = (payload) => {
    const cf    = payload?.clientFilters || [];
    const logic = payload?.logic || 'AND';
    setClientFilters(cf);
    setFilterLogic(logic);
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilters(serverParams), 300);
    return () => clearTimeout(t);
  }, [serverParams]);

  const { leads, loading, error, refetch } = useLeads(debouncedFilters);

  const handleEdit = (lead) => { setSelectedLead(lead); openForm(); };
  const handleAdd  = ()     => { setSelectedLead(null);  openForm(); };

  const handleDeleteClick   = (lead) => { setDeleteTarget(lead); openConfirm(); };
  const handleDeleteConfirm = async () => {
    try {
      await leadService.remove(deleteTarget.id);
      refetch();
    } catch {
      setDeleteError('Failed to delete lead');
    }
  };

  const displayLeads = useMemo(() => {
    let list = [...leads];

    if (clientFilters.length > 0) {
      list = list.filter(lead => {
        const results = clientFilters.map(f => {
          if (!f.field || !f.operator) return true;

          // Search bar — matches name, company, email
          if (f.operator === 'search') {
            const q = f.value.toLowerCase();
            return (
              lead.lead_name?.toLowerCase().includes(q) ||
              lead.company_name?.toLowerCase().includes(q) ||
              lead.email?.toLowerCase().includes(q)
            );
          }

          const raw  = lead[f.field];
          const val  = String(raw  ?? '').toLowerCase().trim();
          const fval = String(f.value ?? '').toLowerCase().trim();

          if (f.operator === 'is_empty')     return !raw || String(raw).trim() === '';
          if (!fval) return true;
          if (f.operator === 'equals')       return val === fval;
          if (f.operator === 'not_equals')   return val !== fval;
          if (f.operator === 'contains')     return val.includes(fval);
          if (f.operator === 'not_contains') return !val.includes(fval);
          if (f.operator === 'starts_with')  return val.startsWith(fval);
          if (f.operator === 'ends_with')    return val.endsWith(fval);
          if (f.operator === 'gt')  return parseFloat(raw) >  parseFloat(f.value);
          if (f.operator === 'lt')  return parseFloat(raw) <  parseFloat(f.value);
          if (f.operator === 'gte') return parseFloat(raw) >= parseFloat(f.value);
          if (f.operator === 'lte') return parseFloat(raw) <= parseFloat(f.value);
          return true;
        });

        return filterLogic === 'OR'
          ? results.some(Boolean)
          : results.every(Boolean);
      });
    }

    if (hiddenStatuses.length > 0) {
      list = list.filter(l => !hiddenStatuses.includes(l.status));
    }

    if (sortConfig?.field) {
      list = [...list].sort((a, b) => {
        const av = a[sortConfig.field] ?? '';
        const bv = b[sortConfig.field] ?? '';
        const cmp = typeof av === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sortConfig.dir === 'desc' ? -cmp : cmp;
      });
    }

    return list;
  }, [leads, clientFilters, filterLogic, hiddenStatuses, sortConfig]);

  return (
    <Stack gap={0}>
      <DataToolbar
        onFiltersChange={handleFiltersChange}
        onAddLead={handleAdd}
        onHideChange={setHiddenStatuses}
        onGroupChange={setGroupField}
        onSortChange={setSortConfig}
      />

      <Stack gap="md" px="xl" py="md">
        {(error || deleteError) && (
          <Alert color="red" variant="light" withCloseButton onClose={() => setDeleteError(null)}>
            {error || deleteError}
          </Alert>
        )}

        <LeadTable
          leads={displayLeads}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          groupField={groupField}
        />
      </Stack>

      <LeadForm
        opened={formOpened}
        onClose={closeForm}
        lead={selectedLead}
        onSuccess={refetch}
      />

      <ConfirmModal
        opened={confirmOpened}
        onClose={closeConfirm}
        onConfirm={handleDeleteConfirm}
        title="Delete Lead"
        message={`Delete "${deleteTarget?.lead_name}"? This cannot be undone.`}
      />
    </Stack>
  );
}
