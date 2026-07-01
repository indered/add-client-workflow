export type ShareContact = {
  email: string;
  name: string;
  phone: string;
};

export type EmailProvider = 'gmail' | 'outlook';

const providerStorageKey = 'waterlily-email-provider';

export function getEmailConnectTarget(pathname: string, search: string) {
  if (pathname !== '/email-connect') {
    return null;
  }

  const provider = new URLSearchParams(search).get('provider');

  if (provider === 'gmail' || provider === 'outlook') {
    return provider;
  }

  return 'gmail';
}

export function getProviderLabel(provider: EmailProvider) {
  return provider === 'gmail' ? 'Gmail' : 'Outlook';
}

export function getProviderIcon(provider: EmailProvider) {
  return provider === 'gmail' ? 'G' : 'O';
}

export function readConnectedEmailProvider() {
  const stored = window.localStorage.getItem(providerStorageKey);

  if (stored === 'gmail' || stored === 'outlook') {
    return stored;
  }

  return null;
}

export function saveConnectedEmailProvider(provider: EmailProvider) {
  window.localStorage.setItem(providerStorageKey, provider);
}

export function buildEmailSubject(contact: ShareContact) {
  return `Waterlily intake for ${contact.name}`;
}

export function buildEmailBody(contact: ShareContact, intakeLink: string) {
  return [
    `Hi ${contact.name},`,
    '',
    `Your Waterlily intake link is ready: ${intakeLink}`,
    '',
    'Open it when you are ready and pick up where you left off.',
    '',
    'Thanks,',
    'Advisor',
  ].join('\n');
}

export function buildMailtoHref(contact: ShareContact, intakeLink: string) {
  return `mailto:${contact.email}?subject=${encodeURIComponent(buildEmailSubject(contact))}&body=${encodeURIComponent(buildEmailBody(contact, intakeLink))}`;
}

export function buildWhatsAppHref(contact: ShareContact, intakeLink: string) {
  const message = buildEmailBody(contact, intakeLink);
  const digits = digitsOnly(contact.phone);
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function buildSmsHref(contact: ShareContact, intakeLink: string) {
  const message = buildEmailBody(contact, intakeLink);
  return `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
}

export function getEmailConnectUrl(provider: EmailProvider, clientName: string) {
  const params = new URLSearchParams({
    client: clientName,
    provider,
  });

  return `/email-connect?${params.toString()}`;
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '') || '0';
}
