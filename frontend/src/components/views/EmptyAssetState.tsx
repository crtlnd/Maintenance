import React, { useState } from 'react';
import { Plus, Wrench, FileText, BarChart3, Brain, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddAssetDialog } from '../dialogs/AddAssetDialog';
import { Asset } from '../../types';

interface EmptyAssetStateProps {
  onAddAsset: (asset: Omit<Asset, 'id'>) => number;
  currentAssetCount: number;
  onCreateDemoData: () => Promise<void>;
}

export function EmptyAssetState({
  onAddAsset,
  currentAssetCount,
  onCreateDemoData
}: EmptyAssetStateProps) {
  const [isAddingDemo, setIsAddingDemo] = useState(false);

  const handleViewDemo = async () => {
    console.log('Demo button clicked - delegating to App.tsx');
    setIsAddingDemo(true);

    try {
      await onCreateDemoData();
    } catch (error) {
      console.error('Error creating demo data:', error);
    } finally {
      setIsAddingDemo(false);
    }
  };

  const features = [
    {
      icon: <Wrench className="w-6 h-6 text-green-600" />,
      title: 'Track Equipment',
      description: 'Monitor all your assets in one centralized location',
      bgColor: 'bg-green-100'
    },
    {
      icon: <FileText className="w-6 h-6 text-orange-600" />,
      title: 'Schedule Maintenance',
      description: 'Create and manage maintenance tasks automatically',
      bgColor: 'bg-orange-100'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
      title: 'Monitor Performance',
      description: 'Get insights into asset health and efficiency',
      bgColor: 'bg-purple-100'
    },
    {
      icon: <Brain className="w-6 h-6 text-blue-600" />,
      title: 'AI Insights',
      description: 'Get intelligent recommendations and predictive analytics',
      bgColor: 'bg-blue-100'
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      title: 'Failure Mode Effects Analysis',
      description: 'Identify potential failure modes and assess risks',
      bgColor: 'bg-red-100'
    },
    {
      icon: <Search className="w-6 h-6 text-indigo-600" />,
      title: 'Root Cause Analysis',
      description: 'Investigate failures and prevent future occurrences',
      bgColor: 'bg-indigo-100'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
      {/* Hero Section */}
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
        <Wrench className="w-12 h-12 text-blue-600" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">Welcome to Casey!</h3>
        <p className="text-muted-foreground max-w-md">
          Start managing your maintenance by adding your first asset. Track equipment, schedule maintenance, and monitor performance all in one place.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <AddAssetDialog
          onAddAsset={onAddAsset}
          currentAssetCount={currentAssetCount}
          triggerButton={
            <Button size="lg" className="px-8">
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Asset
            </Button>
          }
        />
        <Button
          variant="outline"
          size="lg"
          className="px-8"
          onClick={handleViewDemo}
          disabled={isAddingDemo}
        >
          <FileText className="w-5 h-5 mr-2" />
          {isAddingDemo ? 'Creating Demo...' : 'View Demo'}
        </Button>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 max-w-4xl">
        {features.map((feature, index) => (
          <div key={index} className="text-center p-4">
            <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
              {feature.icon}
            </div>
            <h4 className="font-medium mb-1">{feature.title}</h4>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
