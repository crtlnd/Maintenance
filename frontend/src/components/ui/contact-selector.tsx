import React, { useState } from 'react';
import { User, UserPlus, Check } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from './command';
import { cn } from './utils';

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
};

interface ContactSelectorProps {
  value?: { name: string; email: string; phone?: string };
  onChange: (contact: { name: string; email: string; phone?: string }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Mock contacts - in a real app, these would come from a database or API
const defaultContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1 (555) 201-0001',
    role: 'Lead Technician'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 201-0002',
    role: 'Safety Inspector'
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    phone: '+1 (555) 201-0003',
    role: 'Maintenance Manager'
  },
  {
    id: '4',
    name: 'Lisa Chen',
    email: 'lisa.chen@company.com',
    phone: '+1 (555) 201-0004',
    role: 'Equipment Specialist'
  }
];

export function ContactSelector({
  value,
  onChange,
  placeholder = "Select contact or enter manually",
  disabled = false,
  className
}: ContactSelectorProps) {
  const [open, setOpen] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualContact, setManualContact] = useState({
    name: value?.name || '',
    email: value?.email || '',
    phone: value?.phone || ''
  });

  const handleContactSelect = (contact: Contact) => {
    onChange({
      name: contact.name,
      email: contact.email,
      phone: contact.phone
    });
    setOpen(false);
  };

  const handleManualSave = () => {
    if (manualContact.name && manualContact.email) {
      onChange(manualContact);
      setShowManualEntry(false);
      setOpen(false);
    }
  };

  const currentDisplayText = value?.name 
    ? `${value.name} (${value.email})` 
    : placeholder;

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <User className="mr-2 h-4 w-4" />
            <span className="truncate">{currentDisplayText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          {!showManualEntry ? (
            <Command>
              <CommandInput placeholder="Search contacts..." />
              <CommandList>
                <CommandEmpty>No contacts found.</CommandEmpty>
                <CommandGroup heading="Team Contacts">
                  {defaultContacts.map((contact) => (
                    <CommandItem
                      key={contact.id}
                      value={contact.name}
                      onSelect={() => handleContactSelect(contact)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{contact.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {contact.email}
                        </span>
                        {contact.role && (
                          <span className="text-xs text-muted-foreground">
                            {contact.role}
                          </span>
                        )}
                      </div>
                      {value?.email === contact.email && (
                        <Check className="h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setShowManualEntry(true)}
                    className="flex items-center"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Enter contact manually
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          ) : (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Enter Contact Details</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowManualEntry(false);
                    setManualContact({ name: '', email: '', phone: '' });
                  }}
                >
                  ← Back
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="manual-name">Name *</Label>
                  <Input
                    id="manual-name"
                    value={manualContact.name}
                    onChange={(e) => setManualContact(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="manual-email">Email *</Label>
                  <Input
                    id="manual-email"
                    type="email"
                    value={manualContact.email}
                    onChange={(e) => setManualContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@company.com"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="manual-phone">Phone (Optional)</Label>
                  <Input
                    id="manual-phone"
                    type="tel"
                    value={manualContact.phone}
                    onChange={(e) => setManualContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowManualEntry(false);
                    setManualContact({ name: '', email: '', phone: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleManualSave}
                  disabled={!manualContact.name || !manualContact.email}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Use Contact
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}