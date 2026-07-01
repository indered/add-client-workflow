import { Label, ListBox, Select } from '@heroui/react';

type DropdownProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export function Dropdown({ label, value, options, onChange }: DropdownProps) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Select
        aria-label={label}
        className="w-full"
        selectedKey={value}
        onSelectionChange={(key) => onChange(String(key))}
      >
        <Select.Trigger className="w-full">
          <Select.Value>{value}</Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {options.map((option) => (
              <ListBox.Item id={option} key={option} textValue={option}>
                {option}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}
