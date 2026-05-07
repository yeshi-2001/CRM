import { Badge } from '@mantine/core';
import { STATUS_COLORS } from '../../utils/constants';

export function LeadStatusBadge({ status }) {
  return (
    <Badge color={STATUS_COLORS[status] || 'gray'} variant="filled">
      {status}
    </Badge>
  );
}
