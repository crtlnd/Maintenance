import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Star, MapPin, Phone, Check, Map, List, Users, Wrench, Zap, Cog } from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceProvider } from '../../types';
import { getProviderTypeColor, getPricingColor } from '../../utils/helpers';
import { ContactProviderDialog } from '../dialogs/ContactProviderDialog';

interface FormData {
  lat: string;
  lng: string;
  radius: string;
  serviceType: string;
}

interface ProvidersViewProps {
  serviceProviders: ServiceProvider[];
  setServiceProviders: React.Dispatch<React.SetStateAction<ServiceProvider[]>>;
}

const SERVICE_TYPE_FILTERS = [
  { key: 'all', label: 'All Services', icon: 'Users', count: 0 },
  { key: 'mechanics', label: 'Mechanics', icon: 'Wrench', count: 0 },
  { key: 'welders', label: 'Welders', icon: 'Zap', count: 0 },
  { key: 'engineers', label: 'Engineers', icon: 'Cog', count: 0 },
  { key: 'electrical', label: 'Electrical', icon: 'Zap', count: 0 },
  { key: 'hydraulics', label: 'Hydraulics', icon: 'Wrench', count: 0 },
];

const iconMap = {
  Users: Users,
  Wrench: Wrench,
  Zap: Zap,
  Cog: Cog,
};

function ServiceProviderMap({ providers, selectedServiceTypes }: { providers: ServiceProvider[]; selectedServiceTypes: string[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);

  const filteredProviders = providers.filter((provider) => {
    if (selectedServiceTypes.includes('all') || selectedServiceTypes.length === 0) {
      return true;
    }
    return selectedServiceTypes.some((serviceType) => {
      switch (serviceType) {
        case 'mechanics':
          return provider.services.some(
            (service) =>
              service &&
              (service.toLowerCase().includes('repair') ||
                service.toLowerCase().includes('maintenance') ||
                service.toLowerCase().includes('auto') ||
                service.toLowerCase().includes('fleet'))
          );
        case 'welders':
          return (
            provider.services.some(
              (service) => service && (service.toLowerCase().includes('welding') || service.toLowerCase().includes('fabrication'))
            ) ||
            provider.specializations.some(
              (spec) => spec && (spec.toLowerCase().includes('welding') || spec.toLowerCase().includes('fabrication'))
            )
          );
        case 'engineers':
          return (
            provider.services.some(
              (service) =>
                service &&
                (service.toLowerCase().includes('engineering') ||
                  service.toLowerCase().includes('systems') ||
                  service.toLowerCase().includes('design'))
            ) ||
            provider.specializations.some(
              (spec) => spec && (spec.toLowerCase().includes('engineering') || spec.toLowerCase().includes('technical'))
            )
          );
        case 'electrical':
          return (
            provider.services.some(
              (service) =>
                service &&
                (service.toLowerCase().includes('electrical') ||
                  service.toLowerCase().includes('power') ||
                  service.toLowerCase().includes('generator'))
            ) ||
            provider.specializations.some(
              (spec) =>
                spec &&
                (spec.toLowerCase().includes('electrical') ||
                  spec.toLowerCase().includes('power') ||
                  spec.toLowerCase().includes('generator'))
            )
          );
        case 'hydraulics':
          return (
            provider.services.some((service) => service && service.toLowerCase().includes('hydraulic')) ||
            provider.specializations.some((spec) => spec && spec.toLowerCase().includes('hydraulic'))
          );
        default:
          return true;
      }
    });
  });

  useEffect(() => {
    if (mapRef.current && !googleMap.current) {
      googleMap.current = new google.maps.Map(mapRef.current, {
        center: { lat: 31.9973, lng: -102.0779 },
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
      });
    }
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];

    filteredProviders.forEach((provider) => {
      const marker = new google.maps.Marker({
        position: { lat: provider.location.coordinates.coordinates[1], lng: provider.location.coordinates.coordinates[0] },
        map: googleMap.current,
        title: provider.name,
      });
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="font-size: 14px; font-weight: bold; margin: 0;">${provider.name}</h3>
            <p style="font-size: 12px; margin: 5px 0;">${provider.type} • ${provider.pricing}</p>
            <p style="font-size: 12px; margin: 5px 0;">${provider.distance || 'N/A'} mi</p>
            <p style="font-size: 12px; margin: 5px 0;">Rating: ${provider.rating} (${provider.reviewCount})</p>
            ${provider.availability === '24/7' ? '<span style="font-size: 12px; color: green;">24/7 Available</span>' : ''}
          </div>
        `,
      });
      marker.addListener('click', () => {
        infoWindow.open(googleMap.current, marker);
      });
      markers.current.push(marker);
    });

    if (filteredProviders.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      filteredProviders.forEach((provider) => {
        bounds.extend({
          lat: provider.location.coordinates.coordinates[1],
          lng: provider.location.coordinates.coordinates[0],
        });
      });
      googleMap.current?.fitBounds(bounds);
    }

    return () => {
      markers.current.forEach((marker) => marker.setMap(null));
      markers.current = [];
    };
  }, [filteredProviders]);

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border">
      <div ref={mapRef} className="w-full h-full" />
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
        <div className="text-xs text-gray-600 pt-2 border-t">{filteredProviders.length} providers shown</div>
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg">
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"></div>
        </div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">Your Location</div>
      </div>
    </div>
  );
}

function ProvidersView({ serviceProviders, setServiceProviders }: ProvidersViewProps) {
  const [fetchedProviders, setFetchedProviders] = useState<ServiceProvider[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<number>(31);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(['all']);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [formData, setFormData] = useState<FormData>({
    lat: '31.9973',
    lng: '-102.0779',
    radius: '31',
    serviceType: 'mechanics',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.get('http://localhost:3000/api/providers', {
        params: {
          lat: formData.lat,
          lng: formData.lng,
          radius: formData.radius,
          serviceType: formData.serviceType === 'all' ? undefined : formData.serviceType,
        },
      });
      console.log('Providers fetched:', response.data);
      setFetchedProviders(response.data || []);
      setServiceProviders(response.data || []);
    } catch (err: any) {
      console.error('Error fetching providers:', err.message);
      setError(err.response?.data?.error || 'Failed to load providers. Please try again.');
      setFetchedProviders([]);
    }
  };

  useEffect(() => {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  }, []);

  const serviceTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SERVICE_TYPE_FILTERS.forEach((filter) => {
      if (filter.key === 'all') {
        counts[filter.key] = fetchedProviders.length;
      } else {
        counts[filter.key] = fetchedProviders.filter((provider) => {
          switch (filter.key) {
            case 'mechanics':
              return provider.services.some(
                (service) =>
                  service &&
                  (service.toLowerCase().includes('repair') ||
                    service.toLowerCase().includes('maintenance') ||
                    service.toLowerCase().includes('auto') ||
                    service.toLowerCase().includes('fleet'))
              );
            case 'welders':
              return (
                provider.services.some(
                  (service) => service && (service.toLowerCase().includes('welding') || service.toLowerCase().includes('fabrication'))
                ) ||
                provider.specializations.some(
                  (spec) => spec && (spec.toLowerCase().includes('welding') || spec.toLowerCase().includes('fabrication'))
                )
              );
            case 'engineers':
              return (
                provider.services.some(
                  (service) =>
                    service &&
                    (service.toLowerCase().includes('engineering') ||
                      service.toLowerCase().includes('systems') ||
                      service.toLowerCase().includes('design'))
                ) ||
                provider.specializations.some(
                  (spec) => spec && (spec.toLowerCase().includes('engineering') || spec.toLowerCase().includes('technical'))
                )
              );
            case 'electrical':
              return (
                provider.services.some(
                  (service) =>
                    service &&
                    (service.toLowerCase().includes('electrical') ||
                      service.toLowerCase().includes('power') ||
                      service.toLowerCase().includes('generator'))
                ) ||
                provider.specializations.some(
                  (spec) =>
                    spec &&
                    (spec.toLowerCase().includes('electrical') ||
                      spec.toLowerCase().includes('power') ||
                      spec.toLowerCase().includes('generator'))
                )
              );
            case 'hydraulics':
              return (
                provider.services.some((service) => service && service.toLowerCase().includes('hydraulic')) ||
                provider.specializations.some((spec) => spec && spec.toLowerCase().includes('hydraulic'))
              );
            default:
              return true;
          }
        }).length;
      }
    });
    return counts;
  }, [fetchedProviders]);

  const filteredProviders = useMemo(() => {
    const data = fetchedProviders.length > 0 ? fetchedProviders : serviceProviders;
    return data.filter((provider) => {
      const matchesSearch =
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.services.some((service) => service && service.toLowerCase().includes(searchTerm.toLowerCase())) ||
        provider.specializations.some((spec) => spec && spec.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'all' || provider.type === selectedType;
      const matchesPricing = selectedPricing === 'all' || provider.pricing === selectedPricing;
      const matchesDistance = !provider.distance || provider.distance <= maxDistance;
      const matchesServiceType =
        selectedServiceTypes.includes('all') ||
        selectedServiceTypes.some((serviceType) => {
          switch (serviceType) {
            case 'mechanics':
              return provider.services.some(
                (service) =>
                  service &&
                  (service.toLowerCase().includes('repair') ||
                    service.toLowerCase().includes('maintenance') ||
                    service.toLowerCase().includes('auto') ||
                    service.toLowerCase().includes('fleet'))
              );
            case 'welders':
              return (
                provider.services.some(
                  (service) => service && (service.toLowerCase().includes('welding') || service.toLowerCase().includes('fabrication'))
                ) ||
                provider.specializations.some(
                  (spec) => spec && (spec.toLowerCase().includes('welding') || spec.toLowerCase().includes('fabrication'))
                )
              );
            case 'engineers':
              return (
                provider.services.some(
                  (service) =>
                    service &&
                    (service.toLowerCase().includes('engineering') ||
                      service.toLowerCase().includes('systems') ||
                      service.toLowerCase().includes('design'))
                ) ||
                provider.specializations.some(
                  (spec) => spec && (spec.toLowerCase().includes('engineering') || spec.toLowerCase().includes('technical'))
                )
              );
            case 'electrical':
              return (
                provider.services.some(
                  (service) =>
                    service &&
                    (service.toLowerCase().includes('electrical') ||
                      service.toLowerCase().includes('power') ||
                      service.toLowerCase().includes('generator'))
                ) ||
                provider.specializations.some(
                  (spec) =>
                    spec &&
                    (spec.toLowerCase().includes('electrical') ||
                      spec.toLowerCase().includes('power') ||
                      spec.toLowerCase().includes('generator'))
                )
              );
            case 'hydraulics':
              return (
                provider.services.some((service) => service && service.toLowerCase().includes('hydraulic')) ||
                provider.specializations.some((spec) => spec && spec.toLowerCase().includes('hydraulic'))
              );
            default:
              return true;
          }
        });
      return matchesSearch && matchesType && matchesPricing && matchesDistance && matchesServiceType;
    });
  }, [fetchedProviders, serviceProviders, searchTerm, selectedType, selectedPricing, maxDistance, selectedServiceTypes]);

  const stats = useMemo(() => {
    return {
      total: filteredProviders.length,
      available24_7: filteredProviders.filter((p) => p.availability === '24/7').length,
      highRated: filteredProviders.filter((p) => p.rating >= 4.5).length,
      avgDistance: (filteredProviders.reduce((sum, p) => sum + (p.distance || 0), 0) / filteredProviders.length || 0).toFixed(1),
    };
  }, [filteredProviders]);

  const handleServiceTypeToggle = (serviceType: string) => {
    if (serviceType === 'all') {
      setSelectedServiceTypes(['all']);
    } else {
      const newSelected = selectedServiceTypes.includes('all')
        ? [serviceType]
        : selectedServiceTypes.includes(serviceType)
        ? selectedServiceTypes.filter((t) => t !== serviceType)
        : [...selectedServiceTypes.filter((t) => t !== 'all'), serviceType];
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <Input
          type="text"
          name="lat"
          value={formData.lat}
          onChange={handleChange}
          placeholder="Latitude (e.g., 31.9973)"
          required
        />
        <Input
          type="text"
          name="lng"
          value={formData.lng}
          onChange={handleChange}
          placeholder="Longitude (e.g., -102.0779)"
          required
        />
        <Input
          type="number"
          name="radius"
          value={formData.radius}
          onChange={handleChange}
          placeholder="Radius (miles)"
          min="10"
          max="31"
        />
        <Select
          name="serviceType"
          value={formData.serviceType}
          onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="mechanics">Mechanics</SelectItem>
            <SelectItem value="welders">Welders</SelectItem>
            <SelectItem value="engineers">Engineers</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
            <SelectItem value="hydraulics">Hydraulics</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Search</Button>
      </form>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Filter by Service Type</h4>
              <div className="flex flex-wrap gap-2">
                {SERVICE_TYPE_FILTERS.map((filter) => {
                  const IconComponent = iconMap[filter.icon as keyof typeof iconMap];
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
                    <SelectItem value="independent">Independent</SelectItem>
                    <SelectItem value="specialized">Specialized</SelectItem>
                    <SelectItem value="dealer">Dealer</SelectItem>
                    <SelectItem value="fleet">Fleet Service</SelectItem>
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
                    <SelectItem value="10">Within 10 miles</SelectItem>
                    <SelectItem value="20">Within 20 miles</SelectItem>
                    <SelectItem value="30">Within 30 miles</SelectItem>
                    <SelectItem value="31">Within 31 miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
      {viewMode === 'map' ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Provider Locations</CardTitle>
              <div className="text-sm text-muted-foreground">Showing {filteredProviders.length} providers</div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {SERVICE_TYPE_FILTERS.map((filter) => {
                  const IconComponent = iconMap[filter.icon as keyof typeof iconMap];
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProviders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3>No providers found</h3>
                  <p>Try adjusting your search criteria or expanding the distance range.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredProviders.map((provider) => (
              <Card key={provider.placeId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Star className="h-5 w-5" />
                      </div>
                      <div>
                        {provider.verified && (
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
                          {provider.subscriptionTier !== 'none' && (
                            <Badge variant="secondary" className="bg-yellow-600 text-white">
                              {provider.subscriptionTier.charAt(0).toUpperCase() + provider.subscriptionTier.slice(1)}
                            </Badge>
                          )}
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
                        {provider.distance || 'N/A'} mi away
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Services Offered</h5>
                    <div className="flex flex-wrap gap-1">
                      {provider.services.slice(0, 4).map((service, index) => (
                        service && (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        )
                      ))}
                      {provider.services.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{provider.services.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Availability:</span>
                      <p className="font-medium">{provider.availability}</p>
                    </div>
                  </div>
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
                  <div className="text-sm">
                    <span className="text-muted-foreground">Address:</span>
                    <p>{provider.address}</p>
                  </div>
                  {provider.notes && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">{provider.notes}</p>
                    </div>
                  )}
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
                      {(provider.canDirectMessage || provider.subscriptionTier === 'contact' || provider.subscriptionTier === 'promoted') && (
                        <ContactProviderDialog provider={provider} />
                      )}
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
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default ProvidersView;
