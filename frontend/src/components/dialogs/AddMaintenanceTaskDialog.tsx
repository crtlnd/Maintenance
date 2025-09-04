import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { ContactSelector } from '../ui/contact-selector';
import { MaintenanceTask } from '../../types';

export function AddMaintenanceTaskDialog({
  assetId,
  assetName,
  onAddMaintenanceTask
}: {
  assetId: number;
  assetName: string;
  onAddMaintenanceTask: (task: Omit<MaintenanceTask, 'id'>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    taskType: 'preventive' as const,
    description: '',
    frequency: '',
    hoursInterval: 0,
    lastCompleted: '',
    nextDue: '',
    estimatedDuration: '',
    responsible: '',
    responsibleEmail: '',
    responsiblePhone: '',
    priority: 'medium' as const,
    status: 'scheduled' as const
  });

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    if (!formData.frequency.trim()) {
      newErrors.frequency = 'Frequency is required';
    }

    if (!formData.estimatedDuration.trim()) {
      newErrors.estimatedDuration = 'Estimated duration is required';
    }

    if (!formData.responsible.trim()) {
      newErrors.responsible = 'Responsible person is required';
    }

    if (!formData.responsibleEmail.trim()) {
      newErrors.responsibleEmail = 'Responsible person email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.responsibleEmail)) {
      newErrors.responsibleEmail = 'Please enter a valid email address';
    }

    if (!formData.nextDue) {
      newErrors.nextDue = 'Next due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Add default values for any empty required fields as fallback
    const taskData = {
      ...formData,
      responsible: formData.responsible || 'Maintenance Team',
      responsibleEmail: formData.responsibleEmail || 'maintenance@company.com',
      assetId
    };

    onAddMaintenanceTask(taskData);
    setOpen(false);

    // Reset form
    setFormData({
      taskType: 'preventive' as const,
      description: '',
      frequency: '',
      hoursInterval: 0,
      lastCompleted: '',
      nextDue: '',
      estimatedDuration: '',
      responsible: '',
      responsibleEmail: '',
      responsiblePhone: '',
      priority: 'medium' as const,
      status: 'scheduled' as const
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Maintenance Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Maintenance Task - {assetName}</DialogTitle>
          <DialogDescription>
            Schedule a new maintenance task for this asset.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskType">Task Type</Label>
              <Select value={formData.taskType} onValueChange={(value: 'preventive' | 'predictive' | 'condition-based') => setFormData(prev => ({ ...prev, taskType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="predictive">Predictive</SelectItem>
                  <SelectItem value="condition-based">Condition-Based</SelectItem>
                </SelectContent>
              </Select>
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
            <Label htmlFor="description">Task Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the maintenance task to be performed..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                placeholder="e.g., Every 500 hours, Monthly, Quarterly"
                className={errors.frequency ? 'border-red-500' : ''}
              />
              {errors.frequency && <p className="text-red-500 text-sm">{errors.frequency}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hoursInterval">Hours Interval (Optional)</Label>
              <Input
                id="hoursInterval"
                type="number"
                min="0"
                value={formData.hoursInterval}
                onChange={(e) => setFormData(prev => ({ ...prev, hoursInterval: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedDuration">Estimated Duration *</Label>
            <Input
              id="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
              placeholder="e.g., 2 hours, 30 minutes"
              className={errors.estimatedDuration ? 'border-red-500' : ''}
            />
            {errors.estimatedDuration && <p className="text-red-500 text-sm">{errors.estimatedDuration}</p>}
          </div>

          {/* Responsible Person Section - Making it clearer that it's required */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Assign To *</Label>
              <p className="text-sm text-gray-600">Who is responsible for this maintenance task?</p>
            </div>

            {/* Manual input fields instead of ContactSelector for now */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsible Person Name *</Label>
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
                  placeholder="e.g., John Smith, Maintenance Team"
                  className={errors.responsible ? 'border-red-500' : ''}
                />
                {errors.responsible && <p className="text-red-500 text-sm">{errors.responsible}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibleEmail">Email Address *</Label>
                <Input
                  id="responsibleEmail"
                  type="email"
                  value={formData.responsibleEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibleEmail: e.target.value }))}
                  placeholder="e.g., john.smith@company.com"
                  className={errors.responsibleEmail ? 'border-red-500' : ''}
                />
                {errors.responsibleEmail && <p className="text-red-500 text-sm">{errors.responsibleEmail}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsiblePhone">Phone Number (Optional)</Label>
                <Input
                  id="responsiblePhone"
                  type="tel"
                  value={formData.responsiblePhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsiblePhone: e.target.value }))}
                  placeholder="e.g., (555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastCompleted">Last Completed (Optional)</Label>
              <DatePicker
                value={formData.lastCompleted}
                onChange={(value) => setFormData(prev => ({ ...prev, lastCompleted: value }))}
                placeholder="Select last completed date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextDue">Next Due Date *</Label>
              <DatePicker
                value={formData.nextDue}
                onChange={(value) => setFormData(prev => ({ ...prev, nextDue: value }))}
                placeholder="Select due date"
                defaultToTomorrow={true}
              />
              {errors.nextDue && <p className="text-red-500 text-sm">{errors.nextDue}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: 'scheduled' | 'overdue' | 'completed') => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
