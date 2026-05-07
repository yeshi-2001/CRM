import { Modal, Text, Group, Button } from '@mantine/core';

export function ConfirmModal({ opened, onClose, onConfirm, title = 'Confirm', message = 'Are you sure?' }) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="sm">
      <Text mb="lg">{message}</Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>Cancel</Button>
        <Button color="red" onClick={() => { onConfirm(); onClose(); }}>Delete</Button>
      </Group>
    </Modal>
  );
}
