import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, User, BarChart3, Fish, Target, HelpCircle, Edit, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Asset, RCAEntry } from '../../types';
import { getStatusColor } from '../../utils/helpers';
import { AddRCADialog } from '../dialogs/AddRCADialog';
import { EditRCADialog } from '../dialogs/EditRCADialog';

export function RCAView({
  assets,
  rcaData,
  selectedAssetId,
  onSelectAsset,
  onBack,
  onAddRCA,
  onUpdateRCA
}: {
  assets: Asset[];
  rcaData: RCAEntry[];
  selectedAssetId: number | null;
  onSelectAsset: (assetId: number) => void;
  onBack: () => void;
  onAddRCA: (rca: Omit<RCAEntry, 'id'>) => void;
  onUpdateRCA: (updatedRCA: RCAEntry) => void;
}) {
  const [editingRCA, setEditingRCA] = useState<RCAEntry | null>(null);

  if (selectedAssetId) {
    const asset = assets.find(a => a.id === selectedAssetId);
    const assetRCA = rcaData.filter(r => r.assetId === selectedAssetId);

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>
          <h2 className="text-2xl font-bold">
            RCA Analysis - {asset?.name || 'Unknown Asset'}
          </h2>
        </div>

        {assetRCA.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">No RCA Entries</h3>
                  <p className="text-gray-500">
                    No Root Cause Analysis entries found for this asset.
                  </p>
                </div>
                <AddRCADialog assetId={selectedAssetId} onAddRCA={onAddRCA}>
                  <Button>Add RCA Entry</Button>
                </AddRCADialog>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                RCA Entries ({assetRCA.length})
              </h3>
              <AddRCADialog assetId={selectedAssetId} onAddRCA={onAddRCA}>
                <Button>Add New RCA</Button>
              </AddRCADialog>
            </div>

            {assetRCA.map((entry) => (
              <Card key={entry.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{entry.problemDescription}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(entry.dateOccurred).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {entry.reportedBy}
                      </div>
                      <Badge
                        variant={entry.status === 'Completed' ? 'default' :
                                entry.status === 'In Progress' ? 'secondary' : 'outline'}
                        className={getStatusColor(entry.status)}
                      >
                        {entry.status}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRCA(entry)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="actions">Actions</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">Problem Details</h5>
                          <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                            {entry.problemDescription}
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Impact Assessment</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Severity:</span>
                              <Badge variant={entry.severity === 'Critical' ? 'destructive' :
                                            entry.severity === 'High' ? 'secondary' : 'outline'}>
                                {entry.severity}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Cost Impact:</span>
                              <span className="font-medium">${entry.costImpact?.toLocaleString() || '0'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Root Cause Summary</h5>
                        <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                          {entry.rootCauseSummary}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="actions" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h5 className="font-medium text-blue-600 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            Immediate Actions
                          </h5>
                          <p className="text-sm bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                            {entry.immediateActions}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-medium text-green-600 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            Corrective Actions
                          </h5>
                          <p className="text-sm bg-green-50 p-3 rounded-lg border-l-4 border-green-200">
                            {entry.correctiveActions}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-medium text-purple-600 flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                            Preventive Actions
                          </h5>
                          <p className="text-sm bg-purple-50 p-3 rounded-lg border-l-4 border-purple-200">
                            {entry.preventiveActions}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-lg font-medium">
                            <HelpCircle className="h-5 w-5 text-blue-600" />
                            5 Whys Analysis
                          </div>
                          {entry.fiveWhys && (
                            <div className="space-y-3">
                              {Object.entries(entry.fiveWhys).map(([key, value], index) => (
                                <div key={key} className="flex gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">Why {index + 1}?</p>
                                    <p className="text-sm text-muted-foreground">{value}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-lg font-medium">
                            <Fish className="h-5 w-5 text-green-600" />
                            Fishbone Analysis
                          </div>
                          {entry.fishbone && (
                            <div className="space-y-3">
                              {Object.entries(entry.fishbone).map(([category, causes]) => (
                                <div key={category} className="space-y-1">
                                  <h6 className="font-medium text-green-600 capitalize">
                                    {category.replace(/([A-Z])/g, ' $1').trim()}
                                  </h6>
                                  <p className="text-sm text-muted-foreground bg-green-50 p-2 rounded border-l-4 border-green-200">
                                    {causes}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="timeline" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">Problem Occurred</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.dateOccurred).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">RCA Created</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div>
                              <p className="font-medium text-sm">Last Updated</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(entry.updatedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit RCA Dialog */}
        {editingRCA && (
          <EditRCADialog
            rcaEntry={editingRCA}
            assetName={asset?.name || 'Unknown Asset'}
            onUpdateRCA={(updatedRCA) => {
              onUpdateRCA(updatedRCA);
              setEditingRCA(null);
            }}
          />
        )}
      </div>
    );
  }

  // Asset List View
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Root Cause Analysis</h2>
        <p className="text-muted-foreground">
          View and manage RCA entries for your assets. Select an asset to see detailed analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => {
          const assetRCACount = rcaData.filter(r => r.assetId === asset.id).length;
          const recentRCA = rcaData
            .filter(r => r.assetId === asset.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

          return (
            <Card
              key={asset.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectAsset(asset.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium truncate">{asset.name}</h3>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">RCA Entries:</span>
                    <Badge variant="outline">{assetRCACount}</Badge>
                  </div>

                  {recentRCA && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Recent Status:</span>
                        <Badge
                          variant={recentRCA.status === 'Completed' ? 'default' :
                                  recentRCA.status === 'In Progress' ? 'secondary' : 'outline'}
                          className={getStatusColor(recentRCA.status)}
                        >
                          {recentRCA.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {recentRCA.problemDescription}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
