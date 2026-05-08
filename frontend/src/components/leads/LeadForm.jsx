import { Modal, TextInput, Select, NumberInput, Button, Group, Alert, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import { leadService } from '../../services/leadService';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../utils/constants';
import api from '../../services/api';

export function LeadForm({ opened, onClose, lead, onSuccess }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      lead_name:    '',
      company_name: '',
      email:        '',
      phone:        '',
      lead_source:  '',
      assigned_to:  '',
      status:       'New',
      deal_value:   0,
    },
    validate: { lead_name: (v) => v.trim() ? null : 'Lead name is required' },
  });

  useEffect(() => {
    if (opened) {
      form.setValues({
        lead_name:    lead?.lead_name    || '',
        company_name: lead?.company_name || '',
        email:        lead?.email        || '',
        phone:        lead?.phone        || '',
        lead_source:  lead?.lead_source  || '',
        assigned_to:  lead?.assigned_to  || '',
        status:       lead?.status       || 'New',
        deal_value:   parseFloat(lead?.deal_value) || 0,
      });
      setError(null);
    }
  }, [opened, lead]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      if (lead?.id) {
        // Log history if status changed
        if (lead.status && values.status && lead.status !== values.status) {
          await api.post(`/api/leads/${lead.id}/history`, {
            from_status: lead.status,
            to_status:   values.status,
            changed_by:  'Admin',
          }).catch(() => {});
        }
        await leadService.update(lead.id, values);

        // Sync contact — update if exists by email
        if (values.email) {
          const { data: contacts } = await api.get('/api/contacts').catch(() => ({ data: [] }));
          const existing = contacts.find(c => c.email === values.email);
          if (existing) {
            await api.put(`/api/contacts/${existing.id}`, {
              name:        values.lead_name,
              company:     values.company_name,
              email:       values.email,
              phone:       values.phone,
              location:    existing.location || '',
              category:    existing.category || 'Customer',
              assigned_to: values.assigned_to,
            }).catch(() => {});
          }
        }
      } else {
        const created = await leadService.create(values);

        // Log creation history
        if (created?.id) {
          await api.post(`/api/leads/${created.id}/history`, {
            from_status: null,
            to_status:   values.status || 'New',
            changed_by:  'Admin',
          }).catch(() => {});
        }

        // Auto-create contact from lead data
        const { data: contacts } = await api.get('/api/contacts').catch(() => ({ data: [] }));
        const alreadyExists = values.email && contacts.find(c => c.email === values.email);
        if (!alreadyExists) {
          await api.post('/api/contacts', {
            name:        values.lead_name,
            company:     values.company_name,
            email:       values.email,
            phone:       values.phone,
            location:    '',
            category:    'Customer',
            assigned_to: values.assigned_to,
          }).catch(() => {});
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => { onClose(); setError(null); }}
      title={lead?.id ? 'Edit Lead' : 'Add Lead'}
      centered
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          {error && <Alert color="red" variant="light">{error}</Alert>}
          <TextInput label="Lead Name" placeholder="Full name" required {...form.getInputProps('lead_name')} />
          <TextInput label="Company Name" placeholder="Company" {...form.getInputProps('company_name')} />
          <TextInput label="Email" placeholder="email@example.com" {...form.getInputProps('email')} />
          <TextInput label="Phone" placeholder="555-0100" {...form.getInputProps('phone')} />
          <TextInput label="Assigned To" placeholder="Salesperson name" {...form.getInputProps('assigned_to')} />
          <Select
            label="Lead Source"
            placeholder="Select source"
            data={LEAD_SOURCES}
            {...form.getInputProps('lead_source')}
          />
          <Select
            label="Status"
            data={LEAD_STATUSES}
            {...form.getInputProps('status')}
          />
          <NumberInput
            label="Estimated Deal Value"
            prefix="$"
            min={0}
            decimalScale={2}
            {...form.getInputProps('deal_value')}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>{lead?.id ? 'Save Changes' : 'Add Lead'}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
