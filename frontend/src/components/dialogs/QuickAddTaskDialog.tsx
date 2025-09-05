import React, { useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { ContactSelector } from '../ui/contact-selector';
import { Asset, MaintenanceTask } from '../../types';

export function QuickAddTaskDialog({
  assets,
  onAddMaintenanceTask,
  triggerVariant = 'default'
}: {
  assets: Asset[];
  onAddMaintenanceTask: (task: Omit<MaintenanceTask, 'id'>) => void;
  triggerVariant?: 'default' | 'primary' | 'fab';
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    assetId: '',
    description: '',
    nextDue: '',
    responsible: '',
    responsibleEmail: '',
    responsiblePhone: '',
    priority: 'medium' as const,
  });

  const isFormValid = formData.assetId && formData.description && formData.nextDue && formData.responsible && formData.responsibleEmail;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    const task: Omit<MaintenanceTask, 'id'> = {
      assetId: parseInt(formData.assetId),
      taskType: 'preventive',
      description: formData.description,
      frequency: 'As needed',
      hoursInterval: 0,
      lastCompleted: new Date().toISOString().split('T')[0],
      nextDue: formData.nextDue,
      estimatedDuration: '1 hour',
      responsible: formData.responsible,
      responsibleEmail: formData.responsibleEmail || undefined,
      responsiblePhone: formData.responsiblePhone || undefined,
      priority: formData.priority,
      status: 'scheduled'
    };

    onAddMaintenanceTask(task);
    setOpen(false);

    // Reset form
    setFormData({
      assetId: '',
      description: '',
      nextDue: '',
      responsible: '',
      responsibleEmail: '',
      responsiblePhone: '',
      priority: 'medium' as const,
    });
  };

  const handleContactChange = (contact: any) => {
    setFormData(prev => ({
      ...prev,
      responsible: contact.name || '',
      responsibleEmail: contact.email || '',
      responsiblePhone: contact.phone || ''
    }));
  };

  const getTriggerButton = () => {
    if (triggerVariant === 'fab') {
      return (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 border-0 z-50"
          aria-label="Quick Add Task"
        >
          <Plus className="h-6 w-6" />
        </Button>
      );
    }

    if (triggerVariant === 'primary') {
      return (
        <Button
          size="default"
          className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Quick Add Task</span>
          <span className="sm:hidden">Add Task</span>
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="default"
        className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
      >
        <Zap className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Quick Add</span>
        <span className="sm:hidden">Add</span>
      </Button>
    );
  };

  // Filter out any invalid assets before rendering
  const validAssets = (assets || []).filter(asset => asset && asset.id != null);

  // Don't render the dialog if there are no valid assets
  if (validAssets.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {getTriggerButton()}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Quick Add Maintenance Task
          </DialogTitle>
          <DialogDescription>
            Quickly create a maintenance task with essential details. You can add more details later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="assetId">Asset *</Label>
            <Select value={formData.assetId} onValueChange={(value) => setFormData(prev => ({ ...prev, assetId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select an asset..." />
              </SelectTrigger>
              <SelectContent>
                {validAssets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id.toString()}>
                    {asset.name} - {asset.type} ({asset.location})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Task Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What maintenance needs to be done? (e.g., Replace air filter, Check oil level, Inspect belts)"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nextDue">Due Date *</Label>
              <DatePicker
                value={formData.nextDue}
                onChange={(value) => setFormData(prev => ({ ...prev, nextDue: value }))}
                placeholder="Select due date"
                defaultToTomorrow={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Assign To *</Label>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Name *"
                  value={formData.responsible}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={formData.responsibleEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibleEmail: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={formData.responsiblePhone}
                onChange={(e) => setFormData(prev => ({ ...prev, responsiblePhone: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm text-blue-800">
              <strong>Quick Mode:</strong> This creates a task with smart defaults. You can edit it later to add frequency, duration, and other details.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="order-2 sm:order-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid}
              className="bg-blue-600 hover:bg-blue-700 text-white order-1 sm:order-2"
            >
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
