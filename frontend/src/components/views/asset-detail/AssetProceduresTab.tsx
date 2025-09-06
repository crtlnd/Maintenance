import React, { useState, useEffect } from 'react';
import {
  Plus,
  BookOpen,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  Bot,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { procedureApi } from '../../../../Services/api';

interface AssetProceduresTabProps {
  asset: any;
  highRPNItems: any[];
  onAddMaintenanceTask?: (task: any) => void;
}

function ProcedureCard({ procedure, onScheduleTask }: { procedure: any; onScheduleTask?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'inspection': return 'bg-yellow-100 text-yellow-800';
      case 'repair': return 'bg-red-100 text-red-800';
      case 'custom': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${getTypeColor(procedure.type)}`}>
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{procedure.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {procedure.estimatedTime}
                </span>
                {procedure.interval && (
                  <span>{procedure.interval}</span>
                )}
                {procedure.rpnTriggered && (
                  <Badge variant="destructive" className="text-xs">
                    RPN: {procedure.rpnScore}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onScheduleTask}
          >
            Schedule Task
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Tools</p>
            <p className="text-sm">{procedure.tools?.slice(0, 2).join(', ') || 'None specified'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Materials</p>
            <p className="text-sm">{procedure.materials?.slice(0, 2).join(', ') || 'None specified'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">People</p>
            <p className="text-sm">{procedure.people?.join(', ') || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Safety</p>
            <p className="text-sm">{procedure.safety?.[0] || 'Follow standard safety'}</p>
          </div>
        </div>

        {procedure.steps && procedure.steps.length > 0 && (
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto mb-3"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="text-sm font-medium">
                {isExpanded ? 'Hide' : 'Show'} Procedure Steps ({procedure.steps.length})
              </span>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>

            {isExpanded && (
              <div className="space-y-3">
                {procedure.steps.map((step: any, index: number) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">
                        {step.step}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{step.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{step.instruction}</p>
                        {step.expandedDetails && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer">Show detailed instructions</summary>
                            <p className="text-xs text-muted-foreground mt-1 ml-4">{step.expandedDetails}</p>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AssetProceduresTab({ asset, highRPNItems, onAddMaintenanceTask }: AssetProceduresTabProps) {
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load procedures when component mounts
  useEffect(() => {
    const loadProcedures = async () => {
      if (!asset?.id) return;

      setLoading(true);
      setError(null);

      try {
        const procedureData = await procedureApi.getProceduresForAsset(asset.id);
        setProcedures(procedureData);
      } catch (err) {
        console.error('Error loading procedures:', err);
        setError('Failed to load procedures');
        setProcedures([]);
      } finally {
        setLoading(false);
      }
    };

    loadProcedures();
  }, [asset?.id]);

  const handleScheduleTask = (procedure: any) => {
    if (onAddMaintenanceTask) {
      const task = {
        assetId: asset.id,
        taskType: 'preventive',
        description: `Execute: ${procedure.title}`,
        frequency: procedure.interval || 'As needed',
        hoursInterval: 0,
        lastCompleted: new Date().toISOString().split('T')[0],
        nextDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimatedDuration: procedure.estimatedTime,
        responsible: procedure.people?.[0] || 'Maintenance Team',
        responsibleEmail: 'maintenance@company.com',
        priority: procedure.priority === 'urgent' ? 'high' : 'medium',
        status: 'scheduled'
      };
      onAddMaintenanceTask(task);
    }
  };

  const handleGenerateAIProcedures = async () => {
    try {
      setLoading(true);
      await procedureApi.generateAIProcedures(asset.id);
      // Reload procedures after generation
      const procedureData = await procedureApi.getProceduresForAsset(asset.id);
      setProcedures(procedureData);
    } catch (err) {
      console.error('Error generating AI procedures:', err);
      setError('Failed to generate AI procedures');
    } finally {
      setLoading(false);
    }
  };

  const standardProcedures = procedures.filter(p => p.type === 'standard');
  const inspectionProcedures = procedures.filter(p => p.type === 'inspection');
  const repairProcedures = procedures.filter(p => p.type === 'repair');
  const customProcedures = procedures.filter(p => p.type === 'custom');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading procedures...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Maintenance Procedures</h3>
          <p className="text-sm text-muted-foreground">
            Standard operating procedures for {asset.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateAIProcedures}>
            <Bot className="h-4 w-4 mr-2" />
            Generate AI Procedures
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Custom
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Standard Procedures */}
      {standardProcedures.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium">Standard Procedures ({standardProcedures.length})</h4>
            <Badge variant="secondary">Auto-generated</Badge>
          </div>
          {standardProcedures.map((procedure) => (
            <ProcedureCard
              key={procedure.id}
              procedure={procedure}
              onScheduleTask={() => handleScheduleTask(procedure)}
            />
          ))}
        </div>
      )}

      {/* RPN-Triggered Procedures */}
      {(inspectionProcedures.length > 0 || repairProcedures.length > 0) && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h4 className="font-medium">Critical Component Procedures ({inspectionProcedures.length + repairProcedures.length})</h4>
            <Badge variant="destructive">High RPN</Badge>
          </div>
          {[...inspectionProcedures, ...repairProcedures].map((procedure) => (
            <ProcedureCard
              key={procedure.id}
              procedure={procedure}
              onScheduleTask={() => handleScheduleTask(procedure)}
            />
          ))}
        </div>
      )}

      {/* Custom Procedures */}
      {customProcedures.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-green-600" />
            <h4 className="font-medium">Custom Procedures ({customProcedures.length})</h4>
            <Badge variant="secondary">User-created</Badge>
          </div>
          {customProcedures.map((procedure) => (
            <ProcedureCard
              key={procedure.id}
              procedure={procedure}
              onScheduleTask={() => handleScheduleTask(procedure)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {procedures.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Procedures Available</h3>
          <p className="text-muted-foreground mb-4">
            Create your first maintenance procedure or generate AI-powered procedures based on this asset type.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={handleGenerateAIProcedures}>
              <Bot className="h-4 w-4 mr-2" />
              Generate AI Procedures
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Procedure
            </Button>
          </div>
        </Card>
      )}

      {/* High RPN Items Notice */}
      {highRPNItems.length > 0 && (inspectionProcedures.length === 0 && repairProcedures.length === 0) && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h4 className="font-medium text-orange-800">High-Risk Components Detected</h4>
          </div>
          <p className="text-sm text-orange-700 mb-3">
            {highRPNItems.length} components have high RPN scores (≥125 or severity ≥8). Generate procedures to address these risks.
          </p>
          <Button variant="outline" size="sm" onClick={handleGenerateAIProcedures}>
            <Bot className="h-4 w-4 mr-2" />
            Generate Risk-Based Procedures
          </Button>
        </Card>
      )}
    </div>
  );
}
