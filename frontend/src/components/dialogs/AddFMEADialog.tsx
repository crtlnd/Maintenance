import React, { useState } from 'react';
import { Plus, Calculator, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { DatePicker } from '../ui/date-picker';
import { FMEAEntry } from '../../types';
import { assetApi } from '../../../services/api'; // Import API functions

interface AddFMEADialogProps {
  assetId: number;
  assetName: string;
  onAddFMEA: (fmeaEntries: Omit<FMEAEntry, 'id'>[]) => void;
}

export function AddFMEADialog({ assetId, assetName, onAddFMEA }: AddFMEADialogProps) {
  const [open, setOpen] = useState(false);
  const [component, setComponent] = useState('');
  const [failureMode, setFailureMode] = useState('');
  const [effects, setEffects] = useState('');
  const [severity, setSeverity] = useState<number>(1);
  const [causes, setCauses] = useState('');
  const [occurrence, setOccurrence] = useState<number>(1);
  const [controls, setControls] = useState('');
  const [detection, setDetection] = useState<number>(1);
  const [actions, setActions] = useState('');
  const [responsible, setResponsible] = useState('');
  const [dueDate, setDueDate] = useState('');

  // FIXED: Add loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rpn = severity * occurrence * detection;

  const getRPNColor = (rpn: number) => {
    if (rpn >= 150) return 'bg-red-100 text-red-800 border-red-200';
    if (rpn >= 100) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getRPNLevel = (rpn: number) => {
    if (rpn >= 150) return 'High Risk';
    if (rpn >= 100) return 'Medium Risk';
    return 'Low Risk';
  };

  // FIXED: Updated handleSubmit to make actual API call
  const handleSubmit = async () => {
    if (!component || !failureMode || !effects || !causes || !controls || !actions || !responsible || !dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // FIXED: Create FMEA data structure that matches backend expectations
      const fmeaData = {
        assetId,
        component,
        failureMode,
        effects,
        severity,
        causes,
        occurrence,
        controls,
        detection,
        rpn,
        actions,
        responsible,
        dueDate,
        status: 'Open'
      };

      console.log('DEBUG: Sending FMEA data to API:', fmeaData);

      // FIXED: Call the actual API to save FMEA data
      const savedFMEA = await assetApi.addFMEA(fmeaData);

      console.log('DEBUG: FMEA saved successfully:', savedFMEA);

      // Update parent component with the saved data
      onAddFMEA([savedFMEA]);

      // Reset form
      setComponent('');
      setFailureMode('');
      setEffects('');
      setSeverity(1);
      setCauses('');
      setOccurrence(1);
      setControls('');
      setDetection(1);
      setActions('');
      setResponsible('');
      setDueDate('');
      setOpen(false);

    } catch (err) {
      console.error('Error saving FMEA:', err);
      setError(err instanceof Error ? err.message : 'Failed to save FMEA entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add FMEA Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add FMEA Entry</DialogTitle>
          <DialogDescription>
            Create a new Failure Mode & Effects Analysis entry for {assetName}
          </DialogDescription>
        </DialogHeader>

        {/* FIXED: Add error display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="component">Component/Function</Label>
              <Input
                id="component"
                value={component}
                onChange={(e) => setComponent(e.target.value)}
                placeholder="e.g., Hydraulic Pump, Control System"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="failureMode">Failure Mode</Label>
              <Input
                id="failureMode"
                value={failureMode}
                onChange={(e) => setFailureMode(e.target.value)}
                placeholder="e.g., Fails to start, Overheating"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="effects">Potential Effects of Failure</Label>
            <Textarea
              id="effects"
              value={effects}
              onChange={(e) => setEffects(e.target.value)}
              placeholder="Describe what happens when this failure occurs..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="causes">Potential Causes of Failure</Label>
            <Textarea
              id="causes"
              value={causes}
              onChange={(e) => setCauses(e.target.value)}
              placeholder="Describe what could cause this failure mode..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="controls">Current Controls</Label>
            <Textarea
              id="controls"
              value={controls}
              onChange={(e) => setControls(e.target.value)}
              placeholder="Describe current preventive measures and detection methods..."
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* Scoring Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Risk Assessment (1-10 Scale)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity (Impact)</Label>
                  <Select
                    value={severity.toString()}
                    onValueChange={(value) => setSeverity(parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} - {num <= 3 ? 'Low' : num <= 6 ? 'Medium' : num <= 8 ? 'High' : 'Critical'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occurrence">Occurrence (Frequency)</Label>
                  <Select
                    value={occurrence.toString()}
                    onValueChange={(value) => setOccurrence(parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} - {num <= 2 ? 'Very Low' : num <= 4 ? 'Low' : num <= 6 ? 'Medium' : num <= 8 ? 'High' : 'Very High'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detection">Detection (Ability to Detect)</Label>
                  <Select
                    value={detection.toString()}
                    onValueChange={(value) => setDetection(parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} - {num <= 2 ? 'Very High' : num <= 4 ? 'High' : num <= 6 ? 'Medium' : num <= 8 ? 'Low' : 'Very Low'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* RPN Display */}
              <Card className={`border-2 ${getRPNColor(rpn)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-80">Risk Priority Number (RPN)</div>
                      <div className="text-2xl font-bold">{rpn}</div>
                      <div className="text-sm">{severity} × {occurrence} × {detection}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className={getRPNColor(rpn)}>
                        {getRPNLevel(rpn)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Action Plan */}
          <div className="space-y-2">
            <Label htmlFor="actions">Recommended Actions</Label>
            <Textarea
              id="actions"
              value={actions}
              onChange={(e) => setActions(e.target.value)}
              placeholder="Describe actions to reduce risk (improve controls, reduce occurrence, etc.)..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsible">Responsible Person</Label>
              <Input
                id="responsible"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="e.g., John Smith, Maintenance Team"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Target Completion Date</Label>
              <DatePicker
                value={dueDate}
                onChange={(value) => setDueDate(value)}
                placeholder="Select target completion date"
                defaultToTomorrow={true}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving FMEA Entry...' : 'Add FMEA Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
