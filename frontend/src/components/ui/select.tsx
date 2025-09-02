import React from 'react';
import {
  Root,
  Group,
  Value,
  Trigger,
  Icon,
  Portal,
  Content,
  Viewport,
  Item,
  ItemIndicator,
  ItemText,
} from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { cn } from './utils';

export const Select = Root;

export const SelectGroup = Group;

export const SelectValue = Value;

export const SelectTrigger = ({ className, children, ...props }: React.ComponentProps<typeof Trigger>) => (
  <Trigger
    className={cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm', className)}
    {...props}
  >
    {children}
    <Icon asChild>
      <ChevronDownIcon className="h-4 w-4 opacity-50" />
    </Icon>
  </Trigger>
);

export const SelectContent = ({ className, children, position = 'popper', ...props }: React.ComponentProps<typeof Content>) => (
  <Portal>
    <Content
      className={cn('relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md', className)}
      position={position}
      {...props}
    >
      <Viewport className={cn('p-1', position === 'popper' && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]')}>
        {children}
      </Viewport>
    </Content>
  </Portal>
);

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof Item>,
  React.ComponentPropsWithoutRef<typeof Item>
>(({ className, children, ...props }, ref) => (
  <Item
    ref={ref}
    className={cn('relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground', className)}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </ItemIndicator>
    </span>
    <ItemText>{children}</ItemText>
  </Item>
));

SelectItem.displayName = Item.displayName;

export default Select;
