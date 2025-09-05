import React, { useState, useEffect } from 'react';
import { Edit, CheckCircle, AlertCircle, Calendar, User, DollarSign, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { RCAEntry } from '../../types';

interface EditRCADialogProps {
  rca: RCAEntry;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRCA: (updatedRCA: RCAEntry) => void;
}

export function EditRCADialog({ rca, isOpen, onClose, onUpdateRCA }: EditRCADialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic Information
  const [failureDate, setFailureDate] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [immediateActions, setImmediateActions] = useState('');
  const [correctiveActions, setCorrectiveActions] = useState('');
  const [preventiveActions, setPreventiveActions] = useState('');
  const [responsible, setResponsible] = useState('');
  const [status, setStatus] = useState<'Open' | 'In Progress' | 'Completed' | 'Closed'>('In Progress');
  const [cost, setCost] = useState('0');

  // 5 Whys Analysis
  const [whyQuestions, setWhyQuestions] = useState({
    why1: { question: '', answer: '' },
    why2: { question: '', answer: '' },
    why3: { question: '', answer: '' },
    why4: { question: '', answer: '' },
    why5: { question: '', answer: '' }
  });
  const [rootCause, setRootCause] = useState('');

  // Fishbone Analysis
  const [fishboneCategories, setFishboneCategories] = useState({
    people: '',
    process: '',
    equipment: '',
    materials: '',
    environment: '',
    methods: ''
  });

  const steps = [
    { id: 1, title: 'Basic Information', icon: AlertCircle },
    { id: 2, title: '5 Whys Analysis', icon: CheckCircle },
    { id: 3, title: 'Fishbone Analysis', icon: CheckCircle },
    { id: 4, title: 'Review & Update', icon: CheckCircle }
  ];

  // Populate form with existing RCA data
  useEffect(() => {
    if (isOpen && rca) {
      // Basic Information
      setFailureDate(rca.dateOccurred || rca.failureDate || '');
      setProblemDescription(rca.problemDescription || '');
      setImmediateActions(rca.immediateActions || '');
      setCorrectiveActions(rca.correctiveActions || '');
      setPreventiveActions(rca.preventiveActions || '');
      setResponsible(rca.reportedBy || rca.responsible || '');
      setStatus(rca.status as any || 'In Progress');
      setCost((rca.costImpact || rca.cost || 0).toString());

      // 5 Whys Analysis
      if (rca.fiveWhys) {
        setWhyQuestions({
          why1: rca.fiveWhys.why1 || { question: '', answer: '' },
          why2: rca.fiveWhys.why2 || { question: '', answer: '' },
          why3: rca.fiveWhys.why3 || { question: '', answer: '' },
          why4: rca.fiveWhys.why4 || { question: '', answer: '' },
          why5: rca.fiveWhys.why5 || { question: '', answer: '' }
        });
        setRootCause(rca.fiveWhys.rootCause || rca.rootCauseSummary || '');
      } else {
        setRootCause(rca.rootCauseSummary || rca.rootCauses || '');
      }

      // Fishbone Analysis
      if (rca.fishbone?.categories || rca.fishboneDiagram?.categories) {
        const categories = rca.fishbone?.categories || rca.fishboneDiagram?.categories || [];
        const fishboneData = {
          people: '',
          process: '',
          equipment: '',
          materials: '',
          environment: '',
          methods: ''
        };

        categories.forEach(cat => {
          const categoryKey = cat.category.toLowerCase();
          if (fishboneData.hasOwnProperty(categoryKey)) {
            fishboneData[categoryKey as keyof typeof fishboneData] = cat.causes.join(', ');
          }
        });

        setFishboneCategories(fishboneData);
      }
    }
  }, [isOpen, rca]);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(failureDate && problemDescription && immediateActions &&
                 correctiveActions && preventiveActions && responsible);
      case 2:
        return !!(whyQuestions.why1.question && whyQuestions.why1.answer &&
                 whyQuestions.why2.question && whyQuestions.why2.answer &&
                 whyQuestions.why3.question && whyQuestions.why3.answer &&
                 whyQuestions.why4.question && whyQuestions.why4.answer &&
                 whyQuestions.why5.question && whyQuestions.why5.answer &&
                 rootCause);
      case 3:
        return !!(fishboneCategories.people && fishboneCategories.process &&
                 fishboneCategories.equipment && fishboneCategories.materials &&
                 fishboneCategories.environment && fishboneCategories.methods);
      default:
        return true;
    }
  };

  const getStepStatus = (step: number): 'pending' | 'current' | 'completed' => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'pending';
  };

  const getProgress = (): number => {
    let completedSteps = 0;
    for (let i = 1; i <= 3; i++) {
      if (validateStep(i)) completedSteps++;
    }
    return (completedSteps / 3) * 100;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setError(null);
    } else {
      setError(`Please complete all required fields in ${steps[currentStep - 1].title}`);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setError('Please complete all sections before submitting');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedRCAData = {
        assetId: rca.assetId,
        failureDate,
        problemDescription,
        immediateActions,
        rootCauses: rootCause,
        correctiveActions,
        preventiveActions,
        responsible,
        status,
        cost: parseFloat(cost) || 0,
        fiveWhys: {
          problem: problemDescription,
          why1: whyQuestions.why1,
          why2: whyQuestions.why2,
          why3: whyQuestions.why3,
          why4: whyQuestions.why4,
          why5: whyQuestions.why5,
          rootCause
        },
        fishboneDiagram: {
          problem: problemDescription,
          categories: [
            { category: 'People', causes: [fishboneCategories.people] },
            { category: 'Process', causes: [fishboneCategories.process] },
            { category: 'Equipment', causes: [fishboneCategories.equipment] },
            { category: 'Materials', causes: [fishboneCategories.materials] },
            { category: 'Environment', causes: [fishboneCategories.environment] },
            { category: 'Methods', causes: [fishboneCategories.methods] }
          ]
        }
      };

      console.log('Updating RCA entry:', updatedRCAData);

      const response = await fetch(`/api/rca/${rca.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedRCAData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const updatedRCA = await response.json();
      onUpdateRCA(updatedRCA);

      // Reset and close
      setCurrentStep(1);
      onClose();

    } catch (err) {
      console.error('Error updating RCA:', err);
      setError(err instanceof Error ? err.message : 'Failed to update RCA entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Root Cause Analysis
          </DialogTitle>
          <DialogDescription>
            Update the RCA analysis with new information or corrections.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(getProgress())}% complete</span>
          </div>
          <Progress value={getProgress()} className="h-2" />

          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${getStepStatus(step.id) === 'completed' ? 'bg-green-100 text-green-700 border-2 border-green-200' :
                    getStepStatus(step.id) === 'current' ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' :
                    'bg-gray-100 text-gray-500 border-2 border-gray-200'}`}>
                  {getStepStatus(step.id) === 'completed' ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 ml-2 ${getStepStatus(step.id) === 'completed' ? 'bg-green-200' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2">
            {steps.map((step) => (
              <div key={step.id} className="text-xs text-center w-20">
                <span className={getStepStatus(step.id) === 'current' ? 'font-medium text-blue-700' : 'text-muted-foreground'}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="space-y-4">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update essential details about the failure and response.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="failureDate">Failure Date *</Label>
                    <Input
                      id="failureDate"
                      type="date"
                      value={failureDate}
                      onChange={(e) => setFailureDate(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsible">Responsible Person *</Label>
                    <Input
                      id="responsible"
                      value={responsible}
                      onChange={(e) => setResponsible(e.target.value)}
                      placeholder="Person handling this RCA"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value: any) => setStatus(value)} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost Impact ($)</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="problemDescription">Problem Description *</Label>
                  <Textarea
                    id="problemDescription"
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    placeholder="Clearly describe what happened..."
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="immediateActions">Immediate Actions Taken *</Label>
                  <Textarea
                    id="immediateActions"
                    value={immediateActions}
                    onChange={(e) => setImmediateActions(e.target.value)}
                    placeholder="What was done immediately to address the situation..."
                    rows={2}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correctiveActions">Corrective Actions *</Label>
                  <Textarea
                    id="correctiveActions"
                    value={correctiveActions}
                    onChange={(e) => setCorrectiveActions(e.target.value)}
                    placeholder="Actions to fix the root cause..."
                    rows={2}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preventiveActions">Preventive Actions *</Label>
                  <Textarea
                    id="preventiveActions"
                    value={preventiveActions}
                    onChange={(e) => setPreventiveActions(e.target.value)}
                    placeholder="Actions to prevent recurrence..."
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  5 Whys Analysis
                </CardTitle>
                <CardDescription>
                  Update the root cause analysis by asking "why" five times.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className="space-y-2">
                    <Label>Why {num}?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        placeholder={`Why question ${num}`}
                        value={whyQuestions[`why${num}` as keyof typeof whyQuestions].question}
                        onChange={(e) => setWhyQuestions(prev => ({
                          ...prev,
                          [`why${num}`]: { ...prev[`why${num}` as keyof typeof whyQuestions], question: e.target.value }
                        }))}
                        disabled={isLoading}
                      />
                      <Input
                        placeholder={`Answer ${num}`}
                        value={whyQuestions[`why${num}` as keyof typeof whyQuestions].answer}
                        onChange={(e) => setWhyQuestions(prev => ({
                          ...prev,
                          [`why${num}`]: { ...prev[`why${num}` as keyof typeof whyQuestions], answer: e.target.value }
                        }))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                ))}

                <div className="space-y-2">
                  <Label htmlFor="rootCause">Root Cause Summary *</Label>
                  <Textarea
                    id="rootCause"
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    placeholder="Based on the 5 Whys analysis, what is the root cause?"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Fishbone Analysis
                </CardTitle>
                <CardDescription>
                  Update potential causes across different categories.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(fishboneCategories).map(([category, value]) => (
                  <div key={category} className="space-y-2">
                    <Label htmlFor={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)} *
                    </Label>
                    <Textarea
                      id={category}
                      value={value}
                      onChange={(e) => setFishboneCategories(prev => ({
                        ...prev,
                        [category]: e.target.value
                      }))}
                      placeholder={`Potential causes related to ${category}...`}
                      rows={2}
                      disabled={isLoading}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Review & Update
                </CardTitle>
                <CardDescription>
                  Review your changes before updating the RCA entry.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Basic Information</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong>Date:</strong> {failureDate}</p>
                      <p><strong>Status:</strong> <Badge variant={status === 'Completed' ? 'default' : 'outline'}>{status}</Badge></p>
                      <p><strong>Responsible:</strong> {responsible}</p>
                      <p><strong>Cost Impact:</strong> ${cost}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Analysis Completion</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Basic Information Complete</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>5 Whys Analysis Complete</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Fishbone Analysis Complete</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Problem Description</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">{problemDescription}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Root Cause</h4>
                  <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">{rootCause}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep} disabled={isLoading}>
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>

            {currentStep < 4 ? (
              <Button onClick={nextStep} disabled={isLoading}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Updating RCA...' : 'Update RCA Entry'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
