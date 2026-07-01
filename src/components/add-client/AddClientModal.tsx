import { Button, Chip, CloseIcon, Dropdown, Form, IconChevronDown, Input, Modal, Typography, buttonVariants } from '@heroui/react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { CtaButton } from '../common/CtaButton';
import { Dropdown as SelectField } from '../common/Dropdown';
import { ModalShell } from '../common/ModalShell';
import { EmailShareModal } from '../share/EmailShareModal';
import { modeLabels } from '../../data/dashboard';
import { createIntakeLink, createIntakeToken, registerIntakeToken } from '../../data/intakeLinks';
import { buildMailtoHref, buildSmsHref, buildWhatsAppHref } from '../../data/shareLinks';
import type { AddOutcome, ClientForm } from '../../types';

export type AddClientRoute = 'choose' | 'quick' | 'intake-details' | 'intake-link' | 'intake-share';

type AddClientModalProps = {
  form: ClientForm;
  isOpen: boolean;
  isSubmitting: boolean;
  route: AddClientRoute | null;
  onCancel: () => void;
  onComplete: (outcome: AddOutcome) => void;
  onFieldChange: (field: keyof ClientForm, value: string) => void;
  onPersistDraft: (outcome: AddOutcome) => void;
  onNavigate: (path: string) => void;
  onOpenChange: (isOpen: boolean) => void;
};

export function AddClientModal({
  form,
  isOpen,
  isSubmitting,
  route,
  onCancel,
  onComplete,
  onFieldChange,
  onPersistDraft,
  onNavigate,
  onOpenChange,
}: AddClientModalProps) {
  const currentRoute = route ?? 'choose';
  const showBack = currentRoute !== 'choose';

  return (
    <ModalShell isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 pt-4 sm:gap-3 sm:px-5">
        {showBack ? (
          <Button className="shrink-0" size="sm" type="button" variant="secondary" onPress={() => onNavigate(getBackPath(currentRoute))}>
            Back
          </Button>
        ) : (
          <span />
        )}
        <Modal.Heading className="min-w-0 text-center text-sm sm:text-base">{getModalTitle(currentRoute)}</Modal.Heading>
        <Button aria-label="Close add client" className="shrink-0" isIconOnly size="sm" type="button" variant="secondary" onPress={onCancel}>
          <CloseIcon className="size-4" />
        </Button>
      </Modal.Header>
      <Modal.Body className="grid gap-5">
        <Typography className="mx-auto max-w-xl text-center" type="body-xs" color="muted">
          {getModalCopy(currentRoute, form.name)}
        </Typography>
        {currentRoute === 'quick' ? (
          <QuickPlanForm
            form={form}
            isLoading={isSubmitting}
            onCancel={onCancel}
            onComplete={onComplete}
            onFieldChange={onFieldChange}
          />
        ) : currentRoute === 'intake-details' ? (
          <IntakeDetailsForm
            form={form}
            onFieldChange={onFieldChange}
            onNext={() => {
              onPersistDraft('invited');
              onNavigate('/add-client/intake/link');
            }}
          />
        ) : currentRoute === 'intake-link' ? (
          <GeneratedLinkStep form={form} isLoading={isSubmitting} onComplete={onComplete} />
        ) : currentRoute === 'intake-share' ? (
          <ShareStep
            contact={createContact(form)}
            intakeLink={createIntakeLink(createIntakeToken(form))}
            isLoading={isSubmitting}
            onComplete={onComplete}
          />
        ) : (
          <AddModeChoices onCancel={onCancel} onNavigate={onNavigate} />
        )}
      </Modal.Body>
    </ModalShell>
  );
}

function AddModeChoices({
  onCancel,
  onNavigate,
}: {
  onCancel: () => void;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="grid gap-3">
      <AddChoice
        mark="QP"
        title={modeLabels.quick}
        body="Collect key details and answer a few questions to create a quick plan."
        onClick={() => onNavigate('/add-client/quick')}
      />
      <AddChoice
        mark="IF"
        title={modeLabels.intake}
        body="Send a detailed intake form for the client to fill on their own."
        onClick={() => onNavigate('/add-client/intake')}
      />
      <CtaButton fullWidth tone="secondary" type="button" onPress={onCancel}>Cancel</CtaButton>
    </div>
  );
}

function AddChoice({ mark, title, body, onClick }: { mark: string; title: string; body: string; onClick: () => void }) {
  return (
    <CtaButton className="min-h-24 w-full justify-start whitespace-normal px-5 py-4 text-left" tone="secondary" type="button" onPress={onClick}>
      <span className="grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4">
        <span className="grid size-10 place-items-center rounded-full bg-default text-xs font-semibold">{mark}</span>
        <span className="min-w-0">
          <Typography type="body-xs" weight="semibold">{title}</Typography>
          <Typography className="mt-1 whitespace-normal" type="body-xs" color="muted">{body}</Typography>
        </span>
        <span aria-hidden="true">›</span>
      </span>
    </CtaButton>
  );
}

function QuickPlanForm({
  form,
  isLoading,
  onCancel,
  onComplete,
  onFieldChange,
}: {
  form: ClientForm;
  isLoading: boolean;
  onCancel: () => void;
  onComplete: (outcome: AddOutcome) => void;
  onFieldChange: (field: keyof ClientForm, value: string) => void;
}) {
  const submitQuickPlan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onComplete('quick');
  };

  return (
    <Form className="grid gap-4" onSubmit={submitQuickPlan}>
      <div className="grid gap-3">
        <Input aria-label="Full name" placeholder="Enter full name" value={form.name} onChange={(event) => onFieldChange('name', event.target.value)} required />
        <Input aria-label="Email" placeholder="Enter email address" type="email" value={form.email} onChange={(event) => onFieldChange('email', event.target.value)} required />
        <Input aria-label="Phone" placeholder="Enter phone number" value={form.phone} onChange={(event) => onFieldChange('phone', event.target.value)} />
        <SelectField
          label="Primary reason"
          value={form.reason}
          options={['Protect family from future care costs', 'Compare coverage options', 'Plan for retirement', 'Review an existing policy']}
          onChange={(value) => onFieldChange('reason', value)}
        />
        <SelectField
          label="Care concern"
          value={form.careConcern}
          options={['Care at home', 'Assisted living', 'Nursing home care', 'Not sure yet']}
          onChange={(value) => onFieldChange('careConcern', value)}
        />
        <SelectField
          label="Monthly benefit"
          value={form.monthlyBenefit}
          options={['$3,000', '$4,500', '$6,000', '$8,000', 'Not sure yet']}
          onChange={(value) => onFieldChange('monthlyBenefit', value)}
        />
        <SelectField
          label="Coverage start"
          value={form.coverageStart}
          options={['Within 3 months', 'In 3 to 6 months', 'Later this year', 'Just exploring']}
          onChange={(value) => onFieldChange('coverageStart', value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <CtaButton tone="secondary" type="button" onPress={onCancel}>Cancel</CtaButton>
        <CtaButton isLoading={isLoading} type="submit">Save Quick Plan</CtaButton>
      </div>
    </Form>
  );
}

function IntakeDetailsForm({
  form,
  onFieldChange,
  onNext,
}: {
  form: ClientForm;
  onFieldChange: (field: keyof ClientForm, value: string) => void;
  onNext: () => void;
}) {
  const submitDetails = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNext();
  };

  return (
    <Form className="grid gap-3" onSubmit={submitDetails}>
      <Input aria-label="Full name" placeholder="Enter full name" value={form.name} onChange={(event) => onFieldChange('name', event.target.value)} required />
      <Input aria-label="Email or phone" placeholder="Enter email or phone number" value={form.email} onChange={(event) => onFieldChange('email', event.target.value)} required />
      <CtaButton fullWidth type="submit">Generate Link</CtaButton>
    </Form>
  );
}

function GeneratedLinkStep({
  form,
  isLoading,
  onComplete,
}: {
  form: ClientForm;
  isLoading: boolean;
  onComplete: (outcome: AddOutcome) => void;
}) {
  const token = createIntakeToken(form);
  const intakeLink = createIntakeLink(token);
  const contact = useMemo(() => createContact(form), [form]);

  useEffect(() => {
    registerIntakeToken(form);
  }, [form]);

  return (
    <ShareStep contact={contact} intakeLink={intakeLink} isLoading={isLoading} onComplete={onComplete} />
  );
}

function ShareStep({
  contact,
  intakeLink,
  isLoading,
  onComplete,
}: {
  contact: { email: string; name: string; phone: string };
  intakeLink?: string;
  isLoading: boolean;
  onComplete: (outcome: AddOutcome) => void;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const [isEmailShareOpen, setIsEmailShareOpen] = useState(false);

  const copyLink = () => {
    if (intakeLink) {
      void navigator.clipboard?.writeText(intakeLink);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1400);
    }
  };

  const fillOutIntake = () => {
    if (intakeLink) {
      window.open(intakeLink, '_blank', 'noopener,noreferrer');
      return;
    }

    onComplete('behalf');
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="grid gap-1">
            <Typography type="body-xs" weight="semibold">Link ready</Typography>
            <Typography type="body-xs" color="muted">
              Share this unique intake link with {contact.name || 'the client'}.
            </Typography>
          </div>
          {isCopied ? (
            <Chip color="success" size="sm" variant="soft">
              <Chip.Label>Copied</Chip.Label>
            </Chip>
          ) : null}
        </div>

        <div className="grid gap-2 grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0 truncate rounded-medium border border-default bg-background px-3 py-2 font-mono text-[0.8rem] text-foreground">
            {intakeLink}
          </div>
          <CtaButton tone="secondary" type="button" onPress={copyLink}>Copy link</CtaButton>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <CtaButton className="h-10 w-full" tone="secondary" type="button" onPress={() => setIsEmailShareOpen(true)}>
          Send invite on email
        </CtaButton>
        <Dropdown>
          <Dropdown.Trigger className={`${buttonVariants({ size: 'sm', variant: 'secondary' })} h-10 w-full px-4 leading-none`}>
            <span className="inline-flex items-center justify-center gap-1 whitespace-nowrap leading-none">
              <span>Share</span>
              <IconChevronDown className="size-4 shrink-0" />
            </span>
          </Dropdown.Trigger>
          <Dropdown.Popover placement="bottom end">
            <Dropdown.Menu aria-label={`Share actions for ${contact.name || 'the client'}`}>
              <Dropdown.Item id="mail-app" onAction={() => {
                window.location.assign(buildMailtoHref(contact, intakeLink || ''));
              }}>
                Send via mail app
              </Dropdown.Item>
              <Dropdown.Item id="whatsapp" onAction={() => {
                window.open(buildWhatsAppHref(contact, intakeLink || ''), '_blank', 'noopener,noreferrer');
              }}>
                WhatsApp
              </Dropdown.Item>
              <Dropdown.Item id="sms" onAction={() => {
                window.open(buildSmsHref(contact, intakeLink || ''), '_blank', 'noopener,noreferrer');
              }}>
                SMS
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>

        <CtaButton className="w-full sm:col-span-2" isLoading={isLoading} type="button" onPress={fillOutIntake}>
          Fill out intake form
        </CtaButton>
      </div>

      <EmailShareModal
        contact={contact}
        intakeLink={intakeLink || ''}
        isOpen={isEmailShareOpen}
        onSent={() => onComplete('invited')}
        onOpenChange={setIsEmailShareOpen}
      />
    </div>
  );
}

function getBackPath(route: AddClientRoute) {
  if (route === 'intake-link') {
    return '/add-client/intake';
  }

  if (route === 'intake-share') {
    return '/add-client/intake/link';
  }

  return '/add-client';
}

function getModalTitle(route: AddClientRoute) {
  if (route === 'quick') {
    return 'Quick Plan';
  }

  if (route === 'intake-details') {
    return 'Intake Form';
  }

  if (route === 'intake-link') {
    return 'Intake Form Link Generated';
  }

  if (route === 'intake-share') {
    return 'Share Intake Form';
  }

  return 'Add Client';
}

function getModalCopy(route: AddClientRoute, name: string) {
  if (route === 'quick') {
    return 'Fill a few details and answer the key questions first.';
  }

  if (route === 'intake-details') {
    return 'Enter client details to generate their intake form link.';
  }

  if (route === 'intake-link') {
    return `The intake link for ${name || 'this client'} has been generated.`;
  }

  if (route === 'intake-share') {
    return 'Share the link or start the intake form yourself.';
  }

  return 'Choose how you want to onboard this client.';
}

function createContact(form: ClientForm) {
  return {
    email: form.email || 'client@example.com',
    name: form.name || 'New Client',
    phone: form.phone || '',
  };
}
