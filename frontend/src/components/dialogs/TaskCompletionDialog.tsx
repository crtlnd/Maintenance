import React, { useState } from 'react';
import { CheckCircle, Clock, User, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { MaintenanceTask } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface TaskCompletionDialogProps {
  task: MaintenanceTask;
  onCompleteTask: (taskId: number, completionData: {
    completedBy: string;
    completionNotes: string;
    completedAt: string;
  }) => void;
}

export function TaskCompletionDialog({ task, onCompleteTask }: TaskCompletionDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const handleComplete = () => {
    if (!completionNotes.trim()) {
      return;
    }

    const completionData = {
      completedBy: `${user?.firstName} ${user?.lastName}`,
      completionNotes,
      completedAt: new Date().toISOString()
    };

    onCompleteTask(task.id, completionData);
    setCompletionNotes('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant={task.status === 'completed' ? 'outline' : 'default'}
          disabled={task.status === 'completed'}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {task.status === 'completed' ? 'Completed' : 'Mark Complete'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Maintenance Task</DialogTitle>
          <DialogDescription>
            Mark this task as completed and add any notes about the work performed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Summary */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="font-medium">{task.description}</div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {task.responsible}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.estimatedDuration}
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {task.taskType.replace('-', ' ')} • {task.frequency}
              </Badge>
            </CardContent>
          </Card>

          {/* Completion Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              <FileText className="h-4 w-4 inline mr-1" />
              Completion Notes <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="notes"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Describe the work performed, any issues encountered, parts used, etc..."
              rows={4}
            />
          </div>

          {/* Completion Info */}
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <div>Completed by: {user?.firstName} {user?.lastName}</div>
            <div>Completed on: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={!completionNotes.trim()}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}