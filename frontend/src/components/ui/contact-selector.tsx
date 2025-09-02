import React from 'react';
import { Command, CommandInput, CommandItem, CommandList, CommandSeparator } from './command';
import { cn } from './utils';

interface ContactSelectorProps {
  className?: string;
}

export function ContactSelector({ className }: ContactSelectorProps) {
  return (
    <Command className={cn('rounded-md border', className)}>
      <CommandInput placeholder="Search contacts..." />
      <CommandList>
        <CommandSeparator />
        <CommandItem>Sample Contact</CommandItem>
      </CommandList>
    </Command>
  );
}

export default ContactSelector;
