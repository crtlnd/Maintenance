// frontend/src/dialogs/AddAssetDialog.tsx
import React, { useState } from 'react';
import { Plus, Sparkles, AlertCircle, Crown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

interface AddAssetDialogProps {
  onAddAsset: (asset: any) => number;
  currentAssetCount: number;
}

export function AddAssetDialog({ onAddAsset, currentAssetCount }: AddAssetDialogProps) {
  const { canAddAsset, getAssetLimit } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    modelNumber: '',
    serialNumber: '',
  });
  const canAdd = canAddAsset(currentAssetCount);
  const assetLimit = getAssetLimit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) return;
    setIsLoading(true);
    const newAsset = {
      name: formData.name,
      modelNumber: formData.modelNumber,
      serialNumber: formData.serialNumber,
      type: 'Equipment',
      manufacturer: 'Unknown',
      location: 'Main Facility',
      condition: 'Good',
      lastMaintenance: '2024-01-15',
      installDate: '2023-06-01',
      operatingHours: Math.floor(Math.random() * 5000) + 1000,
      specifications: {},
      maintenanceSchedule: {},
    };
    await new Promise(resolve => setTimeout(resolve, 1000));
    onAddAsset(newAsset);
    setFormData({ name: '', modelNumber: '', serialNumber: '' });
    setOpen(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          disabled={canAdd && isLoading}
          onClick={canAdd ? undefined : () => navigate('/account')}
        >
          {canAdd ? (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </>
          ) : (
            <>
              <Crown className="h-4 w-4 mr-2" />
              Asset limit reached for Basic Plan, click to upgrade
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            {canAdd
              ? 'Add a new asset to your maintenance management system. Use the AI button to auto-populate specifications.'
              : `You've reached your plan's limit of ${assetLimit}. Upgrade your plan to add more assets.`}
          </DialogDescription>
        </DialogHeader>
        {!canAdd && (
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              You've reached your plan's limit of {assetLimit} assets.{' '}
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => navigate('/account')}
              >
                Upgrade to add more assets and unlock additional features.
              </span>
            </AlertDescription>
          </Alert>
        )}
        {canAdd && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset-name">Asset Name *</Label>
              <Input
                id="asset-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Compressor Unit #1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model-number">Model Number *</Label>
              <Input
                id="model-number"
                value={formData.modelNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, modelNumber: e.target.value }))}
                placeholder="e.g., AC-2500X"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial-number">Serial Number *</Label>
              <Input
                id="serial-number"
                value={formData.serialNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                placeholder="e.g., SN123456789"
                required
              />
            </div>
            <Alert className="bg-blue-50 border-blue-200">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                After adding the asset, use the "Fill all known details with AI" button to automatically populate specifications and maintenance schedules.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Asset'}
              </Button>
            </div>
          </form>
        )}
        {assetLimit !== 'unlimited' && (
          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Asset Usage</span>
              <span>{currentAssetCount} of {assetLimit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${
                  currentAssetCount >= (assetLimit as number) ? 'bg-destructive' : 'bg-primary'
                }`}
                style={{
                  width: `${Math.min((currentAssetCount / (assetLimit as number)) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
