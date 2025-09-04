import React, { useState, useEffect } from 'react';
import { ChevronRight, Settings, Plus, Wrench, FileText, BarChart3, Brain, AlertTriangle, Search, Eye, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Asset, FMEAEntry, MaintenanceTask } from '../../types';
import { getConditionColor } from '../../utils/helpers';
import { AddAssetDialog } from '../dialogs/AddAssetDialog';
import { EditAssetDialog } from '../dialogs/EditAssetDialog';
import { QuickAddTaskDialog } from '../dialogs/QuickAddTaskDialog';
import { DemoBanner } from '../ui/DemoBanner';

interface AssetsViewProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => number;
  onSelectAsset: (assetId: number) => void;
  onAddFMEA: (fmea: Omit<FMEAEntry, 'id'>[]) => void;
  onAddMaintenanceTask: (tasks: Omit<MaintenanceTask, 'id'>[]) => void;
  onAddSingleMaintenanceTask?: (task: Omit<MaintenanceTask, 'id'>) => void;
  onEditAsset?: (asset: Asset) => void;
  onCreateDemoData: () => Promise<void>;
}

// Empty State Component
function EmptyAssetState({
  onAddAsset,
  currentAssetCount,
  onCreateDemoData
}: {
  onAddAsset: (asset: Omit<Asset, 'id'>) => number;
  currentAssetCount: number;
  onCreateDemoData: () => Promise<void>;
}) {
  const [isAddingDemo, setIsAddingDemo] = useState(false);

  const handleViewDemo = async () => {
    console.log('Demo button clicked - delegating to App.tsx');
    setIsAddingDemo(true);

    try {
      await onCreateDemoData();
    } catch (error) {
      console.error('Error creating demo data:', error);
    } finally {
      setIsAddingDemo(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
        <Wrench className="w-12 h-12 text-blue-600" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">Welcome to Casey!</h3>
        <p className="text-muted-foreground max-w-md">
          Start managing your maintenance by adding your first asset. Track equipment, schedule maintenance, and monitor performance all in one place.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <AddAssetDialog
          onAddAsset={onAddAsset}
          currentAssetCount={currentAssetCount}
          triggerButton={
            <Button size="lg" className="px-8">
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Asset
            </Button>
          }
        />
        <Button
          variant="outline"
          size="lg"
          className="px-8"
          onClick={handleViewDemo}
          disabled={isAddingDemo}
        >
          <FileText className="w-5 h-5 mr-2" />
          {isAddingDemo ? 'Creating Demo...' : 'View Demo'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 max-w-4xl">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Wrench className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="font-medium mb-1">Track Equipment</h4>
          <p className="text-sm text-muted-foreground">Monitor all your assets in one centralized location</p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <h4 className="font-medium mb-1">Schedule Maintenance</h4>
          <p className="text-sm text-muted-foreground">Create and manage maintenance tasks automatically</p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <h4 className="font-medium mb-1">Monitor Performance</h4>
          <p className="text-sm text-muted-foreground">Get insights into asset health and efficiency</p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-medium mb-1">AI Insights</h4>
          <p className="text-sm text-muted-foreground">Get intelligent recommendations and predictive analytics</p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h4 className="font-medium mb-1">Failure Mode Effects Analysis</h4>
          <p className="text-sm text-muted-foreground">Identify potential failure modes and assess risks</p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-indigo-600" />
          </div>
          <h4 className="font-medium mb-1">Root Cause Analysis</h4>
          <p className="text-sm text-muted-foreground">Investigate failures and prevent future occurrences</p>
        </div>
      </div>
    </div>
  );
}

function AssetsView({
  assets,
  onAddAsset,
  onSelectAsset,
  onAddFMEA,
  onAddMaintenanceTask,
  onAddSingleMaintenanceTask,
  onEditAsset,
  onCreateDemoData
}: AssetsViewProps) {
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  useEffect(() => {
    console.log('AssetsView props:', {
      assetsCount: assets?.length || 0,
      isArray: Array.isArray(assets),
      assets: assets?.map(a => ({ id: a?.id, name: a?.name })) || []
    });
  }, [assets]);

  const handleEditClick = (event: React.MouseEvent, asset: Asset) => {
    console.log('Gear clicked for asset:', asset?.name, 'ID:', asset?.id);
    event.stopPropagation();
    setEditingAsset(asset);
  };

  const handleEditSave = (updatedAsset: Asset) => {
    if (onEditAsset) {
      onEditAsset(updatedAsset);
    }
    setEditingAsset(null);
  };

  const handleEditCancel = () => {
    setEditingAsset(null);
  };

  // Enhanced add asset handler that exits demo mode when real asset is added
  const handleAddAssetWithDemoExit = (asset: Omit<Asset, 'id'>) => {
    // If adding a real asset (not demo), exit demo mode
    if (!asset.isDemo) {
      localStorage.removeItem('demoMode');
      console.log('Exiting demo mode - real asset added');
    }
    return onAddAsset(asset);
  };

  // Function to clear demo data and return to empty state
  const handleBackToFeatures = () => {
    // Remove all demo assets
    const realAssets = safeAssets.filter(asset => !asset.isDemo);
    // If there are no real assets, this will trigger the empty state
    if (realAssets.length === 0) {
      localStorage.removeItem('demoMode');
      // Force reload to clear demo data - you might need to implement a cleaner way
      window.location.reload();
    }
  };

  // Safety check for assets
  const safeAssets = Array.isArray(assets) ? assets.filter(asset => asset && asset.id != null) : [];
  const isDemoMode = localStorage.getItem('demoMode') === 'true';
  const hasOnlyDemoAssets = safeAssets.length > 0 && safeAssets.every(asset => asset.isDemo);

  // Show empty state when no valid assets
  if (safeAssets.length === 0) {
    return (
      <div className="p-8">
        <EmptyAssetState
          onAddAsset={handleAddAssetWithDemoExit}
          currentAssetCount={safeAssets.length}
          onCreateDemoData={onCreateDemoData}
        />
      </div>
    );
  }

  return (
    <div className="flex gap-8 p-8">
      <div className="flex-1 space-y-8">
        {/* Demo Mode Banner */}
        <DemoBanner
          onAddAsset={handleAddAssetWithDemoExit}
          currentAssetCount={safeAssets.length}
          onDismiss={() => {
            localStorage.setItem('demoBannerDismissed', 'true');
          }}
        />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2>Assets</h2>
            {/* Back to Features button for demo mode */}
            {isDemoMode && hasOnlyDemoAssets && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToFeatures}
                className="text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Features
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <AddAssetDialog
              onAddAsset={handleAddAssetWithDemoExit}
              currentAssetCount={safeAssets.length}
            />
            {onAddSingleMaintenanceTask && (
              <QuickAddTaskDialog
                assets={safeAssets}
                onAddMaintenanceTask={onAddSingleMaintenanceTask}
                triggerVariant="default"
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {safeAssets.map((asset) => {
            // Extra safety check for each asset
            if (!asset || asset.id == null) {
              console.warn('Invalid asset found:', asset);
              return null;
            }

            return (
              <Card
                key={asset.id}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => onSelectAsset(asset.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        {/* Fixed: Better layout for title and badge */}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg leading-tight break-words">
                            {asset.name || 'Unnamed Asset'}
                          </CardTitle>
                        </div>
                        {asset.isDemo && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">
                            Demo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {asset.type || 'Unknown Type'} • {asset.manufacturer || 'Unknown Manufacturer'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="secondary" className={getConditionColor(asset.condition || 'Unknown')}>
                        {asset.condition || 'Unknown'}
                      </Badge>
                      {/* Only show edit button for non-demo assets */}
                      {onEditAsset && !asset.isDemo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditClick(e, asset)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                      {/* Show read-only indicator for demo assets */}
                      {asset.isDemo && (
                        <div className="h-8 w-8 flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Model:</span>
                      <p className="break-words">{asset.modelNumber || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Serial:</span>
                      <p className="break-words">{asset.serialNumber || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Location:</span>
                      <p className="break-words">{asset.location || 'N/A'}</p>
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
                      Last Maintenance: <span className="font-medium">{asset.lastMaintenance || 'N/A'}</span>
                    </p>
                    {asset.isDemo && (
                      <p className="text-xs text-blue-600 mt-1 italic">
                        View-only demo asset • Click to explore details
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
                <div className="text-3xl font-medium">{safeAssets.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Total Assets</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-medium text-green-600">
                  {safeAssets.filter(a => a?.condition === 'Good').length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Good Condition</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4>Asset Types</h4>
              {Object.entries(
                safeAssets.reduce((acc, asset) => {
                  const type = asset?.type || 'Unknown';
                  acc[type] = (acc[type] || 0) + 1;
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

      {/* Edit Asset Dialog */}
      {editingAsset && (
        <EditAssetDialog
          isOpen={!!editingAsset}
          onClose={handleEditCancel}
          asset={editingAsset}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}

export default AssetsView;
