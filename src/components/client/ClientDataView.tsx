import { Button, Card, Pagination, Table, Typography } from '@heroui/react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ClientIdentity } from './ClientIdentity';
import { EmptyResults } from './EmptyResults';
import { ProgressCell } from './ProgressCell';
import { StatusPill, TypePill } from './StatusPill';
import { IconButton } from '../common/CtaButton';
import { ModalShell } from '../common/ModalShell';
import type { Client } from '../../types';

const rowsPerPage = 7;

type ClientDataViewProps = {
  clients: Client[];
  totalClients: number;
  onRemove: (clientId: number) => void;
  onReset: () => void;
  onView: (clientId: number) => void;
};

export function ClientDataView({ clients, totalClients, onRemove, onReset, onView }: ClientDataViewProps) {
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null);
  const pageCount = Math.max(1, Math.ceil(clients.length / rowsPerPage));

  useEffect(() => {
    setPage(1);
  }, [clients.length]);

  const pageClients = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return clients.slice(start, start + rowsPerPage);
  }, [clients, page]);

  const startRow = clients.length === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endRow = Math.min(page * rowsPerPage, clients.length);

  return (
    <>
      <Table.Root className="hidden lg:block">
        <Table.ScrollContainer>
          <Table.Content aria-label="Clients" className="w-full">
            <Table.Header>
              <Table.Column isRowHeader>Client</Table.Column>
              <Table.Column>Contact</Table.Column>
              <Table.Column>Status</Table.Column>
              <Table.Column>Intake Type</Table.Column>
              <Table.Column>Invited On</Table.Column>
              <Table.Column>Last Activity</Table.Column>
              <Table.Column>Actions</Table.Column>
            </Table.Header>
            <Table.Body>
              {pageClients.length > 0 ? (
                pageClients.map((client) => (
                  <Table.Row className="cursor-pointer" id={String(client.id)} key={client.id}>
                    <Table.Cell>
                      <OpenClientCell clientId={client.id} onView={onView}>
                        <ClientIdentity client={client} />
                      </OpenClientCell>
                    </Table.Cell>
                    <Table.Cell>
                      <OpenClientCell clientId={client.id} onView={onView}>
                        <div className="grid min-w-44 gap-1">
                          <Typography type="body-xs" weight="medium">{client.email}</Typography>
                          <Typography type="body-xs" color="muted">{client.phone}</Typography>
                        </div>
                      </OpenClientCell>
                    </Table.Cell>
                    <Table.Cell>
                      <OpenClientCell clientId={client.id} onView={onView}>
                        <StatusPill status={client.status} />
                      </OpenClientCell>
                    </Table.Cell>
                    <Table.Cell>
                      <OpenClientCell clientId={client.id} onView={onView}>
                        <TypePill type={client.intakeType} />
                      </OpenClientCell>
                    </Table.Cell>
                    <Table.Cell>
                      <OpenClientCell clientId={client.id} onView={onView}>{client.invitedOn}</OpenClientCell>
                    </Table.Cell>
                    <Table.Cell>
                      <OpenClientCell clientId={client.id} onView={onView}>{client.lastActivity}</OpenClientCell>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
                        <IconButton aria-label={`Remove ${client.name}`} size="sm" type="button" variant="ghost" onPress={() => setPendingDelete(client)}>
                          <TrashGlyph className="size-4" />
                        </IconButton>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row id="empty">
                  <Table.Cell colSpan={7}>
                    <EmptyResults onReset={onReset} />
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table.Root>

      <div className="grid gap-3 p-3 lg:hidden">
        {pageClients.length > 0 ? (
          pageClients.map((client) => (
            <Card className="cursor-pointer" key={client.id} onClick={() => onView(client.id)}>
              <Card.Content className="grid gap-2.5 p-3">
                <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <ClientIdentity client={client} />
                  <div className="flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
                    <IconButton aria-label={`Open ${client.name}`} size="sm" type="button" variant="ghost" onPress={() => onView(client.id)}>
                      <OpenGlyph className="size-4" />
                    </IconButton>
                    <IconButton aria-label={`Remove ${client.name}`} size="sm" type="button" variant="ghost" onPress={() => setPendingDelete(client)}>
                      <TrashGlyph className="size-4" />
                    </IconButton>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <StatusPill status={client.status} />
                  <TypePill type={client.intakeType} />
                </div>
              </Card.Content>
            </Card>
          ))
        ) : (
          <EmptyResults onReset={onReset} />
        )}
      </div>

      <Pagination.Root className="flex items-center justify-between gap-3 border-t border-default px-3 py-3" aria-label="Client pagination" size="sm">
        <Pagination.Summary>
          <Typography type="body-xs" color="muted">
            {clients.length > 0
              ? `Showing ${startRow} to ${endRow} of ${totalClients} clients`
              : 'No clients match these filters'}
          </Typography>
        </Pagination.Summary>
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous isDisabled={page === 1} onPress={() => setPage((current) => Math.max(1, current - 1))}>
              Prev
            </Pagination.Previous>
          </Pagination.Item>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
            <Pagination.Item key={pageNumber}>
              <Pagination.Link isActive={pageNumber === page} onPress={() => setPage(pageNumber)}>
                {pageNumber}
              </Pagination.Link>
            </Pagination.Item>
          ))}
          <Pagination.Item>
            <Pagination.Next isDisabled={page === pageCount} onPress={() => setPage((current) => Math.min(pageCount, current + 1))}>
              Next
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination.Root>

      <ModalShell
        isOpen={Boolean(pendingDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setPendingDelete(null);
          }
        }}
      >
        <Card.Content className="grid gap-4 p-4 sm:p-5">
          <div className="grid gap-1">
            <Typography type="h5" weight="semibold">Delete client?</Typography>
            <Typography type="body-xs" color="muted">
              This removes {pendingDelete?.name || 'the client'} from the table. You can add them again later if needed.
            </Typography>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button size="sm" type="button" variant="secondary" onPress={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="button"
              className="bg-danger text-white hover:bg-danger/90"
              onPress={() => {
                if (pendingDelete) {
                  onRemove(pendingDelete.id);
                  setPendingDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </Card.Content>
      </ModalShell>
    </>
  );
}

function OpenClientCell({
  children,
  clientId,
  onView,
}: {
  children: ReactNode;
  clientId: number;
  onView: (clientId: number) => void;
}) {
  return (
    <button className="block w-full cursor-pointer text-left" type="button" onClick={() => onView(clientId)}>
      {children}
    </button>
  );
}

function OpenGlyph({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7h10v10" />
      <path d="m7 17 10-10" />
    </svg>
  );
}

function TrashGlyph({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
