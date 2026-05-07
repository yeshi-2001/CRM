import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Box, Group, Text, Button, ActionIcon, Badge,
  UnstyledButton, TextInput, Stack, Divider,
} from '@mantine/core';
import { IconFilter, IconPlus, IconX, IconChevronDown, IconCheck } from '@tabler/icons-react';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../utils/constants';

const ASSIGNEES    = ['Sarah Chen', 'Mike Torres', 'Priya Nair'];
const DEAL_OPTIONS = ['1000', '5000', '10000', '25000', '50000', '100000', '150000'];

const FIELDS = [
  { value: 'lead_name',    label: 'Lead Name',   type: 'text',   options: null         },
  { value: 'company_name', label: 'Company',     type: 'text',   options: null         },
  { value: 'email',        label: 'Email',       type: 'text',   options: null         },
  { value: 'phone',        label: 'Phone',       type: 'text',   options: null         },
  { value: 'status',       label: 'Status',      type: 'select', options: LEAD_STATUSES },
  { value: 'lead_source',  label: 'Lead Source', type: 'select', options: LEAD_SOURCES  },
  { value: 'assigned_to',  label: 'Assigned To', type: 'select', options: ASSIGNEES     },
  { value: 'deal_value',   label: 'Deal Value',  type: 'number', options: DEAL_OPTIONS  },
];

const OPERATORS = {
  text: [
    { value: 'contains',     label: 'contains'         },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'equals',       label: 'equals'           },
    { value: 'not_equals',   label: 'does not equal'   },
    { value: 'starts_with',  label: 'starts with'      },
    { value: 'ends_with',    label: 'ends with'        },
    { value: 'is_empty',     label: 'is empty'         },
  ],
  select: [
    { value: 'equals',     label: 'is'       },
    { value: 'not_equals', label: 'is not'   },
    { value: 'is_empty',   label: 'is empty' },
  ],
  number: [
    { value: 'equals',   label: 'equals'        },
    { value: 'gt',       label: 'greater than'  },
    { value: 'lt',       label: 'less than'     },
    { value: 'gte',      label: '>= (at least)' },
    { value: 'lte',      label: '<= (at most)'  },
    { value: 'is_empty', label: 'is empty'      },
  ],
};

function getFieldDef(v) { return FIELDS.find(f => f.value === v) || FIELDS[0]; }
function getDefaultOp(type) { return OPERATORS[type]?.[0]?.value || 'contains'; }

// ── Portal dropdown — renders list directly on document.body ──────────────────
function PortalSelect({ value, options = [], onChange, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const menuId = useRef(`pm-${Math.random().toString(36).slice(2)}`).current;

  const selected = options.find(o => o.value === value);

  const openMenu = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const listH = Math.min(options.length * 36 + 8, 240);
    const top = window.innerHeight - r.bottom < listH ? r.top - listH - 4 : r.bottom + 4;
    setPos({ top, left: r.left, width: Math.max(r.width, 180) });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const menu = document.getElementById(menuId);
      if (menu && menu.contains(e.target)) return;
      if (triggerRef.current && triggerRef.current.contains(e.target)) return;
      setOpen(false);
    };
    // use capture so we get the event before anything else closes the panel
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [open, menuId]);

  return (
    <Box style={{ flex: 1, minWidth: 0 }}>
      <UnstyledButton
        ref={triggerRef}
        onClick={() => open ? setOpen(false) : openMenu()}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '6px 10px',
          borderRadius: 6, border: '1px solid #dee2e6',
          background: '#fff', cursor: 'pointer', transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#628141'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#dee2e6'}
      >
        <Text fz={12} c={selected ? '#1B211A' : '#aaa'}
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {selected ? selected.label : placeholder}
        </Text>
        <IconChevronDown size={12} color="#888"
          style={{ flexShrink: 0, marginLeft: 4, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </UnstyledButton>

      {open && createPortal(
        <Box
          id={menuId}
          style={{
            position: 'fixed',
            top: pos.top, left: pos.left, width: pos.width,
            zIndex: 999999,
            background: '#fff',
            border: '1px solid #d0d0d0',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            maxHeight: 240, overflowY: 'auto',
            padding: '4px 0',
          }}
        >
          {options.map(opt => (
            <UnstyledButton
              key={opt.value}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(opt.value);
                setOpen(false);
              }}
              style={{
                width: '100%', padding: '8px 14px', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: opt.value === value ? 'rgba(98,129,65,0.1)' : 'transparent',
                color: opt.value === value ? '#628141' : '#222',
                fontWeight: opt.value === value ? 600 : 400,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { if (opt.value !== value) e.currentTarget.style.background = '#f0f0f0'; }}
              onMouseLeave={(e) => { if (opt.value !== value) e.currentTarget.style.background = 'transparent'; }}
            >
              {opt.label}
              {opt.value === value && <IconCheck size={13} color="#628141" />}
            </UnstyledButton>
          ))}
        </Box>,
        document.body
      )}
    </Box>
  );
}

// ── Filter row ────────────────────────────────────────────────────────────────
function FilterRow({ filter, index, onUpdate, onRemove }) {
  const fieldDef    = getFieldDef(filter.field);
  const opOptions   = (OPERATORS[fieldDef.type] || OPERATORS.text).map(o => ({ value: o.value, label: o.label }));
  const fieldOptions = FIELDS.map(f => ({ value: f.value, label: f.label }));
  const needsValue  = filter.operator !== 'is_empty';

  const valueOptions = fieldDef.options
    ? fieldDef.options.map(o => ({ value: String(o), label: String(o) }))
    : null;

  return (
    <Group gap={6} wrap="nowrap" align="center">
      <Text fz={11} c="dimmed" fw={500} style={{ width: 40, flexShrink: 0, textAlign: 'right' }}>
        {index === 0 ? 'Where' : 'And'}
      </Text>

      {/* Field */}
      <PortalSelect
        value={filter.field}
        options={fieldOptions}
        onChange={(val) => {
          const def = getFieldDef(val);
          onUpdate(filter.id, { field: val, operator: getDefaultOp(def.type), value: '' });
        }}
        placeholder="Field"
      />

      {/* Operator */}
      <PortalSelect
        value={filter.operator}
        options={opOptions}
        onChange={(val) => onUpdate(filter.id, { operator: val, value: '' })}
        placeholder="Operator"
      />

      {/* Value */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        {!needsValue ? (
          <Box style={{
            height: 34, display: 'flex', alignItems: 'center',
            padding: '0 10px', borderRadius: 6,
            border: '1px solid #f0f0f0', background: '#fafafa',
          }}>
            <Text fz={11} c="dimmed">—</Text>
          </Box>
        ) : valueOptions ? (
          <PortalSelect
            value={filter.value}
            options={valueOptions}
            onChange={(val) => onUpdate(filter.id, { value: val })}
            placeholder="Select value..."
          />
        ) : (
          <TextInput
            size="xs"
            placeholder="Enter value..."
            value={filter.value}
            onChange={(e) => onUpdate(filter.id, { value: e.target.value })}
            styles={{ input: { fontSize: 12, height: 34 } }}
          />
        )}
      </Box>

      <ActionIcon size={26} variant="subtle" color="red" onClick={() => onRemove(filter.id)}>
        <IconX size={13} />
      </ActionIcon>
    </Group>
  );
}

// ── Main FilterPanel ──────────────────────────────────────────────────────────
export function FilterPanel({ onApply }) {
  const [open,     setOpen]     = useState(false);
  const [filters,  setFilters]  = useState([]);
  const [logic,    setLogic]    = useState('AND');
  const [applied,  setApplied]  = useState([]);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const btnRef   = useRef(null);
  const panelRef = useRef(null);
  const panelId  = 'filter-panel-root';

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const panel = document.getElementById(panelId);
      if (panel && panel.contains(e.target)) return;
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      // also ignore any portal menu
      if (e.target.closest('[id^="pm-"]')) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [open]);

  const openPanel = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPanelPos({ top: r.bottom + 6, left: r.left });
    }
    setOpen(v => !v);
  };

  const addFilter = () => setFilters(p => [...p, {
    id: Date.now(), field: 'status', operator: 'equals', value: '',
  }]);

  const updateFilter = (id, changes) =>
    setFilters(p => p.map(f => f.id === id ? { ...f, ...changes } : f));

  const removeFilter = (id) => {
    setFilters(p => {
      const next = p.filter(f => f.id !== id);
      if (next.length === 0) { setApplied([]); onApply({ filters: [], logic }); }
      return next;
    });
  };

  const handleApply = () => {
    const valid = filters.filter(f =>
      f.field && f.operator && (f.operator === 'is_empty' || f.value !== '')
    );
    setApplied(valid);
    onApply({ filters: valid, logic });
    setOpen(false);
  };

  const handleReset = () => {
    setFilters([]); setApplied([]);
    onApply({ filters: [], logic });
    setOpen(false);
  };

  return (
    <>
      {/* Filter button */}
      <UnstyledButton
        ref={btnRef}
        onClick={openPanel}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 9px', borderRadius: 6, cursor: 'pointer',
          background: open || applied.length > 0 ? 'rgba(98,129,65,0.1)' : 'transparent',
          transition: 'all 0.15s', position: 'relative',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(98,129,65,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = open || applied.length > 0 ? 'rgba(98,129,65,0.1)' : 'transparent'}
      >
        <IconFilter size={15} color={applied.length > 0 ? '#628141' : '#555'} />
        <Text fz={12} fw={applied.length > 0 ? 600 : 400} c={applied.length > 0 ? '#628141' : '#444'}>Filter</Text>
        {applied.length > 0 && (
          <Box style={{
            position: 'absolute', top: 1, right: 1,
            width: 14, height: 14, borderRadius: '50%',
            background: '#628141', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text fz={9} c="#fff" fw={700}>{applied.length}</Text>
          </Box>
        )}
      </UnstyledButton>

      {/* Panel — portaled to body so nothing clips it */}
      {open && createPortal(
        <Box
          id={panelId}
          ref={panelRef}
          style={{
            position: 'fixed',
            top: panelPos.top, left: panelPos.left,
            zIndex: 99998,
            width: 600,
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: 10,
            boxShadow: '0 10px 40px rgba(0,0,0,0.16)',
          }}
        >
          {/* Header */}
          <Group justify="space-between" px="md" py="sm"
            style={{ borderBottom: '1px solid #f0f0f0' }}>
            <Group gap={8}>
              <IconFilter size={15} color="#628141" />
              <Text fw={600} fz={13} c="#1B211A">Filter</Text>
              {applied.length > 0 && (
                <Badge size="xs" color="green" variant="light">{applied.length} active</Badge>
              )}
            </Group>
            <Group gap={6}>
              {filters.length > 1 && (
                <Group gap={0} style={{ border: '1px solid #e0e0e0', borderRadius: 6, overflow: 'hidden' }}>
                  {['AND', 'OR'].map(l => (
                    <UnstyledButton key={l} onClick={() => setLogic(l)}
                      style={{
                        padding: '3px 10px', fontSize: 11, fontWeight: 600,
                        background: logic === l ? '#628141' : 'transparent',
                        color: logic === l ? '#fff' : '#666',
                        transition: 'all 0.15s',
                      }}
                    >{l}</UnstyledButton>
                  ))}
                </Group>
              )}
              <ActionIcon size={22} variant="subtle" onClick={() => setOpen(false)}>
                <IconX size={14} />
              </ActionIcon>
            </Group>
          </Group>

          {/* Rows */}
          <Box px="md" py="sm">
            {filters.length === 0 ? (
              <Text fz={12} c="dimmed" py="xs">No filters yet. Click "Add Filter" to start.</Text>
            ) : (
              <Stack gap={8}>
                {filters.map((f, i) => (
                  <FilterRow key={f.id} filter={f} index={i}
                    onUpdate={updateFilter} onRemove={removeFilter} />
                ))}
              </Stack>
            )}
          </Box>

          <Divider color="#f0f0f0" />

          {/* Footer */}
          <Group justify="space-between" px="md" py="sm">
            <Button size="xs" variant="subtle" leftSection={<IconPlus size={13} />}
              onClick={addFilter} style={{ color: '#628141' }}>
              Add Filter
            </Button>
            <Group gap={8}>
              {filters.length > 0 && (
                <Button size="xs" variant="subtle" color="red" onClick={handleReset}>Clear All</Button>
              )}
              <Button size="xs" onClick={handleApply} disabled={filters.length === 0}
                style={{ background: '#628141', color: '#fff' }}>
                Apply
              </Button>
            </Group>
          </Group>
        </Box>,
        document.body
      )}

      <style>{`
        @keyframes fpSlide { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </>
  );
}

// ── Active chips bar ──────────────────────────────────────────────────────────
export function ActiveFilterChips({ filters, logic, onRemove, onClearAll }) {
  if (filters.length === 0) return null;
  return (
    <Box style={{
      background: '#fafafa', borderBottom: '1px solid #e8e8e8',
      padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
    }}>
      <Text fz={11} c="dimmed" mr={2}>Filters:</Text>
      {filters.length > 1 && (
        <Badge size="xs" color="gray" variant="outline" style={{ fontSize: 10 }}>{logic}</Badge>
      )}
      {filters.map(f => {
        const fd  = FIELDS.find(x => x.value === f.field);
        const op  = Object.values(OPERATORS).flat().find(o => o.value === f.operator);
        return (
          <Badge key={f.id} size="sm" variant="light" color="green"
            rightSection={
              <ActionIcon size={12} variant="transparent" onClick={() => onRemove(f.id)}>
                <IconX size={9} />
              </ActionIcon>
            }
            style={{ textTransform: 'none', fontWeight: 500, cursor: 'default' }}
          >
            {fd?.label} {op?.label}{f.operator !== 'is_empty' ? ` "${f.value}"` : ''}
          </Badge>
        );
      })}
      <UnstyledButton onClick={onClearAll} style={{ fontSize: 11, color: '#888', textDecoration: 'underline' }}>
        Clear all
      </UnstyledButton>
    </Box>
  );
}
