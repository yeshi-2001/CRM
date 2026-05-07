import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Box, Group, Text, Tooltip, UnstyledButton, Divider,
  TextInput, ActionIcon, Stack, Paper, Button,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconMenu2, IconEyeOff, IconLayoutGrid, IconChevronDown,
  IconLayoutRows, IconArrowsSort,
  IconRowInsertBottom, IconSearch, IconShare, IconPlus,
  IconX, IconCheck, IconDotsVertical,
} from '@tabler/icons-react';
import { LEAD_STATUSES } from '../../utils/constants';
import { FilterPanel, ActiveFilterChips } from './FilterPanel';

const SORT_FIELDS = [
  { value: '',             label: 'None'        },
  { value: 'lead_name',    label: 'Lead Name'   },
  { value: 'company_name', label: 'Company'     },
  { value: 'status',       label: 'Status'      },
  { value: 'lead_source',  label: 'Lead Source' },
  { value: 'assigned_to',  label: 'Assigned To' },
  { value: 'deal_value',   label: 'Deal Value'  },
];

const GROUP_FIELDS = [
  { value: '',             label: 'None'        },
  { value: 'status',       label: 'Status'      },
  { value: 'lead_source',  label: 'Lead Source' },
  { value: 'assigned_to',  label: 'Assigned To' },
];

const ROW_HEIGHTS = ['Compact', 'Medium', 'Large'];

const TP = { color: 'dark', position: 'bottom', withArrow: true, openDelay: 300 };

// Portal-based select — never clipped by parent overflow
function FixedSelect({ label, data, value, onChange, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef(null);
  const safeData = data || [];
  const selected = safeData.find(d => d.value === value);

  const openMenu = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      const listH = Math.min(safeData.length * 36, 240);
      const top = window.innerHeight - r.bottom < listH ? r.top - listH - 4 : r.bottom + 2;
      setPos({ top, left: r.left, width: Math.max(r.width, 160) });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!ref.current?.contains(e.target) && !e.target.closest('[data-portal-menu]')) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <Box style={{ position: 'relative' }}>
      {label && <Text fz={11} fw={500} c="#555" mb={4}>{label}</Text>}
      <UnstyledButton
        ref={ref}
        onClick={() => open ? setOpen(false) : openMenu()}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 10px', borderRadius: 6, border: '1px solid #dee2e6',
          background: '#fff', fontSize: 12, cursor: 'pointer', transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#628141'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#dee2e6'}
      >
        <Text fz={12} c={selected ? '#1B211A' : '#aaa'}>{selected ? selected.label : placeholder}</Text>
        <IconChevronDown size={12} color="#888" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </UnstyledButton>
      {open && safeData.length > 0 && createPortal(
        <Box data-portal-menu="true" style={{
          position: 'fixed', top: pos.top, left: pos.left, width: pos.width,
          zIndex: 99999, background: '#fff', border: '1px solid #dee2e6',
          borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          maxHeight: 240, overflowY: 'auto', animation: 'slideDown 0.12s ease',
        }}>
          {safeData.map(opt => (
            <UnstyledButton key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                width: '100%', padding: '8px 12px', fontSize: 12, display: 'block',
                background: opt.value === value ? 'rgba(98,129,65,0.1)' : 'transparent',
                color: opt.value === value ? '#628141' : '#333',
                fontWeight: opt.value === value ? 600 : 400,
                cursor: 'pointer', transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { if (opt.value !== value) e.currentTarget.style.background = '#f5f5f5'; }}
              onMouseLeave={(e) => { if (opt.value !== value) e.currentTarget.style.background = 'transparent'; }}
            >
              {opt.label}
            </UnstyledButton>
          ))}
        </Box>,
        document.body
      )}
    </Box>
  );
}

function ToolBtn({ icon: Icon, label, active, onClick, badge }) {
  const [hov, setHov] = useState(false);
  return (
    <Tooltip label={label} {...TP}>
      <UnstyledButton onClick={onClick}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 9px', borderRadius: 6, position: 'relative',
          background: hov || active ? 'rgba(98,129,65,0.1)' : 'transparent',
          transition: 'all 0.15s ease', cursor: 'pointer',
        }}
      >
        <Icon size={15} color={active ? '#628141' : '#555'} />
        <Text fz={12} fw={active ? 600 : 400} c={active ? '#628141' : '#444'} style={{ whiteSpace: 'nowrap' }}>{label}</Text>
        {badge > 0 && (
          <Box style={{ position: 'absolute', top: 2, right: 2, width: 14, height: 14, borderRadius: '50%', background: '#628141', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text fz={9} c="#fff" fw={700}>{badge}</Text>
          </Box>
        )}
      </UnstyledButton>
    </Tooltip>
  );
}

function VDivider() {
  return <Box style={{ width: 1, height: 20, background: '#e0e0e0', margin: '0 4px', flexShrink: 0 }} />;
}

function FloatingPanel({ anchorRef, open, width = 240, children }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (open && anchorRef?.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: Math.min(r.left, window.innerWidth - width - 8) });
    }
  }, [open]);
  if (!open) return null;
  return (
    <Paper shadow="md" radius="md" data-floating-panel="true"
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, width, background: '#fff', border: '1px solid #e8e8e8', animation: 'slideDown 0.15s ease' }}
    >
      {children}
    </Paper>
  );
}

export function DataToolbar({ onFiltersChange, onAddLead, onHideChange, onGroupChange, onSortChange }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const [openPanel,      setOpenPanel]      = useState(null);
  const [hiddenStatuses, setHiddenStatuses] = useState([]);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchVal,      setSearchVal]      = useState('');
  const [rowHeight,      setRowHeight]      = useState('Medium');
  const [sortField,      setSortField]      = useState('');
  const [sortDir,        setSortDir]        = useState('asc');
  const [groupField,     setGroupField]     = useState('');
  const [appliedGroup,   setAppliedGroup]   = useState('');
  const [activeFilters,  setActiveFilters]  = useState([]);
  const [filterLogic,    setFilterLogic]    = useState('AND');

  const viewsRef  = useRef(null);
  const hideRef   = useRef(null);
  const groupRef  = useRef(null);
  const sortRef   = useRef(null);
  const heightRef = useRef(null);
  const moreRef   = useRef(null);
  const searchRef = useRef(null);

  const toggle = (name) => setOpenPanel(p => p === name ? null : name);

  useEffect(() => {
    function onDown(e) {
      if (e.target.closest('[data-floating-panel]') || e.target.closest('[data-portal-menu]')) return;
      const btnRefs = [viewsRef, hideRef, groupRef, sortRef, heightRef, moreRef];
      if (!btnRefs.some(r => r.current?.contains(e.target))) setOpenPanel(null);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // Emit filter changes whenever search or filters change
  useEffect(() => {
    const searchFilter = searchVal
      ? [{ id: '_search', field: '_search', operator: 'search', value: searchVal }]
      : [];
    onFiltersChange({
      clientFilters: [...activeFilters, ...searchFilter],
      logic: filterLogic,
    });
  }, [searchVal, activeFilters, filterLogic]);

  const handleFilterApply = ({ filters, logic }) => {
    setActiveFilters(filters);
    setFilterLogic(logic);
  };

  const handleRemoveChip = (id) => {
    const next = activeFilters.filter(f => f.id !== id);
    setActiveFilters(next);
  };

  const handleClearAll = () => setActiveFilters([]);

  const toggleStatus = (status) => {
    const next = hiddenStatuses.includes(status)
      ? hiddenStatuses.filter(s => s !== status)
      : [...hiddenStatuses, status];
    setHiddenStatuses(next);
    onHideChange?.(next);
  };

  const applyGroup = () => { setAppliedGroup(groupField); onGroupChange?.(groupField); setOpenPanel(null); };
  const clearGroup = () => { setGroupField(''); setAppliedGroup(''); onGroupChange?.(''); setOpenPanel(null); };

  const TOOLS = [
    { key: 'hide',   label: 'Hide',       Icon: IconEyeOff,          btnRef: hideRef,   active: hiddenStatuses.length > 0, badge: hiddenStatuses.length },
    { key: 'group',  label: 'Group',      Icon: IconLayoutRows,      btnRef: groupRef,  active: !!appliedGroup },
    { key: 'sort',   label: 'Sort',       Icon: IconArrowsSort,      btnRef: sortRef,   active: !!sortField    },
    { key: 'height', label: 'Row Height', Icon: IconRowInsertBottom,  btnRef: heightRef, active: rowHeight !== 'Medium' },
    { key: 'search', label: 'Search',     Icon: IconSearch,          btnRef: null,      active: searchOpen     },
  ];

  const visibleTools = isMobile ? TOOLS.filter(t => ['search'].includes(t.key))
                     : isTablet ? TOOLS.filter(t => !['color', 'height'].includes(t.key))
                     : TOOLS;
  const hiddenTools = TOOLS.filter(t => !visibleTools.find(v => v.key === t.key));

  return (
    <>
      <Box style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', padding: '0 16px', height: 44, gap: 4 }}>

        {/* LEFT — Views */}
        <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
          <Tooltip label="Open Sidebar" {...TP}>
            <UnstyledButton ref={viewsRef} onClick={() => toggle('views')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', background: openPanel === 'views' ? 'rgba(98,129,65,0.1)' : 'transparent', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(98,129,65,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = openPanel === 'views' ? 'rgba(98,129,65,0.1)' : 'transparent'}
            >
              <IconMenu2 size={15} color="#555" />
              <Text fz={12} fw={500} c="#444">Views</Text>
            </UnstyledButton>
          </Tooltip>
          <VDivider />
        </Group>

        {/* CENTER — Filter + other tools */}
        <Group gap={2} wrap="nowrap" style={{ flex: 1 }}>

          {/* FilterPanel replaces the old broken filter button */}
          <FilterPanel onApply={handleFilterApply} />

          {visibleTools.map(({ key, label, Icon, btnRef, active, badge }) => (
            <span key={key} ref={btnRef}>
              <ToolBtn icon={Icon} label={label} active={active} badge={badge}
                onClick={() => {
                  if (key === 'search') { setSearchOpen(v => !v); if (searchOpen) setSearchVal(''); }
                  else if (key === 'color') {}
                  else toggle(key);
                }}
              />
            </span>
          ))}

          {hiddenTools.length > 0 && (
            <span ref={moreRef}>
              <Tooltip label="More options" {...TP}>
                <UnstyledButton onClick={() => toggle('more')}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', borderRadius: 6, cursor: 'pointer', background: openPanel === 'more' ? 'rgba(98,129,65,0.1)' : 'transparent', transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(98,129,65,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = openPanel === 'more' ? 'rgba(98,129,65,0.1)' : 'transparent'}
                >
                  <IconDotsVertical size={15} color="#555" />
                </UnstyledButton>
              </Tooltip>
            </span>
          )}

          {searchOpen && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
              <TextInput ref={searchRef} size="xs" placeholder="Search leads..."
                value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
                leftSection={<IconSearch size={13} />}
                style={{ width: 200 }} styles={{ input: { fontSize: 12, height: 30 } }}
              />
              <ActionIcon size={24} variant="subtle" onClick={() => { setSearchOpen(false); setSearchVal(''); }}>
                <IconX size={13} color="#888" />
              </ActionIcon>
            </Box>
          )}
        </Group>

        {/* RIGHT */}
        <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
          <Tooltip label="Share & Sync" {...TP}>
            <UnstyledButton
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 6, cursor: 'pointer', border: '1px solid #e0e0e0', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.borderColor = '#ccc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
            >
              <IconShare size={14} color="#555" />
              <Text fz={12} fw={500} c="#444">Share</Text>
            </UnstyledButton>
          </Tooltip>
          <Button size="xs" leftSection={<IconPlus size={13} />} onClick={onAddLead}
            style={{ background: '#628141', color: '#fff', fontWeight: 600, fontSize: 12, height: 30 }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#4e6a34'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#628141'}
          >
            Add Lead
          </Button>
        </Group>
      </Box>

      {/* Active filter chips bar */}
      <ActiveFilterChips
        filters={activeFilters}
        logic={filterLogic}
        onRemove={handleRemoveChip}
        onClearAll={handleClearAll}
      />

      {/* VIEWS panel */}
      <FloatingPanel anchorRef={viewsRef} open={openPanel === 'views'} width={220}>
        <Box p="sm">
          <Text fw={600} fz={13} c="#1B211A" mb="sm">Saved Views</Text>
          <Stack gap={2}>
            {['All Leads', 'My Leads', 'Won Deals', 'Pipeline View'].map((v, i) => (
              <UnstyledButton key={v}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 6, cursor: 'pointer', background: i === 0 ? 'rgba(98,129,65,0.1)' : 'transparent', transition: 'all 0.15s ease' }}
                onMouseEnter={(e) => { if (i !== 0) e.currentTarget.style.background = '#f5f5f5'; }}
                onMouseLeave={(e) => { if (i !== 0) e.currentTarget.style.background = 'transparent'; }}
              >
                <Group gap={7}>
                  <IconLayoutGrid size={13} color={i === 0 ? '#628141' : '#888'} />
                  <Text fz={12} c={i === 0 ? '#628141' : '#444'} fw={i === 0 ? 600 : 400}>{v}</Text>
                </Group>
                {i === 0 && <IconCheck size={12} color="#628141" />}
              </UnstyledButton>
            ))}
          </Stack>
          <Divider my="sm" />
          <UnstyledButton style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6, width: '100%' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <IconPlus size={13} color="#628141" />
            <Text fz={12} c="#628141" fw={500}>Add View</Text>
          </UnstyledButton>
        </Box>
      </FloatingPanel>

      {/* HIDE panel */}
      <FloatingPanel anchorRef={hideRef} open={openPanel === 'hide'} width={230}>
        <Box p="sm">
          <Group justify="space-between" mb="xs">
            <Text fw={600} fz={13} c="#1B211A">Hide by Status</Text>
            <ActionIcon size={22} variant="subtle" onClick={() => setOpenPanel(null)}><IconX size={14} /></ActionIcon>
          </Group>
          <Text fz={11} c="dimmed" mb="sm">Uncheck a status to hide those leads.</Text>
          <Stack gap={4}>
            {LEAD_STATUSES.map(status => {
              const hidden = hiddenStatuses.includes(status);
              return (
                <UnstyledButton key={status} onClick={() => toggleStatus(status)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Box style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `2px solid ${hidden ? '#ccc' : '#628141'}`, background: hidden ? 'transparent' : '#628141', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}>
                    {!hidden && <IconCheck size={10} color="#fff" />}
                  </Box>
                  <Text fz={12} c={hidden ? '#aaa' : '#333'} style={{ textDecoration: hidden ? 'line-through' : 'none' }}>{status}</Text>
                </UnstyledButton>
              );
            })}
          </Stack>
          {hiddenStatuses.length > 0 && (
            <UnstyledButton onClick={() => { setHiddenStatuses([]); onHideChange?.([]); }}
              style={{ marginTop: 8, fontSize: 11, color: '#628141', fontWeight: 500, textDecoration: 'underline', padding: '4px 10px' }}>
              Show all
            </UnstyledButton>
          )}
        </Box>
      </FloatingPanel>

      {/* GROUP panel */}
      <FloatingPanel anchorRef={groupRef} open={openPanel === 'group'} width={260}>
        <Box p="md">
          <Group justify="space-between" mb="sm">
            <Text fw={600} fz={13} c="#1B211A">Group By</Text>
            <ActionIcon size={22} variant="subtle" onClick={() => setOpenPanel(null)}><IconX size={14} /></ActionIcon>
          </Group>
          <FixedSelect label="Group by field" data={GROUP_FIELDS} value={groupField} onChange={setGroupField} placeholder="Select field..." />
          <Group justify="flex-end" mt="md" gap="xs">
            <Button size="xs" variant="subtle" onClick={clearGroup}>Clear</Button>
            <Button size="xs" style={{ background: '#628141', color: '#fff' }} onClick={applyGroup}>Apply</Button>
          </Group>
        </Box>
      </FloatingPanel>

      {/* SORT panel */}
      <FloatingPanel anchorRef={sortRef} open={openPanel === 'sort'} width={280}>
        <Box p="md">
          <Group justify="space-between" mb="sm">
            <Text fw={600} fz={13} c="#1B211A">Sort</Text>
            <ActionIcon size={22} variant="subtle" onClick={() => setOpenPanel(null)}><IconX size={14} /></ActionIcon>
          </Group>
          <Stack gap="sm">
            <FixedSelect label="Sort by" data={SORT_FIELDS} value={sortField} onChange={setSortField} placeholder="Select field..." />
            <FixedSelect label="Direction" data={[{ value: 'asc', label: 'Ascending ↑' }, { value: 'desc', label: 'Descending ↓' }]} value={sortDir} onChange={setSortDir} />
            <Group justify="flex-end" mt={4}>
              <Button size="xs" variant="subtle" onClick={() => { setSortField(''); onSortChange?.(null); setOpenPanel(null); }}>Clear</Button>
              <Button size="xs" style={{ background: '#628141', color: '#fff' }} onClick={() => { onSortChange?.({ field: sortField, dir: sortDir }); setOpenPanel(null); }}>Apply</Button>
            </Group>
          </Stack>
        </Box>
      </FloatingPanel>

      {/* ROW HEIGHT panel */}
      <FloatingPanel anchorRef={heightRef} open={openPanel === 'height'} width={180}>
        <Box p="sm">
          <Text fw={600} fz={13} c="#1B211A" mb="sm">Row Height</Text>
          <Stack gap={4}>
            {ROW_HEIGHTS.map(h => (
              <UnstyledButton key={h} onClick={() => { setRowHeight(h); setOpenPanel(null); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 6, cursor: 'pointer', background: rowHeight === h ? 'rgba(98,129,65,0.1)' : 'transparent', transition: 'all 0.15s ease' }}
                onMouseEnter={(e) => { if (rowHeight !== h) e.currentTarget.style.background = '#f5f5f5'; }}
                onMouseLeave={(e) => { if (rowHeight !== h) e.currentTarget.style.background = 'transparent'; }}
              >
                <Text fz={12} c={rowHeight === h ? '#628141' : '#444'} fw={rowHeight === h ? 600 : 400}>{h}</Text>
                {rowHeight === h && <IconCheck size={13} color="#628141" />}
              </UnstyledButton>
            ))}
          </Stack>
        </Box>
      </FloatingPanel>

      {/* MORE panel */}
      <FloatingPanel anchorRef={moreRef} open={openPanel === 'more'} width={180}>
        <Box p="xs">
          {hiddenTools.map(({ key, label, Icon }) => (
            <UnstyledButton key={key}
              onClick={() => { if (key === 'search') { setSearchOpen(v => !v); if (searchOpen) setSearchVal(''); } else toggle(key); setOpenPanel(null); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, width: '100%', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Icon size={14} color="#555" />
              <Text fz={12} c="#444">{label}</Text>
            </UnstyledButton>
          ))}
        </Box>
      </FloatingPanel>

      <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </>
  );
}
