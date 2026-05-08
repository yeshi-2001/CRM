import { useState, useEffect } from 'react';
import {
  Box, Group, Button, Avatar, Text, Badge, Stack,
  Paper, SimpleGrid, Textarea, ActionIcon, Divider, ScrollArea,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { formatDate, formatTime } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';

const CATEGORY_COLORS = {
  Employee: { bg: '#628141', badge: 'green'  },
  Customer: { bg: '#10b981', badge: 'teal'   },
  Partner:  { bg: '#f59e0b', badge: 'yellow' },
};

function getInitials(name) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function Field({ label, value }) {
  return (
    <Box>
      <Text fz={11} c="dimmed" fw={500} mb={2}>{label}</Text>
      <Text fz={13} c="#1B211A">{value || '—'}</Text>
    </Box>
  );
}

export function ContactDetail({ contact, onBack, onEdit, onDelete, onAddNote, onDeleteNote, getNotesFor, currentUser }) {
  const [notes,       setNotes]       = useState([]);
  const [noteText,    setNoteText]    = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving,      setSaving]      = useState(false);

  const colors = CATEGORY_COLORS[contact.category] || CATEGORY_COLORS.Customer;

  const fetchNotes = async () => {
    try {
      const data = await getNotesFor(contact.id);
      setNotes(data);
    } catch { setNotes([]); }
  };

  useEffect(() => { fetchNotes(); }, [contact.id]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await onAddNote(contact.id, noteText.trim(), currentUser);
      setNoteText('');
      fetchNotes();
    } finally { setSaving(false); }
  };

  const handleDeleteNote = async (noteId) => {
    await onDeleteNote(contact.id, noteId);
    fetchNotes();
  };

  return (
    <Box>
      <Group justify="space-between" mb="lg">
        <Button variant="subtle" onClick={onBack} style={{ color: '#628141' }}>
          Back to Contacts
        </Button>
        <Group gap="xs">
          <Button size="xs" variant="outline"
            style={{ borderColor: '#628141', color: '#628141' }} onClick={() => onEdit(contact)}>
            Edit
          </Button>
          <Button size="xs" variant="outline" color="red" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </Group>
      </Group>

      <Group gap="xl" align="flex-start" wrap="nowrap">
        {/* Left — details */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Paper p="lg" radius="md" style={{ background: 'rgba(224,217,217,0.4)', border: '1px solid #e8e8e8' }}>
            <Group gap="md" mb="lg" align="center">
              <Avatar size={64} radius="xl" style={{ background: colors.bg, color: '#fff', fontWeight: 700, fontSize: 22 }}>
                {getInitials(contact.name)}
              </Avatar>
              <Stack gap={4}>
                <Text fw={700} fz={20} c="#1B211A">{contact.name}</Text>
                <Group gap="xs">
                  <Badge color={colors.badge} variant="light" size="sm">{contact.category}</Badge>
                  {contact.company && <Text fz={13} c="dimmed">{contact.company}</Text>}
                </Group>
              </Stack>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Field label="Email"       value={contact.email} />
              <Field label="Phone"       value={contact.phone} />
              <Field label="Location"    value={contact.location} />
              <Field label="Company"     value={contact.company} />
              <Field label="Assigned To" value={contact.assigned_to || contact.assignedTo} />
              <Field label="Date Added"  value={formatDate(contact.created_at || contact.createdAt)} />
            </SimpleGrid>
          </Paper>
        </Box>

        {/* Right — notes */}
        <Box style={{ width: 340, flexShrink: 0 }}>
          <Paper p="lg" radius="md" style={{ background: 'rgba(224,217,217,0.4)', border: '1px solid #e8e8e8' }}>
            <Group justify="space-between" mb="md">
              <Text fw={600} fz={14} c="#1B211A">Notes</Text>
              <Badge color="green" variant="filled" size="sm">{notes.length}</Badge>
            </Group>

            <ScrollArea h={300} mb="md">
              <Stack gap="sm">
                {notes.length === 0 && <Text fz={12} c="dimmed">No notes yet.</Text>}
                {notes.map(n => (
                  <Paper key={n.id} p="sm" radius="sm"
                    style={{ background: '#fff', borderLeft: '3px solid #628141', border: '1px solid #eee' }}>
                    <Group justify="space-between" align="flex-start">
                      <Text fz={12} c="#1B211A" style={{ flex: 1, whiteSpace: 'pre-wrap' }}>{n.content}</Text>
                      <ActionIcon size={18} variant="subtle" color="red" onClick={() => handleDeleteNote(n.id)}>
                        <IconX size={12} />
                      </ActionIcon>
                    </Group>
                    <Text fz={11} c="dimmed" mt={4}>
                      {n.created_by} · {formatDate(n.created_at)} {formatTime(n.created_at)}
                    </Text>
                  </Paper>
                ))}
              </Stack>
            </ScrollArea>

            <Divider mb="sm" />
            <Textarea
              placeholder="Write a note..."
              minRows={3} autosize maxRows={5}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              mb="sm"
              styles={{ input: { fontSize: 13 } }}
            />
            <Button fullWidth size="xs" loading={saving}
              style={{ background: '#628141', color: '#fff' }}
              onClick={handleAddNote}>
              Add Note
            </Button>
          </Paper>
        </Box>
      </Group>

      <ConfirmModal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { onDelete(contact.id); onBack(); }}
        title="Delete Contact"
        message={`Delete "${contact.name}"? This cannot be undone.`}
      />
    </Box>
  );
}
