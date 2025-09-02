import React from 'react';
import { Root, Trigger, Portal, Overlay, Content, Title, Description } from '@radix-ui/react-dialog';
import { cn } from './utils';

export const Dialog = Root;

export const DialogTrigger = Trigger;

export const DialogContent = ({ className, children, ...props }: React.ComponentProps<typeof Content>) => (
  <Portal>
    <Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
    <Content
      className={cn('fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg', className)}
      {...props}
    >
      {children}
    </Content>
  </Portal>
);

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);

export const DialogTitle = Title;

export const DialogDescription = Description;

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex justify-end gap-2', className)}
    {...props}
  />
);

export default Dialog;
