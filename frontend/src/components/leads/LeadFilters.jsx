import { Group, Select, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../utils/constants';

export function LeadFilters({ filters, onChange }) {
  const statusOptions = [{ value: '', label: 'All Statuses' }, ...LEAD_STATUSES.map(s => ({ value: s, label: s }))];
  const sourceOptions = [{ value: '', label: 'All Sources' }, ...LEAD_SOURCES.map(s => ({ value: s, label: s }))];
  const assigneeOptions = [
    { value: '', label: 'All Assignees' },
    { value: 'Sarah Chen', label: 'Sarah Chen' },
    { value: 'Mike Torres', label: 'Mike Torres' },
    { value: 'Priya Nair', label: 'Priya Nair' },
  ];

  return (
    <Group gap="sm" wrap="wrap">
      <Select
        placeholder="Status"
        data={statusOptions}
        value={filters.status || ''}
        onChange={(v) => onChange({ ...filters, status: v || undefined })}
        clearable
        style={{ minWidth: 150 }}
      />
      <Select
        placeholder="Lead Source"
        data={sourceOptions}
        value={filters.source || ''}
        onChange={(v) => onChange({ ...filters, source: v || undefined })}
        clearable
        style={{ minWidth: 150 }}
      />
      <Select
        placeholder="Assigned To"
        data={assigneeOptions}
        value={filters.assigned_to || ''}
        onChange={(v) => onChange({ ...filters, assigned_to: v || undefined })}
        clearable
        style={{ minWidth: 160 }}
      />
      <TextInput
        placeholder="Search name, company, email..."
        leftSection={<IconSearch size={16} />}
        value={filters.search || ''}
        onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
        style={{ minWidth: 240 }}
      />
    </Group>
  );
}
