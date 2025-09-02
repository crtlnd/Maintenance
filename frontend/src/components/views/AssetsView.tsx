import React, { useState, useEffect } from 'react';
import { ChevronRight, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Asset, FMEAEntry, MaintenanceTask } from '../../types';
import { getConditionColor } from '../../utils/helpers';
import { AddAssetDialog } from '../dialogs/AddAssetDialog';
import { EditAssetDialog } from '../dialogs/EditAssetDialog';
import { QuickAddTaskDialog } from '../dialogs/QuickAddTaskDialog';

interface AssetsViewProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => number;
  onSelectAsset: (assetId: number) => void;
  onAddFMEA: (fmea: Omit<FMEAEntry, 'id'>[]) => void;
  onAddMaintenanceTask: (tasks: Omit<MaintenanceTask, 'id'>[]) => void;
  onAddSingleMaintenanceTask?: (task: Omit<MaintenanceTask, 'id'>) => void;
  onEditAsset?: (asset: Asset) => void;
}

function AssetsView({
  assets,
  onAddAsset,
  onSelectAsset,
  onAddFMEA,
  onAddMaintenanceTask,
  onAddSingleMaintenanceTask,
  onEditAsset
}: AssetsViewProps) {
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  useEffect(() => {
    console.log('AssetsView props:', { assets, isArray: Array.isArray(assets) });
  }, [assets]);

  const handleEditClick = (event: React.MouseEvent, asset: Asset) => {
    event.stopPropagation();
    setEditingAsset(asset);
  };

  const handleEditSave = (updatedAsset: Asset) => {
    if (onEditAsset) {
      onEditAsset(updatedAsset);
    }
    setEditingAsset(null);
  };

  return (
    <div className="flex gap-8 p-8">
      <div className="flex-1 space-y-8">
        <div className="flex justify-between items-center">
          <h2>Assets</h2>
          <div className="flex gap-2">
            <AddAssetDialog
              onAddAsset={onAddAsset}
              currentAssetCount={assets.length}
            />
            {onAddSingleMaintenanceTask && (
              <QuickAddTaskDialog
                assets={assets}
                onAddMaintenanceTask={onAddSingleMaintenanceTask}
                triggerVariant="default"
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {assets.map((asset) => (
            <Card
              key={asset.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => onSelectAsset(asset.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{asset.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {asset.type} • {asset.manufacturer}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="secondary" className={getConditionColor(asset.condition)}>
                      {asset.condition}
                    </Badge>
                    {onEditAsset && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditClick(e, asset)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Model:</span>
                    <p className="break-words">{asset.modelNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Serial:</span>
                    <p className="break-words">{asset.serialNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Location:</span>
                    <p className="break-words">{asset.location}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Hours:</span>
                    <p>{asset.operatingHours ? asset.operatingHours.toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
                {asset.specifications?.power && (
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Power:</span>
                      <span className="font-medium">{asset.specifications.power}</span>
                    </div>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Last Maintenance: <span className="font-medium">{asset.lastMaintenance}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="w-80 flex-shrink-0">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-medium">{assets.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Total Assets</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-medium text-green-600">
                  {assets.filter(a => a.condition === 'Good').length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Good Condition</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4>Asset Types</h4>
              {Object.entries(
                assets.reduce((acc, asset) => {
                  acc[asset.type] = (acc[asset.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AssetsView;
