import { useState } from 'react';
import {
  Box, Group, Button, Avatar, Text, Badge, Stack,
  Paper, SimpleGrid, Textarea, ActionIcon, Divider, ScrollArea,
} from '@mantine/core';
import { IconPencil, IconTrash, IconX } from '@tabler/icons-react';
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

export function ContactDetail({ contact, notes, onBack, onEdit, onDelete, onAddNote, onDeleteNote, currentUser }) {
  const [noteText,     setNoteText]     = useState('');
  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const colors = CATEGORY_COLORS[contact.category] || CATEGORY_COLORS.Customer;

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    onAddNote(contact.id, noteText.trim(), currentUser);
    setNoteText('');
  };

  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <Button variant="subtle" onClick={onBack}
          style={{ color: '#628141' }}>
          Back to Contacts
        </Button>
        <Group gap="xs">
          <Button size="xs" variant="outline"
            style={{ borderColor: '#628141', color: '#628141' }} onClick={() => onEdit(contact)}>
            Edit
          </Button>
          <Button size="xs" variant="outline" color="red"
            onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </Group>
      </Group>

      <Group gap="xl" align="flex-start" wrap="nowrap" style={{ '@media(max-width:768px)': { flexDirection: 'column' } }}>
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
              <Field label="Email"        value={contact.email} />
              <Field label="Phone"        value={contact.phone} />
              <Field label="Location"     value={contact.location} />
              <Field label="Company"      value={contact.company} />
              <Field label="Assigned To"  value={contact.assignedTo} />
              <Field label="Date Added"   value={formatDate(contact.createdAt)} />
              <Field label="Last Updated" value={formatDate(contact.updatedAt)} />
            </SimpleGrid>
          </Paper>

          {/* Activity timeline */}
          <Paper p="lg" radius="md" mt="md" style={{ background: 'rgba(224,217,217,0.4)', border: '1px solid #e8e8e8' }}>
            <Text fw={600} fz={14} c="#1B211A" mb="md">Activity</Text>
            <Stack gap="xs">
              {notes.map(n => (
                <Group key={n.id} gap="sm" align="flex-start">
                  <Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#628141', marginTop: 5, flexShrink: 0 }} />
                  <Box style={{ flex: 1 }}>
                    <Text fz={12} c="#444">Note added by <Text component="span" fw={600}>{n.createdBy}</Text></Text>
                    <Text fz={11} c="dimmed">{formatDate(n.createdAt)} · {formatTime(n.createdAt)}</Text>
                  </Box>
                </Group>
              ))}
              <Group gap="sm" align="flex-start">
                <Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#8BAE66', marginTop: 5, flexShrink: 0 }} />
                <Box>
                  <Text fz={12} c="#444">Contact created</Text>
                  <Text fz={11} c="dimmed">{formatDate(contact.createdAt)}</Text>
                </Box>
              </Group>
            </Stack>
          </Paper>
        </Box>

        {/* Right — notes */}
        <Box style={{ width: 340, flexShrink: 0 }}>
          <Paper p="lg" radius="md" style={{ background: 'rgba(224,217,217,0.4)', border: '1px solid #e8e8e8' }}>
            <Group justify="space-between" mb="md">
              <Text fw={600} fz={14} c="#1B211A">Notes</Text>
              <Badge color="forest" variant="filled" size="sm">{notes.length}</Badge>
            </Group>

            <ScrollArea h={300} mb="md">
              <Stack gap="sm">
                {notes.length === 0 && <Text fz={12} c="dimmed">No notes yet.</Text>}
                {notes.map(n => (
                  <Paper key={n.id} p="sm" radius="sm"
                    style={{ background: '#fff', borderLeft: '3px solid #628141', border: '1px solid #eee', borderLeft: '3px solid #628141' }}>
                    <Group justify="space-between" align="flex-start">
                      <Text fz={12} c="#1B211A" style={{ flex: 1, whiteSpace: 'pre-wrap' }}>{n.content}</Text>
                      <ActionIcon size={18} variant="subtle" color="red" onClick={() => onDeleteNote(contact.id, n.id)}>
                        <IconX size={12} />
                      </ActionIcon>
                    </Group>
                    <Text fz={11} c="dimmed" mt={4}>{n.createdBy} · {formatDate(n.createdAt)}</Text>
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
            <Button fullWidth size="xs" style={{ background: '#628141', color: '#fff' }} onClick={handleAddNote}>
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
