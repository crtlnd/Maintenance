import React from 'react';
import { Root, Image, Fallback } from '@radix-ui/react-avatar';
import { cn } from './utils';

export const Avatar = ({ className, ...props }: React.ComponentProps<typeof Root>) => (
  <Root className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props} />
);

export const AvatarImage = ({ className, ...props }: React.ComponentProps<typeof Image>) => (
  <Image className={cn('aspect-square h-full w-full', className)} {...props} />
);

export const AvatarFallback = ({ className, ...props }: React.ComponentProps<typeof Fallback>) => (
  <Fallback className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted', className)} {...props} />
);

export default Avatar;
