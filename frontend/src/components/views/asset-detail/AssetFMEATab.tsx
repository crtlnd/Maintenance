import React from 'react';
import { AlertTriangle, User, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Asset, FMEAEntry } from '../../../types';
import { getRPNColor, getStatusColor } from '../../../utils/helpers';
import { AddFMEADialog } from '../../dialogs/AddFMEADialog';

interface AssetFMEATabProps {
  asset: Asset;
  fmeaData: FMEAEntry[];
  onAddFMEA?: (fmeaEntries: Omit<FMEAEntry, 'id'>[]) => void;
}

export function AssetFMEATab({ asset, fmeaData, onAddFMEA }: AssetFMEATabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3>Failure Mode & Effects Analysis</h3>
          <p className="text-muted-foreground">Risk assessment and mitigation strategies</p>
        </div>
        {onAddFMEA && (
          <AddFMEADialog
            assetId={asset.id}
            assetName={asset.name}
            onAddFMEA={onAddFMEA}
          />
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-red-600">{fmeaData.filter(f => f.rpn >= 150).length}</div>
            <p className="text-sm text-muted-foreground">High Risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-yellow-600">{fmeaData.filter(f => f.rpn >= 100 && f.rpn < 150).length}</div>
            <p className="text-sm text-muted-foreground">Medium Risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-green-600">{fmeaData.filter(f => f.rpn < 100).length}</div>
            <p className="text-sm text-muted-foreground">Low Risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl">{fmeaData.length}</div>
            <p className="text-sm text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {fmeaData.map((entry) => (
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
