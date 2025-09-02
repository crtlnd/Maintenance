import React from 'react';
import { Root as LabelPrimitive } from '@radix-ui/react-label';
import { cn } from './utils';

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive
      className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    />
  );
}

export default Label;
