import React from 'react';
import { Root, Trigger, Portal, Content } from '@radix-ui/react-popover';
import { cn } from './utils';

export const Popover = Root;

export const PopoverTrigger = Trigger;

export const PopoverContent = ({ className, align = 'center', sideOffset = 4, ...props }: React.ComponentProps<typeof Content>) => (
  <Portal>
    <Content
      align={align}
      sideOffset={sideOffset}
      className={cn('z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none', className)}
      {...props}
    />
  </Portal>
);

export default Popover;
