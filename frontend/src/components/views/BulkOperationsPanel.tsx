import React, { useState } from 'react';
import { CheckSquare, X, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Asset } from '../../types';

interface BulkOperationsPanelProps {
  selectedAssets: Asset[];
  onClearSelection: () => void;
  onCreateBulkTask: (taskType: string, description: string, dueDate: string) => void;
}

const taskTemplates = {
  'grease-inspection': {
    name: 'Grease Inspection',
    description: 'Inspect and lubricate grease fittings, check grease levels, and apply grease gun as needed'
  },
  'visual-inspection': {
    name: 'Visual Inspection',
    description: 'Perform visual inspection for wear, damage, leaks, and general condition'
  },
  'safety-check': {
    name: 'Safety Check',
    description: 'Verify safety guards, emergency stops, and safety systems are functioning'
  },
  'custom': {
    name: 'Custom Task',
    description: ''
  }
};

export function BulkOperationsPanel({
  selectedAssets,
  onClearSelection,
  onCreateBulkTask
}: BulkOperationsPanelProps) {
  const [taskType, setTaskType] = useState('grease-inspection');
  const [customDescription, setCustomDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const handleCreateTask = () => {
    const template = taskTemplates[taskType as keyof typeof taskTemplates];
    const description = taskType === 'custom' ? customDescription : template.description;

    if (description.trim()) {
      onCreateBulkTask(taskType, description, dueDate);
    }
  };

  const isFormValid = taskType !== 'custom' || customDescription.trim().length > 0;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">
              Bulk Operations - {selectedAssets.length} Assets Selected
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="h-4 w-4 mr-2" />
            Clear Selection
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-blue-700">
          <span className="font-medium">Selected Assets:</span> {selectedAssets.map(asset => asset.name).join(', ')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Task Type</label>
            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(taskTemplates).map(([key, template]) => (
                  <SelectItem key={key} value={key}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {taskType === 'custom' && (
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Task Description</label>
              <Input
                placeholder="Enter custom task description..."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
              />
            </div>
          )}
        </div>

        {taskType !== 'custom' && (
          <div className="p-3 bg-white rounded border">
            <p className="text-sm text-gray-700">
              <strong>Task Description:</strong> {taskTemplates[taskType as keyof typeof taskTemplates].description}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleCreateTask}
            disabled={!isFormValid}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            Create Bulk Task for {selectedAssets.length} Assets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
