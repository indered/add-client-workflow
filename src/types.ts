import type { FormEvent } from 'react';

export type ClientStatus = 'Invited' | 'In Progress' | 'Completed';
export type IntakeType = 'Full Intake' | 'Quick Plan';
export type AddMode = 'quick' | 'intake';
export type AddOutcome = 'quick' | 'invited' | 'behalf';
export type MetricTone = 'violet' | 'amber' | 'blue' | 'green' | 'rose' | 'neutral';

export type Client = {
  id: number;
  name: string;
  initials: string;
  email: string;
  phone: string;
  status: ClientStatus;
  intakeType: IntakeType;
  step: string;
  progress: number;
  invitedOn: string;
  lastActivity: string;
  tone: 'violet' | 'mint' | 'photo' | 'amber' | 'rose';
};

export type ClientForm = {
  name: string;
  email: string;
  phone: string;
  goal: string;
  risk: string;
  birthDate: string;
  reason: string;
  careConcern: string;
  monthlyBenefit: string;
  coverageStart: string;
};

export type AddClientSubmit = (event: FormEvent<HTMLFormElement>) => void;
