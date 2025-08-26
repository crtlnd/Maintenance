import React, { useState, useMemo } from 'react';
import { Search, Star, MapPin, Phone, Users, Check, Map, List, Wrench, Zap, Cog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ServiceProvider } from '../../types';
import { getProviderTypeColor, getPricingColor, getProviderTypeIcon } from '../../utils/helpers';
import { ContactProviderDialog } from '../dialogs/ContactProviderDialog';

// Service type mapping for filtering
const SERVICE_TYPE_FILTERS = [
  { key: 'all', label: 'All Services', icon: Users, count: 0 },
  { key: 'mechanics', label: 'Mechanics', icon: Wrench, count: 0 },
  { key: 'welders', label: 'Welders', icon: Zap, count: 0 },
  { key: 'engineers', label: 'Engineers', icon: Cog, count: 0 },
  { key: 'electrical', label: 'Electrical', icon: Zap, count: 0 },
  { key: 'hydraulics', label: 'Hydraulics', icon: Wrench, count: 0 }
];

// Mock map component for demonstration
function ServiceProviderMap({ providers, selectedServiceTypes }: { 
  providers: ServiceProvider[]; 
  selectedServiceTypes: string[];
}) {
  const filteredProviders = providers.filter(provider => {
    if (selectedServiceTypes.includes('all') || selectedServiceTypes.length === 0) {
      return true;
    }
    
    return selectedServiceTypes.some(serviceType => {
      switch (serviceType) {
        case 'mechanics':
          return provider.services.some(service => 
            service.toLowerCase().includes('repair') || 
            service.toLowerCase().includes('maintenance') ||
            service.toLowerCase().includes('auto') ||
            service.toLowerCase().includes('fleet')
          );
        case 'welders':
          return provider.services.some(service => 
            service.toLowerCase().includes('welding') ||
            service.toLowerCase().includes('fabrication')
          ) || provider.specializations.some(spec =>
            spec.toLowerCase().includes('welding') ||
            spec.toLowerCase().includes('fabrication')
          );
        case 'engineers':
          return provider.services.some(service => 
            service.toLowerCase().includes('engineering') ||
            service.toLowerCase().includes('systems') ||
            service.toLowerCase().includes('design')
          ) || provider.specializations.some(spec =>
            spec.toLowerCase().includes('engineering') ||
            spec.toLowerCase().includes('technical')
          );
        case 'electrical':
          return provider.services.some(service => 
            service.toLowerCase().includes('electrical') ||
            service.toLowerCase().includes('power') ||
            service.toLowerCase().includes('generator')
          ) || provider.specializations.some(spec =>
            spec.toLowerCase().includes('electrical') ||
            spec.toLowerCase().includes('power') ||
            spec.toLowerCase().includes('generator')
          );
        case 'hydraulics':
          return provider.services.some(service => 
            service.toLowerCase().includes('hydraulic')
          ) || provider.specializations.some(spec =>
            spec.toLowerCase().includes('hydraulic')
          );
        default:
          return true;
      }
    });
  });

  // Predefined positions for better distribution
  const providerPositions = [
    { x: 120, y: 80 }, { x: 280, y: 60 }, { x: 200, y: 120 },
    { x: 80, y: 180 }, { x: 320, y: 140 }, { x: 160, y: 220 },
    { x: 240, y: 180 }, { x: 350, y: 100 }, { x: 100, y: 250 },
    { x: 300, y: 240 }
  ];

  const getServiceTypeColor = (provider: ServiceProvider) => {
    if (provider.services.some(s => s.toLowerCase().includes('welding'))) return 'bg-orange-600';
    if (provider.services.some(s => s.toLowerCase().includes('engineering'))) return 'bg-purple-600';
    if (provider.services.some(s => s.toLowerCase().includes('electrical'))) return 'bg-yellow-600';
    if (provider.services.some(s => s.toLowerCase().includes('hydraulic'))) return 'bg-indigo-600';
    return provider.isVerified ? 'bg-blue-600' : 'bg-gray-600';
  };

  return (
    <div className="relative w-full h-96 bg-slate-100 rounded-lg overflow-hidden border">
      {/* Enhanced map background */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 400 300">
          {/* Map base */}
          <rect width="100%" height="100%" fill="#f1f5f9"/>
          
          {/* Grid pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5" />
          
          {/* Mock streets and areas */}
          <path d="M 0 100 L 400 100" stroke="#94a3b8" strokeWidth="4" opacity="0.6"/>
          <path d="M 0 200 L 400 200" stroke="#94a3b8" strokeWidth="4" opacity="0.6"/>
          <path d="M 100 0 L 100 300" stroke="#94a3b8" strokeWidth="4" opacity="0.6"/>
          <path d="M 300 0 L 300 300" stroke="#94a3b8" strokeWidth="4" opacity="0.6"/>
          
          {/* Industrial areas */}
          <rect x="50" y="50" width="80" height="60" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3"/>
          <text x="90" y="85" fontSize="8" fill="#059669" textAnchor="middle">Industrial Zone A</text>
          
          <rect x="250" y="150" width="90" height="70" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3"/>
          <text x="295" y="190" fontSize="8" fill="#2563eb" textAnchor="middle">Commercial Zone</text>
        </svg>
      </div>

      {/* Provider markers */}
      {filteredProviders.map((provider, index) => {
        const position = providerPositions[index % providerPositions.length];
        const markerColor = getServiceTypeColor(provider);
        
        return (
          <div
            key={provider.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
          >
            {/* Marker */}
            <div className="relative">
              <div className={`w-8 h-8 rounded-full border-3 border-white shadow-lg flex items-center justify-center transition-all duration-200 group-hover:scale-125 group-hover:shadow-xl ${markerColor}`}>
                <div className="text-white text-xs font-medium">
                  {provider.rating}
                </div>
              </div>
              
              {/* Pulse animation for 24/7 providers */}
              {provider.availability === '24/7' && (
                <div className={`absolute inset-0 rounded-full animate-ping ${markerColor} opacity-20`}></div>
              )}
              
              {/* Enhanced tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
                <div className="bg-white border border-gray-200 shadow-xl rounded-lg p-3 min-w-48">
                  <div className="font-medium text-gray-900">{provider.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{provider.type} • {provider.pricing}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {provider.distance} mi • {provider.responseTime}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    <span className="text-xs">{provider.rating} ({provider.reviewCount})</span>
                  </div>
                  {provider.availability === '24/7' && (
                    <Badge className="mt-2 text-xs" variant="secondary">
                      24/7 Available
                    </Badge>
                  )}
                </div>
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white"></div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button size="sm" variant="secondary" className="w-8 h-8 p-0 shadow-lg">
          <span>+</span>
        </Button>
        <Button size="sm" variant="secondary" className="w-8 h-8 p-0 shadow-lg">
          <span>−</span>
        </Button>
      </div>

      {/* Enhanced legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border space-y-2">
        <div className="font-medium text-sm text-gray-900 mb-2">Service Types</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <span>Welders</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
            <span>Engineers</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
            <span>Electrical</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
            <span>Hydraulics</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span>Verified</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-gray-600"></div>
            <span>Standard</span>
          </div>
        </div>
        <div className="text-xs text-gray-600 pt-2 border-t">
          {filteredProviders.length} providers shown
        </div>
      </div>

      {/* Center marker (user location) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg">
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"></div>
        </div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
          Your Location
        </div>
      </div>
    </div>
  );
}

export function ProvidersView({ providers }: { providers: ServiceProvider[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<number>(1);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(['all']);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Calculate service type counts
  const serviceTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    SERVICE_TYPE_FILTERS.forEach(filter => {
      if (filter.key === 'all') {
        counts[filter.key] = providers.length;
      } else {
        counts[filter.key] = providers.filter(provider => {
          switch (filter.key) {
            case 'mechanics':
              return provider.services.some(service => 
                service.toLowerCase().includes('repair') || 
                service.toLowerCase().includes('maintenance') ||
                service.toLowerCase().includes('auto') ||
                service.toLowerCase().includes('fleet')
              );
            case 'welders':
              return provider.services.some(service => 
                service.toLowerCase().includes('welding') ||
                service.toLowerCase().includes('fabrication')
              ) || provider.specializations.some(spec =>
                spec.toLowerCase().includes('welding') ||
                spec.toLowerCase().includes('fabrication')
              );
            case 'engineers':
              return provider.services.some(service => 
                service.toLowerCase().includes('engineering') ||
                service.toLowerCase().includes('systems') ||
                service.toLowerCase().includes('design')
              ) || provider.specializations.some(spec =>
                spec.toLowerCase().includes('engineering') ||
                spec.toLowerCase().includes('technical')
              );
            case 'electrical':
              return provider.services.some(service => 
                service.toLowerCase().includes('electrical') ||
                service.toLowerCase().includes('power') ||
                service.toLowerCase().includes('generator')
              ) || provider.specializations.some(spec =>
                spec.toLowerCase().includes('electrical') ||
                spec.toLowerCase().includes('power') ||
                spec.toLowerCase().includes('generator')
              );
            case 'hydraulics':
              return provider.services.some(service => 
                service.toLowerCase().includes('hydraulic')
              ) || provider.specializations.some(spec =>
                spec.toLowerCase().includes('hydraulic')
              );
            default:
              return true;
          }
        }).length;
      }
    });
    
    return counts;
  }, [providers]);

  const filteredProviders = useMemo(() => {
    return providers.filter(provider => {
      const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          provider.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          provider.specializations.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = selectedType === 'all' || provider.type === selectedType;
      const matchesPricing = selectedPricing === 'all' || provider.pricing === selectedPricing;
      const matchesDistance = provider.distance <= maxDistance;
      
      const matchesServiceType = selectedServiceTypes.includes('all') || selectedServiceTypes.some(serviceType => {
        switch (serviceType) {
          case 'mechanics':
            return provider.services.some(service => 
              service.toLowerCase().includes('repair') || 
              service.toLowerCase().includes('maintenance') ||
              service.toLowerCase().includes('auto') ||
              service.toLowerCase().includes('fleet')
            );
          case 'welders':
            return provider.services.some(service => 
              service.toLowerCase().includes('welding') ||
              service.toLowerCase().includes('fabrication')
            ) || provider.specializations.some(spec =>
              spec.toLowerCase().includes('welding') ||
              spec.toLowerCase().includes('fabrication')
            );
          case 'engineers':
            return provider.services.some(service => 
              service.toLowerCase().includes('engineering') ||
              service.toLowerCase().includes('systems') ||
              service.toLowerCase().includes('design')
            ) || provider.specializations.some(spec =>
              spec.toLowerCase().includes('engineering') ||
              spec.toLowerCase().includes('technical')
            );
          case 'electrical':
            return provider.services.some(service => 
              service.toLowerCase().includes('electrical') ||
              service.toLowerCase().includes('power') ||
              service.toLowerCase().includes('generator')
            ) || provider.specializations.some(spec =>
              spec.toLowerCase().includes('electrical') ||
              spec.toLowerCase().includes('power') ||
              spec.toLowerCase().includes('generator')
            );
          case 'hydraulics':
            return provider.services.some(service => 
              service.toLowerCase().includes('hydraulic')
            ) || provider.specializations.some(spec =>
              spec.toLowerCase().includes('hydraulic')
            );
          default:
            return true;
        }
      });

      return matchesSearch && matchesType && matchesPricing && matchesDistance && matchesServiceType;
    });
  }, [providers, searchTerm, selectedType, selectedPricing, maxDistance, selectedServiceTypes]);

  const stats = useMemo(() => {
    return {
      total: providers.length,
      available24_7: providers.filter(p => p.availability === '24/7').length,
      highRated: providers.filter(p => p.rating >= 4.5).length,
      avgDistance: (providers.reduce((sum, p) => sum + p.distance, 0) / providers.length).toFixed(1)
    };
  }, [providers]);

  const handleServiceTypeToggle = (serviceType: string) => {
    if (serviceType === 'all') {
      setSelectedServiceTypes(['all']);
    } else {
      const newSelected = selectedServiceTypes.includes('all') 
        ? [serviceType]
        : selectedServiceTypes.includes(serviceType)
          ? selectedServiceTypes.filter(t => t !== serviceType)
          : [...selectedServiceTypes.filter(t => t !== 'all'), serviceType];
      
      setSelectedServiceTypes(newSelected.length === 0 ? ['all'] : newSelected);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Service Providers</h2>
          <p className="text-muted-foreground">Maintenance and repair companies within your area</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            <Map className="h-4 w-4 mr-2" />
            Map
          </Button>
        </div>
      </div>

      {/* Service Type Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Filter by Service Type</h4>
              <div className="flex flex-wrap gap-2">
                {SERVICE_TYPE_FILTERS.map((filter) => {
                  const IconComponent = filter.icon;
                  const isSelected = selectedServiceTypes.includes(filter.key);
                  const count = serviceTypeCounts[filter.key] || 0;
                  
                  return (
                    <Button
                      key={filter.key}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleServiceTypeToggle(filter.key)}
                      className="h-9"
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {filter.label}
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 ${isSelected ? 'bg-primary-foreground text-primary' : ''}`}
                      >
                        {count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* Additional Filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search providers, services, or specializations..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Provider Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="dealer">Dealer</SelectItem>
                    <SelectItem value="specialized">Specialized</SelectItem>
                    <SelectItem value="fleet">Fleet Service</SelectItem>
                    <SelectItem value="independent">Independent</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPricing} onValueChange={setSelectedPricing}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Pricing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pricing</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="mid-range">Mid-range</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={maxDistance.toString()} onValueChange={(value) => setMaxDistance(Number(value))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">Within 0.5 miles</SelectItem>
                    <SelectItem value="1">Within 1 mile</SelectItem>
                    <SelectItem value="2">Within 2 miles</SelectItem>
                    <SelectItem value="5">Within 5 miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Providers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-green-600">{stats.available24_7}</div>
            <p className="text-sm text-muted-foreground">24/7 Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl text-blue-600">{stats.highRated}</div>
            <p className="text-sm text-muted-foreground">Highly Rated (4.5+)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl">{stats.avgDistance} mi</div>
            <p className="text-sm text-muted-foreground">Average Distance</p>
          </CardContent>
        </Card>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'map' ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Provider Locations</CardTitle>
              <div className="text-sm text-muted-foreground">
                Showing {filteredProviders.length} of {providers.length} providers
              </div>
            </div>
            {/* Service Type Filters for Map View */}
            <div className="pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {SERVICE_TYPE_FILTERS.map((filter) => {
                  const IconComponent = filter.icon;
                  const isSelected = selectedServiceTypes.includes(filter.key);
                  const count = serviceTypeCounts[filter.key] || 0;
                  
                  return (
                    <Button
                      key={filter.key}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleServiceTypeToggle(filter.key)}
                      className="h-8"
                    >
                      <IconComponent className="h-3 w-3 mr-1" />
                      {filter.label}
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 text-xs ${isSelected ? 'bg-primary-foreground text-primary' : ''}`}
                      >
                        {count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ServiceProviderMap providers={filteredProviders} selectedServiceTypes={selectedServiceTypes} />
          </CardContent>
        </Card>
      ) : (
        /* Provider Cards */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProviders.map((provider) => {
            const IconComponent = getProviderTypeIcon(provider.type);
            
            return (
              <Card key={provider.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        {provider.id <= 2 && (
                          <Badge className="bg-blue-600 text-white border-blue-700 shadow-sm mb-2 inline-flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Verified Provider
                          </Badge>
                        )}
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={getProviderTypeColor(provider.type)}>
                            {provider.type}
                          </Badge>
                          <Badge variant="secondary" className={getPricingColor(provider.pricing)}>
                            {provider.pricing}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        <span>{provider.rating}</span>
                        <span className="text-muted-foreground">({provider.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {provider.distance} mi away
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Services */}
                  <div>
                    <h5 className="font-medium mb-2">Services Offered</h5>
                    <div className="flex flex-wrap gap-1">
                      {provider.services.slice(0, 4).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {provider.services.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{provider.services.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Specializations */}
                  {provider.specializations.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Specializations</h5>
                      <div className="flex flex-wrap gap-1">
                        {provider.specializations.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Response Time:</span>
                      <p className="font-medium">{provider.responseTime}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Availability:</span>
                      <p className="font-medium">{provider.availability}</p>
                    </div>
                  </div>

                  {/* Certifications */}
                  {provider.certifications.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Certifications</h5>
                      <div className="flex flex-wrap gap-1">
                        {provider.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Address:</span>
                    <p>{provider.address}</p>
                  </div>

                  {/* Notes */}
                  {provider.notes && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">{provider.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(`tel:${provider.phone}`)}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <ContactProviderDialog provider={provider} />
                    </div>
                    {provider.website && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(provider.website, '_blank')}
                      >
                        Visit Website
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredProviders.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3>No providers found</h3>
              <p>Try adjusting your search criteria or expanding the distance range.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}