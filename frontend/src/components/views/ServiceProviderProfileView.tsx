import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Save, 
  Edit, 
  Plus, 
  X, 
  CheckCircle,
  Star,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function ServiceProviderProfileView() {
  const { user, updateProfile } = useAuth();
  const profile = user?.serviceProviderProfile;
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  if (!profile || !editedProfile) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2>Service Provider Profile Not Found</h2>
          <p className="text-muted-foreground">Unable to load your service provider profile.</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (user && editedProfile) {
      updateProfile({
        ...user,
        serviceProviderProfile: editedProfile
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const updateBusinessInfo = (field: string, value: any) => {
    setEditedProfile(prev => prev ? {
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        [field]: value
      }
    } : null);
  };

  const addService = (service: string) => {
    if (service.trim() && editedProfile && !editedProfile.businessInfo.services.includes(service)) {
      updateBusinessInfo('services', [...editedProfile.businessInfo.services, service]);
    }
  };

  const removeService = (service: string) => {
    if (editedProfile) {
      updateBusinessInfo('services', editedProfile.businessInfo.services.filter(s => s !== service));
    }
  };

  const addSpecialization = (spec: string) => {
    if (spec.trim() && editedProfile && !editedProfile.businessInfo.specializations.includes(spec)) {
      updateBusinessInfo('specializations', [...editedProfile.businessInfo.specializations, spec]);
    }
  };

  const removeSpecialization = (spec: string) => {
    if (editedProfile) {
      updateBusinessInfo('specializations', editedProfile.businessInfo.specializations.filter(s => s !== spec));
    }
  };

  const addCertification = (cert: string) => {
    if (cert.trim() && editedProfile && !editedProfile.businessInfo.certifications.includes(cert)) {
      updateBusinessInfo('certifications', [...editedProfile.businessInfo.certifications, cert]);
    }
  };

  const removeCertification = (cert: string) => {
    if (editedProfile) {
      updateBusinessInfo('certifications', editedProfile.businessInfo.certifications.filter(c => c !== cert));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Business Profile</h1>
          <p className="text-muted-foreground">
            Manage your service provider profile and business information.
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>Your current subscription and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-lg">
                  {editedProfile.businessName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-medium">{editedProfile.businessName}</h3>
                <p className="text-sm text-muted-foreground">
                  {editedProfile.businessInfo.type.charAt(0).toUpperCase() + editedProfile.businessInfo.type.slice(1)} Provider
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subscription</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {editedProfile.subscription.plan.charAt(0).toUpperCase() + editedProfile.subscription.plan.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {editedProfile.subscription.status.charAt(0).toUpperCase() + editedProfile.subscription.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Features</h4>
              <div className="space-y-1">
                {editedProfile.isVerified && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verified Badge
                  </div>
                )}
                {editedProfile.canDirectMessage && (
                  <div className="flex items-center text-sm text-blue-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Direct Messaging
                  </div>
                )}
                {editedProfile.isPromoted && (
                  <div className="flex items-center text-sm text-purple-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Promoted Listings
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Basic details about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  {isEditing ? (
                    <Input
                      id="businessName"
                      value={editedProfile.businessName}
                      onChange={(e) => setEditedProfile(prev => prev ? {...prev, businessName: e.target.value} : null)}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{editedProfile.businessName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  {isEditing ? (
                    <Select
                      value={editedProfile.businessInfo.type}
                      onValueChange={(value) => updateBusinessInfo('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dealer">Dealer</SelectItem>
                        <SelectItem value="independent">Independent</SelectItem>
                        <SelectItem value="specialized">Specialized</SelectItem>
                        <SelectItem value="fleet">Fleet Service</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">
                      {editedProfile.businessInfo.type.charAt(0).toUpperCase() + editedProfile.businessInfo.type.slice(1)}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={editedProfile.businessInfo.address}
                    onChange={(e) => updateBusinessInfo('address', e.target.value)}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">{editedProfile.businessInfo.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editedProfile.businessInfo.phone}
                      onChange={(e) => updateBusinessInfo('phone', e.target.value)}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{editedProfile.businessInfo.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  {isEditing ? (
                    <Input
                      id="website"
                      value={editedProfile.businessInfo.website || ''}
                      onChange={(e) => updateBusinessInfo('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{editedProfile.businessInfo.website || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  {isEditing ? (
                    <Select
                      value={editedProfile.businessInfo.availability}
                      onValueChange={(value) => updateBusinessInfo('availability', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24/7">24/7</SelectItem>
                        <SelectItem value="business-hours">Business Hours</SelectItem>
                        <SelectItem value="on-call">On Call</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{editedProfile.businessInfo.availability}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricing">Pricing Tier</Label>
                  {isEditing ? (
                    <Select
                      value={editedProfile.businessInfo.pricing}
                      onValueChange={(value) => updateBusinessInfo('pricing', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget</SelectItem>
                        <SelectItem value="mid-range">Mid-Range</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">
                      {editedProfile.businessInfo.pricing.charAt(0).toUpperCase() + editedProfile.businessInfo.pricing.slice(1)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responseTime">Response Time</Label>
                  {isEditing ? (
                    <Input
                      id="responseTime"
                      value={editedProfile.businessInfo.responseTime}
                      onChange={(e) => updateBusinessInfo('responseTime', e.target.value)}
                      placeholder="e.g., < 2 hours"
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{editedProfile.businessInfo.responseTime}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>Services you offer to customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {editedProfile.businessInfo.services.map((service, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {service}
                      {isEditing && (
                        <button
                          onClick={() => removeService(service)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a service..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addService(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addService(input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle>Specializations</CardTitle>
              <CardDescription>Areas of expertise and specialization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {editedProfile.businessInfo.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {spec}
                      {isEditing && (
                        <button
                          onClick={() => removeSpecialization(spec)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a specialization..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSpecialization(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addSpecialization(input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>Professional certifications and credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {editedProfile.businessInfo.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline" className="text-sm bg-blue-50 text-blue-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {cert}
                      {isEditing && (
                        <button
                          onClick={() => removeCertification(cert)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a certification..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addCertification(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addCertification(input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}