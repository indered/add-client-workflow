import { Avatar, Typography } from '@heroui/react';
import type { Client } from '../../types';

type ClientIdentityProps = {
  client: Client;
  small?: boolean;
};

export function ClientIdentity({ client, small = false }: ClientIdentityProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-8">
        <Avatar.Fallback>{client.initials}</Avatar.Fallback>
      </Avatar>
      <div className="min-w-0">
        <Typography className="truncate" type="body-xs" weight="semibold">{client.name}</Typography>
        {small ? <Typography className="truncate" type="body-xs" color="muted">{client.step}</Typography> : null}
      </div>
    </div>
  );
}
