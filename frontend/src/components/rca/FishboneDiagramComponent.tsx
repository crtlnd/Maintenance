import React, { useState, useEffect } from 'react';
import { Fish, Plus, Trash2, CheckCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FishboneDiagram, FishboneCause } from '../../types';

interface FishboneDiagramComponentProps {
  initialProblem?: string;
  onComplete: (data: FishboneDiagram) => void;
  isCompleted: boolean;
  existingData?: FishboneDiagram | null;
}

export function FishboneDiagramComponent({ initialProblem = '', onComplete, isCompleted, existingData }: FishboneDiagramComponentProps) {
  const [problem, setProblem] = useState(existingData?.problem || initialProblem);
  const [categories, setCategories] = useState<FishboneCause[]>(
    existingData?.categories || [
      { category: 'People', causes: [''] },
      { category: 'Process', causes: [''] },
      { category: 'Equipment', causes: [''] },
      { category: 'Materials', causes: [''] },
      { category: 'Environment', causes: [''] },
      { category: 'Methods', causes: [''] }
    ]
  );

  // Update problem when initialProblem changes
  useEffect(() => {
    if (initialProblem && !existingData) {
      setProblem(initialProblem);
    }
  }, [initialProblem, existingData]);

  const updateCategory = (index: number, category: string) => {
    setCategories(prev => prev.map((cat, i) => 
      i === index ? { ...cat, category } : cat
    ));
  };

  const updateCause = (categoryIndex: number, causeIndex: number, cause: string) => {
    setCategories(prev => prev.map((cat, i) => 
      i === categoryIndex 
        ? { ...cat, causes: cat.causes.map((c, j) => j === causeIndex ? cause : c) }
        : cat
    ));
  };

  const addCause = (categoryIndex: number) => {
    setCategories(prev => prev.map((cat, i) => 
      i === categoryIndex 
        ? { ...cat, causes: [...cat.causes, ''] }
        : cat
    ));
  };

  const removeCause = (categoryIndex: number, causeIndex: number) => {
    setCategories(prev => prev.map((cat, i) => 
      i === categoryIndex 
        ? { ...cat, causes: cat.causes.filter((_, j) => j !== causeIndex) }
        : cat
    ));
  };

  const addCategory = () => {
    setCategories(prev => [...prev, { category: '', causes: [''] }]);
  };

  const removeCategory = (index: number) => {
    setCategories(prev => prev.filter((_, i) => i !== index));
  };

  const isComplete = () => {
    return problem.trim() && 
           categories.some(cat => 
             cat.category.trim() && 
             cat.causes.some(cause => cause.trim())
           );
  };

  const handleComplete = () => {
    if (isComplete()) {
      // Clean up empty causes and categories
      const cleanCategories = categories
        .filter(cat => cat.category.trim())
        .map(cat => ({
          ...cat,
          causes: cat.causes.filter(cause => cause.trim())
        }))
        .filter(cat => cat.causes.length > 0);

      const data: FishboneDiagram = {
        problem,
        categories: cleanCategories
      };
      onComplete(data);
    }
  };

  const handleReset = () => {
    setCategories([
      { category: 'People', causes: [''] },
      { category: 'Process', causes: [''] },
      { category: 'Equipment', causes: [''] },
      { category: 'Materials', causes: [''] },
      { category: 'Environment', causes: [''] },
      { category: 'Methods', causes: [''] }
    ]);
  };

  const categoryColors = [
    'bg-red-50 border-red-200 text-red-800',
    'bg-blue-50 border-blue-200 text-blue-800',
    'bg-green-50 border-green-200 text-green-800',
    'bg-yellow-50 border-yellow-200 text-yellow-800',
    'bg-purple-50 border-purple-200 text-purple-800',
    'bg-orange-50 border-orange-200 text-orange-800'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Fish className="h-5 w-5" />
          <h3>Fishbone Diagram (Ishikawa)</h3>
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

      <div>
        <div className="flex items-center justify-between mb-4">
          <Label>Cause Categories</Label>
          {!isCompleted && (
            <Button variant="outline" size="sm" onClick={addCategory}>
              <Plus className="h-3 w-3 mr-1" />
              Add Category
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category, categoryIndex) => (
            <Card 
              key={categoryIndex} 
              className={`border ${categoryColors[categoryIndex % categoryColors.length]}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Input
                      value={category.category}
                      onChange={(e) => updateCategory(categoryIndex, e.target.value)}
                      placeholder="Category name (e.g., People, Process, Equipment)"
                      className="font-medium"
                      disabled={isCompleted}
                    />
                  </div>
                  {!isCompleted && categories.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCategory(categoryIndex)}
                      className="ml-2 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {category.causes.map((cause, causeIndex) => (
                  <div key={causeIndex} className="flex items-center gap-2">
                    <Input
                      value={cause}
                      onChange={(e) => updateCause(categoryIndex, causeIndex, e.target.value)}
                      placeholder="Potential cause..."
                      disabled={isCompleted}
                    />
                    {!isCompleted && category.causes.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCause(categoryIndex, causeIndex)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {!isCompleted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addCause(categoryIndex)}
                    className="w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Cause
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {!isCompleted && (
        <div className="flex justify-end">
          <Button 
            onClick={handleComplete}
            disabled={!isComplete()}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Fishbone Analysis
          </Button>
        </div>
      )}

      {isCompleted && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Fishbone Analysis Completed</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Your fishbone diagram has been completed with {categories.filter(cat => cat.category.trim()).length} categories and {categories.reduce((total, cat) => total + cat.causes.filter(cause => cause.trim()).length, 0)} potential causes identified.
          </p>
        </div>
      )}
    </div>
  );
}