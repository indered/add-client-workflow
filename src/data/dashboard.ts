import type { AddMode, Client } from '../types';
import clientSeed from './clients.json';

export const initialClients = clientSeed.clients as Client[];

export const statusOptions = ['All Statuses', 'Invited', 'In Progress', 'Completed'];
export const intakeOptions = ['All Types', 'Full Intake', 'Quick Plan'];
export const stepOptions = ['All Steps', 'Not started', 'Step 2 of 6', 'Completed', 'Quick plan created'];

export const modeLabels: Record<AddMode, string> = {
  quick: 'Quick Plan',
  intake: 'Intake Form',
};

export const todayLabel = 'Jul 1, 2026 9:41 PM';
