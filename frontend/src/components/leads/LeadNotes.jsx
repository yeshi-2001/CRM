import { useState } from 'react';
import {
  Text, Group, Badge, Textarea, Button, Loader,
  ScrollArea, Skeleton, Alert, Stack, Box,
} from '@mantine/core';
import { IconNotebook, IconSend } from '@tabler/icons-react';
import { useNotes } from '../../hooks/useNotes';
import { formatDate, formatTime } from '../../utils/formatters';

export function LeadNotes({ leadId, currentUser }) {
  const { notes, loading, error, addNote, refetch } = useNotes(leadId);
  const [content,    setContent]    = useState('');
  const [inputError, setInputError] = useState(null);
  const [saving,     setSaving]     = useState(false);

  const handleSave = async () => {
    if (!content.trim()) { setInputError('Note cannot be empty'); return; }
    setSaving(true);
    setInputError(null);
    try {
      await addNote(content.trim(), currentUser);
      setContent('');
    } catch (err) {
      setInputError(err.response?.data?.error || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSave();
  };

  return (
    <Stack gap={20}>

      {/* Header */}
      <Group justify="space-between" align="center">
        <Box>
          <Text fw={700} fz={15} c="#111827">Notes</Text>
          <Text fz={11} c="#9ca3af" mt={1}>Ctrl+Enter to save quickly</Text>
        </Box>
        <Box style={{
          background: 'rgba(91,124,74,0.1)', color: '#5B7C4A',
          borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700,
        }}>
          {notes.length}
        </Box>
      </Group>

      {/* Add note area */}
      <Box style={{
        background: '#F8F9FC', borderRadius: 12,
        border: '1px solid #e5e7eb', overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}>
        <Textarea
          placeholder="Write a note about this lead... (Ctrl+Enter to save)"
          minRows={3}
          maxRows={6}
          autosize
          value={content}
          onChange={(e) => { setContent(e.target.value); setInputError(null); }}
          onKeyDown={handleKeyDown}
          styles={{
            input: {
              background: 'transparent',
              border: 'none',
              borderRadius: 0,
              fontSize: 13,
              color: '#374151',
              padding: '14px 16px',
              resize: 'none',
              '&:focus': { outline: 'none', boxShadow: 'none' },
            },
          }}
        />
        {inputError && (
          <Text fz={11} c="red" px={16} pb={8}>{inputError}</Text>
        )}
        <Box style={{ borderTop: '1px solid #e5e7eb', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text fz={11} c="#9ca3af">as {currentUser}</Text>
          <Button
            size="xs"
            leftSection={saving ? <Loader size={12} color="white" /> : <IconSend size={13} />}
            disabled={saving || !content.trim()}
            onClick={handleSave}
            style={{
              background: content.trim() ? '#5B7C4A' : '#e5e7eb',
              color: content.trim() ? '#fff' : '#9ca3af',
              borderRadius: 8, fontWeight: 600, fontSize: 12,
              transition: 'all 0.2s',
              border: 'none',
            }}
            onMouseEnter={(e) => { if (content.trim()) e.currentTarget.style.background = '#4a6130'; }}
            onMouseLeave={(e) => { if (content.trim()) e.currentTarget.style.background = '#5B7C4A'; }}
          >
            Save Note
          </Button>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Alert color="red" variant="light" radius={10}>
          <Group justify="space-between">
            <Text fz={12}>Failed to load notes.</Text>
            <Button size="xs" variant="subtle" color="red" onClick={refetch}>Retry</Button>
          </Group>
        </Alert>
      )}

      {/* Notes list */}
      <ScrollArea h={380} offsetScrollbars>
        {loading ? (
          <Stack gap={10}>
            <Skeleton height={72} radius={12} />
            <Skeleton height={72} radius={12} />
            <Skeleton height={72} radius={12} />
          </Stack>
        ) : notes.length === 0 ? (
          <Box py={40} style={{ textAlign: 'center' }}>
            <Box style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(91,124,74,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <IconNotebook size={22} color="#5B7C4A" />
            </Box>
            <Text fz={13} fw={500} c="#374151">No notes yet</Text>
            <Text fz={12} c="#9ca3af" mt={4}>Add the first note above</Text>
          </Box>
        ) : (
          <Stack gap={10}>
            {notes.map((note) => (
              <Box
                key={note.id}
                style={{
                  background: '#fff',
                  border: '1px solid #f0f0f0',
                  borderLeft: '3px solid #5B7C4A',
                  borderRadius: 12,
                  padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
              >
                <Group justify="space-between" mb={8}>
                  <Group gap={8}>
                    <Box style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #5B7C4A, #7a9e5a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text fz={10} fw={700} c="#fff">{note.created_by?.charAt(0).toUpperCase()}</Text>
                    </Box>
                    <Text fz={12} fw={600} c="#374151">{note.created_by}</Text>
                  </Group>
                  <Box style={{ textAlign: 'right' }}>
                    <Text fz={10} c="#9ca3af">{formatDate(note.created_at)}</Text>
                    <Text fz={10} c="#9ca3af">{formatTime(note.created_at)}</Text>
                  </Box>
                </Group>
                <Text fz={13} c="#374151" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {note.content}
                </Text>
              </Box>
            ))}
          </Stack>
        )}
      </ScrollArea>
    </Stack>
  );
}
