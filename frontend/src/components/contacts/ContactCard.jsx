import { Paper, Avatar, Text, Group, Badge, Stack, Button, ActionIcon, Box } from '@mantine/core';
import { IconMail, IconPhone, IconEye } from '@tabler/icons-react';

const CATEGORY_COLORS = {
  Employee: { bg: '#628141', badge: 'green'  },
  Customer: { bg: '#10b981', badge: 'teal'   },
  Partner:  { bg: '#f59e0b', badge: 'yellow' },
};

function getInitials(name) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export function ContactCard({ contact, onView, onEdit, onDelete }) {
  const colors = CATEGORY_COLORS[contact.category] || CATEGORY_COLORS.Customer;

  return (
    <Paper
      p="md" radius="md"
      style={{
        background: '#fff',
        border: '1px solid #eee',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.15s ease',
        cursor: 'default',
        position: 'relative',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* View button top-right */}
      <ActionIcon
        size={26} variant="subtle" radius="md"
        style={{ position: 'absolute', top: 10, right: 10 }}
        onClick={() => onView(contact)}
      >
        <IconEye size={14} color="#888" />
      </ActionIcon>

      <Stack align="center" gap="xs" mb="sm">
        <Avatar size={56} radius="xl" style={{ background: colors.bg, color: '#fff', fontWeight: 700, fontSize: 18 }}>
          {getInitials(contact.name)}
        </Avatar>
        <Text fw={700} fz={14} c="#1B211A" ta="center" style={{ lineHeight: 1.3 }}>{contact.name}</Text>
        {contact.location && <Text fz={11} c="dimmed" ta="center">{contact.location}</Text>}
        <Badge size="sm" color={colors.badge} variant="light">{contact.category}</Badge>
      </Stack>

      <Stack gap={6} mb="md">
        {contact.email && (
          <Group gap={6} wrap="nowrap">
            <IconMail size={13} color="#888" style={{ flexShrink: 0 }} />
            <Text fz={12} c="#555" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.email}</Text>
          </Group>
        )}
        {contact.phone && (
          <Group gap={6} wrap="nowrap">
            <IconPhone size={13} color="#888" style={{ flexShrink: 0 }} />
            <Text fz={12} c="#555">{contact.phone}</Text>
          </Group>
        )}
      </Stack>

      <Group gap="xs">
        <Button
          size="xs" variant="outline" style={{ flex: 1, borderColor: '#ddd', color: '#444', fontSize: 12 }}
          leftSection={<IconPhone size={12} />}
        >
          Call
        </Button>
        <Button
          size="xs" variant="outline" style={{ flex: 1, borderColor: '#ddd', color: '#444', fontSize: 12 }}
          leftSection={<IconMail size={12} />}
        >
          Mail
        </Button>
      </Group>
    </Paper>
  );
}
