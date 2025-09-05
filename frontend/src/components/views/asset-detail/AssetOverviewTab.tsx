import React from 'react';
import { AlertTriangle, Calendar, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Asset, RCAEntry, MaintenanceTask } from '../../../types';

interface AssetOverviewTabProps {
  asset: Asset;
  fmeaCount: number;
  rcaData: RCAEntry[];
  maintenanceData: MaintenanceTask[];
}

export function AssetOverviewTab({ asset, fmeaCount, rcaData, maintenanceData }: AssetOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {asset.specifications?.power && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Power:</span>
                <span>{asset.specifications.power}</span>
              </div>
            )}
            {asset.specifications?.capacity && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity:</span>
                <span>{asset.specifications.capacity}</span>
              </div>
            )}
            {asset.specifications?.voltage && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Voltage:</span>
                <span>{asset.specifications.voltage}</span>
              </div>
            )}
            {asset.specifications?.weight && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight:</span>
                <span>{asset.specifications.weight}</span>
              </div>
            )}
            {(!asset.specifications || Object.keys(asset.specifications).length === 0) && (
              <p className="text-sm text-muted-foreground italic">No specifications available</p>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {asset.maintenanceSchedule?.oilChange && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Oil Change:</span>
                <span>{asset.maintenanceSchedule.oilChange}</span>
              </div>
            )}
            {asset.maintenanceSchedule?.filterReplacement && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Filter Replacement:</span>
                <span>{asset.maintenanceSchedule.filterReplacement}</span>
              </div>
            )}
            {asset.maintenanceSchedule?.inspection && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inspection:</span>
                <span>{asset.maintenanceSchedule.inspection}</span>
              </div>
            )}
            {asset.maintenanceSchedule?.overhaul && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overhaul:</span>
                <span>{asset.maintenanceSchedule.overhaul}</span>
              </div>
            )}
            {(!asset.maintenanceSchedule || Object.keys(asset.maintenanceSchedule).length === 0) && (
              <p className="text-sm text-muted-foreground italic">No maintenance schedule defined</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">FMEA Items</p>
                <p className="text-2xl font-medium">{fmeaCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failure Records</p>
                <p className="text-2xl font-medium">{rcaData.length}</p>
                {rcaData.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Total Cost: ${rcaData.reduce((sum, r) => sum + (r.cost || r.costImpact || 0), 0).toLocaleString()}
                  </p>
                )}
              </div>
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maintenance Tasks</p>
                <p className="text-2xl font-medium">{maintenanceData.length}</p>
                {maintenanceData.filter(m => m.status === 'overdue').length > 0 && (
                  <p className="text-sm text-red-600">
                    {maintenanceData.filter(m => m.status === 'overdue').length} Overdue
                  </p>
                )}
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
