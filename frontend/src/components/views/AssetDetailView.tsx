import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, Calendar, Search, Plus, User, Clock, BarChart3, Zap, Fish, Target, HelpCircle, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Asset, FMEAEntry, RCAEntry, MaintenanceTask } from '../../types';
import { getConditionColor, getStatusColor, getRPNColor, getPriorityColor } from '../../utils/helpers';
import { AddRCADialog } from '../dialogs/AddRCADialog';
import { EditAssetDialog } from '../dialogs/EditAssetDialog';
import { AddMaintenanceTaskDialog } from '../dialogs/AddMaintenanceTaskDialog';
import { AddFMEADialog } from '../dialogs/AddFMEADialog';

export function AssetDetailView({
  asset,
  fmeaData,
  rcaData,
  maintenanceData,
  defaultTab = 'overview',
  onBack,
  onAddRCA,
  onAddMaintenanceTask,
  onEditAsset,
  onAddFMEA
}: {
  asset: Asset;
  fmeaData: FMEAEntry[];
  rcaData: RCAEntry[];
  maintenanceData: MaintenanceTask[];
  defaultTab?: string;
  onBack: () => void;
  onAddRCA?: (rca: Omit<RCAEntry, 'id'>) => void;
  onAddMaintenanceTask?: (task: Omit<MaintenanceTask, 'id'>) => void;
  onEditAsset?: (asset: Asset) => void;
  onAddFMEA?: (fmeaEntries: Omit<FMEAEntry, 'id'>[]) => void;
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const assetFMEA = fmeaData.filter(f => f.assetId === asset.id);
  const assetRCA = rcaData.filter(r => r.assetId === asset.id);
  const assetMaintenance = maintenanceData.filter(m => m.assetId === asset.id);

  const handleEditSave = (updatedAsset: Asset) => {
    if (onEditAsset) {
      onEditAsset(updatedAsset);
    }
    setIsEditDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assets
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2>{asset.name}</h2>
              <p className="text-muted-foreground">
                {asset.type} • {asset.manufacturer} • {asset.modelNumber}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className={getConditionColor(asset.condition)}>
                {asset.condition}
              </Badge>
              {onEditAsset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Asset
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Serial Number</p>
                <p className="font-medium">{asset.serialNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{asset.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Operating Hours</p>
                <p className="font-medium">{asset.operatingHours?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Last Maintenance</p>
                <p className="font-medium">{asset.lastMaintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fmea">
            FMEA ({assetFMEA.length})
          </TabsTrigger>
          <TabsTrigger value="rca">
            RCA ({assetRCA.length})
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            Maintenance ({assetMaintenance.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
                    <p className="text-2xl font-medium">{assetFMEA.length}</p>
                    {assetFMEA.filter(f => f.rpn >= 150).length > 0 && (
                      <p className="text-sm text-red-600">
                        {assetFMEA.filter(f => f.rpn >= 150).length} High Risk
                      </p>
                    )}
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
                    <p className="text-2xl font-medium">{assetRCA.length}</p>
                    {assetRCA.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Total Cost: ${assetRCA.reduce((sum, r) => sum + r.cost, 0).toLocaleString()}
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
                    <p className="text-2xl font-medium">{assetMaintenance.length}</p>
                    {assetMaintenance.filter(m => m.status === 'overdue').length > 0 && (
                      <p className="text-sm text-red-600">
                        {assetMaintenance.filter(m => m.status === 'overdue').length} Overdue
                      </p>
                    )}
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fmea" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="rca" className="space-y-6">
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

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl">{assetRCA.length}</div>
                <p className="text-sm text-muted-foreground">Total Failures</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl text-green-600">{assetRCA.filter(r => r.status === 'Complete').length}</div>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl text-green-600">
                  ${assetRCA.reduce((sum, r) => sum + r.cost, 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {assetRCA.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Failure Analysis #{entry.id}
                        {(entry.fiveWhys || entry.fishboneDiagram) && (
                          <div className="flex gap-1">
                            {entry.fiveWhys && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                <BarChart3 className="h-3 w-3 mr-1" />
                                5 Whys
                              </Badge>
                            )}
                            {entry.fishboneDiagram && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <Fish className="h-3 w-3 mr-1" />
                                Fishbone
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Date: {entry.failureDate}</p>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(entry.status)}>
                      {entry.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {(entry.fiveWhys || entry.fishboneDiagram) ? (
                    <Tabs defaultValue="summary" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        {entry.fiveWhys && (
                          <TabsTrigger value="fivewhys" className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            5 Whys
                          </TabsTrigger>
                        )}
                        {entry.fishboneDiagram && (
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
                            {entry.rootCauses}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {entry.responsible}
                            </div>
                            <div>Cost: ${entry.cost.toLocaleString()}</div>
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

                      {entry.fishboneDiagram && (
                        <TabsContent value="fishbone" className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <h5 className="font-medium flex items-center gap-2">
                              <Fish className="h-4 w-4" />
                              Problem Statement
                            </h5>
                            <p className="text-sm bg-gray-50 p-3 rounded-lg border-l-4 border-gray-200">
                              {entry.fishboneDiagram.problem}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {entry.fishboneDiagram.categories
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
                          {entry.rootCauses}
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
                            {entry.responsible}
                          </div>
                          <div>Cost: ${entry.cost.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3>Reliability Centered Maintenance</h3>
              <p className="text-muted-foreground">Planned maintenance schedules and tasks</p>
            </div>
            {onAddMaintenanceTask && (
              <AddMaintenanceTaskDialog
                assetId={asset.id}
                assetName={asset.name}
                onAddMaintenanceTask={onAddMaintenanceTask}
              />
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl">{assetMaintenance.length}</div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl text-red-600">{assetMaintenance.filter(m => m.status === 'overdue').length}</div>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl text-blue-600">{assetMaintenance.filter(m => m.status === 'scheduled').length}</div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl text-green-600">{assetMaintenance.filter(m => m.status === 'completed').length}</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {assetMaintenance.map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {task.taskType === 'preventive' && <Calendar className="h-5 w-5" />}
                        {task.taskType === 'predictive' && <BarChart3 className="h-5 w-5" />}
                        {task.taskType === 'condition-based' && <Zap className="h-5 w-5" />}
                        {task.description}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">{task.taskType} Maintenance</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="secondary" className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Frequency</p>
                      <p className="font-medium">{task.frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Duration</p>
                      <p className="font-medium">{task.estimatedDuration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Completed</p>
                      <p className="font-medium">{task.lastCompleted}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Due</p>
                      <p className="font-medium">{task.nextDue}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      {task.responsible}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {isEditDialogOpen && (
        <EditAssetDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          asset={asset}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
