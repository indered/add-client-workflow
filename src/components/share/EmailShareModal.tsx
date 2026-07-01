import { Button, Card, Chip, CloseIcon, Input, TextArea, Typography } from '@heroui/react';
import { useEffect, useState } from 'react';
import { CtaButton } from '../common/CtaButton';
import { ModalShell } from '../common/ModalShell';
import {
  buildEmailBody,
  buildEmailSubject,
  getEmailConnectUrl,
  getProviderIcon,
  getProviderLabel,
  readConnectedEmailProvider,
  saveConnectedEmailProvider,
  type EmailProvider,
} from '../../data/shareLinks';
import type { ShareContact } from '../../data/shareLinks';

type EmailShareModalProps = {
  contact: ShareContact;
  intakeLink: string;
  isOpen: boolean;
  onSent?: () => void;
  onOpenChange: (isOpen: boolean) => void;
};

type ComposerState = 'choose' | 'connecting' | 'compose' | 'sending' | 'sent';

export function EmailShareModal({ contact, intakeLink, isOpen, onOpenChange, onSent }: EmailShareModalProps) {
  const [provider, setProvider] = useState<EmailProvider | null>(null);
  const [state, setState] = useState<ComposerState>('choose');
  const [to, setTo] = useState(contact.email);
  const [subject, setSubject] = useState(buildEmailSubject(contact));
  const [message, setMessage] = useState(buildEmailBody(contact, intakeLink));

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const storedProvider = readConnectedEmailProvider();
    const nextProvider = storedProvider ?? null;
    setProvider(nextProvider);
    setState(nextProvider ? 'compose' : 'choose');
    setTo(contact.email);
    setSubject(buildEmailSubject(contact));
    setMessage(buildEmailBody(contact, intakeLink));
  }, [contact, intakeLink, isOpen]);

  const startConnect = (nextProvider: EmailProvider) => {
    setState('connecting');
    window.open(getEmailConnectUrl(nextProvider, contact.name), '_blank', 'noopener,noreferrer');

    window.setTimeout(() => {
      saveConnectedEmailProvider(nextProvider);
      setProvider(nextProvider);
      setState('compose');
    }, 700);
  };

  const sendEmail = () => {
    setState('sending');

    window.setTimeout(() => {
      setState('sent');
      onSent?.();
    }, 850);
  };

  return (
    <ModalShell isOpen={isOpen} onOpenChange={onOpenChange}>
      <div className="grid gap-4 p-4 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="grid gap-1">
            <Typography type="h5" weight="semibold">Send email in app</Typography>
            <Typography type="body-xs" color="muted">
              {provider ? `Connected with ${getProviderLabel(provider)}.` : 'Pick a mailbox first, then send from Waterlily.'}
            </Typography>
          </div>
          <Button aria-label="Close email composer" isIconOnly type="button" variant="secondary" onPress={() => onOpenChange(false)}>
            <CloseIcon className="size-4" />
          </Button>
        </div>

        {state === 'choose' ? (
          <div className="grid gap-3">
            <ProviderCard provider="gmail" onPress={() => startConnect('gmail')} />
            <ProviderCard provider="outlook" onPress={() => startConnect('outlook')} />
          </div>
        ) : state === 'connecting' ? (
          <Card>
            <Card.Content className="grid gap-3 p-5 text-center">
              <Chip color="accent" size="sm" variant="soft">
                <Chip.Label>Connecting</Chip.Label>
              </Chip>
              <Typography type="body-xs" weight="semibold">Opening the mailbox setup page now.</Typography>
              <Typography type="body-xs" color="muted">
                This is a dummy connect flow. The provider will show as added locally in a moment.
              </Typography>
            </Card.Content>
          </Card>
        ) : state === 'sent' ? (
          <Card>
            <Card.Content className="grid gap-3 p-5 text-center">
              <Chip color="success" size="sm" variant="soft">
                <Chip.Label>Sent</Chip.Label>
              </Chip>
              <Typography type="body-xs" weight="semibold">The email was sent inside Waterlily.</Typography>
              <Typography type="body-xs" color="muted">A real integration would log the send event here.</Typography>
              <CtaButton type="button" onPress={() => onOpenChange(false)}>Done</CtaButton>
            </Card.Content>
          </Card>
        ) : (
          <div className="grid gap-4">
            <Card>
              <Card.Content className="grid gap-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="grid gap-1">
                    <Typography type="body-xs" weight="semibold">Connected mailbox</Typography>
                    <Typography type="body-xs" color="muted">This is the account that will send the email.</Typography>
                  </div>
                  {provider ? (
                    <Chip color="success" size="sm" variant="soft">
                      <Chip.Label>{getProviderLabel(provider)} connected</Chip.Label>
                    </Chip>
                  ) : null}
                </div>

                <div className="grid gap-3">
                  <div className="grid gap-1.5">
                    <Typography type="body-xs" weight="medium">To</Typography>
                    <Input aria-label="Send to" placeholder="Client email" value={to} onChange={(event) => setTo(event.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <Typography type="body-xs" weight="medium">Subject</Typography>
                    <Input aria-label="Subject" placeholder="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <Typography type="body-xs" weight="medium">Message</Typography>
                    <TextArea aria-label="Message" className="min-h-28" placeholder="Write your message" value={message} onChange={(event) => setMessage(event.target.value)} />
                  </div>
                </div>
              </Card.Content>
            </Card>

            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="secondary" onPress={() => onOpenChange(false)}>Cancel</Button>
              <CtaButton isLoading={state === 'sending'} type="button" onPress={sendEmail}>Send email</CtaButton>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function ProviderCard({ provider, onPress }: { provider: EmailProvider; onPress: () => void }) {
  return (
    <Button className="h-auto justify-start py-4" type="button" variant="secondary" onPress={onPress}>
      <span className="grid w-full grid-cols-[2rem_1fr_auto] items-center gap-3 text-left">
        <span className="grid size-8 place-items-center rounded-full bg-default text-xs font-semibold">
          {getProviderIcon(provider)}
        </span>
        <span className="grid">
          <Typography type="body-xs" weight="semibold">{getProviderLabel(provider)}</Typography>
          <Typography type="body-xs" color="muted">Connect this mailbox and keep sending inside Waterlily.</Typography>
        </span>
        <span aria-hidden="true">›</span>
      </span>
    </Button>
  );
}
