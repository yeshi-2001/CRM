import { useEffect, useState } from 'react';
import { Modal, TextInput, Select, Button, Group, Stack, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';

const CATEGORIES = ['Employee', 'Partner', 'Customer'];
const ASSIGNEES  = ['Kasun Fernando', 'Nimali Silva', 'Pradeep Seneviratne'];

export function ContactForm({ opened, onClose, contact, onSubmit }) {
  const [error, setError] = useState(null);

  const form = useForm({
    initialValues: { name: '', company: '', email: '', phone: '', location: '', category: 'Customer', assignedTo: '' },
    validate: { name: (v) => v.trim() ? null : 'Name is required' },
  });

  useEffect(() => {
    if (opened) {
      form.setValues({
        name:       contact?.name       || '',
        company:    contact?.company    || '',
        email:      contact?.email      || '',
        phone:      contact?.phone      || '',
        location:   contact?.location   || '',
        category:   contact?.category   || 'Customer',
        assignedTo: contact?.assignedTo || '',
      });
      setError(null);
    }
  }, [opened, contact]);

  const handleSubmit = (values) => {
    try { onSubmit(values); onClose(); }
    catch { setError('Something went wrong.'); }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={contact?.id ? 'Edit Contact' : 'Add Contact'} centered size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          {error && <Alert color="red" variant="light">{error}</Alert>}
          <Group grow>
            <TextInput label="Full Name" placeholder="Jane Smith" required {...form.getInputProps('name')} />
            <TextInput label="Company" placeholder="Acme Corp" {...form.getInputProps('company')} />
          </Group>
          <Group grow>
            <TextInput label="Email" placeholder="jane@example.com" {...form.getInputProps('email')} />
            <TextInput label="Phone" placeholder="555-0100" {...form.getInputProps('phone')} />
          </Group>
          <Group grow>
            <TextInput label="Location" placeholder="City, State" {...form.getInputProps('location')} />
            <Select label="Category" data={CATEGORIES} {...form.getInputProps('category')} />
          </Group>
          <Select label="Assigned To" placeholder="Select salesperson" data={ASSIGNEES} {...form.getInputProps('assignedTo')} />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button type="submit" style={{ background: '#628141', color: '#fff' }}>
              {contact?.id ? 'Save Changes' : 'Add Contact'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
