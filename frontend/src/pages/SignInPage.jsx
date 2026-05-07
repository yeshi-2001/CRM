import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Center, Paper, Group, Title, TextInput,
  PasswordInput, Button, Alert, Stack, Text, Anchor, Divider,
} from '@mantine/core';
import { IconLayoutDashboard, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';

const INPUT_STYLES = {
  label: { color: '#374151', fontSize: 13, fontWeight: 500 },
  input: {
    borderColor: '#D1D5DB',
    '&:focus': { borderColor: '#628141' },
  },
};

export function SignInPage() {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/leads');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#F5F5F4' }}>
      <Center style={{ minHeight: '100vh', padding: 16 }}>
        <Paper
          shadow="sm"
          radius="md"
          p="xl"
          style={{ width: '100%', maxWidth: 420, backgroundColor: '#fff' }}
        >
          <Stack gap="xs" align="center" mb="xl">
            <Group gap={8}>
              <IconLayoutDashboard size={26} color="#628141" />
              <Title
                order={2}
                style={{ color: '#628141', fontSize: 24, fontWeight: 700, letterSpacing: -0.3 }}
              >
                LeadFlow CRM
              </Title>
            </Group>
            <Text fz={13} c="#6B7280" ta="center">
              Sign in to your account to continue
            </Text>
          </Stack>

          <Divider color="#F3F4F6" mb="xl" />

          {error && (
            <Alert
              color="red"
              variant="light"
              icon={<IconAlertCircle size={16} />}
              mb="md"
              radius="md"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="md"
                autoFocus
                styles={INPUT_STYLES}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="md"
                styles={INPUT_STYLES}
              />

              <Group justify="flex-end" mt={-8}>
                <Anchor
                  fz={12}
                  style={{ color: '#6B7280', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#628141'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                >
                  Forgot password?
                </Anchor>
              </Group>

              <Button
                type="submit"
                fullWidth
                size="md"
                loading={isLoading}
                style={{
                  backgroundColor: '#628141',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  borderRadius: 8,
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a6130'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#628141'}
              >
                Sign In
              </Button>
            </Stack>
          </form>

          <Divider color="#F3F4F6" mt="xl" mb="md" />

          <Text fz={12} c="#6B7280" ta="center">
            Having trouble?{' '}
            <Anchor
              fz={12}
              style={{ color: '#6B7280', fontWeight: 500, transition: 'color 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#628141'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              Contact support
            </Anchor>
          </Text>
        </Paper>
      </Center>
    </Box>
  );
}
