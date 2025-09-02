import React from 'react';
import { cn } from './utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-muted rounded-md', className)}
      {...props}
    />
  );
}

export default Skeleton;
