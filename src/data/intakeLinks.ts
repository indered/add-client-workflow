import type { ClientForm } from '../types';

export type IntakeTokenPayload = {
  advisorName: string;
  clientEmail: string;
  clientName: string;
  clientPhone: string;
  token: string;
};

const advisorId = 'advisor-kate-moore';
const advisorName = 'Advisor';
const storagePrefix = 'waterlily-intake-token:';

export function createIntakeToken(form: ClientForm) {
  const clientKey = slugify(form.email || form.name || 'new-client');
  const raw = `${advisorId}:${form.email}:${form.name}:${form.phone}`;
  return `wl_${advisorId}_${clientKey}_${hash(raw)}`;
}

export function createIntakeLink(token: string) {
  const origin = window.location.origin;
  return `${origin}/intake/${token}`;
}

export function registerIntakeToken(form: ClientForm) {
  const token = createIntakeToken(form);
  const payload: IntakeTokenPayload = {
    advisorName,
    clientEmail: form.email,
    clientName: form.name,
    clientPhone: form.phone,
    token,
  };

  window.localStorage.setItem(`${storagePrefix}${token}`, JSON.stringify(payload));
  return payload;
}

export function readIntakeToken(token: string): IntakeTokenPayload {
  const stored = window.localStorage.getItem(`${storagePrefix}${token}`);

  if (stored) {
    return JSON.parse(stored) as IntakeTokenPayload;
  }

  return {
    advisorName,
    clientEmail: '',
    clientName: titleize(token.split('_')[2] ?? 'New Client'),
    clientPhone: '',
    token,
  };
}

export function getIntakeTokenFromPath(pathname: string) {
  const match = pathname.match(/^\/intake\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'client';
}

function hash(value: string) {
  let result = 0;

  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) % 1000000;
  }

  return String(result).padStart(6, '0');
}

function titleize(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}
