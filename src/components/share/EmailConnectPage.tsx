import { Button, Card, Chip, ExternalLinkIcon, SuccessIcon, Typography } from '@heroui/react';
import { useEffect } from 'react';
import { saveConnectedEmailProvider, getProviderLabel, type EmailProvider } from '../../data/shareLinks';

type EmailConnectPageProps = {
  provider: EmailProvider;
  theme: 'Light' | 'Dark';
  onThemeToggle: () => void;
};

export function EmailConnectPage({ provider, theme, onThemeToggle }: EmailConnectPageProps) {
  useEffect(() => {
    saveConnectedEmailProvider(provider);
  }, [provider]);

  const label = getProviderLabel(provider);

  return (
    <main className="grid min-h-screen place-items-center bg-default p-4">
      <Card className="w-full max-w-lg">
        <Card.Content className="grid gap-5 p-5 text-center">
          <div className="flex items-center justify-end gap-2">
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
          </div>
          <div className="grid justify-items-center gap-2">
            <Chip color="success" size="sm" variant="soft">
              <Chip.Label>Connected</Chip.Label>
            </Chip>
            <SuccessIcon className="size-10 text-success" />
            <Typography type="h4" weight="semibold">{label} added</Typography>
            <Typography type="body-xs" color="muted">
              The connection is saved locally. You can close this tab and send the email from Waterlily.
            </Typography>
          </div>

          <div className="grid gap-2">
            <Button type="button" variant="primary" onPress={() => window.close()}>
              Close tab
            </Button>
            <Button type="button" variant="outline" onPress={() => window.location.assign('/')}>
              <ExternalLinkIcon className="size-4" />
              Return to Waterlily
            </Button>
          </div>
        </Card.Content>
      </Card>
    </main>
  );
}
