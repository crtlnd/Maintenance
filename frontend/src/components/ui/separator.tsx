import React from 'react';
import { Root as SeparatorPrimitive } from '@radix-ui/react-separator';
import { cn } from './utils';

interface SeparatorProps extends React.ComponentProps<typeof SeparatorPrimitive> {}

export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <SeparatorPrimitive
      className={cn('bg-border h-px w-full', className)}
      {...props}
    />
  );
}

export default Separator;
