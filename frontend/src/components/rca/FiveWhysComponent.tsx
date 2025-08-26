import React, { useState, useEffect } from 'react';
import { HelpCircle, Target, CheckCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FiveWhys } from '../../types';

interface FiveWhysComponentProps {
  initialProblem?: string;
  onComplete: (data: FiveWhys) => void;
  isCompleted: boolean;
  existingData?: FiveWhys | null;
}

export function FiveWhysComponent({ initialProblem = '', onComplete, isCompleted, existingData }: FiveWhysComponentProps) {
  const [problem, setProblem] = useState(existingData?.problem || initialProblem);
  const [whys, setWhys] = useState({
    why1: existingData?.why1 || { question: '', answer: '' },
    why2: existingData?.why2 || { question: '', answer: '' },
    why3: existingData?.why3 || { question: '', answer: '' },
    why4: existingData?.why4 || { question: '', answer: '' },
    why5: existingData?.why5 || { question: '', answer: '' }
  });
  const [rootCause, setRootCause] = useState(existingData?.rootCause || '');

  // Update problem when initialProblem changes
  useEffect(() => {
    if (initialProblem && !existingData) {
      setProblem(initialProblem);
    }
  }, [initialProblem, existingData]);

  const updateWhy = (level: keyof typeof whys, field: 'question' | 'answer', value: string) => {
    setWhys(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: value
      }
    }));
  };

  const isComplete = () => {
    return problem.trim() && 
           Object.values(whys).every(why => why.question.trim() && why.answer.trim()) &&
           rootCause.trim();
  };

  const handleComplete = () => {
    if (isComplete()) {
      const data: FiveWhys = {
        problem,
        why1: whys.why1,
        why2: whys.why2,
        why3: whys.why3,
        why4: whys.why4,
        why5: whys.why5,
        rootCause
      };
      onComplete(data);
    }
  };

  const handleReset = () => {
    setWhys({
      why1: { question: '', answer: '' },
      why2: { question: '', answer: '' },
      why3: { question: '', answer: '' },
      why4: { question: '', answer: '' },
      why5: { question: '', answer: '' }
    });
    setRootCause('');
  };

  const whyLevels = [
    { key: 'why1' as const, level: 1, color: 'bg-red-50 border-red-200' },
    { key: 'why2' as const, level: 2, color: 'bg-orange-50 border-orange-200' },
    { key: 'why3' as const, level: 3, color: 'bg-yellow-50 border-yellow-200' },
    { key: 'why4' as const, level: 4, color: 'bg-blue-50 border-blue-200' },
    { key: 'why5' as const, level: 5, color: 'bg-green-50 border-green-200' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          <h3>5 Whys Analysis</h3>
          {isCompleted && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        {!isCompleted && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="problem">Problem Statement *</Label>
        <Textarea
          id="problem"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Clearly state the problem you're investigating..."
          rows={2}
          disabled={isCompleted}
        />
      </div>

      <div className="space-y-4">
        {whyLevels.map((why, index) => (
          <Card key={why.key} className={`${why.color} border`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Why {why.level}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {index === 0 ? 'Why did this problem occur?' : `Why did "${whys[whyLevels[index-1].key].answer}" happen?`}
                </span>
              </div>
              
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={whys[why.key].question}
                  onChange={(e) => updateWhy(why.key, 'question', e.target.value)}
                  placeholder={`Why ${why.level}: Ask why this happened...`}
                  disabled={isCompleted}
                />
              </div>

              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  value={whys[why.key].answer}
                  onChange={(e) => updateWhy(why.key, 'answer', e.target.value)}
                  placeholder="Provide a specific, factual answer..."
                  rows={2}
                  disabled={isCompleted}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-purple-50 border-purple-200 border-2">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            <Label className="text-purple-800 font-medium">Root Cause Identified *</Label>
          </div>
          <Textarea
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
            placeholder="Based on your 5 Whys analysis, what is the actual root cause of the problem?"
            rows={3}
            disabled={isCompleted}
          />
        </CardContent>
      </Card>

      {!isCompleted && (
        <div className="flex justify-end">
          <Button 
            onClick={handleComplete}
            disabled={!isComplete()}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete 5 Whys Analysis
          </Button>
        </div>
      )}

      {isCompleted && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">5 Whys Analysis Completed</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Your analysis has identified the root cause. You can now proceed to the Fishbone analysis.
          </p>
        </div>
      )}
    </div>
  );
}