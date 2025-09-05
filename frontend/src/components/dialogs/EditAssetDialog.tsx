// frontend/src/dialogs/EditAssetDialog.tsx - FIXED to use flattened structure
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { CalendarDays, Settings, FileText, AlertTriangle, CheckCircle, Clock, Wrench, AlertCircle } from 'lucide-react';
import { Asset } from '../../types';
import { assetApi } from '../../../services/api';

interface EditAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onSave: (asset: Asset) => void;
}

const assetTypes = [
  'HVAC System',
  'Pump',
  'Motor',
  'Conveyor',
  'Boiler',
  'Compressor',
  'Generator',
  'Transformer',
  'Chiller',
  'Fan',
  'Valve',
  'Tank',
  'Pipe System',
  'Control Panel',
  'Safety Equipment',
  'Other'
];

const conditionOptions = [
  { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-800' },
  { value: 'good', label: 'Good', color: 'bg-blue-100 text-blue-800' },
  { value: 'fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'poor', label: 'Poor', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
];

export function EditAssetDialog({ isOpen, onClose, asset, onSave }: EditAssetDialogProps) {
  // FIXED: Initialize form data to read from flattened fields
  const getInitialFormData = (asset: Asset) => {
    console.log('DEBUG: Raw asset data for edit:', asset);

    return {
      ...asset,
      // Ensure all optional fields have default values
      maintenanceHistory: asset.maintenanceHistory || [],
      condition: asset.condition || 'good',
      lastMaintenanceDate: asset.lastMaintenanceDate || '',
      nextMaintenanceDate: asset.nextMaintenanceDate || '',
      warrantyExpiry: asset.warrantyExpiry || '',
      notes: asset.notes || '',
      // FIXED: Read from flattened fields that are actually stored in database
      manufacturer: (asset as any).manufacturer || '',
      model: (asset as any).model || '',
      serialNumber: (asset as any).serialNumber || '',
      yearManufactured: (asset as any).yearManufactured || '',
      operatingHours: (asset as any).operatingHours || '',
    };
  };

  const [formData, setFormData] = useState(getInitialFormData(asset));

  const [newMaintenanceEntry, setNewMaintenanceEntry] = useState({
    date: '',
    type: '',
    description: '',
    cost: '',
    performedBy: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when asset prop changes
  useEffect(() => {
    console.log('DEBUG: Asset prop changed, updating form data');
    setFormData(getInitialFormData(asset));
    setError(null);
  }, [asset]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const addMaintenanceEntry = () => {
    if (!newMaintenanceEntry.date || !newMaintenanceEntry.type || !newMaintenanceEntry.description) {
      setError('Please fill in date, type, and description for the maintenance entry');
      return;
    }

    const entry = {
      id: Date.now(),
      date: newMaintenanceEntry.date,
      type: newMaintenanceEntry.type,
      description: newMaintenanceEntry.description,
      cost: newMaintenanceEntry.cost ? parseFloat(newMaintenanceEntry.cost) : undefined,
      performedBy: newMaintenanceEntry.performedBy || 'Internal'
    };

    setFormData(prev => ({
      ...prev,
      maintenanceHistory: [...(prev.maintenanceHistory || []), entry]
    }));

    setNewMaintenanceEntry({
      date: '',
      type: '',
      description: '',
      cost: '',
      performedBy: ''
    });
    setError(null);
  };

  const removeMaintenanceEntry = (id: number) => {
    setFormData(prev => ({
      ...prev,
      maintenanceHistory: prev.maintenanceHistory?.filter(entry => entry.id !== id) || []
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    console.log('DEBUG: Asset ID being sent:', asset.id);
    console.log('DEBUG: Asset ID type:', typeof asset.id);
    console.log('DEBUG: Form data being sent:', formData);

    try {
      console.log('DEBUG: Saving asset with flattened data:', formData);
      const updatedAsset = await assetApi.updateAsset(asset.id, formData);
      console.log('DEBUG: Asset updated successfully:', updatedAsset);
      onSave(updatedAsset);
      onClose();
    } catch (err) {
      console.error('Error updating asset:', err);
      setError(err instanceof Error ? err.message : 'Failed to update asset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(getInitialFormData(asset));
    setError(null);
    onClose();
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'fair':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Edit Asset Details
          </DialogTitle>
          <DialogDescription>
            Update asset information, specifications, maintenance history, and condition
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Asset Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Asset Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    placeholder="e.g., Excavator, Pump, Generator"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Building, Floor, Room"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => handleInputChange('condition', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {getConditionIcon(option.value)}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this asset"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer || ''}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    placeholder="e.g., Caterpillar"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model || ''}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="e.g., 320D"
                  />
                </div>
                <div>
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber || ''}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    placeholder="e.g., SN123456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="yearManufactured">Year Manufactured</Label>
                  <Input
                    id="yearManufactured"
                    type="number"
                    value={formData.yearManufactured || ''}
                    onChange={(e) => handleInputChange('yearManufactured', e.target.value)}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div>
                  <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                  <Input
                    id="warrantyExpiry"
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e) => handleInputChange('warrantyExpiry', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="operatingHours">Operating Hours</Label>
                  <Input
                    id="operatingHours"
                    type="number"
                    value={formData.operatingHours || ''}
                    onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                    placeholder="Current operating hours"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Maintenance Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lastMaintenance">Last Maintenance Date</Label>
                  <Input
                    id="lastMaintenance"
                    type="date"
                    value={formData.lastMaintenanceDate}
                    onChange={(e) => handleInputChange('lastMaintenanceDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nextMaintenance">Next Maintenance Date</Label>
                  <Input
                    id="nextMaintenance"
                    type="date"
                    value={formData.nextMaintenanceDate}
                    onChange={(e) => handleInputChange('nextMaintenanceDate', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Maintenance History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new maintenance entry */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-3">Add Maintenance Record</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Input
                    type="date"
                    placeholder="Date"
                    value={newMaintenanceEntry.date}
                    onChange={(e) => setNewMaintenanceEntry(prev => ({ ...prev, date: e.target.value }))}
                  />
                  <Select
                    value={newMaintenanceEntry.type}
                    onValueChange={(value) => setNewMaintenanceEntry(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Maintenance Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="calibration">Calibration</SelectItem>
                      <SelectItem value="replacement">Replacement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <Input
                    placeholder="Performed By"
                    value={newMaintenanceEntry.performedBy}
                    onChange={(e) => setNewMaintenanceEntry(prev => ({ ...prev, performedBy: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Cost ($)"
                    value={newMaintenanceEntry.cost}
                    onChange={(e) => setNewMaintenanceEntry(prev => ({ ...prev, cost: e.target.value }))}
                  />
                  <Button onClick={addMaintenanceEntry} size="sm" disabled={isLoading}>
                    Add Record
                  </Button>
                </div>
                <Textarea
                  placeholder="Description of work performed"
                  value={newMaintenanceEntry.description}
                  onChange={(e) => setNewMaintenanceEntry(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Existing maintenance history */}
              <div className="space-y-3">
                {formData.maintenanceHistory && formData.maintenanceHistory.length > 0 ? (
                  formData.maintenanceHistory
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry, index) => (
                      <div key={entry.id || index} className="border rounded-lg p-3 bg-card">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium">{entry.date}</span>
                              <Badge variant="outline">{entry.type}</Badge>
                              {entry.cost && (
                                <span className="text-sm text-muted-foreground">${entry.cost.toFixed(2)}</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{entry.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Performed by: {entry.performedBy || 'Internal'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMaintenanceEntry(entry.id || index)}
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            disabled={isLoading}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No maintenance history recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
