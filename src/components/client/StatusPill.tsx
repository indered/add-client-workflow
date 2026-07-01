import { Chip } from '@heroui/react';
import type { ClientStatus } from '../../types';

type StatusPillProps = {
  status: ClientStatus;
};

export function StatusPill({ status }: StatusPillProps) {
  const color = status === 'Completed' ? 'success' : status === 'In Progress' ? 'accent' : 'warning';

  return (
    <Chip className="h-5 min-h-0 whitespace-nowrap px-1.5 py-0" color={color} size="sm" variant="soft">
      <Chip.Label className="whitespace-nowrap text-[10px] font-medium leading-none">{status}</Chip.Label>
    </Chip>
  );
}

export function TypePill({ type }: { type: string }) {
  return (
    <Chip className="h-5 min-h-0 whitespace-nowrap px-1.5 py-0" color={type === 'Quick Plan' ? 'danger' : 'default'} size="sm" variant="soft">
      <Chip.Label className="whitespace-nowrap text-[10px] font-medium leading-none">{type}</Chip.Label>
    </Chip>
  );
}
