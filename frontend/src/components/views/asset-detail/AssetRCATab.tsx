import React, { useState } from 'react';
import { Edit, BarChart3, Fish, User, Target, HelpCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Asset, RCAEntry } from '../../../types';
import { getStatusColor } from '../../../utils/helpers';
import { AddRCADialog } from '../../dialogs/AddRCADialog';
import { EditRCADialog } from '../../dialogs/EditRCADialog';

interface AssetRCATabProps {
  asset: Asset;
  rcaData: RCAEntry[];
  onAddRCA?: (rca: Omit<RCAEntry, 'id'>) => void;
  onUpdateRCA?: (updatedRCA: RCAEntry) => void;
}

export function AssetRCATab({ asset, rcaData, onAddRCA, onUpdateRCA }: AssetRCATabProps) {
  const [editingRCA, setEditingRCA] = useState<RCAEntry | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3>Root Cause Analysis</h3>
          <p className="text-muted-foreground">Historical failure analysis with structured methodologies</p>
        </div>
        {onAddRCA && (
          <AddRCADialog
            assetId={asset.id}
            assetName={asset.name}
            onAddRCA={onAddRCA}
          />
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl">{rcaData.length}</div>
            <p className="text-sm text-muted-foreground">Total Failures</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-green-600">
              {rcaData.filter(r => r.status === 'Complete' || r.status === 'Completed').length}
            </div>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-green-600">
              ${rcaData.reduce((sum, r) => sum + (r.cost || r.costImpact || 0), 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Cost</p>
          </CardContent>
        </Card>
      </div>

      {/* RCA Entries */}
      <div className="space-y-6">
        {rcaData.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Failure Analysis #{entry.id}
                    {(entry.fiveWhys || entry.fishboneDiagram || entry.fishbone) && (
                      <div className="flex gap-1">
                        {entry.fiveWhys && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            5 Whys
                          </Badge>
                        )}
                        {(entry.fishboneDiagram || entry.fishbone) && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Fish className="h-3 w-3 mr-1" />
                            Fishbone
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Date: {entry.failureDate || entry.dateOccurred}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {onUpdateRCA && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingRCA(entry)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  <Badge variant="secondary" className={getStatusColor(entry.status)}>
                    {entry.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(entry.fiveWhys || entry.fishboneDiagram || entry.fishbone) ? (
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    {entry.fiveWhys && (
                      <TabsTrigger value="fivewhys" className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        5 Whys
                      </TabsTrigger>
                    )}
                    {(entry.fishboneDiagram || entry.fishbone) && (
                      <TabsTrigger value="fishbone" className="flex items-center gap-1">
                        <Fish className="h-3 w-3" />
                        Fishbone
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-red-600">Problem Description</h5>
                      <p className="text-sm bg-red-50 p-3 rounded-lg border-l-4 border-red-200">
                        {entry.problemDescription}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-orange-600">Root Causes</h5>
                      <p className="text-sm bg-orange-50 p-3 rounded-lg border-l-4 border-orange-200">
                        {entry.rootCauses || entry.rootCauseSummary}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.responsible || entry.reportedBy}
                        </div>
                        <div>Cost: ${(entry.cost || entry.costImpact || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  </TabsContent>

                  {entry.fiveWhys && (
                    <TabsContent value="fivewhys" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <h5 className="font-medium flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          Problem Statement
                        </h5>
                        <p className="text-sm bg-gray-50 p-3 rounded-lg border-l-4 border-gray-200">
                          {entry.fiveWhys.problem}
                        </p>
                      </div>

                      <div className="grid gap-3">
                        {[
                          { key: 'why1', level: 1, color: 'bg-red-50 border-red-200' },
                          { key: 'why2', level: 2, color: 'bg-orange-50 border-orange-200' },
                          { key: 'why3', level: 3, color: 'bg-yellow-50 border-yellow-200' },
                          { key: 'why4', level: 4, color: 'bg-blue-50 border-blue-200' },
                          { key: 'why5', level: 5, color: 'bg-green-50 border-green-200' }
                        ].map((why) => (
                          <Card key={why.key} className={`${why.color} border`}>
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  Why {why.level}
                                </Badge>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium">
                                    {entry.fiveWhys![why.key as keyof typeof entry.fiveWhys].question}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {entry.fiveWhys![why.key as keyof typeof entry.fiveWhys].answer}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {entry.fiveWhys.rootCause && (
                        <Card className="bg-purple-50 border-purple-200 border-2">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <Target className="h-4 w-4 text-purple-600 mt-1" />
                              <div>
                                <h5 className="font-medium text-purple-800">Root Cause Identified</h5>
                                <p className="text-sm text-purple-700 mt-1">{entry.fiveWhys.rootCause}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  )}

                  {(entry.fishboneDiagram || entry.fishbone) && (
                    <TabsContent value="fishbone" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <h5 className="font-medium flex items-center gap-2">
                          <Fish className="h-4 w-4" />
                          Problem Statement
                        </h5>
                        <p className="text-sm bg-gray-50 p-3 rounded-lg border-l-4 border-gray-200">
                          {(entry.fishboneDiagram || entry.fishbone)?.problem}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(entry.fishboneDiagram?.categories || entry.fishbone?.categories || [])
                          .filter(cat => cat.category && cat.causes.length > 0)
                          .map((category, index) => {
                            const colors = [
                              'bg-red-50 border-red-200 text-red-800',
                              'bg-blue-50 border-blue-200 text-blue-800',
                              'bg-green-50 border-green-200 text-green-800',
                              'bg-yellow-50 border-yellow-200 text-yellow-800',
                              'bg-purple-50 border-purple-200 text-purple-800',
                              'bg-orange-50 border-orange-200 text-orange-800'
                            ];
                            return (
                              <Card key={index} className={`${colors[index % colors.length]} border`}>
                                <CardContent className="p-3">
                                  <h6 className="font-medium mb-2">{category.category}</h6>
                                  <ul className="space-y-1">
                                    {category.causes
                                      .filter(cause => cause.trim())
                                      .map((cause, causeIndex) => (
                                        <li key={causeIndex} className="text-sm flex items-start gap-1">
                                          <span className="text-current/60">•</span>
                                          <span>{cause}</span>
                                        </li>
                                      ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    </TabsContent>
                  )}

                  <TabsContent value="actions" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-blue-600">Immediate Actions</h5>
                      <p className="text-sm bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                        {entry.immediateActions}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-green-600">Corrective Actions</h5>
                      <p className="text-sm bg-green-50 p-3 rounded-lg border-l-4 border-green-200">
                        {entry.correctiveActions}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-purple-600">Preventive Actions</h5>
                      <p className="text-sm bg-purple-50 p-3 rounded-lg border-l-4 border-purple-200">
                        {entry.preventiveActions}
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                // Fallback for entries without structured analysis
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h5 className="font-medium text-red-600">Problem Description</h5>
                    <p className="text-sm bg-red-50 p-3 rounded-lg border-l-4 border-red-200">
                      {entry.problemDescription}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium text-orange-600">Root Causes</h5>
                    <p className="text-sm bg-orange-50 p-3 rounded-lg border-l-4 border-orange-200">
                      {entry.rootCauses || entry.rootCauseSummary}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium text-green-600">Corrective Actions</h5>
                    <p className="text-sm bg-green-50 p-3 rounded-lg border-l-4 border-green-200">
                      {entry.correctiveActions}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {entry.responsible || entry.reportedBy}
                      </div>
                      <div>Cost: ${(entry.cost || entry.costImpact || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit RCA Dialog */}
      {editingRCA && onUpdateRCA && (
        <EditRCADialog
          rca={editingRCA}
          isOpen={!!editingRCA}
          onClose={() => setEditingRCA(null)}
          onUpdateRCA={(updatedRCA) => {
            onUpdateRCA(updatedRCA);
            setEditingRCA(null);
          }}
        />
      )}
    </div>
  );
}
