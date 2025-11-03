// Export all UI components for easy importing
export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Select } from './Select';
export type { SelectProps } from './Select';

export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';

export { Checkbox } from './Checkbox';
export type { CheckboxProps } from './Checkbox';

export { RadioGroup } from './Radio';
export type { RadioGroupProps, RadioOption } from './Radio';

export { Toggle } from './Toggle';
export type { ToggleProps } from './Toggle';

export { Tabs, TabPanel } from './Tabs';

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonText } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

// Re-export default exports
export { default as Badge } from './Badge';
export { default as Card } from './Card';
export { default as Modal } from './Modal';
export { default as StatCard } from '../cards/StatCard';

/*
Usage example:

import { Button, Input, Select, Checkbox, Toggle } from '@/components/ui';

<Button variant="primary">Click me</Button>
<Input label="Email" type="email" />
<Checkbox label="Accept terms" />
<Toggle label="Enable notifications" />
*/
