import { ProgressBar, Typography } from '@heroui/react';
import type { Client } from '../../types';

type ProgressCellProps = {
  client: Client;
  compact?: boolean;
};

export function ProgressCell({ client, compact = false }: ProgressCellProps) {
  const hasProgress = client.progress > 0;

  return (
    <div className={`grid min-w-0 gap-1.5 ${compact ? 'col-span-full' : 'min-w-32'}`}>
      <Typography className="truncate" type="body-xs" weight="medium">{client.step}</Typography>
      {hasProgress ? (
        <div className="flex items-center gap-2">
          <ProgressBar aria-label={`${client.name} progress`} className="w-28" color="accent" size="sm" value={client.progress} />
          <Typography type="body-xs" color="muted">{client.progress}%</Typography>
        </div>
      ) : (
        <Typography type="body-xs" color="muted">-</Typography>
      )}
    </div>
  );
}
