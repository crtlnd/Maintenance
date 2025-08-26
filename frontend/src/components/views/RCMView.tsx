import React from 'react';
import { ArrowLeft, ChevronRight, Calendar, BarChart3, Zap, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Asset, MaintenanceTask } from '../../types';
import { getStatusColor, getPriorityColor } from '../../utils/helpers';
import { AddMaintenanceTaskDialog } from '../dialogs/AddMaintenanceTaskDialog';

export function RCMView({ 
  assets, 
  maintenanceData, 
  selectedAssetId, 
  onSelectAsset, 
  onBack,
  onAddMaintenanceTask
}: { 
  assets: Asset[]; 
  maintenanceData: MaintenanceTask[]; 
  selectedAssetId: number | null; 
  onSelectAsset: (assetId: number) => void; 
  onBack: () => void;
  onAddMaintenanceTask: (task: Omit<MaintenanceTask, 'id'>) => void;
}) {
  if (selectedAssetId) {
    const asset = assets.find(a => a.id === selectedAssetId);
    const assetMaintenance = maintenanceData.filter(m => m.assetId === selectedAssetId);

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>
          <div className="flex-1">
            <h2>RCM - {asset?.name}</h2>
            <p className="text-muted-foreground">{asset?.modelNumber} • {asset?.location}</p>
          </div>
          <AddMaintenanceTaskDialog 
            assetId={selectedAssetId!} 
            assetName={asset?.name || ''} 
            onAddMaintenanceTask={onAddMaintenanceTask} 
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl">{assetMaintenance.length}</div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl text-red-600">{assetMaintenance.filter(m => m.status === 'overdue').length}</div>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl text-blue-600">{assetMaintenance.filter(m => m.status === 'scheduled').length}</div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl text-green-600">{assetMaintenance.filter(m => m.status === 'completed').length}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {assetMaintenance.map((task) => (
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

  return (
    <div className="p-6 space-y-6">
      <h2>RCM (Reliability Centered Maintenance)</h2>
      <p className="text-muted-foreground">Select an asset to view its maintenance schedule</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => {
          const assetMaintenance = maintenanceData.filter(m => m.assetId === asset.id);
          const overdue = assetMaintenance.filter(m => m.status === 'overdue').length;
          
          return (
            <Card 
              key={asset.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectAsset(asset.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {asset.type} • {asset.modelNumber}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Tasks:</span>
                    <span className="font-medium">{assetMaintenance.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Scheduled:</span>
                    <span className="font-medium text-blue-600">
                      {assetMaintenance.filter(m => m.status === 'scheduled').length}
                    </span>
                  </div>
                  {overdue > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Overdue:</span>
                      <span className="font-medium text-red-600">{overdue}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}