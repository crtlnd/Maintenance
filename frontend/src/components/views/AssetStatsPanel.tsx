import React from 'react';
import { AlertTriangle, BarChart3, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Asset } from '../../types';
import { getConditionColor } from '../../utils/helpers';
import { FilterState } from './AssetFiltersPanel';

interface AssetStatsPanelProps {
  assets: Asset[];
  hasActiveFilters: boolean;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onBulkModeActivate: () => void;
}

export function AssetStatsPanel({
  assets,
  hasActiveFilters,
  onFilterChange,
  onBulkModeActivate
}: AssetStatsPanelProps) {

  // Calculate statistics
  const totalAssets = assets.length;
  const goodConditionAssets = assets.filter(a => a?.condition === 'Good').length;

  // Condition breakdown
  const conditionStats = assets.reduce((acc, asset) => {
    const condition = asset?.condition || 'Unknown';
    acc[condition] = (acc[condition] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Asset type breakdown
  const typeStats = assets.reduce((acc, asset) => {
    const type = asset?.type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Quick filter handlers
  const handleNeedsAttentionFilter = () => {
    onFilterChange({ condition: 'Poor' });
  };

  const handleHighUsageFilter = () => {
    onFilterChange({ operatingHoursMin: '5000' });
  };

  const handleQuickGreaseInspection = () => {
    onBulkModeActivate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-3xl font-medium">{totalAssets}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {hasActiveFilters ? 'Filtered' : 'Total'} Assets
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-medium text-green-600">
              {goodConditionAssets}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Good Condition</p>
          </div>
        </div>

        <Separator />

        {/* Condition Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium">Condition Status</h4>
          {Object.entries(conditionStats).map(([condition, count]) => (
            <div key={condition} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getConditionColor(condition)}>
                  {condition}
                </Badge>
              </div>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Asset Types */}
        <div className="space-y-3">
          <h4 className="font-medium">Asset Types</h4>
          {Object.entries(typeStats).map(([type, count]) => (
            <div key={type} className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{type}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Quick Filter Buttons */}
        <div className="space-y-3">
          <h4 className="font-medium">Quick Filters</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleNeedsAttentionFilter}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Needs Attention
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleHighUsageFilter}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              High Usage (5000+ hrs)
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleQuickGreaseInspection}
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Grease Inspection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
