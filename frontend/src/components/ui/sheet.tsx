import React from 'react';
import { Root, Content, Title, Description } from '@radix-ui/react-dialog';
import { cn } from './utils';

export const Sheet = Root;
export const SheetContent = Content;
export const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
export const SheetTitle = Title;
export const SheetDescription = Description;

export default Sheet;
