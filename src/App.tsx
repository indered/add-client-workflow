import { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Card, Heading, Input, Typography } from '@heroui/react';
import { useLocation, useNavigate } from 'react-router';
import { AdvisorLogin } from './components/auth/AdvisorLogin';
import { AddClientModal } from './components/add-client/AddClientModal';
import { CtaButton } from './components/common/CtaButton';
import { Dropdown } from './components/common/Dropdown';
import { MetricCard } from './components/common/MetricCard';
import { ClientDataView } from './components/client/ClientDataView';
import { ClientDetailView } from './components/client/ClientDetailView';
import { ClientIntakeForm } from './components/intake/ClientIntakeForm';
import { EmailConnectPage } from './components/share/EmailConnectPage';
import { SettingsView } from './components/settings/SettingsView';
import { initialClients, intakeOptions, statusOptions, stepOptions, todayLabel } from './data/dashboard';
import { getIntakeTokenFromPath } from './data/intakeLinks';
import { getEmailConnectTarget } from './data/shareLinks';
import { clientsStorageKey, loadClients, saveClients } from './data/clientStore';
import type { AddOutcome, Client, ClientForm } from './types';

const dateRangeOptions = ['Last 30 days', 'Last 60 days', 'This year'];
const themeOptions = ['Light', 'Dark'] as const;

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const intakeToken = getIntakeTokenFromPath(location.pathname);
  const emailConnectProvider = getEmailConnectTarget(location.pathname, location.search);
  const [isAuthenticated, setIsAuthenticated] = useState(() => window.localStorage.getItem('waterlily-authenticated') === 'true');
  const [advisorEmail, setAdvisorEmail] = useState(() => window.localStorage.getItem('waterlily-auth-email') ?? '');
  const [advisorName, setAdvisorName] = useState(() => {
    const storedName = window.localStorage.getItem('waterlily-advisor-name');
    return storedName && storedName !== 'Kate Moore' ? storedName : 'Advisor';
  });
  const [clients, setClients] = useState(() => loadClients());
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]);
  const [intakeFilter, setIntakeFilter] = useState(intakeOptions[0]);
  const [stepFilter, setStepFilter] = useState(stepOptions[0]);
  const [dateRange, setDateRange] = useState(dateRangeOptions[0]);
  const [theme, setTheme] = useState<(typeof themeOptions)[number]>('Light');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ClientForm>(() => createBlankClientForm());
  const [showMobileAccountMenu, setShowMobileAccountMenu] = useState(false);

  useEffect(() => {
    if (!intakeToken && !emailConnectProvider && !isAuthenticated && location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [emailConnectProvider, intakeToken, isAuthenticated, location.pathname, navigate]);

  useEffect(() => {
    window.localStorage.setItem('waterlily-auth-email', advisorEmail);
  }, [advisorEmail]);

  useEffect(() => {
    window.localStorage.setItem('waterlily-advisor-name', advisorName);
  }, [advisorName]);

  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  useEffect(() => {
    const syncClients = () => setClients(loadClients());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === clientsStorageKey) {
        syncClients();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('waterlily-clients-updated', syncClients as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('waterlily-clients-updated', syncClients as EventListener);
    };
  }, []);

  const filteredClients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        client.name.toLowerCase().includes(normalizedQuery) ||
        client.email.toLowerCase().includes(normalizedQuery) ||
        client.phone.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === 'All Statuses' || client.status === statusFilter;
      const matchesType = intakeFilter === 'All Types' || client.intakeType === intakeFilter;
      const matchesStep = stepFilter === 'All Steps' || client.step === stepFilter;

      return matchesQuery && matchesStatus && matchesType && matchesStep;
    });
  }, [clients, intakeFilter, query, statusFilter, stepFilter]);

  const stats = useMemo(() => {
    const extraClients = clients.length - initialClients.length;
    return {
      totalClients: 128 + extraClients,
      invited: clients.filter((client) => client.status === 'Invited').length + 21,
      inProgress: clients.filter((client) => client.status === 'In Progress').length + 40,
      completed: clients.filter((client) => client.status === 'Completed').length + 56,
      quickPlans: clients.filter((client) => client.intakeType === 'Quick Plan').length + 5,
    };
  }, [clients]);

  const resetFilters = () => {
    setQuery('');
    setStatusFilter(statusOptions[0]);
    setIntakeFilter(intakeOptions[0]);
    setStepFilter(stepOptions[0]);
    setDateRange(dateRangeOptions[0]);
    setShowMobileFilters(false);
  };

  const openAddFlow = () => {
    setForm(createBlankClientForm());
    navigate('/add-client');
  };

  const closeAddFlow = () => {
    navigate('/');
    setIsSubmitting(false);
    setForm(createBlankClientForm());
  };

  const updateField = (field: keyof ClientForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const removeClient = (clientId: number) => {
    setClients((current) => current.filter((client) => client.id !== clientId));
  };

  const persistClientFromForm = (outcome: AddOutcome) => {
    const normalizedEmail = (form.email || 'client@example.com').trim().toLowerCase();
    const normalizedName = form.name || 'New Client';

    setClients((current) => {
      const index = current.findIndex((client) => client.email.trim().toLowerCase() === normalizedEmail);
      const existing = index >= 0 ? current[index] : null;
      const nextClient: Client = {
        id: existing?.id ?? Date.now(),
        name: normalizedName,
        initials: getInitials(normalizedName),
        email: normalizedEmail,
        phone: form.phone || 'No phone added',
        status: outcome === 'quick' ? 'Completed' : outcome === 'behalf' ? 'In Progress' : 'Invited',
        intakeType: outcome === 'quick' ? 'Quick Plan' : 'Full Intake',
        step: outcome === 'quick' ? 'Quick plan created' : outcome === 'behalf' ? 'Step 1 of 6' : 'Not started',
        progress: outcome === 'behalf' ? 17 : outcome === 'quick' ? 100 : 0,
        invitedOn: existing?.invitedOn ?? todayLabel,
        lastActivity: todayLabel,
        tone: existing?.tone ?? 'violet',
      };

      if (index >= 0) {
        const next = [...current];
        next[index] = nextClient;
        return next;
      }

      return [nextClient, ...current];
    });
  };

  const addClient = (outcome: AddOutcome) => {
    persistClientFromForm(outcome);
    closeAddFlow();
  };

  const completeAddFlow = (outcome: AddOutcome) => {
    setIsSubmitting(true);
    window.setTimeout(() => addClient(outcome), 260);
  };

  const nextTheme = theme === 'Light' ? 'Dark' : 'Light';
  const addClientRoute = getAddClientRoute(location.pathname);
  const selectedClientId = getClientDetailId(location.pathname);
  const selectedClient = selectedClientId ? clients.find((client) => client.id === selectedClientId) : null;
  const toggleTheme = () => setTheme(nextTheme);
  const isDashboardRoute = location.pathname === '/' || location.pathname.startsWith('/clients/') || location.pathname.startsWith('/add-client') || location.pathname.startsWith('/intake/');
  const isSettingsRoute = location.pathname === '/settings';

  const logout = () => {
    window.localStorage.removeItem('waterlily-authenticated');
    window.localStorage.removeItem('waterlily-auth-email');
    setIsAuthenticated(false);
    setAdvisorEmail('');
    setShowMobileAccountMenu(false);
    navigate('/');
  };

  if (intakeToken) {
    return <ClientIntakeForm theme={theme} token={intakeToken} onThemeToggle={toggleTheme} />;
  }

  if (emailConnectProvider) {
    return <EmailConnectPage onThemeToggle={toggleTheme} provider={emailConnectProvider} theme={theme} />;
  }

  if (!isAuthenticated) {
    return <AdvisorLogin onLogin={(email) => {
      setAdvisorEmail(email);
      setAdvisorName((current) => current || 'Advisor');
      window.localStorage.setItem('waterlily-auth-email', email);
      window.localStorage.setItem('waterlily-authenticated', 'true');
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <div className={`${theme === 'Dark' ? 'dark' : ''} min-h-screen bg-default text-foreground lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]`}>
      <aside className="hidden h-screen flex-col border-r border-white/10 bg-black p-6 lg:sticky lg:top-0 lg:flex" aria-label="Main navigation">
        <Heading className="mb-5 text-white" level={2}>Waterlily</Heading>
        <div className="flex items-center gap-3 border-b border-white/10 pb-5">
          <Avatar className="size-12 rounded-xl">
            <Avatar.Fallback>{getInitials(advisorName || 'Advisor')}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0">
            <Typography className="truncate text-white" type="body-sm" weight="medium">{advisorName}</Typography>
            <Typography className="truncate text-white/60" type="body-xs">
              {advisorEmail || 'advisor@example.com'}
            </Typography>
          </div>
        </div>
        <nav className="mt-6 grid gap-2" aria-label="Workspace">
          <Button
            className={isDashboardRoute ? 'justify-start bg-white/15 text-white hover:bg-white/15 hover:text-white' : 'justify-start text-white/80 hover:bg-white/10 hover:text-white'}
            fullWidth
            type="button"
            variant="ghost"
            onPress={() => navigate('/')}
          >
            Dashboard
          </Button>
          <Button
            className={isSettingsRoute ? 'justify-start bg-white/15 text-white hover:bg-white/15 hover:text-white' : 'justify-start text-white/80 hover:bg-white/10 hover:text-white'}
            fullWidth
            type="button"
            variant="ghost"
            onPress={() => navigate('/settings')}
          >
            Settings
          </Button>
        </nav>
        <nav className="mt-auto grid gap-2 border-t border-white/10 pt-5" aria-label="Account">
          <Button className="justify-start text-white/80 hover:bg-white/10 hover:text-white" fullWidth type="button" variant="ghost">Help & Information</Button>
          <Button className="justify-start gap-2 text-white/80 hover:bg-white/10 hover:text-white" fullWidth type="button" variant="ghost" onPress={logout}>
            <LogoutGlyph className="size-4" />
            Log out
          </Button>
        </nav>
      </aside>

      <main className="min-w-0 pb-40 p-3 sm:p-6 lg:p-8 lg:pb-8" id="dashboard">
        {selectedClient ? (
          <ClientDetailView advisorName={advisorName} client={selectedClient} theme={theme} onBack={() => navigate('/')} onThemeToggle={toggleTheme} />
        ) : location.pathname === '/settings' ? (
          <SettingsView
            advisorEmail={advisorEmail || 'advisor@example.com'}
            advisorName={advisorName}
            onAdvisorNameChange={setAdvisorName}
            onThemeToggle={toggleTheme}
            theme={theme}
          />
        ) : (
          <>
        <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:gap-3">
          <div className="min-w-0">
            <Heading className="hidden text-2xl leading-none sm:block sm:text-3xl lg:text-4xl" level={1}>Dashboard</Heading>
            <Typography className="mt-1" type="body-xs" color="muted">
              Track clients and intake progress in one place.
            </Typography>
          </div>
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <CtaButton className="px-2.5 sm:px-3" tone="secondary" type="button" onPress={() => setClients(loadClients())}>
              <RefreshGlyph className="size-4" />
              <span className="hidden sm:inline">Refresh</span>
            </CtaButton>
            <Button
              aria-label={`Switch to ${nextTheme} theme`}
              isIconOnly
              size="sm"
              type="button"
              variant="outline"
              onPress={toggleTheme}
            >
              <span aria-hidden="true">{theme === 'Light' ? '☾' : '☀'}</span>
            </Button>
            <CtaButton className="px-3 sm:px-4" type="button" onPress={openAddFlow}>
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Client</span>
            </CtaButton>
          </div>
        </header>

        <section className="mb-2 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 sm:mb-4 sm:grid sm:grid-cols-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-5" aria-label="Intake summary">
          <div className="min-w-[12rem] max-w-[12rem] shrink-0 snap-start sm:min-w-0 sm:max-w-none">
            <MetricCard label="Total Clients" mark="TC" value={stats.totalClients} tone="violet" note="View all" />
          </div>
          <div className="min-w-[12rem] max-w-[12rem] shrink-0 snap-start sm:min-w-0 sm:max-w-none">
            <MetricCard label="Invited" mark="IN" value={stats.invited} tone="amber" note="Awaiting response" />
          </div>
          <div className="min-w-[12rem] max-w-[12rem] shrink-0 snap-start sm:min-w-0 sm:max-w-none">
            <MetricCard label="In Progress" mark="IP" value={stats.inProgress} tone="blue" note="Intake in progress" />
          </div>
          <div className="min-w-[12rem] max-w-[12rem] shrink-0 snap-start sm:min-w-0 sm:max-w-none">
            <MetricCard label="Completed" mark="CO" value={stats.completed} tone="green" note="Intake completed" />
          </div>
          <div className="min-w-[12rem] max-w-[12rem] shrink-0 snap-start sm:min-w-0 sm:max-w-none">
            <MetricCard label="Quick Plans" mark="QP" value={stats.quickPlans} tone="rose" note="Created" />
          </div>
        </section>
        <Typography className="mb-4 sm:hidden" type="body-xs" color="muted">
          Swipe sideways to see more stats.
        </Typography>

        <Card aria-label="Client table">
          <Card.Content className="p-0">
          <div className="grid items-end gap-3 p-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.7fr)_repeat(4,minmax(130px,1fr))_auto]">
            <Input
              aria-label="Search clients"
              className="h-10 md:col-span-2 xl:col-span-1"
              placeholder="Search clients..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <CtaButton className="md:hidden" tone="secondary" type="button" onPress={() => setShowMobileFilters((current) => !current)}>Filters</CtaButton>
            <div className={`${showMobileFilters ? 'grid' : 'hidden'} gap-3 md:contents`}>
              <Dropdown label="Status" value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
              <Dropdown label="Intake Type" value={intakeFilter} options={intakeOptions} onChange={setIntakeFilter} />
              <Dropdown label="Step" value={stepFilter} options={stepOptions} onChange={setStepFilter} />
              <Dropdown label="Date Range" value={dateRange} options={dateRangeOptions} onChange={setDateRange} />
            </div>
            <CtaButton className="hidden self-end md:inline-flex" tone="secondary" type="button" onPress={resetFilters}>Clear</CtaButton>
            {showMobileFilters ? <CtaButton className="md:hidden" tone="secondary" type="button" onPress={resetFilters}>Clear filters</CtaButton> : null}
          </div>

          <ClientDataView
            clients={filteredClients}
            totalClients={stats.totalClients}
            onRemove={removeClient}
            onReset={resetFilters}
            onView={(clientId) => navigate(`/clients/${clientId}`)}
          />
          </Card.Content>
        </Card>
          </>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 items-stretch gap-0 border-t border-default bg-background/95 px-2 py-2 backdrop-blur lg:hidden" aria-label="Mobile navigation">
        <Button className="h-12 w-full flex-col items-center justify-center gap-0.5 px-0 text-xs" type="button" variant={location.pathname === '/' ? 'secondary' : 'ghost'} onPress={() => navigate('/')}>
          <HomeGlyph className="size-4" />
          Dashboard
        </Button>
        <Button className="h-12 w-full flex-col items-center justify-center gap-0.5 px-0 text-xs" type="button" variant={location.pathname === '/settings' ? 'secondary' : 'ghost'} onPress={() => navigate('/settings')}>
          <SettingsGlyph className="size-4" />
          Settings
        </Button>
        <Button aria-label="Advisor profile" className="h-12 w-full flex-col items-center justify-center gap-0.5 px-0 text-xs" type="button" variant="ghost" onPress={() => setShowMobileAccountMenu((current) => !current)}>
          <Avatar className="size-5">
            <Avatar.Fallback>{getInitials(advisorName || 'Advisor')}</Avatar.Fallback>
          </Avatar>
          Profile
        </Button>
      </nav>

      {showMobileAccountMenu ? (
        <div className="fixed inset-x-3 bottom-16 z-30 lg:hidden">
          <Card className="ml-auto w-full max-w-64 shadow-lg">
            <Card.Content className="grid gap-2 p-3">
              <Typography type="body-xs" color="muted">
                Signed in as {advisorEmail || 'advisor@example.com'}
              </Typography>
              <Button className="justify-start gap-2" type="button" variant="ghost" onPress={logout}>
                <LogoutGlyph className="size-4" />
                Log out
              </Button>
            </Card.Content>
          </Card>
        </div>
      ) : null}

      <AddClientModal
        route={addClientRoute}
        form={form}
        isOpen={Boolean(addClientRoute)}
        isSubmitting={isSubmitting}
        onCancel={closeAddFlow}
        onComplete={completeAddFlow}
        onFieldChange={updateField}
        onPersistDraft={() => persistClientFromForm('invited')}
        onNavigate={(path) => navigate(path)}
        onOpenChange={(isOpen) => {
          if (isOpen) {
            navigate('/add-client');
          } else {
            closeAddFlow();
          }
        }}
      />
    </div>
  );
}

function getAddClientRoute(pathname: string) {
  if (pathname === '/add-client') {
    return 'choose' as const;
  }

  if (pathname === '/add-client/quick') {
    return 'quick' as const;
  }

  if (pathname === '/add-client/intake') {
    return 'intake-details' as const;
  }

  if (pathname === '/add-client/intake/link') {
    return 'intake-link' as const;
  }

  if (pathname === '/add-client/intake/share') {
    return 'intake-share' as const;
  }

  return null;
}

function getClientDetailId(pathname: string) {
  const match = pathname.match(/^\/clients\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function createBlankClientForm(): ClientForm {
  return {
    name: '',
    email: '',
    phone: '',
    goal: '',
    risk: '',
    birthDate: '',
    reason: '',
    careConcern: '',
    monthlyBenefit: '',
    coverageStart: '',
  };
}

function RefreshGlyph({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 1-15.6 6.4" />
      <path d="M3 12a9 9 0 0 1 15.6-6.4" />
      <path d="m17 4h2.5V1.5" />
      <path d="m7 20h-2.5V22.5" />
    </svg>
  );
}

function HomeGlyph({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v9h14v-9" />
    </svg>
  );
}

function SettingsGlyph({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.9 1.9 0 0 0 .38 2.09l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.9 1.9 0 0 0 15 19.4a1.9 1.9 0 0 0-1 1.72V22a2 2 0 0 1-4 0v-.88a1.9 1.9 0 0 0-1-1.72 1.9 1.9 0 0 0-2.09.38l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.9 1.9 0 0 0 4.6 15a1.9 1.9 0 0 0-1.72-1H2a2 2 0 0 1 0-4h.88a1.9 1.9 0 0 0 1.72-1 1.9 1.9 0 0 0-.38-2.09l-.06-.06A2 2 0 0 1 7 3.02l.06.06A1.9 1.9 0 0 0 9 3.4 1.9 1.9 0 0 0 10 1.68V1a2 2 0 0 1 4 0v.68a1.9 1.9 0 0 0 1 1.72 1.9 1.9 0 0 0 2.09-.38l.06-.06A2 2 0 0 1 20.98 7l-.06.06A1.9 1.9 0 0 0 20.6 9a1.9 1.9 0 0 0 1.72 1H23a2 2 0 0 1 0 4h-.68a1.9 1.9 0 0 0-1.72 1Z" />
    </svg>
  );
}

function LogoutGlyph({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 7V5a1 1 0 0 0-1-1H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7a1 1 0 0 0 1-1v-2" />
      <path d="M11 12h9" />
      <path d="m16 9 4 3-4 3" />
    </svg>
  );
}

export default App;
