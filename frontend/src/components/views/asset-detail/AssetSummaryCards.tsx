// AssetSummaryCards.tsx
import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Asset } from '../../../types';

interface AssetSummaryCardsProps {
  asset: Asset;
}

export function AssetSummaryCards({ asset }: AssetSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Serial Number</p>
          <p className="font-medium">{asset.serialNumber}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Location</p>
          <p className="font-medium">{asset.location}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Operating Hours</p>
          <p className="font-medium">{asset.operatingHours?.toLocaleString() || 'N/A'}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Last Maintenance</p>
          <p className="font-medium">{asset.lastMaintenance}</p>
        </CardContent>
      </Card>
    </div>
  );
}
