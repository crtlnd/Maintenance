import React, { useState } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Asset, FMEAEntry, RCAEntry, MaintenanceTask } from '../../types';
import { getConditionColor } from '../../utils/helpers';
import { EditAssetDialog } from '../dialogs/EditAssetDialog';
import { AssetSummaryCards } from './asset-detail/AssetSummaryCards';
import { AssetOverviewTab } from './asset-detail/AssetOverviewTab';
import { AssetFMEATab } from './asset-detail/AssetFMEATab';
import { AssetRCATab } from './asset-detail/AssetRCATab';
import { AssetMaintenanceTab } from './asset-detail/AssetMaintenanceTab';

interface AssetDetailViewProps {
  asset: Asset;
  fmeaData: FMEAEntry[];
  rcaData: RCAEntry[];
  maintenanceData: MaintenanceTask[];
  defaultTab?: string;
  onBack: () => void;
  onAddRCA?: (rca: Omit<RCAEntry, 'id'>) => void;
  onUpdateRCA?: (updatedRCA: RCAEntry) => void;
  onAddMaintenanceTask?: (task: Omit<MaintenanceTask, 'id'>) => void;
  onEditAsset?: (asset: Asset) => void;
  onAddFMEA?: (fmeaEntries: Omit<FMEAEntry, 'id'>[]) => void;
}

export function AssetDetailView({
  asset,
  fmeaData,
  rcaData,
  maintenanceData,
  defaultTab = 'overview',
  onBack,
  onAddRCA,
  onUpdateRCA,
  onAddMaintenanceTask,
  onEditAsset,
  onAddFMEA
}: AssetDetailViewProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const assetFMEA = fmeaData.filter(f => f.assetId === asset.id);
  const assetRCA = rcaData.filter(r => r.assetId === asset.id);
  const assetMaintenance = maintenanceData.filter(m => m.assetId === asset.id);

  const handleEditSave = (updatedAsset: Asset) => {
    if (onEditAsset) {
      onEditAsset(updatedAsset);
    }
    setIsEditDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assets
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2>{asset.name}</h2>
              <p className="text-muted-foreground">
                {asset.type} • {asset.manufacturer} • {asset.modelNumber}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className={getConditionColor(asset.condition)}>
                {asset.condition}
              </Badge>
              {onEditAsset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Asset
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Summary Cards */}
      <AssetSummaryCards asset={asset} />

      {/* Tabs for different sections */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fmea">FMEA ({assetFMEA.length})</TabsTrigger>
          <TabsTrigger value="rca">RCA ({assetRCA.length})</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance ({assetMaintenance.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AssetOverviewTab
            asset={asset}
            fmeaCount={assetFMEA.length}
            rcaData={assetRCA}
            maintenanceData={assetMaintenance}
          />
        </TabsContent>

        <TabsContent value="fmea">
          <AssetFMEATab
            asset={asset}
            fmeaData={assetFMEA}
            onAddFMEA={onAddFMEA}
          />
        </TabsContent>

        <TabsContent value="rca">
          <AssetRCATab
            asset={asset}
            rcaData={assetRCA}
            onAddRCA={onAddRCA}
            onUpdateRCA={onUpdateRCA}
          />
        </TabsContent>

        <TabsContent value="maintenance">
          <AssetMaintenanceTab
            asset={asset}
            maintenanceData={assetMaintenance}
            onAddMaintenanceTask={onAddMaintenanceTask}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Asset Dialog */}
      {isEditDialogOpen && (
        <EditAssetDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          asset={asset}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
