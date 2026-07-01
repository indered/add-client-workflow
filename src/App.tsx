import { Button, Card, Chip, Link } from '@heroui/react';

const starterCards: Array<{ title: string; body: string }> = [
  {
    title: 'Design system',
    body: 'HeroUI components and Tailwind utilities are wired up.',
  },
  {
    title: 'Deploy path',
    body: 'Vercel production deploys are part of the bootstrap.',
  },
  {
    title: 'Clean base',
    body: 'No auth, database, or extra services until the app needs them.',
  },
];

export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-6 py-12">
        <div className="max-w-2xl space-y-5">
          <Chip color="accent" variant="soft">HeroUI starter</Chip>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-6xl">Add Client Workflow is live.</h1>
          <p className="max-w-xl text-lg leading-8 text-default-600">
            This React app is ready for the first real screen. Keep the parts that help, delete the rest, and move fast.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="lg">Start building</Button>
            <Link href="https://www.heroui.com" target="_blank" className="inline-flex min-h-11 items-center rounded-xl border border-default-300 px-5 text-sm font-medium text-foreground">
              HeroUI docs
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {starterCards.map(({ title, body }) => (
            <Card key={title} className="border border-default-200">
              <Card.Content className="gap-2 p-5">
                <h2 className="text-base font-medium">{title}</h2>
                <p className="text-sm leading-6 text-default-600">{body}</p>
              </Card.Content>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
