import React from 'react';
import { Calendar, BarChart3, Zap, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Asset, MaintenanceTask } from '../../../types';
import { getPriorityColor, getStatusColor } from '../../../utils/helpers';
import { AddMaintenanceTaskDialog } from '../../dialogs/AddMaintenanceTaskDialog';

interface AssetMaintenanceTabProps {
  asset: Asset;
  maintenanceData: MaintenanceTask[];
  onAddMaintenanceTask?: (task: Omit<MaintenanceTask, 'id'>) => void;
}

export function AssetMaintenanceTab({ asset, maintenanceData, onAddMaintenanceTask }: AssetMaintenanceTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3>Reliability Centered Maintenance</h3>
          <p className="text-muted-foreground">Planned maintenance schedules and tasks</p>
        </div>
        {onAddMaintenanceTask && (
          <AddMaintenanceTaskDialog
            assetId={asset.id}
            assetName={asset.name}
            onAddMaintenanceTask={onAddMaintenanceTask}
          />
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl">{maintenanceData.length}</div>
            <p className="text-sm text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-red-600">{maintenanceData.filter(m => m.status === 'overdue').length}</div>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-blue-600">{maintenanceData.filter(m => m.status === 'scheduled').length}</div>
            <p className="text-sm text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-green-600">{maintenanceData.filter(m => m.status === 'completed').length}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {maintenanceData.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {task.taskType === 'preventive' && <Calendar className="h-5 w-5" />}
                    {task.taskType === 'predictive' && <BarChart3 className="h-5 w-5" />}
                    {task.taskType === 'condition-based' && <Zap className="h-5 w-5" />}
                    {task.description}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground capitalize">{task.taskType} Maintenance</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge variant="secondary" className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="font-medium">{task.frequency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Duration</p>
                  <p className="font-medium">{task.estimatedDuration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Completed</p>
                  <p className="font-medium">{task.lastCompleted}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Due</p>
                  <p className="font-medium">{task.nextDue}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  {task.responsible}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
