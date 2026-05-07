import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';

export function AppShellLayout() {
  return (
    <AppShell header={{ height: 56 }} padding={0}>
      <AppShell.Header style={{ border: 'none', background: 'transparent' }}>
        <Topbar />
      </AppShell.Header>
      <AppShell.Main style={{ backgroundColor: '#F5F5F4' }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
