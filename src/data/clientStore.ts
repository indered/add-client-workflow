import type { Client } from '../types';
import type { IntakeTokenPayload } from './intakeLinks';
import { initialClients } from './dashboard';

export const clientsStorageKey = 'waterlily-clients';

export type IntakeSubmission = {
  email: string;
  name: string;
  phone: string;
};

export function loadClients() {
  const stored = window.localStorage.getItem(clientsStorageKey);

  if (!stored) {
    return initialClients;
  }

  try {
    return JSON.parse(stored) as Client[];
  } catch {
    return initialClients;
  }
}

export function saveClients(clients: Client[]) {
  window.localStorage.setItem(clientsStorageKey, JSON.stringify(clients));
}

export function applyIntakeSubmission(payload: IntakeTokenPayload, submission: IntakeSubmission, submittedAt: string) {
  const nextClients = loadClients();
  const normalizedEmail = (submission.email || payload.clientEmail).trim().toLowerCase();
  const normalizedName = (submission.name || payload.clientName).trim() || 'New Client';
  const normalizedPhone = submission.phone || payload.clientPhone || 'No phone added';

  const index = nextClients.findIndex((client) => client.email.trim().toLowerCase() === normalizedEmail);
  const updatedClient: Client = {
    id: index >= 0 ? nextClients[index].id : Date.now(),
    initials: getInitials(normalizedName),
    name: normalizedName,
    email: normalizedEmail || payload.clientEmail,
    phone: normalizedPhone,
    status: 'Completed',
    intakeType: 'Full Intake',
    step: 'Completed',
    progress: 100,
    invitedOn: index >= 0 ? nextClients[index].invitedOn : submittedAt,
    lastActivity: submittedAt,
    tone: index >= 0 ? nextClients[index].tone : 'violet',
  };

  if (index >= 0) {
    nextClients[index] = updatedClient;
  } else {
    nextClients.unshift(updatedClient);
  }

  saveClients(nextClients);
  window.dispatchEvent(new Event('waterlily-clients-updated'));
}

export function updateClientInStore(clientId: number, updates: Partial<Pick<Client, 'email' | 'name' | 'phone'>>) {
  const nextClients = loadClients();
  const index = nextClients.findIndex((client) => client.id === clientId);

  if (index < 0) {
    return;
  }

  const current = nextClients[index];
  const nextName = updates.name ?? current.name;

  nextClients[index] = {
    ...current,
    ...updates,
    initials: updates.name ? getInitials(nextName) : current.initials,
    name: nextName,
  };

  saveClients(nextClients);
  window.dispatchEvent(new Event('waterlily-clients-updated'));
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'NC';
}
