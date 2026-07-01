import {
  Button,
  Card,
  CircleDashedIcon,
  Dropdown,
  ExternalLinkIcon,
  IconCalendar,
  IconChevronDown,
  IconChevronLeft,
  Form,
  Input,
  SuccessIcon,
  Typography,
  buttonVariants,
} from '@heroui/react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { CtaButton } from '../common/CtaButton';
import { ModalShell } from '../common/ModalShell';
import { createIntakeLink, createIntakeToken, registerIntakeToken } from '../../data/intakeLinks';
import { EmailShareModal } from '../share/EmailShareModal';
import { buildMailtoHref, buildSmsHref, buildWhatsAppHref } from '../../data/shareLinks';
import { updateClientInStore } from '../../data/clientStore';
import { StatusPill, TypePill } from './StatusPill';
import type { Client, ClientForm, ClientStatus } from '../../types';

type ClientDetailViewProps = {
  advisorName: string;
  client: Client;
  theme: 'Light' | 'Dark';
  onBack: () => void;
  onThemeToggle: () => void;
};

type DetailTone = 'success' | 'warning' | 'accent' | 'default';

const onboardingSteps = ['Link Generated', 'Invited', 'Opened', 'In Progress', 'Completed'];

export function ClientDetailView({ advisorName, client, theme, onBack, onThemeToggle }: ClientDetailViewProps) {
  const activeStep = getActiveStep(client);
  const timeline = getTimeline(client);
  const [isEmailShareOpen, setIsEmailShareOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [editDraft, setEditDraft] = useState(() => getEditDraft(client));
  const intakeForm = getClientFormSeed(client);
  const intakeToken = createIntakeToken(intakeForm);
  const intakeLink = createIntakeLink(intakeToken);
  const filledIntake = getFilledIntakeRows(client);

  useEffect(() => {
    registerIntakeToken(intakeForm);
  }, [client.email, client.id, client.name, client.phone]);

  useEffect(() => {
    setEditDraft(getEditDraft(client));
  }, [client]);

  const runQuickAction = (action: string) => {
    if (action === 'Fill Out Intake Form') {
      window.open(intakeLink, '_blank', 'noopener,noreferrer');
      return;
    }

    if (action === 'Copy Link') {
      copyIntakeLink();
    }
  };

  const copyIntakeLink = async () => {
    try {
      setCopyState('loading');
      await navigator.clipboard?.writeText(intakeLink);
      setCopyState('done');
      window.setTimeout(() => setCopyState('idle'), 1400);
    } catch {
      setCopyState('idle');
    }
  };

  const saveClientEdits = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateClientInStore(client.id, editDraft);
    setIsEditOpen(false);
  };

  return (
    <div className="grid gap-4">
      <Card>
        <Card.Content className="grid gap-3 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <Button size="sm" type="button" variant="ghost" onPress={onBack}>
              <IconChevronLeft className="size-4" />
              Back to Dashboard
            </Button>
            <Button
              aria-label={`Switch to ${theme === 'Light' ? 'Dark' : 'Light'} theme`}
              className="shrink-0"
              isIconOnly
              size="sm"
              type="button"
              variant="outline"
              onPress={onThemeToggle}
            >
              <span aria-hidden="true">{theme === 'Light' ? '☾' : '☀'}</span>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:hidden">
            <CtaButton className="h-10" tone="secondary" type="button" onPress={() => setIsEmailShareOpen(true)}>
              Send invite on email
            </CtaButton>
            <ShareActions client={client} intakeLink={intakeLink} onCopyLink={copyIntakeLink} onOpenEmail={() => setIsEmailShareOpen(true)} />
            <CopyLinkButton copyState={copyState} onPress={copyIntakeLink} />
            <DetailActions client={client} intakeLink={intakeLink} onOpenEmail={() => setIsEmailShareOpen(true)} />
          </div>
          <div className="hidden items-start justify-between gap-3 lg:flex">
            <Button size="sm" type="button" variant="ghost" onPress={onBack}>
              <IconChevronLeft className="size-4" />
              Back to Dashboard
            </Button>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <CtaButton tone="secondary" type="button" onPress={() => setIsEmailShareOpen(true)}>
                Send invite on email
              </CtaButton>
              <ShareActions client={client} intakeLink={intakeLink} onCopyLink={copyIntakeLink} onOpenEmail={() => setIsEmailShareOpen(true)} />
              <CopyLinkButton copyState={copyState} onPress={copyIntakeLink} />
              <DetailActions client={client} intakeLink={intakeLink} onOpenEmail={() => setIsEmailShareOpen(true)} />
              <Button aria-label={`Switch to ${theme === 'Light' ? 'Dark' : 'Light'} theme`} isIconOnly size="sm" type="button" variant="outline" onPress={onThemeToggle}>
                <span aria-hidden="true">{theme === 'Light' ? '☾' : '☀'}</span>
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <Typography type="h2" weight="semibold">{client.name}</Typography>
              <StatusPill status={client.status} />
              <TypePill type={client.intakeType} />
            </div>
            <Typography type="body-xs" color="muted">
              Client since {getClientSince(client)} · Advisor: {advisorName}
            </Typography>
          </div>
        </Card.Content>
      </Card>

      <div className="grid items-stretch gap-4 xl:grid-cols-[0.85fr_1fr_22rem]">
        <Card className="h-full">
          <Card.Content className="grid h-full content-start gap-3 p-3 sm:p-4">
            <SectionTitle title="Client Information" action="Edit" onAction={() => setIsEditOpen(true)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoField label="Full Name" value={client.name} />
              <InfoField label="Date of Birth" value={getBirthDate(client)} />
              <InfoField label="Email" value={client.email} />
              <InfoField label="Location" value={getLocation(client)} />
              <InfoField label="Phone" value={client.phone} />
              <InfoField label="Preferred Contact" value={getPreferredContact(client)} />
            </div>
          </Card.Content>
        </Card>

        <Card className="h-full">
          <Card.Content className="grid h-full content-start gap-4 p-3 sm:p-4">
            <SectionTitle title="Onboarding Status" />
            <div className="grid grid-cols-5 gap-4 sm:gap-6">
              {onboardingSteps.map((step, index) => (
                <StatusStep activeStep={activeStep} index={index} key={step} label={step} />
              ))}
            </div>
            <div className="grid gap-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusPill status={client.status} />
                <Typography type="body-xs" color="muted">Last activity: {client.lastActivity}</Typography>
              </div>
              <Typography type="body-xs">{getStatusMessage(client)}</Typography>
              <CtaButton className="justify-self-start" tone="secondary" type="button" onPress={() => runQuickAction('Fill Out Intake Form')}>
                Fill out intake form
              </CtaButton>
            </div>
          </Card.Content>
        </Card>

        <Card className="h-full">
          <Card.Content className="grid h-full content-start gap-3 p-3 sm:p-4">
            <SectionTitle title="Timeline" subtitle="All events and activities." />
            {timeline.map((event) => (
              <div className="grid grid-cols-[2rem_1fr] gap-3" key={`${event.label}-${event.date}`}>
                <div className={`grid size-7 place-items-center rounded-full ${getToneClass(event.tone)}`}>
                  <IconCalendar className="size-4" />
                </div>
                <div className="grid gap-1">
                  <Typography type="body-xs" weight="semibold">{event.label}</Typography>
                  <Typography type="body-xs" color="muted">{event.date}</Typography>
                  <Typography type="body-xs">{event.detail}</Typography>
                </div>
              </div>
            ))}
          </Card.Content>
        </Card>
      </div>

      {filledIntake.length > 0 ? (
        <Card>
          <Card.Content className="grid gap-3 p-3 sm:p-4">
            <SectionTitle title="Filled intake" subtitle="Captured from the intake form when the client has started or submitted it." />
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {filledIntake.map((row) => (
                <InfoField key={row.label} label={row.label} value={row.value} />
              ))}
            </div>
          </Card.Content>
        </Card>
      ) : null}

      <EmailShareModal
        contact={client}
        intakeLink={intakeLink}
        isOpen={isEmailShareOpen}
        onOpenChange={setIsEmailShareOpen}
      />

      <ModalShell isOpen={isEditOpen} onOpenChange={setIsEditOpen}>
        <Form className="grid gap-4 p-4 sm:p-5" onSubmit={saveClientEdits}>
          <div className="grid gap-1">
            <Typography type="h5" weight="semibold">Edit client</Typography>
            <Typography type="body-xs" color="muted">Update the client details that appear in the table and client view.</Typography>
          </div>
          <div className="grid gap-3">
            <Input aria-label="Name" placeholder="Full name" value={editDraft.name} onChange={(event) => setEditDraft((current) => ({ ...current, name: event.target.value }))} />
            <Input aria-label="Email" placeholder="Email" type="email" value={editDraft.email} onChange={(event) => setEditDraft((current) => ({ ...current, email: event.target.value }))} />
            <Input aria-label="Phone" placeholder="Phone" value={editDraft.phone} onChange={(event) => setEditDraft((current) => ({ ...current, phone: event.target.value }))} />
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <CtaButton tone="secondary" type="button" onPress={() => setIsEditOpen(false)}>Cancel</CtaButton>
            <CtaButton type="submit">Save client</CtaButton>
          </div>
        </Form>
      </ModalShell>
    </div>
  );
}

function ShareActions({
  client,
  intakeLink,
  onCopyLink,
  onOpenEmail,
}: {
  client: Client;
  intakeLink: string;
  onCopyLink: () => void;
  onOpenEmail: () => void;
}) {
  return (
    <Dropdown>
      <Dropdown.Trigger className={`${buttonVariants({ size: 'sm', variant: 'outline' })} h-8 min-w-20 px-3 text-xs whitespace-nowrap`}>
        <span className="inline-flex items-center justify-center gap-1 whitespace-nowrap">
          Share
          <IconChevronDown className="size-3 shrink-0" />
        </span>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu aria-label={`Share actions for ${client.name}`}>
          <Dropdown.Item id="mailto" onAction={() => window.location.assign(buildMailtoHref(client, intakeLink))}>Email via mail app</Dropdown.Item>
          <Dropdown.Item id="whatsapp" onAction={() => window.open(buildWhatsAppHref(client, intakeLink), '_blank', 'noopener,noreferrer')}>WhatsApp</Dropdown.Item>
          <Dropdown.Item id="sms" onAction={() => window.open(buildSmsHref(client, intakeLink), '_blank', 'noopener,noreferrer')}>SMS</Dropdown.Item>
          <Dropdown.Item id="copy" onAction={onCopyLink}>Copy Link</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

function CopyLinkButton({
  copyState,
  onPress,
}: {
  copyState: 'idle' | 'loading' | 'done';
  onPress: () => void;
}) {
  return (
    <Button
      aria-label={copyState === 'done' ? 'Link copied' : 'Copy intake link'}
      isIconOnly
      size="sm"
      type="button"
      variant="outline"
      onPress={onPress}
    >
      {copyState === 'loading' ? <SpinnerGlyph /> : copyState === 'done' ? <SuccessIcon className="size-4" /> : <CopyGlyph className="size-4" />}
    </Button>
  );
}

function DetailActions({
  client,
  intakeLink,
  onOpenEmail,
}: {
  client: Client;
  intakeLink: string;
  onOpenEmail: () => void;
}) {
  return (
    <Dropdown>
      <Dropdown.Trigger className={`${buttonVariants({ size: 'sm', variant: 'secondary' })} h-8 min-w-16 px-3 text-xs whitespace-nowrap`}>
        <span className="inline-flex items-center justify-center gap-1 whitespace-nowrap">
          More
          <IconChevronDown className="size-3 shrink-0" />
        </span>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu aria-label={`Actions for ${client.name}`}>
          <Dropdown.Item id="resend" onAction={onOpenEmail}>
            Resend invitation
          </Dropdown.Item>
          <Dropdown.Item id="fill" onAction={() => window.open(intakeLink, '_blank', 'noopener,noreferrer')}>
            Fill out intake form
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

function SectionTitle({ action, onAction, subtitle, title }: { action?: string; onAction?: () => void; subtitle?: string; title: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="grid gap-1">
        <Typography type="h6" weight="semibold">{title}</Typography>
        {subtitle ? <Typography type="body-xs" color="muted">{subtitle}</Typography> : null}
      </div>
      {action ? <Button size="sm" type="button" variant="outline" onPress={onAction}>{action}</Button> : null}
    </div>
  );
}

function StatusStep({ activeStep, index, label }: { activeStep: number; index: number; label: string }) {
  const isDone = index < activeStep;
  const isActive = index === activeStep;

  return (
    <div className="grid w-full min-w-0 justify-items-center gap-2 text-center">
      <div className={`grid size-6 place-items-center rounded-full sm:size-7 ${isDone ? 'bg-success/15 text-success' : isActive ? 'bg-warning/15 text-warning' : 'bg-default text-muted-foreground'}`}>
        {isDone ? <SuccessIcon className="size-3 sm:size-3.5" /> : isActive ? <ExternalLinkIcon className="size-3 sm:size-3.5" /> : <CircleDashedIcon className="size-3 sm:size-3.5" />}
      </div>
      <div className="mx-auto block w-full max-w-[4.5rem] whitespace-normal break-words text-[0.58rem] font-medium leading-tight text-foreground sm:max-w-[5.5rem] sm:text-[0.72rem]">
        {label}
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <Typography type="body-xs" color="muted">{label}</Typography>
      <Typography type="body-xs" weight="medium">{value}</Typography>
    </div>
  );
}

function getActiveStep(client: Client) {
  if (client.status === 'Completed') {
    return 4;
  }

  if (client.status === 'In Progress') {
    return 3;
  }

  return 1;
}

function getTimeline(client: Client) {
  const events: Array<{ date: string; detail: string; label: string; tone: DetailTone }> = [
    {
      date: client.invitedOn,
      detail: `${client.intakeType} link was generated.`,
      label: 'Link Generated',
      tone: 'default',
    },
    {
      date: client.invitedOn,
      detail: `Invitation sent to ${client.email}.`,
      label: 'Invited via Email',
      tone: 'accent',
    },
  ];

  if (client.status !== 'Invited') {
    events.unshift({
      date: client.lastActivity,
      detail: client.status === 'Completed' ? 'Client completed the intake workflow.' : 'Client has started filling out the intake form.',
      label: client.status,
      tone: client.status === 'Completed' ? 'success' : 'warning',
    });
  }

  return events;
}

function getStatusMessage(client: Client) {
  const messages: Record<ClientStatus, string> = {
    Completed: 'The client workflow is complete and ready for advisor review.',
    'In Progress': 'Client has started filling out the intake form.',
    Invited: 'Client has been invited but has not started yet.',
  };

  return messages[client.status];
}

function getToneClass(tone: DetailTone) {
  if (tone === 'success') {
    return 'bg-success/15 text-success';
  }

  if (tone === 'warning') {
    return 'bg-warning/15 text-warning';
  }

  if (tone === 'accent') {
    return 'bg-accent/15 text-accent';
  }

  return 'bg-default text-muted-foreground';
}

function getClientSince(client: Client) {
  return client.invitedOn.split(' ').slice(0, 3).join(' ');
}

function getBirthDate(client: Client) {
  return client.id % 2 === 0 ? 'March 8, 1981' : 'May 15, 1985';
}

function getLocation(client: Client) {
  return client.id % 2 === 0 ? 'San Francisco, USA' : 'New York, USA';
}

function getPreferredContact(client: Client) {
  return client.phone === 'No phone added' ? 'Email' : 'Email and SMS';
}

function getClientFormSeed(client: Client): ClientForm {
  return {
    birthDate: '',
    careConcern: 'Care at home',
    coverageStart: 'Within 3 months',
    email: client.email,
    goal: 'Retirement planning',
    monthlyBenefit: '$6,000',
    name: client.name,
    phone: client.phone,
    reason: 'Protect family from future care costs',
    risk: 'Moderate',
  };
}

function CopyGlyph({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <path d="M7 15H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function SpinnerGlyph({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function getEditDraft(client: Client) {
  return {
    email: client.email,
    name: client.name,
    phone: client.phone,
  };
}

type FilledIntakeRow = {
  label: string;
  value: string;
};

function getFilledIntakeRows(client: Client): FilledIntakeRow[] {
  const token = createIntakeToken(getClientFormSeed(client));
  const storageKey = `waterlily-intake-progress:${token}`;
  const stored = window.localStorage.getItem(storageKey);

  if (!stored) {
    return [];
  }

  try {
    const answers = JSON.parse(stored) as Record<string, string>;
    const rows: FilledIntakeRow[] = [
      ['Full name', answers.name || client.name],
      ['Email', answers.email || client.email],
      ['Phone', answers.phone || client.phone],
      ['Date of birth', answers.birthDate || 'Not added'],
      ['Location', answers.location || 'Not added'],
      ['Policy type', answers.policyType || 'Not added'],
      ['Monthly benefit', answers.monthlyBenefit || 'Not added'],
      ['Inflation protection', answers.inflationProtection || 'Not added'],
      ['Coverage start', answers.coverageStart || 'Not added'],
    ].map(([label, value]) => ({ label, value }));

    return rows;
  } catch {
    return [];
  }
}
