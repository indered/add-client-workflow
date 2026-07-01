import {
  Card,
  CircleDashedIcon,
  ExternalLinkIcon,
  IconPlus,
  IconSearch,
  InfoIcon,
  SuccessIcon,
  Typography,
} from '@heroui/react';
import type { MetricTone } from '../../types';

type MetricCardProps = {
  label: string;
  mark: string;
  note: string;
  tone: MetricTone;
  value: number;
};

export function MetricCard({ label, mark, note, tone, value }: MetricCardProps) {
  const toneClass = {
    amber: 'bg-warning/15 text-warning',
    blue: 'bg-accent/15 text-accent',
    green: 'bg-success/15 text-success',
    neutral: 'bg-default text-foreground',
    rose: 'bg-danger/15 text-danger',
    violet: 'bg-default text-foreground',
  }[tone];
  const Icon = getMetricIcon(mark);

  return (
    <Card className="group relative overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-md after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-1/2 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/35 after:to-transparent after:transition-transform after:duration-700 hover:after:translate-x-[260%]">
      <Card.Content className="grid min-h-16 grid-cols-[1.875rem_1fr] items-center gap-2 p-2.5 sm:min-h-20 sm:grid-cols-[2.25rem_1fr] sm:gap-3 sm:p-3">
        <div className={`grid size-7 place-items-center rounded-full sm:size-9 ${toneClass}`} aria-hidden="true">
          <Icon className="size-3.5 sm:size-4" />
        </div>
        <div className="min-w-0">
          <Typography className="whitespace-nowrap" type="body-xs" weight="medium">{label}</Typography>
          <Typography className="text-xl leading-none sm:text-2xl" type="body-sm" weight="semibold">{value}</Typography>
          <Typography className="text-[11px] leading-tight text-foreground/60" type="body-xs">{note}</Typography>
        </div>
      </Card.Content>
    </Card>
  );
}

function getMetricIcon(mark: string) {
  if (mark === 'TC') {
    return IconSearch;
  }

  if (mark === 'IN') {
    return ExternalLinkIcon;
  }

  if (mark === 'IP') {
    return CircleDashedIcon;
  }

  if (mark === 'CO') {
    return SuccessIcon;
  }

  if (mark === 'QP') {
    return IconPlus;
  }

  return InfoIcon;
}
