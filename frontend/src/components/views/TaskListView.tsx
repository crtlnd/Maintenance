import React, { useState, useMemo } from 'react';
import { ClipboardList, Shapes, MapPin, User, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Asset, MaintenanceTask, TaskWithAsset } from '../../types';
import { getUrgencyColor, getPriorityColor, getStatusColor } from '../../utils/helpers';
import { TaskCompletionDialog } from '../dialogs/TaskCompletionDialog';
import { QuickAddTaskDialog } from '../dialogs/QuickAddTaskDialog';

export function TaskListView({ 
  assets, 
  maintenanceData,
  onSelectAsset,
  onCompleteTask,
  onAddMaintenanceTask
}: { 
  assets: Asset[]; 
  maintenanceData: MaintenanceTask[];
  onSelectAsset: (assetId: number) => void;
  onCompleteTask?: (taskId: number, completionData: {
    completedBy: string;
    completionNotes: string;
    completedAt: string;
  }) => void;
  onAddMaintenanceTask?: (task: Omit<MaintenanceTask, 'id'>) => void;
}) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'urgency' | 'hours' | 'date'>('urgency');

  // Calculate task urgency and remaining time
  const tasksWithUrgency = useMemo(() => {
    const today = new Date();
    
    return maintenanceData
      .map(task => {
        const asset = assets.find(a => a.id === task.assetId)!;
        let hoursRemaining: number | undefined;
        let daysRemaining: number | undefined;
        let urgencyScore = 0;

        // Skip urgency calculation for completed tasks
        if (task.status === 'completed') {
          return {
            ...task,
            asset,
            hoursRemaining: undefined,
            daysRemaining: undefined,
            urgencyScore: 0
          } as TaskWithAsset;
        }

        // Calculate hours remaining if hoursInterval is available
        if (task.hoursInterval && asset) {
          // Calculate hours since last completed
          const lastCompletedDate = new Date(task.lastCompleted);
          const daysSinceCompleted = Math.floor((today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24));
          const estimatedHoursSinceCompleted = daysSinceCompleted * 8; // Assume 8 hours per day operation
          const totalHoursSinceCompleted = asset.operatingHours - (asset.operatingHours - estimatedHoursSinceCompleted);
          
          hoursRemaining = task.hoursInterval - (totalHoursSinceCompleted % task.hoursInterval);
          if (hoursRemaining <= 0) hoursRemaining = 0;
        }

        // Calculate days remaining
        const nextDueDate = new Date(task.nextDue);
        daysRemaining = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate urgency score (0-100, higher = more urgent)
        if (task.status === 'overdue') {
          urgencyScore = 100;
        } else {
          let timeUrgency = 0;
          let hoursUrgency = 0;
          
          // Time-based urgency
          if (daysRemaining <= 0) {
            timeUrgency = 100;
          } else if (daysRemaining <= 3) {
            timeUrgency = 90;
          } else if (daysRemaining <= 7) {
            timeUrgency = 70;
          } else if (daysRemaining <= 14) {
            timeUrgency = 50;
          } else if (daysRemaining <= 30) {
            timeUrgency = 30;
          } else {
            timeUrgency = 10;
          }
          
          // Hours-based urgency
          if (hoursRemaining !== undefined) {
            if (hoursRemaining <= 0) {
              hoursUrgency = 100;
            } else if (hoursRemaining <= 25) {
              hoursUrgency = 90;
            } else if (hoursRemaining <= 50) {
              hoursUrgency = 70;
            } else if (hoursRemaining <= 100) {
              hoursUrgency = 50;
            } else if (hoursRemaining <= 200) {
              hoursUrgency = 30;
            } else {
              hoursUrgency = 10;
            }
          }
          
          // Priority weight
          const priorityWeight = task.priority === 'high' ? 1.2 : task.priority === 'medium' ? 1.0 : 0.8;
          
          // Combine urgencies (take the higher of time or hours, apply priority weight)
          urgencyScore = Math.max(timeUrgency, hoursUrgency) * priorityWeight;
          urgencyScore = Math.min(100, urgencyScore); // Cap at 100
        }

        return {
          ...task,
          asset,
          hoursRemaining,
          daysRemaining,
          urgencyScore: Math.round(urgencyScore)
        } as TaskWithAsset;
      });
  }, [assets, maintenanceData]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasksWithUrgency;

    // Apply filters
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          return b.urgencyScore - a.urgencyScore;
        case 'hours':
          if (a.hoursRemaining === undefined && b.hoursRemaining === undefined) return 0;
          if (a.hoursRemaining === undefined) return 1;
          if (b.hoursRemaining === undefined) return -1;
          return a.hoursRemaining - b.hoursRemaining;
        case 'date':
          return new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime();
        default:
          return 0;
      }
    });
  }, [tasksWithUrgency, filterStatus, filterPriority, sortBy]);

  const stats = useMemo(() => {
    const activeTasksOnly = tasksWithUrgency.filter(t => t.status !== 'completed');
    const overdue = activeTasksOnly.filter(t => t.status === 'overdue').length;
    const critical = activeTasksOnly.filter(t => t.urgencyScore >= 90).length;
    const dueThisWeek = activeTasksOnly.filter(t => t.daysRemaining !== undefined && t.daysRemaining <= 7 && t.daysRemaining > 0).length;
    const scheduled = activeTasksOnly.filter(t => t.status === 'scheduled').length;
    const completed = tasksWithUrgency.filter(t => t.status === 'completed').length;

    return { overdue, critical, dueThisWeek, scheduled, completed };
  }, [tasksWithUrgency]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Task List</h2>
          <p className="text-muted-foreground">Upcoming maintenance tasks prioritized by urgency</p>
        </div>
        {onAddMaintenanceTask && (
          <div className="flex gap-2">
            <QuickAddTaskDialog 
              assets={assets}
              onAddMaintenanceTask={onAddMaintenanceTask}
              triggerVariant="primary"
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-red-600">{stats.overdue}</div>
            <p className="text-sm text-muted-foreground">Overdue Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-orange-600">{stats.critical}</div>
            <p className="text-sm text-muted-foreground">Critical Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-yellow-600">{stats.dueThisWeek}</div>
            <p className="text-sm text-muted-foreground">Due This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-blue-600">{stats.scheduled}</div>
            <p className="text-sm text-muted-foreground">Total Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sorting */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: 'urgency' | 'hours' | 'date') => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgency">Urgency Score</SelectItem>
                  <SelectItem value="hours">Hours Remaining</SelectItem>
                  <SelectItem value="date">Due Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedTasks.length} of {tasksWithUrgency.length} tasks
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {filteredAndSortedTasks.map((task) => (
          <Card 
            key={task.id} 
            className={`hover:shadow-md transition-shadow ${task.status === 'completed' ? 'bg-green-50 border-green-200' : ''}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1" onClick={() => onSelectAsset(task.assetId)} role="button">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium word-wrap-break-word">{task.description}</h4>
                        {task.status !== 'completed' && (
                          <Badge variant="secondary" className={getUrgencyColor(task.urgencyScore)}>
                            Urgency: {task.urgencyScore}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Shapes className="h-3 w-3" />
                          {task.asset.name} ({task.asset.type})
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {task.asset.location}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span className="word-wrap-break-word">{task.responsible}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Task Type:</span>
                          <p className="font-medium capitalize">{task.taskType.replace('-', ' ')}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Frequency:</span>
                          <p className="font-medium">{task.frequency}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <p className="font-medium">{task.estimatedDuration}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {task.status === 'completed' ? 'Completed:' : 'Last Completed:'}
                          </span>
                          <p className="font-medium">
                            {task.status === 'completed' && task.completedAt
                              ? new Date(task.completedAt).toLocaleDateString()
                              : task.lastCompleted}
                          </p>
                        </div>
                      </div>

                      {/* Completion details for completed tasks */}
                      {task.status === 'completed' && task.completionNotes && (
                        <div className="mt-3 p-3 bg-green-100 rounded-lg border-l-4 border-green-400">
                          <div className="text-sm">
                            <span className="font-medium text-green-800">Completion Notes:</span>
                            <p className="text-green-700 mt-1 word-wrap-break-word">{task.completionNotes}</p>
                            {task.completedBy && (
                              <p className="text-green-600 text-xs mt-1 word-wrap-break-word">Completed by: {task.completedBy}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant="secondary" className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                      
                      {task.status !== 'completed' && (
                        <div className="text-right">
                          {task.hoursRemaining !== undefined && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Hours remaining:</span>
                              <p className="font-medium text-lg">
                                {task.hoursRemaining <= 0 ? (
                                  <span className="text-red-600">Overdue</span>
                                ) : (
                                  <span className={task.hoursRemaining <= 50 ? 'text-orange-600' : 'text-green-600'}>
                                    {task.hoursRemaining}h
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                          
                          <div className="text-sm mt-1">
                            <span className="text-muted-foreground">Due date:</span>
                            <p className="font-medium">
                              {task.daysRemaining !== undefined && task.daysRemaining <= 0 ? (
                                <span className="text-red-600">
                                  {task.daysRemaining === 0 ? 'Today' : `${Math.abs(task.daysRemaining)} days overdue`}
                                </span>
                              ) : (
                                <span className={task.daysRemaining !== undefined && task.daysRemaining <= 7 ? 'text-orange-600' : 'text-green-600'}>
                                  {task.nextDue}
                                  {task.daysRemaining !== undefined && task.daysRemaining > 0 && (
                                    <span className="text-muted-foreground ml-1">
                                      ({task.daysRemaining} days)
                                    </span>
                                  )}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  {onCompleteTask && (
                    <TaskCompletionDialog
                      task={task}
                      onCompleteTask={onCompleteTask}
                    />
                  )}
                  <div onClick={() => onSelectAsset(task.assetId)} role="button">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedTasks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3>No tasks found</h3>
              <p>Try adjusting your filters or check back later for scheduled maintenance.</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Floating Action Button */}
      {onAddMaintenanceTask && (
        <QuickAddTaskDialog 
          assets={assets}
          onAddMaintenanceTask={onAddMaintenanceTask}
          triggerVariant="fab"
        />
      )}
    </div>
  );
}