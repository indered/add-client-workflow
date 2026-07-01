import { Button, Card, Chip, Heading, Input, Typography } from '@heroui/react';
import { useEffect, useState } from 'react';
import { CtaButton } from '../common/CtaButton';
import {
  getEmailConnectUrl,
  getProviderLabel,
  readConnectedEmailProvider,
  saveConnectedEmailProvider,
  type EmailProvider,
} from '../../data/shareLinks';

type SettingsViewProps = {
  advisorEmail: string;
  advisorName: string;
  theme: 'Light' | 'Dark';
  onAdvisorNameChange: (name: string) => void;
  onBack: () => void;
  onThemeToggle: () => void;
};

export function SettingsView({ advisorEmail, advisorName, onAdvisorNameChange, onBack, onThemeToggle, theme }: SettingsViewProps) {
  const [draftName, setDraftName] = useState(advisorName);
  const [connectedProvider, setConnectedProvider] = useState<EmailProvider | null>(readConnectedEmailProvider());
  const [isConnecting, setIsConnecting] = useState<EmailProvider | null>(null);

  useEffect(() => {
    setDraftName(advisorName);
  }, [advisorName]);

  const connectProvider = (provider: EmailProvider) => {
    setIsConnecting(provider);
    window.open(getEmailConnectUrl(provider, advisorName || 'Advisor'), '_blank', 'noopener,noreferrer');

    window.setTimeout(() => {
      saveConnectedEmailProvider(provider);
      setConnectedProvider(provider);
      setIsConnecting(null);
    }, 700);
  };

  const saveName = () => {
    onAdvisorNameChange(draftName.trim() || advisorName);
  };

  return (
    <div className="grid gap-4">
      <Card>
        <Card.Content className="grid gap-4 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="grid gap-1">
              <Heading level={2}>Settings</Heading>
              <Typography type="body-xs" color="muted">
                Manage the signed-in profile and mailbox connections.
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Button
                aria-label={`Switch to ${theme === 'Light' ? 'Dark' : 'Light'} theme`}
                isIconOnly
                size="sm"
                type="button"
                variant="outline"
                onPress={onThemeToggle}
              >
                <span aria-hidden="true">{theme === 'Light' ? '☾' : '☀'}</span>
              </Button>
              <Button size="sm" type="button" variant="ghost" onPress={onBack}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="h-full">
          <Card.Content className="grid h-full content-start gap-4 p-4 sm:p-5">
            <div className="grid gap-1">
              <Typography type="h6" weight="semibold">Advisor profile</Typography>
              <Typography type="body-xs" color="muted">This is the name people see in Waterlily.</Typography>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Typography type="body-xs" weight="medium">Logged in email</Typography>
                <Input aria-label="Logged in email" value={advisorEmail} readOnly />
              </div>
              <div className="grid gap-1.5">
                <Typography type="body-xs" weight="medium">Advisor name</Typography>
                <Input aria-label="Advisor name" placeholder="Advisor name" value={draftName} onChange={(event) => setDraftName(event.target.value)} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <CtaButton type="button" onPress={saveName}>Save name</CtaButton>
              <Typography type="body-xs" color="muted">
                The app keeps this in local storage.
              </Typography>
            </div>
          </Card.Content>
        </Card>

        <Card className="h-full">
          <Card.Content className="grid h-full content-start gap-4 p-4 sm:p-5">
            <div className="grid gap-1">
              <Typography type="h6" weight="semibold">Email connections</Typography>
              <Typography type="body-xs" color="muted">Connect Gmail or Outlook so email can send from inside the app.</Typography>
            </div>

            <div className="grid gap-3">
              <ConnectionRow
                isConnected={connectedProvider === 'gmail'}
                isConnecting={isConnecting === 'gmail'}
                provider="gmail"
                label="Gmail"
                onPress={() => connectProvider('gmail')}
              />
              <ConnectionRow
                isConnected={connectedProvider === 'outlook'}
                isConnecting={isConnecting === 'outlook'}
                provider="outlook"
                label="Outlook"
                onPress={() => connectProvider('outlook')}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {connectedProvider ? (
                <Chip color="success" size="sm" variant="soft">
                  <Chip.Label>{getProviderLabel(connectedProvider)} connected</Chip.Label>
                </Chip>
              ) : (
                <Chip size="sm" variant="soft">
                  <Chip.Label>No mailbox connected</Chip.Label>
                </Chip>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

function ConnectionRow({
  isConnected,
  isConnecting,
  provider,
  label,
  onPress,
}: {
  isConnected: boolean;
  isConnecting: boolean;
  provider: EmailProvider;
  label: string;
  onPress: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-large border border-default bg-default/30 px-4 py-4">
      <ProviderGlyph provider={provider} />
      <div className="grid min-w-0 flex-1 gap-1">
        <Typography type="body-xs" weight="semibold">{label}</Typography>
        <Typography type="body-xs" color="muted">
          {isConnected ? 'This mailbox is connected in Waterlily.' : isConnecting ? 'Opening the connect page now.' : 'Add this mailbox to send email from Waterlily.'}
        </Typography>
      </div>
      {isConnected ? (
        <Chip color="success" size="sm" variant="soft">
          <Chip.Label>Connected</Chip.Label>
        </Chip>
      ) : (
        <Button size="sm" type="button" variant="ghost" onPress={onPress}>
          {isConnecting ? 'Opening' : 'Connect'}
        </Button>
      )}
    </div>
  );
}

function ProviderGlyph({ provider }: { provider: EmailProvider }) {
  return (
    <div className="grid size-10 place-items-center rounded-full bg-background text-[0.7rem] font-semibold text-foreground shadow-sm">
      {provider === 'gmail' ? <GmailMark /> : <OutlookMark />}
    </div>
  );
}

function GmailMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none">
      <path d="M4 7.5 12 13l8-5.5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-11Z" fill="#EA4335" opacity=".95" />
      <path d="M4 7.5 8.7 11V21H5a1 1 0 0 1-1-1V7.5Z" fill="#34A853" />
      <path d="M20 7.5 15.3 11V21H19a1 1 0 0 0 1-1V7.5Z" fill="#4285F4" />
      <path d="M4 7.5 12 13l8-5.5V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v1.5Z" fill="#FBBC05" />
    </svg>
  );
}

function OutlookMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none">
      <rect x="4" y="5" width="10" height="14" rx="2" fill="#2F6BFF" />
      <path d="M14 7h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4V7Z" fill="#2F6BFF" opacity=".9" />
      <path d="M7 10.5h10v3H7z" fill="#fff" opacity=".92" />
      <path d="M7 10.5 12 14l5-3.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
