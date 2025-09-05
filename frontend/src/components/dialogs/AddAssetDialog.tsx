// frontend/src/dialogs/AddAssetDialog.tsx - SIMPLIFIED flattened structure
import React, { useState } from 'react';
import { Plus, Crown, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { assetApi } from '../../../services/api';

interface AddAssetDialogProps {
  onAddAsset: (asset: any) => number;
  currentAssetCount: number;
  triggerButton?: React.ReactNode;
}

// FIXED: Simplified to match backend expectations (flattened fields)
interface AssetFormData {
  name: string;
  type: string;
  location: string;
  organization: string;
  status: 'operational' | 'maintenance' | 'down' | 'retired';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  // Direct fields that backend expects
  manufacturer: string;
  model: string;
  serialNumber: string;
  yearManufactured?: number;
  operatingHours?: number;
}

export function AddAssetDialog({ onAddAsset, currentAssetCount, triggerButton }: AddAssetDialogProps) {
  const { canAddAsset, getAssetLimit } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FIXED: Simplified initial state with flattened fields
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    type: '',
    location: '',
    organization: '',
    status: 'operational',
    condition: 'good',
    manufacturer: '',
    model: '',
    serialNumber: '',
  });

  const canAdd = canAddAsset(currentAssetCount);
  const assetLimit = getAssetLimit();

  console.log('DEBUG: canAdd:', canAdd, 'currentAssetCount:', currentAssetCount, 'assetLimit:', assetLimit);

  const handleInputChange = (field: keyof AssetFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) return;

    // FIXED: Simplified validation for flattened fields
    if (!formData.name.trim() || !formData.type.trim() || !formData.manufacturer.trim() ||
        !formData.model.trim() || !formData.serialNumber.trim() ||
        !formData.location.trim() || !formData.organization.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // FIXED: Send data exactly as backend expects it (flattened structure)
      console.log('Sending to API:', formData);
      const newAsset = await assetApi.createAsset(formData);
      console.log('Asset created successfully:', newAsset);

      onAddAsset(newAsset);

      // FIXED: Reset form with flattened structure
      setFormData({
        name: '',
        type: '',
        location: '',
        organization: '',
        status: 'operational',
        condition: 'good',
        manufacturer: '',
        model: '',
        serialNumber: '',
      });
      setOpen(false);
    } catch (err) {
      console.error('Error creating asset:', err);
      setError(err instanceof Error ? err.message : 'Failed to create asset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // FIXED: Reset with flattened structure
    setFormData({
      name: '',
      type: '',
      location: '',
      organization: '',
      status: 'operational',
      condition: 'good',
      manufacturer: '',
      model: '',
      serialNumber: '',
    });
    setError(null);
    setOpen(false);
  };

  const handleUpgradeClick = () => {
    console.log('Upgrade button clicked - navigating to settings');
    navigate('/settings');
  };

  const handleImportClick = () => {
    setOpen(false);
    navigate('/assets/import');
  };

  if (!canAdd) {
    return (
      <Button
        variant="default"
        disabled={isLoading}
        onClick={handleUpgradeClick}
      >
        <Crown className="h-4 w-4 mr-2" />
        Asset limit reached for Basic Plan, click to upgrade
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="default" disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Enter the details of your new asset. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asset-name">Asset Name *</Label>
                <Input
                  id="asset-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Excavator #1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-type">Asset Type *</Label>
                <Input
                  id="asset-type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  placeholder="e.g., Excavator, Pump, Generator"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Houston Facility, Building A"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  placeholder="Your organization name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="down">Down</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* FIXED: Technical Specifications Section with flattened fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer *</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  placeholder="e.g., Caterpillar, John Deere"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., 320D, L540"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial-number">Serial Number *</Label>
                <Input
                  id="serial-number"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  placeholder="e.g., SN123456789"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year-manufactured">Year Manufactured</Label>
                <Input
                  id="year-manufactured"
                  type="number"
                  value={formData.yearManufactured || ''}
                  onChange={(e) => handleInputChange('yearManufactured', parseInt(e.target.value) || undefined)}
                  min={1900}
                  max={new Date().getFullYear()}
                  placeholder="e.g., 2020"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operating-hours">Operating Hours</Label>
                <Input
                  id="operating-hours"
                  type="number"
                  value={formData.operatingHours || ''}
                  onChange={(e) => handleInputChange('operatingHours', parseInt(e.target.value) || undefined)}
                  min={0}
                  placeholder="Current operating hours"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            {/* Left side - Import button */}
            <Button
              type="button"
              variant="ghost"
              onClick={handleImportClick}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700"
            >
              Import Bulk Assets from CSV
            </Button>

            {/* Right side - Form buttons */}
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating Asset...' : 'Create Asset'}
              </Button>
            </div>
          </div>
        </form>

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
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
