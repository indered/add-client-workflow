import { FormEvent, ReactNode, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  FileText,
  Home,
  Link2,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Sun,
  User,
  UserRoundPlus,
  Users,
  X,
} from 'lucide-react';

type ClientStatus = 'Invited' | 'In Progress' | 'Completed' | 'Quick Plan';
type IntakeType = 'Full Intake' | 'Quick Plan';
type AddMode = 'invite' | 'quick' | 'behalf';

type Client = {
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

const initialClients: Client[] = [
  {
    id: 1,
    name: 'Sarah Miller',
    initials: 'SM',
    email: 'sarah.miller@gmail.com',
    phone: '+1 (415) 555-0123',
    status: 'Invited',
    intakeType: 'Full Intake',
    step: 'Not started',
    progress: 0,
    invitedOn: 'May 20, 2025 10:30 AM',
    lastActivity: 'May 20, 2025 10:30 AM',
    tone: 'violet',
  },
  {
    id: 2,
    name: 'Robert Johnson',
    initials: 'RJ',
    email: 'robert.j@example.com',
    phone: '+1 (415) 555-0188',
    status: 'Invited',
    intakeType: 'Full Intake',
    step: 'Not started',
    progress: 0,
    invitedOn: 'May 19, 2025 2:15 PM',
    lastActivity: 'May 19, 2025 2:15 PM',
    tone: 'mint',
  },
  {
    id: 3,
    name: 'Emily Davis',
    initials: 'ED',
    email: 'emily.davis@company.com',
    phone: '+1 (415) 555-0199',
    status: 'In Progress',
    intakeType: 'Full Intake',
    step: 'Step 2 of 6',
    progress: 33,
    invitedOn: 'May 18, 2025 11:20 AM',
    lastActivity: 'Today 9:15 AM',
    tone: 'photo',
  },
  {
    id: 4,
    name: 'Lisa Williams',
    initials: 'LW',
    email: 'lisa.williams@gmail.com',
    phone: '+1 (415) 555-0111',
    status: 'Completed',
    intakeType: 'Full Intake',
    step: 'Completed',
    progress: 100,
    invitedOn: 'May 10, 2025 9:00 AM',
    lastActivity: 'May 12, 2025 10:00 AM',
    tone: 'amber',
  },
  {
    id: 5,
    name: 'Amanda Taylor',
    initials: 'AT',
    email: 'amanda.taylor@gmail.com',
    phone: '+1 (415) 555-0177',
    status: 'Quick Plan',
    intakeType: 'Quick Plan',
    step: 'Quick plan created',
    progress: 0,
    invitedOn: 'May 21, 2025 9:45 AM',
    lastActivity: 'May 21, 2025 9:45 AM',
    tone: 'rose',
  },
];

const statusOptions = ['All Statuses', 'Invited', 'In Progress', 'Completed', 'Quick Plan'];
const intakeOptions = ['All Types', 'Full Intake', 'Quick Plan'];
const stepOptions = ['All Steps', 'Not started', 'Step 2 of 6', 'Completed', 'Quick plan created'];

const modeLabels: Record<AddMode, string> = {
  invite: 'Send intake link',
  quick: 'Quick form',
  behalf: 'Fill intake on behalf',
};

const todayLabel = 'Jul 1, 2026 9:41 PM';

function App() {
  const [clients, setClients] = useState(initialClients);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]);
  const [intakeFilter, setIntakeFilter] = useState(intakeOptions[0]);
  const [stepFilter, setStepFilter] = useState(stepOptions[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<AddMode | null>(null);
  const [reviewReady, setReviewReady] = useState(false);
  const [form, setForm] = useState({
    name: 'Sarah Miller',
    email: 'sarah.miller@gmail.com',
    phone: '+1 (415) 555-0123',
    goal: 'Retirement planning',
    risk: 'Moderate',
    birthDate: '',
  });

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
      completed: clients.filter((client) => client.status === 'Completed').length + 57,
      quickPlans: clients.filter((client) => client.status === 'Quick Plan').length + 5,
    };
  }, [clients]);

  const openAddFlow = () => {
    setIsModalOpen(true);
    setAddMode(null);
    setReviewReady(false);
  };

  const closeAddFlow = () => {
    setIsModalOpen(false);
    setAddMode(null);
    setReviewReady(false);
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const addClient = (mode: AddMode) => {
    const nextClient: Client = {
      id: Date.now(),
      name: form.name || 'New Client',
      initials: getInitials(form.name || 'New Client'),
      email: form.email || 'client@example.com',
      phone: form.phone || 'No phone added',
      status: mode === 'quick' ? 'Quick Plan' : mode === 'behalf' ? 'In Progress' : 'Invited',
      intakeType: mode === 'quick' ? 'Quick Plan' : 'Full Intake',
      step: mode === 'quick' ? 'Quick plan created' : mode === 'behalf' ? 'Step 1 of 6' : 'Not started',
      progress: mode === 'behalf' ? 17 : 0,
      invitedOn: todayLabel,
      lastActivity: todayLabel,
      tone: 'violet',
    };

    setClients((current) => [nextClient, ...current]);
    closeAddFlow();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (addMode === 'invite' && !reviewReady) {
      setReviewReady(true);
      return;
    }

    if (addMode) {
      addClient(addMode);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand">Waterlily</div>
        <nav className="nav-list">
          <a className="nav-item active" href="#dashboard">
            <Home size={18} />
            <span>Dashboard</span>
          </a>
          <a className="nav-item" href="#settings">
            <Settings size={18} />
            <span>Settings</span>
            <ChevronDown className="nav-chevron" size={16} />
          </a>
          <a className="nav-item" href="#connections">
            <Link2 size={18} />
            <span>Connections</span>
          </a>
          <a className="nav-item" href="#profile">
            <User size={18} />
            <span>Profile</span>
          </a>
        </nav>
        <button className="theme-control" type="button" aria-label="Switch theme">
          <Sun size={18} />
          <span>Light</span>
          <ChevronDown size={16} />
        </button>
      </aside>

      <main className="dashboard" id="dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Track clients and intake progress in one place.</p>
          </div>
          <div className="header-actions">
            <button className="primary-action" type="button" aria-label="Add client" onClick={openAddFlow}>
              <Plus size={18} />
              <span>Add Client</span>
            </button>
            <button className="icon-button" type="button" aria-label="Display settings">
              <Sun size={18} />
            </button>
          </div>
        </header>

        <section className="metric-grid" aria-label="Intake summary">
          <MetricCard icon={<Users size={28} />} label="Total Clients" value={stats.totalClients} tone="violet" note="View all" />
          <MetricCard icon={<Mail size={28} />} label="Invited" value={stats.invited} tone="amber" note="Awaiting response" />
          <MetricCard icon={<Clock3 size={28} />} label="In Progress" value={stats.inProgress} tone="blue" note="Intake in progress" />
          <MetricCard icon={<CheckCircle2 size={28} />} label="Completed" value={stats.completed} tone="green" note="Intake completed" />
          <MetricCard icon={<FileText size={28} />} label="Quick Plans" value={stats.quickPlans} tone="rose" note="Created" />
        </section>

        <section className="client-panel" aria-label="Client table">
          <div className="filters">
            <label className="search-field">
              <Search size={18} />
              <input
                aria-label="Search clients"
                placeholder="Search clients..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <kbd>⌘ K</kbd>
            </label>
            <FilterSelect label="Status" value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
            <FilterSelect label="Intake Type" value={intakeFilter} options={intakeOptions} onChange={setIntakeFilter} />
            <FilterSelect label="Step" value={stepFilter} options={stepOptions} onChange={setStepFilter} />
            <label className="date-filter">
              <span>Date Range</span>
              <button type="button">
                Last 30 days
                <CalendarDays size={16} />
              </button>
            </label>
            <button className="filter-button" type="button">
              <SlidersHorizontal size={18} />
              Filters
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Intake Type</th>
                  <th>Step / Progress</th>
                  <th>Invited On</th>
                  <th>Last Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <ClientIdentity client={client} />
                      </td>
                      <td>
                        <div className="contact-stack">
                          <span>{client.email}</span>
                          <span>{client.phone}</span>
                        </div>
                      </td>
                      <td>
                        <StatusPill status={client.status} />
                      </td>
                      <td>
                        <span className={`type-pill ${client.intakeType === 'Quick Plan' ? 'quick' : ''}`}>{client.intakeType}</span>
                      </td>
                      <td>
                        <ProgressCell client={client} />
                      </td>
                      <td>{client.invitedOn}</td>
                      <td>{client.lastActivity}</td>
                      <td>
                        <button className="row-action" type="button" aria-label={`Actions for ${client.name}`}>
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <EmptyResults onReset={() => {
                        setQuery('');
                        setStatusFilter(statusOptions[0]);
                        setIntakeFilter(intakeOptions[0]);
                        setStepFilter(stepOptions[0]);
                      }} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mobile-client-list">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <article className="mobile-client-card" key={client.id}>
                  <ClientIdentity client={client} />
                  <StatusPill status={client.status} />
                  <ProgressCell client={client} compact />
                </article>
              ))
            ) : (
              <EmptyResults onReset={() => {
                setQuery('');
                setStatusFilter(statusOptions[0]);
                setIntakeFilter(intakeOptions[0]);
                setStepFilter(stepOptions[0]);
              }} />
            )}
          </div>

          <footer className="table-footer">
            <span>
              {filteredClients.length > 0
                ? `Showing 1 to ${filteredClients.length} of ${stats.totalClients} clients`
                : 'No clients match these filters'}
            </span>
            <div className="pagination">
              <button type="button" aria-label="Previous page">
                <ChevronLeft size={16} />
              </button>
              <button className="current" type="button">1</button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button">...</button>
              <button type="button">16</button>
              <button type="button" aria-label="Next page">
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        </section>
      </main>

      <aside className="phone-preview" aria-label="Mobile dashboard preview">
        <div className="phone-frame">
          <div className="phone-status">
            <span>9:41</span>
            <span>•••</span>
          </div>
          <div className="phone-header">
            <h2>Dashboard</h2>
            <button type="button" aria-label="Add client" onClick={openAddFlow}>
              <Plus size={18} />
            </button>
          </div>
          <div className="phone-metrics">
            <PhoneMetric icon={<Users size={18} />} label="Total Clients" value={stats.totalClients} tone="violet" />
            <PhoneMetric icon={<Mail size={18} />} label="Invited" value={stats.invited} tone="amber" />
            <PhoneMetric icon={<Clock3 size={18} />} label="In Progress" value={stats.inProgress} tone="blue" />
            <PhoneMetric icon={<CheckCircle2 size={18} />} label="Completed" value={stats.completed} tone="green" />
            <PhoneMetric icon={<FileText size={18} />} label="Quick Plans" value={stats.quickPlans} tone="rose" />
          </div>
          <button className="phone-filter" type="button">
            <SlidersHorizontal size={16} />
            Filters
          </button>
          <div className="recent-heading">Recent Clients</div>
          <div className="recent-list">
            {clients.slice(0, 3).map((client) => (
              <div className="recent-client" key={client.id}>
                <ClientIdentity client={client} small />
                <StatusPill status={client.status} />
              </div>
            ))}
          </div>
          <nav className="bottom-nav" aria-label="Mobile navigation">
            <a className="active" href="#dashboard">
              <Home size={18} />
              <span>Dashboard</span>
            </a>
            <a href="#clients">
              <Users size={18} />
              <span>Clients</span>
            </a>
            <button type="button" aria-label="Add client" onClick={openAddFlow}>
              <Plus size={18} />
            </button>
            <a href="#settings">
              <Settings size={18} />
              <span>Settings</span>
            </a>
          </nav>
        </div>
      </aside>

      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="add-modal" role="dialog" aria-modal="true" aria-labelledby="add-client-title">
            <div className="modal-topline">
              {addMode ? (
                <button className="ghost-icon" type="button" aria-label="Back to add options" onClick={() => {
                  setAddMode(null);
                  setReviewReady(false);
                }}>
                  <ArrowLeft size={18} />
                </button>
              ) : (
                <span />
              )}
              <button className="ghost-icon" type="button" aria-label="Close add client" onClick={closeAddFlow}>
                <X size={18} />
              </button>
            </div>
            <h2 id="add-client-title">{addMode ? modeLabels[addMode] : 'Add Client'}</h2>
            <p className="modal-copy">{getModalCopy(addMode, reviewReady, form.name)}</p>
            {addMode ? (
              <AddClientForm
                mode={addMode}
                reviewReady={reviewReady}
                form={form}
                onFieldChange={updateField}
                onSubmit={handleSubmit}
                onCancel={closeAddFlow}
              />
            ) : (
              <div className="add-choice-list">
                <AddChoice
                  icon={<Send size={20} />}
                  title="Send intake link"
                  body="Let the client fill the intake form."
                  onClick={() => setAddMode('invite')}
                />
                <AddChoice
                  icon={<Sparkles size={20} />}
                  title="Quick form"
                  body="Create a plan with minimal information."
                  onClick={() => setAddMode('quick')}
                />
                <AddChoice
                  icon={<UserRoundPlus size={20} />}
                  title="Fill intake on behalf"
                  body="You fill out the intake form."
                  onClick={() => setAddMode('behalf')}
                />
                <button className="secondary-action full-width" type="button" onClick={closeAddFlow}>Cancel</button>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

type MetricTone = 'violet' | 'amber' | 'blue' | 'green' | 'rose';

function MetricCard({ icon, label, value, tone, note }: { icon: ReactNode; label: string; value: number; tone: MetricTone; note: string }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

function PhoneMetric({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone: MetricTone }) {
  return (
    <article className="phone-metric">
      <div className={`phone-icon ${tone}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="filter-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ClientIdentity({ client, small = false }: { client: Client; small?: boolean }) {
  return (
    <div className={`client-identity ${small ? 'small' : ''}`}>
      <div className={`avatar ${client.tone}`}>{client.tone === 'photo' ? 'ED' : client.initials}</div>
      <div>
        <strong>{client.name}</strong>
        {small ? <span>{client.step}</span> : null}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ClientStatus }) {
  return <span className={`status-pill ${status.toLowerCase().replace(/\s+/g, '-')}`}>{status}</span>;
}

function ProgressCell({ client, compact = false }: { client: Client; compact?: boolean }) {
  const hasProgress = client.progress > 0;

  return (
    <div className={`progress-cell ${compact ? 'compact' : ''}`}>
      <span>{client.step}</span>
      {hasProgress ? (
        <div className="progress-line-wrap">
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${client.progress}%` }} />
          </div>
          <small>{client.progress}%</small>
        </div>
      ) : (
        <small>-</small>
      )}
    </div>
  );
}

function AddChoice({ icon, title, body, onClick }: { icon: ReactNode; title: string; body: string; onClick: () => void }) {
  return (
    <button className="add-choice" type="button" onClick={onClick}>
      <span className="choice-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{body}</small>
      </span>
      <ChevronRight size={18} />
    </button>
  );
}

function EmptyResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="empty-results">
      <strong>No clients found</strong>
      <span>Clear the filters or search for another client.</span>
      <button className="secondary-action" type="button" onClick={onReset}>Clear filters</button>
    </div>
  );
}

function AddClientForm({
  mode,
  reviewReady,
  form,
  onFieldChange,
  onSubmit,
  onCancel,
}: {
  mode: AddMode;
  reviewReady: boolean;
  form: {
    name: string;
    email: string;
    phone: string;
    goal: string;
    risk: string;
    birthDate: string;
  };
  onFieldChange: (field: keyof typeof form, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  if (mode === 'invite' && reviewReady) {
    return (
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="share-link">
          <span>waterlily.io/i/8fha8x</span>
          <button type="button">
            <Copy size={16} />
            Copy
          </button>
        </div>
        <div className="send-options">
          <button type="submit">
            <Mail size={18} />
            Send via Email
            <ChevronRight size={18} />
          </button>
          <button type="submit">
            <MessageCircle size={18} />
            Send via SMS
            <ChevronRight size={18} />
          </button>
          <button type="submit">
            <MessageCircle size={18} />
            Send via WhatsApp
            <ChevronRight size={18} />
          </button>
          <button type="submit">
            <Link2 size={18} />
            Copy link
            <ChevronRight size={18} />
          </button>
        </div>
        <button className="secondary-action full-width" type="button" onClick={onCancel}>Done</button>
      </form>
    );
  }

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      {mode === 'behalf' ? (
        <div className="form-progress">
          <div>
            <span>Step 1 of 6</span>
            <strong>17%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: '17%' }} />
          </div>
        </div>
      ) : null}

      <label>
        Full name
        <input value={form.name} onChange={(event) => onFieldChange('name', event.target.value)} required />
      </label>

      {mode !== 'quick' ? (
        <>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => onFieldChange('email', event.target.value)} required />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(event) => onFieldChange('phone', event.target.value)} />
          </label>
        </>
      ) : (
        <>
          <label>
            Primary goal
            <select value={form.goal} onChange={(event) => onFieldChange('goal', event.target.value)}>
              <option>Retirement planning</option>
              <option>Insurance review</option>
              <option>Family care planning</option>
            </select>
          </label>
          <label>
            Risk tolerance
            <select value={form.risk} onChange={(event) => onFieldChange('risk', event.target.value)}>
              <option>Moderate</option>
              <option>Conservative</option>
              <option>Growth focused</option>
            </select>
          </label>
        </>
      )}

      {mode === 'behalf' ? (
        <label>
          Date of birth
          <input type="date" value={form.birthDate} onChange={(event) => onFieldChange('birthDate', event.target.value)} />
        </label>
      ) : null}

      <div className="modal-actions">
        <button className="secondary-action" type="button" onClick={onCancel}>
          Save and exit
        </button>
        <button className="primary-action" type="submit">
          {mode === 'invite' ? 'Continue' : mode === 'quick' ? 'Create Plan' : 'Next'}
        </button>
      </div>
    </form>
  );
}

function getModalCopy(mode: AddMode | null, reviewReady: boolean, name: string) {
  if (!mode) {
    return 'How would you like to add this client?';
  }

  if (mode === 'invite' && reviewReady) {
    return `Share the intake link with ${name || 'this client'} using any option below.`;
  }

  if (mode === 'invite') {
    return 'Enter client details to create a personalized invite.';
  }

  if (mode === 'quick') {
    return 'Provide basic information to create a plan.';
  }

  return 'Start the full intake while the client is with you.';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default App;
