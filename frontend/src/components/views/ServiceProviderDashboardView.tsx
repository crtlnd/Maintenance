import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function ServiceProviderDashboardView() {
  const { user } = useAuth();
  const profile = user?.serviceProviderProfile;

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2>Service Provider Profile Not Found</h2>
          <p className="text-muted-foreground">Unable to load your service provider profile.</p>
        </div>
      </div>
    );
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case '24/7': return 'bg-green-100 text-green-800';
      case 'business-hours': return 'bg-blue-100 text-blue-800';
      case 'on-call': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'budget': return 'bg-green-100 text-green-800';
      case 'mid-range': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock data for dashboard metrics
  const dashboardStats = {
    activeRequests: 3,
    completedJobs: 24,
    monthlyRevenue: 12500,
    rating: 4.8,
    responseTime: profile.businessInfo.responseTime
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Service Provider Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName}! Here's your business overview.
          </p>
        </div>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeRequests}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.completedJobs}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.rating}</div>
            <p className="text-xs text-muted-foreground">
              Based on 47 reviews
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>Your service provider information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-lg">
                  {profile.businessName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">{profile.businessName}</h3>
                  {profile.isVerified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {profile.isPromoted && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Promoted
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {profile.businessInfo.type.charAt(0).toUpperCase() + profile.businessInfo.type.slice(1)} Service Provider
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                {profile.businessInfo.address}
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                {profile.businessInfo.phone}
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                {user?.email}
              </div>
              {profile.businessInfo.website && (
                <div className="flex items-center text-sm">
                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                  {profile.businessInfo.website}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className={getAvailabilityColor(profile.businessInfo.availability)}>
                <Clock className="h-3 w-3 mr-1" />
                {profile.businessInfo.availability}
              </Badge>
              <Badge className={getPricingColor(profile.businessInfo.pricing)}>
                <DollarSign className="h-3 w-3 mr-1" />
                {profile.businessInfo.pricing}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Services & Specializations */}
        <Card>
          <CardHeader>
            <CardTitle>Services & Specializations</CardTitle>
            <CardDescription>What you offer to customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Services Offered</h4>
              <div className="flex flex-wrap gap-2">
                {profile.businessInfo.services.map((service, index) => (
                  <Badge key={index} variant="outline">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Specializations</h4>
              <div className="flex flex-wrap gap-2">
                {profile.businessInfo.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {profile.businessInfo.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Response Time:</span>
                <span className="font-medium">{profile.businessInfo.responseTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">New maintenance request from Industrial Solutions Inc.</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Completed service for Manufacturing Corp</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Quote requested for Power Plant Operations</p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}