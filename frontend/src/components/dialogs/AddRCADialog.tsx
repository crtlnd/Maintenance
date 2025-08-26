import React, { useState } from 'react';
import { Plus, AlertTriangle, CheckCircle, BarChart3, Fish } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DatePicker } from '../ui/date-picker';
import { FiveWhysComponent } from '../rca/FiveWhysComponent';
import { FishboneDiagramComponent } from '../rca/FishboneDiagramComponent';
import { RCAEntry, FiveWhys, FishboneDiagram } from '../../types';

interface AddRCADialogProps {
  assetId: number;
  assetName: string;
  onAddRCA: (rca: Omit<RCAEntry, 'id'>) => void;
}

export function AddRCADialog({ assetId, assetName, onAddRCA }: AddRCADialogProps) {
  const [open, setOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');
  
  // Basic information
  const [failureDate, setFailureDate] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [immediateActions, setImmediateActions] = useState('');
  const [rootCauses, setRootCauses] = useState('');
  const [correctiveActions, setCorrectiveActions] = useState('');
  const [preventiveActions, setPreventiveActions] = useState('');
  const [responsible, setResponsible] = useState('');
  const [cost, setCost] = useState('');

  // 5 Whys data
  const [fiveWhys, setFiveWhys] = useState<FiveWhys | null>(null);
  const [fiveWhysCompleted, setFiveWhysCompleted] = useState(false);

  // Fishbone data  
  const [fishboneDiagram, setFishboneDiagram] = useState<FishboneDiagram | null>(null);
  const [fishboneCompleted, setFishboneCompleted] = useState(false);

  const canSubmit = () => {
    const basicInfoComplete = failureDate && problemDescription && immediateActions && 
                             correctiveActions && preventiveActions && responsible && cost;
    return basicInfoComplete && fiveWhysCompleted && fishboneCompleted;
  };

  const handleSubmit = () => {
    if (!canSubmit()) {
      return;
    }

    const newRCA: Omit<RCAEntry, 'id'> = {
      assetId,
      failureDate,
      problemDescription,
      immediateActions,
      rootCauses: fiveWhys?.rootCause || rootCauses,
      correctiveActions,
      preventiveActions,
      responsible,
      status: 'In Progress',
      cost: parseFloat(cost) || 0,
      fiveWhys: fiveWhys || undefined,
      fishboneDiagram: fishboneDiagram || undefined
    };

    onAddRCA(newRCA);
    
    // Reset form
    setFailureDate('');
    setProblemDescription('');
    setImmediateActions('');
    setRootCauses('');
    setCorrectiveActions('');
    setPreventiveActions('');
    setResponsible('');
    setCost('');
    setFiveWhys(null);
    setFiveWhysCompleted(false);
    setFishboneDiagram(null);
    setFishboneCompleted(false);
    setCurrentTab('basic');
    setOpen(false);
  };

  const handleFiveWhysComplete = (data: FiveWhys) => {
    setFiveWhys(data);
    setFiveWhysCompleted(true);
  };

  const handleFishboneComplete = (data: FishboneDiagram) => {
    setFishboneDiagram(data);
    setFishboneCompleted(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add RCA Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Root Cause Analysis</DialogTitle>
          <DialogDescription>
            Complete a comprehensive RCA for {assetName}. Both 5 Whys and Fishbone analysis are required.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicators */}
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${failureDate && problemDescription ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Basic Info</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${fiveWhysCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">5 Whys</span>
            {fiveWhysCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${fishboneCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Fishbone</span>
            {fishboneCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="fivewhys" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              5 Whys
              {fiveWhysCompleted && <CheckCircle className="h-3 w-3 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="fishbone" className="flex items-center gap-1">
              <Fish className="h-3 w-3" />
              Fishbone
              {fishboneCompleted && <CheckCircle className="h-3 w-3 text-green-600" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="failureDate">Failure Date *</Label>
                <DatePicker
                  value={failureDate}
                  onChange={(value) => setFailureDate(value)}
                  placeholder="Select failure date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsible Person *</Label>
                <Input
                  id="responsible"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="e.g., John Smith"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="problemDescription">Problem Description *</Label>
              <Textarea
                id="problemDescription"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Clearly describe the problem that occurred..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="immediateActions">Immediate Actions Taken *</Label>
              <Textarea
                id="immediateActions"
                value={immediateActions}
                onChange={(e) => setImmediateActions(e.target.value)}
                placeholder="Describe the immediate actions taken to address the failure..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correctiveActions">Corrective Actions *</Label>
              <Textarea
                id="correctiveActions"
                value={correctiveActions}
                onChange={(e) => setCorrectiveActions(e.target.value)}
                placeholder="Describe the corrective actions to fix the problem..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preventiveActions">Preventive Actions *</Label>
              <Textarea
                id="preventiveActions"
                value={preventiveActions}
                onChange={(e) => setPreventiveActions(e.target.value)}
                placeholder="Describe actions to prevent this problem from recurring..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Estimated Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Required Analysis</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You must complete both the 5 Whys and Fishbone analysis before submitting this RCA.
                    These structured approaches ensure a thorough investigation of the root causes.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fivewhys" className="mt-4">
            <FiveWhysComponent
              initialProblem={problemDescription}
              onComplete={handleFiveWhysComplete}
              isCompleted={fiveWhysCompleted}
              existingData={fiveWhys}
            />
          </TabsContent>

          <TabsContent value="fishbone" className="mt-4">
            <FishboneDiagramComponent
              initialProblem={problemDescription}
              onComplete={handleFishboneComplete}
              isCompleted={fishboneCompleted}
              existingData={fishboneDiagram}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit()}
          >
            {canSubmit() ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Add RCA Entry
              </>
            ) : (
              'Complete All Sections'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}