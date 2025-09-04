import React from 'react';
import { Info, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddAssetDialog } from '../dialogs/AddAssetDialog';

interface DemoBannerProps {
  onAddAsset: (asset: any) => number;
  currentAssetCount: number;
  onDismiss?: () => void;
}

export function DemoBanner({ onAddAsset, currentAssetCount, onDismiss }: DemoBannerProps) {
  const isDemoMode = localStorage.getItem('demoMode') === 'true';

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              You're viewing demo data
            </h4>
            <p className="text-sm text-blue-700 mb-3">
              These are sample assets to help you explore the platform. Ready to add your own equipment?
            </p>
            <AddAssetDialog
              onAddAsset={onAddAsset}
              currentAssetCount={currentAssetCount}
              triggerButton={
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Asset
                </Button>
              }
            />
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
