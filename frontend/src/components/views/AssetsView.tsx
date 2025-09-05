import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Settings, Eye, ArrowLeft, CheckSquare, Zap, BarChart3, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Asset, FMEAEntry, MaintenanceTask } from '../../types';
import { getConditionColor } from '../../utils/helpers';
import { AddAssetDialog } from '../dialogs/AddAssetDialog';
import { EditAssetDialog } from '../dialogs/EditAssetDialog';
import { QuickAddTaskDialog } from '../dialogs/QuickAddTaskDialog';
import { DemoBanner } from '../ui/DemoBanner';
import { BulkOperationsPanel } from './BulkOperationsPanel';
import { AssetFiltersPanel, FilterState, SortState } from './AssetFiltersPanel';
import { EmptyAssetState } from './EmptyAssetState';
import { AssetCard } from './AssetCard';
import { AssetStatsPanel } from './AssetStatsPanel';

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
  // State management
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<number>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // Filter and Sort State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    condition: 'all',
    type: 'all',
    location: 'all',
    manufacturer: 'all',
    operatingHoursMin: '',
    operatingHoursMax: ''
  });

  const [sort, setSort] = useState<SortState>({
    field: 'name',
    direction: 'asc'
  });

  useEffect(() => {
    console.log('AssetsView props:', {
      assetsCount: assets?.length || 0,
      isArray: Array.isArray(assets),
      assets: assets?.map(a => ({ id: a?.id, name: a?.name })) || []
    });
  }, [assets]);

  // Get selected assets for bulk operations
  const selectedAssets = useMemo(() => {
    const safeAssets = Array.isArray(assets) ? assets.filter(asset => asset && asset.id != null) : [];
    return safeAssets.filter(asset => selectedAssetIds.has(asset.id));
  }, [assets, selectedAssetIds]);

  // Bulk operations handlers
  const handleSelectAsset = (assetId: number, checked: boolean) => {
    setSelectedAssetIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(assetId);
      } else {
        newSet.delete(assetId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    const safeAssets = Array.isArray(assets) ? assets.filter(asset => asset && asset.id != null) : [];
    if (checked) {
      const allIds = new Set(safeAssets.map(asset => asset.id));
      setSelectedAssetIds(allIds);
    } else {
      setSelectedAssetIds(new Set());
    }
  };

  const handleClearSelection = () => {
    setSelectedAssetIds(new Set());
    setBulkMode(false);
  };

  const handleCreateBulkTask = async (taskType: string, description: string, dueDate: string) => {
    if (!onAddSingleMaintenanceTask || selectedAssets.length === 0) return;

    try {
      // Create maintenance tasks for each selected asset
      const tasks = selectedAssets.map(asset => ({
        assetId: asset.id,
        taskType: 'preventive' as const,
        description: `${description} - ${asset.name}`,
        frequency: 'As needed',
        hoursInterval: 0,
        lastCompleted: new Date().toISOString().split('T')[0],
        nextDue: dueDate,
        estimatedDuration: taskType === 'grease-inspection' ? '30 minutes' : '1 hour',
        responsible: 'Maintenance Team',
        responsibleEmail: 'maintenance@company.com',
        priority: 'medium' as const,
        status: 'scheduled' as const
      }));

      // Add each task
      for (const task of tasks) {
        await onAddSingleMaintenanceTask(task);
      }

      // Clear selection and exit bulk mode
      handleClearSelection();

      // Show success message (you might want to add a toast notification here)
      console.log(`Created ${tasks.length} maintenance tasks successfully`);

    } catch (error) {
      console.error('Error creating bulk maintenance tasks:', error);
    }
  };

  // Get unique values for filter dropdowns
  const filterOptions = useMemo(() => {
    const safeAssets = Array.isArray(assets) ? assets.filter(asset => asset && asset.id != null) : [];

    return {
      conditions: [...new Set(safeAssets.map(a => a.condition).filter(Boolean))],
      types: [...new Set(safeAssets.map(a => a.type).filter(Boolean))],
      locations: [...new Set(safeAssets.map(a => a.location).filter(Boolean))],
      manufacturers: [...new Set(safeAssets.map(a => a.manufacturer).filter(Boolean))]
    };
  }, [assets]);

  // Filter and sort assets
  const filteredAndSortedAssets = useMemo(() => {
    const safeAssets = Array.isArray(assets) ? assets.filter(asset => asset && asset.id != null) : [];

    // Apply filters
    let filtered = safeAssets.filter(asset => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          asset.name,
          asset.type,
          asset.manufacturer,
          asset.modelNumber,
          asset.serialNumber,
          asset.location
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchTerm)) return false;
      }

      // Condition filter
      if (filters.condition !== 'all' && asset.condition !== filters.condition) return false;

      // Type filter
      if (filters.type !== 'all' && asset.type !== filters.type) return false;

      // Location filter
      if (filters.location !== 'all' && asset.location !== filters.location) return false;

      // Manufacturer filter
      if (filters.manufacturer !== 'all' && asset.manufacturer !== filters.manufacturer) return false;

      // Operating hours filter
      if (filters.operatingHoursMin && asset.operatingHours < parseInt(filters.operatingHoursMin)) return false;
      if (filters.operatingHoursMax && asset.operatingHours > parseInt(filters.operatingHoursMax)) return false;

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.field) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'type':
          aValue = a.type?.toLowerCase() || '';
          bValue = b.type?.toLowerCase() || '';
          break;
        case 'condition':
          aValue = a.condition || '';
          bValue = b.condition || '';
          break;
        case 'location':
          aValue = a.location?.toLowerCase() || '';
          bValue = b.location?.toLowerCase() || '';
          break;
        case 'operatingHours':
          aValue = a.operatingHours || 0;
          bValue = b.operatingHours || 0;
          break;
        case 'lastMaintenance':
          aValue = new Date(a.lastMaintenance || 0);
          bValue = new Date(b.lastMaintenance || 0);
          break;
        default:
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
      }

      if (sort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [assets, filters, sort]);

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
    const realAssets = filteredAndSortedAssets.filter(asset => !asset.isDemo);
    // If there are no real assets, this will trigger the empty state
    if (realAssets.length === 0) {
      localStorage.removeItem('demoMode');
      // Force reload to clear demo data - you might need to implement a cleaner way
      window.location.reload();
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      condition: 'all',
      type: 'all',
      location: 'all',
      manufacturer: 'all',
      operatingHoursMin: '',
      operatingHoursMax: ''
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.search ||
    filters.condition !== 'all' ||
    filters.type !== 'all' ||
    filters.location !== 'all' ||
    filters.manufacturer !== 'all' ||
    filters.operatingHoursMin ||
    filters.operatingHoursMax;

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
            {/* Bulk Selection Toggle */}
            <Button
              variant={bulkMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setBulkMode(!bulkMode);
                if (!bulkMode) setSelectedAssetIds(new Set());
              }}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              {bulkMode ? 'Exit Selection' : 'Bulk Select'}
            </Button>

            {/* Select All/None when in bulk mode */}
            {bulkMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(selectedAssetIds.size === 0)}
              >
                {selectedAssetIds.size === filteredAndSortedAssets.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}

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

        {/* Asset Filters Panel */}
        <AssetFiltersPanel
          filters={filters}
          sort={sort}
          filterOptions={filterOptions}
          onFiltersChange={setFilters}
          onSortChange={setSort}
          onClearFilters={clearFilters}
          isVisible={showFilters}
          onToggleVisibility={() => setShowFilters(!showFilters)}
          hasActiveFilters={hasActiveFilters}
          resultCount={filteredAndSortedAssets.length}
          totalCount={safeAssets.length}
        />

        {/* Bulk Operations Panel */}
        {bulkMode && selectedAssets.length > 0 && (
          <BulkOperationsPanel
            selectedAssets={selectedAssets}
            onClearSelection={handleClearSelection}
            onCreateBulkTask={handleCreateBulkTask}
          />
        )}

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredAndSortedAssets.map((asset) => {
            // Extra safety check for each asset
            if (!asset || asset.id == null) {
              console.warn('Invalid asset found:', asset);
              return null;
            }

            return (
              <AssetCard
                key={asset.id}
                asset={asset}
                isSelected={selectedAssetIds.has(asset.id)}
                bulkMode={bulkMode}
                onSelect={handleSelectAsset}
                onAssetClick={onSelectAsset}
                onEditClick={handleEditClick}
                showEdit={!!onEditAsset}
              />
            );
          })}
        </div>

        {/* No Results Message */}
        {filteredAndSortedAssets.length === 0 && safeAssets.length > 0 && (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <div className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No assets found</h3>
                <p className="text-muted-foreground">Try adjusting your filters to see more results</p>
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Sidebar with Stats Panel */}
      <div className="w-80 flex-shrink-0">
        <AssetStatsPanel
          assets={filteredAndSortedAssets}
          hasActiveFilters={hasActiveFilters}
          onFilterChange={(partialFilters) => setFilters(prev => ({ ...prev, ...partialFilters }))}
          onBulkModeActivate={() => {
            setBulkMode(true);
            // Select all assets for quick bulk grease inspection
            const allIds = new Set(filteredAndSortedAssets.map(asset => asset.id));
            setSelectedAssetIds(allIds);
          }}
        />
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
