import { Card, Chip, Heading, Input, ProgressBar, Typography } from '@heroui/react';
import { useEffect, useMemo, useState } from 'react';
import { CtaButton } from '../common/CtaButton';
import { Dropdown } from '../common/Dropdown';
import { readIntakeToken } from '../../data/intakeLinks';
import { applyIntakeSubmission } from '../../data/clientStore';

type ClientIntakeFormProps = {
  token: string;
  theme: 'Light' | 'Dark';
  onThemeToggle: () => void;
};

type IntakeAnswers = {
  birthDate: string;
  coverageStart: string;
  email: string;
  health: string;
  inflationProtection: string;
  location: string;
  monthlyBenefit: string;
  name: string;
  phone: string;
  policyType: string;
};

type Question = {
  field: keyof IntakeAnswers;
  label: string;
  options: string[];
  prompt: string;
};

const questions: Question[] = [
  {
    field: 'policyType',
    label: 'Policy type',
    options: ['Asset-based LTC', 'Pure LTC', 'Hybrid life with LTC', 'Not sure yet'],
    prompt: 'What type of long-term care policy are you considering?',
  },
  {
    field: 'monthlyBenefit',
    label: 'Monthly benefit',
    options: ['$3,000', '$4,500', '$6,000', '$8,000', 'Not sure yet'],
    prompt: 'What monthly care benefit would feel useful?',
  },
  {
    field: 'inflationProtection',
    label: 'Inflation protection',
    options: ['None', '3% simple', '3% compound', '5% compound', 'Not sure yet'],
    prompt: 'How should the benefit grow over time?',
  },
  {
    field: 'coverageStart',
    label: 'Coverage start',
    options: ['Within 3 months', 'Within 1 year', 'Later this year', 'Just exploring'],
    prompt: 'When would you like coverage to start?',
  },
];

const personalFields: Array<{ field: keyof IntakeAnswers; label: string; placeholder: string; type?: string }> = [
  { field: 'name', label: 'Full name', placeholder: 'Full name' },
  { field: 'email', label: 'Email', placeholder: 'Email', type: 'email' },
  { field: 'phone', label: 'Phone', placeholder: 'Phone' },
  { field: 'birthDate', label: 'Date of birth', placeholder: 'Date of birth', type: 'date' },
  { field: 'location', label: 'Location', placeholder: 'City, state' },
];

export function ClientIntakeForm({ token, theme, onThemeToggle }: ClientIntakeFormProps) {
  const payload = readIntakeToken(token);
  const storageKey = `waterlily-intake-progress:${token}`;
  const [sectionIndex, setSectionIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState<IntakeAnswers>(() => {
    const stored = window.localStorage.getItem(storageKey);

    if (stored) {
      return JSON.parse(stored) as IntakeAnswers;
    }

    return {
      birthDate: '',
      coverageStart: 'Within 1 year',
      email: payload.clientEmail,
      health: 'Generally healthy',
      inflationProtection: '3% compound',
      location: '',
      monthlyBenefit: '$6,000',
      name: payload.clientName,
      phone: payload.clientPhone,
      policyType: 'Asset-based LTC',
    };
  });

  const activeQuestion = questions[questionIndex];
  const screenNumber = sectionIndex === 0 ? 1 : sectionIndex === 1 ? questionIndex + 2 : questions.length + 2;
  const totalScreens = questions.length + 2;
  const progress = isSubmitted ? 100 : Math.round((screenNumber / totalScreens) * 100);
  const sectionLabel = sectionIndex === 0 ? 'Personal section' : sectionIndex === 1 ? 'Questionnaire' : 'Review';

  const reviewRows = useMemo(() => {
    const personalRows = [
      ['Full name', answers.name || 'Not added'],
      ['Email', answers.email || 'Not added'],
      ['Phone', answers.phone || 'Not added'],
      ['Date of birth', answers.birthDate || 'Not added'],
      ['Location', answers.location || 'Not added'],
    ];
    const questionRows = questions.map((question) => [question.label, answers[question.field] || 'Not answered']);

    return [...personalRows, ...questionRows];
  }, [answers]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(answers));
  }, [answers, storageKey]);

  const updateAnswer = (field: keyof IntakeAnswers, value: string) => {
    setAnswers((current) => ({ ...current, [field]: value }));
  };

  const goBack = () => {
    if (sectionIndex === 2) {
      setSectionIndex(1);
      setQuestionIndex(questions.length - 1);
      return;
    }

    if (sectionIndex === 1 && questionIndex > 0) {
      setQuestionIndex((current) => current - 1);
      return;
    }

    if (sectionIndex === 1) {
      setSectionIndex(0);
    }
  };

  const goNext = () => {
    if (sectionIndex === 0) {
      setSectionIndex(1);
      setQuestionIndex(0);
      return;
    }

    if (sectionIndex === 1 && questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }

    setSectionIndex(2);
  };

  const submitIntake = () => {
    setIsSubmitted(true);
    const submittedAt = new Date().toISOString();
    window.localStorage.setItem(`${storageKey}:submitted`, submittedAt);
    applyIntakeSubmission(payload, {
      email: answers.email,
      name: answers.name,
      phone: answers.phone,
    }, submittedAt);
  };

  return (
    <main className="min-h-screen bg-default p-4 text-foreground sm:p-6 lg:p-8">
      <section className="mx-auto grid max-w-3xl gap-5">
        <header className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="grid gap-1">
            <Typography type="body-xs" color="muted">Waterlily intake</Typography>
            <Heading level={1}>Long-term care intake</Heading>
            <Typography type="body-xs" color="muted">
              This link is unique to you and {payload.advisorName}.
            </Typography>
          </div>
          <div className="flex items-center justify-end">
            <Chip color="accent" size="sm" variant="soft">
              <Chip.Label>Saved locally</Chip.Label>
            </Chip>
          </div>
        </header>

        <Card>
          <Card.Content className="grid gap-5 p-4 sm:p-5">
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <Typography type="body-xs" weight="medium">{sectionLabel}</Typography>
                <Typography type="body-xs" color="muted">{progress}%</Typography>
              </div>
              <ProgressBar aria-label="Intake progress" value={progress} />
            </div>

            {isSubmitted ? (
              <Card>
                <Card.Content className="grid gap-3 p-5 text-center">
                  <Typography type="h5" weight="semibold">Intake submitted</Typography>
                  <Typography type="body-xs" color="muted">
                    {payload.advisorName} can now review your responses and continue the plan.
                  </Typography>
                </Card.Content>
              </Card>
            ) : sectionIndex === 0 ? (
              <PersonalSection answers={answers} onChange={updateAnswer} />
            ) : sectionIndex === 1 ? (
              <QuestionSection
                answer={answers[activeQuestion.field]}
                question={activeQuestion}
                questionIndex={questionIndex}
                totalQuestions={questions.length}
                onChange={(value) => updateAnswer(activeQuestion.field, value)}
              />
            ) : (
              <ReviewSection rows={reviewRows} />
            )}

            {!isSubmitted ? (
              <div className="flex flex-wrap items-center justify-end gap-3">
                {sectionIndex > 0 ? (
                  <CtaButton className="min-w-28" tone="secondary" type="button" onPress={goBack}>
                    Back
                  </CtaButton>
                ) : null}
                {sectionIndex === 2 ? (
                  <CtaButton className="min-w-32" type="button" onPress={submitIntake}>
                    Submit intake
                  </CtaButton>
                ) : (
                  <CtaButton className="min-w-28" type="button" isDisabled={sectionIndex === 0 && (!answers.name || !answers.email)} onPress={goNext}>
                    Next
                  </CtaButton>
                )}
              </div>
            ) : null}
          </Card.Content>
        </Card>
      </section>
    </main>
  );
}

function PersonalSection({
  answers,
  onChange,
}: {
  answers: IntakeAnswers;
  onChange: (field: keyof IntakeAnswers, value: string) => void;
}) {
  return (
    <Card>
      <Card.Content className="grid gap-4 p-4">
        <SectionTitle title="Personal section" subtitle="Start with the basics. You can come back and edit this anytime." />
        <div className="grid gap-3 md:grid-cols-2">
          {personalFields.map((field) => (
            <Input
              aria-label={field.label}
              className={field.field === 'location' ? 'md:col-span-2' : undefined}
              key={field.field}
              placeholder={field.placeholder}
              type={field.type}
              value={answers[field.field]}
              onChange={(event) => onChange(field.field, event.target.value)}
            />
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

function QuestionSection({
  answer,
  onChange,
  question,
  questionIndex,
  totalQuestions,
}: {
  answer: string;
  onChange: (value: string) => void;
  question: Question;
  questionIndex: number;
  totalQuestions: number;
}) {
  return (
    <Card>
      <Card.Content className="grid gap-5 p-5">
        <div className="grid gap-2">
          <Typography type="body-xs" color="muted">Question {questionIndex + 1} of {totalQuestions}</Typography>
          <Typography type="h5" weight="semibold">{question.prompt}</Typography>
        </div>
        <Dropdown label={question.label} value={answer} options={question.options} onChange={onChange} />
      </Card.Content>
    </Card>
  );
}

function ReviewSection({ rows }: { rows: string[][] }) {
  return (
    <Card>
      <Card.Content className="grid gap-4 p-4">
        <SectionTitle title="Review answers" subtitle="Check everything before submitting." />
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <Typography type="body-xs" color="muted">Review progress</Typography>
            <Typography type="body-xs" color="muted">100%</Typography>
          </div>
          <ProgressBar aria-label="Review progress" value={100} />
        </div>
        <div className="grid gap-2">
          {rows.map(([label, value]) => (
            <SummaryRow key={label} label={label} value={value} />
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

function SectionTitle({ subtitle, title }: { subtitle?: string; title: string }) {
  return (
    <div className="grid gap-1">
      <Typography type="body-sm" weight="semibold">{title}</Typography>
      {subtitle ? <Typography type="body-xs" color="muted">{subtitle}</Typography> : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-large border border-default px-3 py-2">
      <Typography type="body-xs" color="muted">{label}</Typography>
      <Typography className="text-right" type="body-xs" weight="medium">{value}</Typography>
    </div>
  );
}
