import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box, Group, Text, Button, Badge, SimpleGrid, Stack,
  Table, Avatar, ActionIcon, UnstyledButton, TextInput,
  Paper, Tooltip, Divider, Notification,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPlus, IconLayoutGrid, IconList, IconTable, IconColumns,
  IconSearch, IconX, IconPencil, IconTrash, IconEye,
  IconChevronDown, IconCheck, IconUsers,
} from '@tabler/icons-react';
import { useContacts } from '../hooks/useContacts';
import { useAuth } from '../hooks/useAuth';
import { ContactCard } from '../components/contacts/ContactCard';
import { ContactForm } from '../components/contacts/ContactForm';
import { ContactDetail } from '../components/contacts/ContactDetail';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { formatDate } from '../utils/formatters';

const CATEGORY_COLORS = { Employee: 'green', Customer: 'teal', Partner: 'yellow' };
const CATEGORY_BG     = { Employee: '#628141', Customer: '#10b981', Partner: '#f59e0b' };
const CATEGORY_DOT    = { Employee: '#628141', Partner: '#f59e0b', Customer: '#10b981' };

const VIEW_TABS = [
  { key: 'list',   label: 'List',   Icon: IconList       },
  { key: 'kanban', label: 'Kanban', Icon: IconColumns    },
  { key: 'table',  label: 'Table',  Icon: IconTable      },
  { key: 'grid',   label: 'Grid',   Icon: IconLayoutGrid },
];

function getInitials(name) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function Toast({ msg, onClose }) {
  if (!msg) return null;
  return (
    <Notification
      color="green" onClose={onClose} withCloseButton
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, minWidth: 260 }}
    >
      {msg}
    </Notification>
  );
}

const TP = { color: 'dark', position: 'bottom', withArrow: true, openDelay: 300 };

function ToolBtn({ icon: Icon, label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <Tooltip label={label} {...TP}>
      <UnstyledButton
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '5px 9px',
          borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s ease',
          background: hov || active ? 'rgba(98,129,65,0.1)' : 'transparent',
        }}
      >
        <Icon size={15} color={active ? '#628141' : '#555'} />
        <Text fz={12} fw={active ? 600 : 400} c={active ? '#628141' : '#444'}>{label}</Text>
      </UnstyledButton>
    </Tooltip>
  );
}

export function ContactsPage() {
  const { contacts, loading, error, addContact, updateContact, deleteContact, addNote, deleteNote, getNotesFor, refetch } = useContacts();
  const { user } = useAuth();

  const [view,             setView]             = useState('grid');
  const [categoryTab,      setCategoryTab]      = useState('All Contacts');
  const [categoryDropOpen, setCategoryDropOpen] = useState(false);
  const [searchOpen,       setSearchOpen]       = useState(false);
  const [searchVal,        setSearchVal]        = useState('');
  const [sortAsc,          setSortAsc]          = useState(true);
  const [detailContact,    setDetailContact]    = useState(null);
  const [editContact,      setEditContact]      = useState(null);
  const [deleteTarget,     setDeleteTarget]     = useState(null);
  const [toast,            setToast]            = useState(null);

  const [formOpened,  { open: openForm,    close: closeForm    }] = useDisclosure(false);
  const [confirmOpen, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

  const categoryDropRef = useRef(null);

  useEffect(() => {
    function onDown(e) {
      if (categoryDropRef.current && !categoryDropRef.current.contains(e.target)) {
        setCategoryDropOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const getCategoryCount = (cat) =>
    cat === 'All Contacts' ? contacts.length : contacts.filter(c => c.category === cat).length;

  const filtered = useMemo(() => {
    let list = [...contacts];
    if (categoryTab !== 'All Contacts') list = list.filter(c => c.category === categoryTab);
    if (searchVal) {
      const q = searchVal.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    return list;
  }, [contacts, categoryTab, searchVal, sortAsc]);

  const handleAdd    = () => { setEditContact(null); openForm(); };
  const handleEdit   = (c) => { setEditContact(c);   openForm(); };

  const handleSubmit = async (values) => {
    try {
      if (editContact?.id) {
        await updateContact(editContact.id, values);
        showToast('Contact updated successfully');
        if (detailContact?.id === editContact.id) {
          const updated = { ...detailContact, ...values, assigned_to: values.assignedTo || values.assigned_to };
          setDetailContact(updated);
        }
      } else {
        await addContact(values);
        showToast('Contact added successfully');
      }
    } catch {
      showToast('Failed to save contact');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContact(id);
      showToast('Contact deleted');
      if (detailContact?.id === id) setDetailContact(null);
    } catch {
      showToast('Failed to delete contact');
    }
  };

  if (detailContact) {
    const fresh = contacts.find(c => c.id === detailContact.id) || detailContact;
    return (
      <Box px="xl" py="md">
        <ContactDetail
          contact={fresh}
          onBack={() => setDetailContact(null)}
          onEdit={(c) => { setEditContact(c); openForm(); }}
          onDelete={handleDelete}
          onAddNote={addNote}
          onDeleteNote={deleteNote}
          getNotesFor={getNotesFor}
          currentUser={user?.name || 'Admin'}
        />
        <ContactForm opened={formOpened} onClose={closeForm} contact={editContact} onSubmit={handleSubmit} />
        <Toast msg={toast} onClose={() => setToast(null)} />
      </Box>
    );
  }

  return (
    <Box>
      {/* ── TOOLBAR ── */}
      <Box style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', padding: '0 16px', height: 44, gap: 0, overflowX: 'auto' }}>

        {/* View tabs */}
        <Group gap={0} wrap="nowrap" style={{ flexShrink: 0, borderRight: '1px solid #e8e8e8', paddingRight: 8, marginRight: 8 }}>
          {VIEW_TABS.map(({ key, label, Icon }) => (
            <UnstyledButton
              key={key}
              onClick={() => setView(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                height: 44, padding: '0 12px', fontSize: 12,
                fontWeight: view === key ? 600 : 400,
                color: view === key ? '#628141' : '#666',
                borderBottom: view === key ? '2px solid #628141' : '2px solid transparent',
                borderTop: '2px solid transparent',
                transition: 'all 0.15s ease', cursor: 'pointer', whiteSpace: 'nowrap',
                background: 'transparent',
              }}
              onMouseEnter={(e) => { if (view !== key) e.currentTarget.style.color = '#333'; }}
              onMouseLeave={(e) => { if (view !== key) e.currentTarget.style.color = '#666'; }}
            >
              <Icon size={13} />
              {label}
            </UnstyledButton>
          ))}
        </Group>

        {/* Category dropdown */}
        <Box ref={categoryDropRef} style={{ position: 'relative', flexShrink: 0, borderRight: '1px solid #e8e8e8', paddingRight: 8, marginRight: 8 }}>
          <UnstyledButton
            onClick={() => setCategoryDropOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 44, padding: '0 12px', fontSize: 12, fontWeight: 600,
              color: '#1B211A', cursor: 'pointer', whiteSpace: 'nowrap',
              background: categoryDropOpen ? 'rgba(98,129,65,0.08)' : 'transparent',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(98,129,65,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = categoryDropOpen ? 'rgba(98,129,65,0.08)' : 'transparent'}
          >
            <IconUsers size={14} color="#628141" />
            <Text fz={12} fw={600} c="#1B211A">
              {categoryTab} ({getCategoryCount(categoryTab)})
            </Text>
            <IconChevronDown
              size={12} color="#888"
              style={{ transform: categoryDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
            />
          </UnstyledButton>

          {categoryDropOpen && (
            <Box style={{
              position: 'fixed',
              top: (() => { const r = categoryDropRef.current?.getBoundingClientRect(); return r ? r.bottom + 4 : 48; })(),
              left: (() => { const r = categoryDropRef.current?.getBoundingClientRect(); return r ? r.left : 0; })(),
              zIndex: 9999, width: 220,
              background: '#fff', border: '1px solid #e8e8e8',
              borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              overflow: 'hidden', animation: 'slideDown 0.15s ease',
            }}>
              <UnstyledButton
                onClick={() => { setCategoryTab('All Contacts'); setCategoryDropOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', cursor: 'pointer', transition: 'background 0.1s ease',
                  background: categoryTab === 'All Contacts' ? 'rgba(98,129,65,0.08)' : 'transparent',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(98,129,65,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = categoryTab === 'All Contacts' ? 'rgba(98,129,65,0.08)' : 'transparent'}
              >
                <Group gap={8}>
                  <IconUsers size={14} color="#628141" />
                  <Text fz={12} fw={categoryTab === 'All Contacts' ? 600 : 400} c="#1B211A">All Contacts</Text>
                </Group>
                <Group gap={6}>
                  <Badge size="xs" color="green" variant="light">{contacts.length}</Badge>
                  {categoryTab === 'All Contacts' && <IconCheck size={12} color="#628141" />}
                </Group>
              </UnstyledButton>

              <Divider color="#f0f0f0" />

              {['Employee', 'Partner', 'Customer'].map((cat) => {
                const count  = getCategoryCount(cat);
                const active = categoryTab === cat;
                return (
                  <UnstyledButton
                    key={cat}
                    onClick={() => { setCategoryTab(cat); setCategoryDropOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', cursor: 'pointer', transition: 'background 0.1s ease',
                      background: active ? 'rgba(98,129,65,0.08)' : 'transparent',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(98,129,65,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = active ? 'rgba(98,129,65,0.08)' : 'transparent'}
                  >
                    <Group gap={8}>
                      <Box style={{ width: 10, height: 10, borderRadius: '50%', background: CATEGORY_DOT[cat], flexShrink: 0 }} />
                      <Text fz={12} fw={active ? 600 : 400} c="#1B211A">{cat}</Text>
                    </Group>
                    <Group gap={6}>
                      <Badge size="xs" color={CATEGORY_COLORS[cat]} variant="light">{count}</Badge>
                      {active && <IconCheck size={12} color="#628141" />}
                    </Group>
                  </UnstyledButton>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Tool buttons */}
        <Group gap={2} wrap="nowrap" style={{ flex: 1 }}>
          <ToolBtn
            icon={IconSearch} label="Search" active={searchOpen}
            onClick={() => { setSearchOpen(v => !v); if (searchOpen) setSearchVal(''); }}
          />
          {searchOpen && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
              <TextInput
                autoFocus size="xs" placeholder="Search contacts..."
                value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
                leftSection={<IconSearch size={13} />}
                style={{ width: 200 }}
                styles={{ input: { fontSize: 12, height: 30 } }}
              />
              <ActionIcon size={24} variant="subtle" onClick={() => { setSearchOpen(false); setSearchVal(''); }}>
                <IconX size={13} color="#888" />
              </ActionIcon>
            </Box>
          )}
        </Group>

        {/* Right actions */}
        <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
          <Button
            size="xs" leftSection={<IconPlus size={13} />} onClick={handleAdd}
            style={{ background: '#628141', color: '#fff', fontWeight: 600, fontSize: 12, height: 30, whiteSpace: 'nowrap' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#4e6a34'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#628141'}
          >
            Add Contact
          </Button>
        </Group>
      </Box>

      <Box px="xl" py="md">
        <Group justify="space-between" mb="lg" align="center">
          <Text fw={700} fz={22} c="#1B211A">Contacts</Text>
        </Group>

        {/* GRID */}
        {view === 'grid' && (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
            {filtered.map(c => (
              <ContactCard
                key={c.id} contact={c}
                onView={setDetailContact}
                onEdit={handleEdit}
                onDelete={(contact) => { setDeleteTarget(contact); openConfirm(); }}
              />
            ))}
          </SimpleGrid>
        )}

        {/* LIST */}
        {view === 'list' && (
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead style={{ backgroundColor: '#628141' }}>
              <Table.Tr>
                {['Name', 'Category', 'Location', 'Email', 'Phone', 'Date Added', 'Actions'].map(h => (
                  <Table.Th key={h} style={{ color: '#fff', fontSize: 12 }}>{h}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(c => (
                <Table.Tr key={c.id}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Avatar size={28} radius="xl" style={{ background: CATEGORY_BG[c.category] || '#628141', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                        {getInitials(c.name)}
                      </Avatar>
                      <Text fz={13} fw={500}>{c.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td><Badge size="sm" color={CATEGORY_COLORS[c.category]} variant="light">{c.category}</Badge></Table.Td>
                  <Table.Td><Text fz={12} c="dimmed">{c.location || '—'}</Text></Table.Td>
                  <Table.Td><Text fz={12}>{c.email || '—'}</Text></Table.Td>
                  <Table.Td><Text fz={12}>{c.phone || '—'}</Text></Table.Td>
                  <Table.Td><Text fz={12} c="dimmed">{formatDate(c.created_at || c.createdAt)}</Text></Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <ActionIcon size={26} variant="subtle" onClick={() => setDetailContact(c)}><IconEye size={14} color="#628141" /></ActionIcon>
                      <ActionIcon size={26} variant="subtle" onClick={() => handleEdit(c)}><IconPencil size={14} color="#555" /></ActionIcon>
                      <ActionIcon size={26} variant="subtle" color="red" onClick={() => { setDeleteTarget(c); openConfirm(); }}><IconTrash size={14} /></ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}

        {/* TABLE */}
        {view === 'table' && (
          <Table withTableBorder withColumnBorders style={{ fontSize: 12 }}>
            <Table.Thead style={{ backgroundColor: '#f5f5f5' }}>
              <Table.Tr>
                {['Name', 'Company', 'Category', 'Email', 'Phone', 'Location', 'Assigned To', 'Added'].map(h => (
                  <Table.Th key={h} style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>{h}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(c => (
                <Table.Tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setDetailContact(c)}>
                  <Table.Td><Text fz={12} fw={500} c="#628141">{c.name}</Text></Table.Td>
                  <Table.Td><Text fz={12}>{c.company || '—'}</Text></Table.Td>
                  <Table.Td><Badge size="xs" color={CATEGORY_COLORS[c.category]} variant="light">{c.category}</Badge></Table.Td>
                  <Table.Td><Text fz={12}>{c.email || '—'}</Text></Table.Td>
                  <Table.Td><Text fz={12}>{c.phone || '—'}</Text></Table.Td>
                  <Table.Td><Text fz={12}>{c.location || '—'}</Text></Table.Td>
                  <Table.Td><Text fz={12}>{c.assigned_to || c.assignedTo || '—'}</Text></Table.Td>
                  <Table.Td><Text fz={12} c="dimmed">{formatDate(c.created_at || c.createdAt)}</Text></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}

        {/* KANBAN */}
        {view === 'kanban' && (
          <Group gap="md" align="flex-start" wrap="nowrap" style={{ overflowX: 'auto', paddingBottom: 8 }}>
            {['Employee', 'Partner', 'Customer'].map(cat => {
              const col = filtered.filter(c => c.category === cat);
              return (
                <Box key={cat} style={{ minWidth: 260, flex: '0 0 260px' }}>
                  <Group justify="space-between" mb="sm">
                    <Group gap={6}>
                      <Box style={{ width: 10, height: 10, borderRadius: '50%', background: CATEGORY_BG[cat] }} />
                      <Text fw={600} fz={13} c="#1B211A">{cat}</Text>
                    </Group>
                    <Badge size="sm" color={CATEGORY_COLORS[cat]} variant="light">{col.length}</Badge>
                  </Group>
                  <Stack gap="xs">
                    {col.map(c => (
                      <Paper
                        key={c.id} p="sm" radius="md"
                        style={{ background: '#fff', border: '1px solid #eee', cursor: 'pointer', transition: 'all 0.15s ease' }}
                        onClick={() => setDetailContact(c)}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                      >
                        <Group gap="sm" wrap="nowrap">
                          <Avatar size={32} radius="xl" style={{ background: CATEGORY_BG[cat], color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {getInitials(c.name)}
                          </Avatar>
                          <Box style={{ minWidth: 0 }}>
                            <Text fz={13} fw={600} c="#1B211A" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</Text>
                            {c.company && <Text fz={11} c="dimmed" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.company}</Text>}
                          </Box>
                        </Group>
                      </Paper>
                    ))}
                    {col.length === 0 && <Text fz={12} c="dimmed" ta="center" py="md">No contacts</Text>}
                  </Stack>
                </Box>
              );
            })}
          </Group>
        )}

        {filtered.length === 0 && (
          <Box py="xl" style={{ textAlign: 'center' }}>
            <Text c="dimmed" fz={14}>No contacts match your filters.</Text>
          </Box>
        )}
      </Box>

      <ContactForm opened={formOpened} onClose={closeForm} contact={editContact} onSubmit={handleSubmit} />
      <ConfirmModal
        opened={confirmOpen} onClose={closeConfirm}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget.id); }}
        title="Delete Contact"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
      <Toast msg={toast} onClose={() => setToast(null)} />
      <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </Box>
  );
}
