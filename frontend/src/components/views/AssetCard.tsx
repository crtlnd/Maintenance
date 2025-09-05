import React from 'react';
import { ChevronRight, Settings, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Asset } from '../../types';
import { getConditionColor } from '../../utils/helpers';

interface AssetCardProps {
  asset: Asset;
  isSelected: boolean;
  bulkMode: boolean;
  onSelect: (assetId: number, checked: boolean) => void;
  onAssetClick: (assetId: number) => void;
  onEditClick?: (event: React.MouseEvent, asset: Asset) => void;
  showEdit: boolean;
}

export function AssetCard({
  asset,
  isSelected,
  bulkMode,
  onSelect,
  onAssetClick,
  onEditClick,
  showEdit
}: AssetCardProps) {

  const handleCardClick = () => {
    if (bulkMode) {
      onSelect(asset.id, !isSelected);
    } else {
      onAssetClick(asset.id);
    }
  };

  const handleEditClick = (event: React.MouseEvent) => {
    if (onEditClick) {
      onEditClick(event, asset);
    }
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow group cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          {/* Bulk Mode Checkbox */}
          {bulkMode && (
            <div className="flex items-center pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(asset.id, !!checked)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
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

            {/* Edit button for non-demo assets and not in bulk mode */}
            {showEdit && !asset.isDemo && !bulkMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}

            {/* Read-only indicator for demo assets */}
            {asset.isDemo && !bulkMode && (
              <div className="h-8 w-8 flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity">
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            {!bulkMode && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
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
}
