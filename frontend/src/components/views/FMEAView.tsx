import React from 'react';
import { ArrowLeft, AlertTriangle, ChevronRight, User, Clock, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Asset, FMEAEntry } from '../../types';
import { getRPNColor, getStatusColor } from '../../utils/helpers';
import { AddFMEADialog } from '../dialogs/AddFMEADialog';

export function FMEAView({ 
  assets, 
  fmeaData, 
  selectedAssetId, 
  onSelectAsset, 
  onBack,
  onAddFMEA
}: { 
  assets: Asset[]; 
  fmeaData: FMEAEntry[]; 
  selectedAssetId: number | null; 
  onSelectAsset: (assetId: number) => void; 
  onBack: () => void; 
  onAddFMEA: (fmeaEntries: Omit<FMEAEntry, 'id'>[]) => void;
}) {
  if (selectedAssetId) {
    const asset = assets.find(a => a.id === selectedAssetId);
    const assetFMEA = fmeaData.filter(f => f.assetId === selectedAssetId);

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>
          <div className="flex-1">
            <h2>FMEA - {asset?.name}</h2>
            <p className="text-muted-foreground">{asset?.modelNumber} • {asset?.location}</p>
          </div>
          <AddFMEADialog 
            assetId={selectedAssetId} 
            assetName={asset?.name || ''} 
            onAddFMEA={onAddFMEA} 
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl text-red-600">{assetFMEA.filter(f => f.rpn >= 150).length}</div>
              <p className="text-sm text-muted-foreground">High Risk</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl text-yellow-600">{assetFMEA.filter(f => f.rpn >= 100 && f.rpn < 150).length}</div>
              <p className="text-sm text-muted-foreground">Medium Risk</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl text-green-600">{assetFMEA.filter(f => f.rpn < 100).length}</div>
              <p className="text-sm text-muted-foreground">Low Risk</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl">{assetFMEA.length}</div>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {assetFMEA.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      {entry.component}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Failure Mode: {entry.failureMode}</p>
                  </div>
                  <Badge variant="secondary" className={getRPNColor(entry.rpn)}>
                    RPN: {entry.rpn}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-red-600">Effects</h5>
                  <p className="text-sm bg-red-50 p-3 rounded-lg border-l-4 border-red-200">
                    {entry.effects}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Severity</div>
                    <div className="text-lg font-medium">{entry.severity}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Occurrence</div>
                    <div className="text-lg font-medium">{entry.occurrence}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Detection</div>
                    <div className="text-lg font-medium">{entry.detection}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {entry.responsible}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {entry.dueDate}
                    </div>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(entry.status)}>
                    {entry.status}
                  </Badge>
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
      <h2>FMEA (Failure Mode & Effects Analysis)</h2>
      <p className="text-muted-foreground">Select an asset to view its FMEA analysis</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => {
          const assetFMEA = fmeaData.filter(f => f.assetId === asset.id);
          const highRisk = assetFMEA.filter(f => f.rpn >= 150).length;
          
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
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{assetFMEA.length} FMEA Items</p>
                    {highRisk > 0 && (
                      <p className="text-sm text-red-600">{highRisk} High Risk</p>
                    )}
                  </div>
                  <AlertTriangle className={`h-6 w-6 ${highRisk > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}