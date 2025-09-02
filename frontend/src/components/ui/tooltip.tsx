import React from 'react';
import { Provider, Root, Trigger, Content } from '@radix-ui/react-tooltip';

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}

export const Tooltip = Root;
export const TooltipTrigger = Trigger;
export const TooltipContent = Content;

export default TooltipProvider;
