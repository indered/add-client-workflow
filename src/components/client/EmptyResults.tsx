import { Typography } from '@heroui/react';
import { CtaButton } from '../common/CtaButton';

type EmptyResultsProps = {
  onReset: () => void;
};

export function EmptyResults({ onReset }: EmptyResultsProps) {
  return (
    <div className="grid min-h-40 justify-items-center gap-3 px-4 py-10 text-center">
      <Typography type="h6" weight="semibold">No clients found</Typography>
      <Typography className="max-w-72" type="body-xs" color="muted">Clear the filters or search for another client.</Typography>
      <CtaButton tone="secondary" type="button" onPress={onReset}>Clear filters</CtaButton>
    </div>
  );
}
