import { Group, Text, Avatar, Menu, Stack, Divider, UnstyledButton, Box } from '@mantine/core';
import { IconLayoutDashboard, IconUsers, IconAddressBook, IconUser, IconLogout, IconSettings } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', Icon: IconLayoutDashboard },
  { label: 'Leads',     path: '/leads',     Icon: IconUsers           },
  { label: 'Contacts',  path: '/contacts',  Icon: IconAddressBook     },
];

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const userName    = user?.name  || 'Admin User';
  const userEmail   = user?.email || 'admin@example.com';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <Box style={{
      height: 56,
      background: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 20,
      paddingRight: 20,
    }}>
      <Group justify="space-between" style={{ width: '100%' }} wrap="nowrap">

        {/* Left — logo + nav links */}
        <Group gap={0} wrap="nowrap">

          {/* Logo */}
          <Text
            fw={700} fz={16} c="#628141"
            style={{ marginRight: 32, whiteSpace: 'nowrap', letterSpacing: -0.2 }}
          >
            LeadFlow CRM
          </Text>

          {/* Nav links */}
          {NAV_ITEMS.map(({ label, path, Icon }) => {
            const active = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <UnstyledButton
                key={path}
                onClick={() => navigate(path)}
                style={{
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '0 14px',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#628141' : '#6B7280',
                  borderBottom: active ? '2px solid #628141' : '2px solid transparent',
                  borderTop: '2px solid transparent',
                  transition: 'all 0.2s ease',
                  background: 'transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = '#374151';
                    e.currentTarget.style.background = 'rgba(98,129,65,0.05)';
                    const svg = e.currentTarget.querySelector('svg');
                    if (svg) svg.style.color = '#628141';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = '#6B7280';
                    e.currentTarget.style.background = 'transparent';
                    const svg = e.currentTarget.querySelector('svg');
                    if (svg) svg.style.color = '#9CA3AF';
                  }
                }}
              >
                <Icon size={15} color={active ? '#628141' : '#9CA3AF'} style={{ transition: 'color 0.2s ease' }} />
                {label}
              </UnstyledButton>
            );
          })}
        </Group>

        {/* Right — user avatar + dropdown */}
        <Menu width={240} position="bottom-end" offset={8} shadow="sm">
          <Menu.Target>
            <UnstyledButton style={{ borderRadius: '50%', lineHeight: 0 }}>
              <Avatar
                size={30} radius="xl"
                style={{
                  background: '#628141',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {userInitial}
              </Avatar>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8 }}>

            {/* User info header */}
            <Box px="sm" py="sm">
              <Group gap={10} wrap="nowrap">
                <Avatar size={34} radius="xl" style={{ background: '#628141', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {userInitial}
                </Avatar>
                <Stack gap={0} style={{ minWidth: 0 }}>
                  <Text fw={600} fz={13} c="#111827" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userName}
                  </Text>
                  <Text fz={11} c="#6B7280" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userEmail}
                  </Text>
                </Stack>
              </Group>
            </Box>

            <Divider color="#F3F4F6" />

            <Menu.Item
              leftSection={<IconUser size={15} color="#6B7280" />}
              style={{ color: '#374151', fontSize: 13 }}
              styles={{ item: { '&:hover': { background: '#F9FAFB', color: '#111827' } } }}
            >
              Account
            </Menu.Item>

            <Menu.Item
              leftSection={<IconSettings size={15} color="#6B7280" />}
              style={{ color: '#374151', fontSize: 13 }}
              styles={{ item: { '&:hover': { background: '#F9FAFB', color: '#111827' } } }}
            >
              Settings
            </Menu.Item>

            <Divider color="#F3F4F6" />

            <Menu.Item
              leftSection={<IconLogout size={15} color="#DC2626" />}
              style={{ color: '#DC2626', fontSize: 13 }}
              styles={{ item: { '&:hover': { background: '#FEF2F2' } } }}
              onClick={handleLogout}
            >
              Log Out
            </Menu.Item>

          </Menu.Dropdown>
        </Menu>

      </Group>
    </Box>
  );
}
