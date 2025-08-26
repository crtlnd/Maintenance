import React, { useState } from 'react';
import { Phone, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ServiceProvider } from '../../types';

export function ContactProviderDialog({ provider }: { provider: ServiceProvider }) {
  const [open, setOpen] = useState(false);
  const [contactMethod, setContactMethod] = useState<'phone' | 'email'>('phone');
  const [message, setMessage] = useState('');

  const handleContact = () => {
    if (contactMethod === 'phone') {
      window.open(`tel:${provider.phone}`);
    } else {
      const subject = encodeURIComponent(`Service Request - ${provider.name}`);
      const body = encodeURIComponent(message || `Hello, I would like to inquire about your maintenance services.`);
      window.open(`mailto:${provider.email}?subject=${subject}&body=${body}`);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Contact {provider.name}</DialogTitle>
          <DialogDescription>
            Choose how you'd like to contact this service provider.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Contact Method</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="phone"
                  name="contact"
                  checked={contactMethod === 'phone'}
                  onChange={() => setContactMethod('phone')}
                />
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone: {provider.phone}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="email"
                  name="contact"
                  checked={contactMethod === 'email'}
                  onChange={() => setContactMethod('email')}
                />
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email: {provider.email}
                </Label>
              </div>
            </div>
          </div>

          {contactMethod === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your service needs..."
                rows={4}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleContact}>
              {contactMethod === 'phone' ? 'Call Now' : 'Send Email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}