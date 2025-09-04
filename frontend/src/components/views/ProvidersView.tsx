import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Star, MapPin, Phone, Check, Map, List, Users, Wrench, Zap, Cog, Locate, AlertCircle } from 'lucide-react';
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
import { loadGoogleMapsAPI } from '../../utils/googleMapsLoader';

interface FormData {
  location: string;
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

// Major cities as location options
const MAJOR_CITIES = [
  { name: 'Houston, TX', lat: 29.7604, lng: -95.3698 },
  { name: 'Dallas, TX', lat: 32.7767, lng: -96.7970 },
  { name: 'Austin, TX', lat: 30.2672, lng: -97.7431 },
  { name: 'San Antonio, TX', lat: 29.4241, lng: -98.4936 },
  { name: 'Fort Worth, TX', lat: 32.7555, lng: -97.3308 },
  { name: 'El Paso, TX', lat: 31.7619, lng: -106.4850 },
  { name: 'Oklahoma City, OK', lat: 35.4676, lng: -97.5164 },
  { name: 'Tulsa, OK', lat: 36.1540, lng: -95.9928 },
  { name: 'New Orleans, LA', lat: 29.9511, lng: -90.0715 },
  { name: 'Baton Rouge, LA', lat: 30.4515, lng: -91.1871 },
];

function ServiceProviderMap({ providers, selectedServiceTypes, userLocation }: {
  providers: ServiceProvider[];
  selectedServiceTypes: string[];
  userLocation: { lat: number; lng: number } | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map only when Google Maps API is available
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      // Wait for Google Maps API to be available
      if (!window.google || !window.google.maps) {
        try {
          await loadGoogleMapsAPI();
        } catch (error) {
          console.error('Failed to load Google Maps in map component:', error);
          return;
        }
      }

      if (!googleMap.current) {
        // Use user location or default to Houston
        const center = userLocation || { lat: 29.7604, lng: -95.3698 };
        googleMap.current = new google.maps.Map(mapRef.current, {
          center,
          zoom: 10,
          mapTypeControl: false,
          streetViewControl: false,
        });
        setMapLoaded(true);
      }
    };

    initializeMap();
  }, [userLocation]);

  const filteredProviders = providers.filter((provider) => {
    // Only include providers that have valid location data
    let hasValidLocation = false;

    if (provider.location?.coordinates?.coordinates) {
      const lng = provider.location.coordinates.coordinates[0];
      const lat = provider.location.coordinates.coordinates[1];
      hasValidLocation = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
    } else if (provider.location?.lat && provider.location?.lng) {
      hasValidLocation = typeof provider.location.lat === 'number' && typeof provider.location.lng === 'number' &&
                       !isNaN(provider.location.lat) && !isNaN(provider.location.lng);
    } else if (provider.lat && provider.lng) {
      hasValidLocation = typeof provider.lat === 'number' && typeof provider.lng === 'number' &&
                       !isNaN(provider.lat) && !isNaN(provider.lng);
    }

    if (!hasValidLocation) {
      return false;
    }

    if (selectedServiceTypes.includes('all') || selectedServiceTypes.length === 0) {
      return true;
    }
    return selectedServiceTypes.some((serviceType) => {
      switch (serviceType) {
        case 'mechanics':
          return provider.services?.some(
            (service) =>
              service &&
              (service.toLowerCase().includes('repair') ||
                service.toLowerCase().includes('maintenance') ||
                service.toLowerCase().includes('auto') ||
                service.toLowerCase().includes('fleet'))
          );
        case 'welders':
          return (
            provider.services?.some(
              (service) => service && (service.toLowerCase().includes('welding') || service.toLowerCase().includes('fabrication'))
            ) ||
            provider.specializations?.some(
              (spec) => spec && (spec.toLowerCase().includes('welding') || spec.toLowerCase().includes('fabrication'))
            )
          );
        case 'engineers':
          return (
            provider.services?.some(
              (service) =>
                service &&
                (service.toLowerCase().includes('engineering') ||
                  service.toLowerCase().includes('systems') ||
                  service.toLowerCase().includes('design'))
            ) ||
            provider.specializations?.some(
              (spec) => spec && (spec.toLowerCase().includes('engineering') || spec.toLowerCase().includes('technical'))
            )
          );
        case 'electrical':
          return (
            provider.services?.some(
              (service) =>
                service &&
                (service.toLowerCase().includes('electrical') ||
                  service.toLowerCase().includes('power') ||
                  service.toLowerCase().includes('generator'))
            ) ||
            provider.specializations?.some(
              (spec) =>
                spec &&
                (spec.toLowerCase().includes('electrical') ||
                  spec.toLowerCase().includes('power') ||
                  spec.toLowerCase().includes('generator'))
            )
          );
        case 'hydraulics':
          return (
            provider.services?.some((service) => service && service.toLowerCase().includes('hydraulic')) ||
            provider.specializations?.some((spec) => spec && spec.toLowerCase().includes('hydraulic'))
          );
        default:
          return true;
      }
    });
  });

  // Update markers when providers change, but only if map is loaded
  useEffect(() => {
    if (!mapLoaded || !googleMap.current || !window.google || !window.google.maps) {
      return;
    }

    // Clear existing markers
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];

    filteredProviders.forEach((provider) => {
      // Safe coordinate extraction with fallbacks
      let lat, lng;

      if (provider.location?.coordinates?.coordinates) {
        // GeoJSON format: [longitude, latitude]
        lng = provider.location.coordinates.coordinates[0];
        lat = provider.location.coordinates.coordinates[1];
      } else if (provider.location?.lat && provider.location?.lng) {
        // Direct lat/lng format
        lat = provider.location.lat;
        lng = provider.location.lng;
      } else if (provider.lat && provider.lng) {
        // Provider has direct lat/lng properties
        lat = provider.lat;
        lng = provider.lng;
      } else {
        // Skip this provider if no valid coordinates
        console.warn('Provider missing location data:', provider.name);
        return;
      }

      // Validate coordinates are numbers
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates for provider:', provider.name, { lat, lng });
        return;
      }

      const marker = new google.maps.Marker({
        position: { lat, lng },
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
      let validProviders = 0;

      filteredProviders.forEach((provider) => {
        let lat, lng;

        if (provider.location?.coordinates?.coordinates) {
          lng = provider.location.coordinates.coordinates[0];
          lat = provider.location.coordinates.coordinates[1];
        } else if (provider.location?.lat && provider.location?.lng) {
          lat = provider.location.lat;
          lng = provider.location.lng;
        } else if (provider.lat && provider.lng) {
          lat = provider.lat;
          lng = provider.lng;
        } else {
          return;
        }

        if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
          bounds.extend({ lat, lng });
          validProviders++;
        }
      });

      if (validProviders > 0) {
        googleMap.current?.fitBounds(bounds);
      }
    } else if (userLocation) {
      // Center on user location if no providers found
      googleMap.current?.setCenter(userLocation);
      googleMap.current?.setZoom(12);
    }

    return () => {
      markers.current.forEach((marker) => marker.setMap(null));
      markers.current = [];
    };
  }, [filteredProviders, userLocation, mapLoaded]);

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border">
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      {mapLoaded && filteredProviders.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No providers with location data</h3>
            <p className="text-sm text-gray-600">Providers need valid coordinates to display on the map.</p>
          </div>
        </div>
      )}
      {mapLoaded && filteredProviders.length > 0 && (
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
      )}
      {userLocation && mapLoaded && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg">
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"></div>
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">Your Location</div>
        </div>
      )}
    </div>
  );
}

function ProvidersView({ serviceProviders, setServiceProviders }: ProvidersViewProps) {
  const [fetchedProviders, setFetchedProviders] = useState<ServiceProvider[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<number>(25);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(['all']);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    location: '',
    lat: '',
    lng: '',
    radius: '25',
    serviceType: 'mechanics',
  });

  // Get user's current location
  const getCurrentLocation = () => {
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setFormData(prev => ({
          ...prev,
          lat: latitude.toString(),
          lng: longitude.toString(),
          location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        }));
        setLocationLoading(false);
        // Automatically search for providers at user's location
        searchProviders(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your location. Please enter a location manually.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // Search for providers at specific coordinates
  const searchProviders = async (lat: number, lng: number) => {
    setError(null);
    try {
      const response = await axios.get('http://localhost:3000/api/providers', {
        params: {
          lat: lat.toString(),
          lng: lng.toString(),
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

  // Handle city selection
  const handleCitySelect = (cityName: string) => {
    const city = MAJOR_CITIES.find(c => c.name === cityName);
    if (city) {
      setUserLocation({ lat: city.lat, lng: city.lng });
      setFormData(prev => ({
        ...prev,
        location: cityName,
        lat: city.lat.toString(),
        lng: city.lng.toString(),
      }));
      searchProviders(city.lat, city.lng);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.lat || !formData.lng) {
      setError('Please select a location or use "Use My Location" button');
      return;
    }

    searchProviders(parseFloat(formData.lat), parseFloat(formData.lng));
  };

  // Load providers with user's location on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load Google Maps API first
        await loadGoogleMapsAPI();
        console.log('Google Maps API loaded successfully');

        // Then get user location and search for providers
        getCurrentLocation();
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
        setError('Failed to load Google Maps. Please check your internet connection and refresh the page.');
      }
    };

    initializeApp();
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
              return provider.services?.some(
                (service) =>
                  service &&
                  (service.toLowerCase().includes('repair') ||
                    service.toLowerCase().includes('maintenance') ||
                    service.toLowerCase().includes('auto') ||
                    service.toLowerCase().includes('fleet'))
              );
            case 'welders':
              return (
                provider.services?.some(
                  (service) => service && (service.toLowerCase().includes('welding') || service.toLowerCase().includes('fabrication'))
                ) ||
                provider.specializations?.some(
                  (spec) => spec && (spec.toLowerCase().includes('welding') || spec.toLowerCase().includes('fabrication'))
                )
              );
            case 'engineers':
              return (
                provider.services?.some(
                  (service) =>
                    service &&
                    (service.toLowerCase().includes('engineering') ||
                      service.toLowerCase().includes('systems') ||
                      service.toLowerCase().includes('design'))
                ) ||
                provider.specializations?.some(
                  (spec) => spec && (spec.toLowerCase().includes('engineering') || spec.toLowerCase().includes('technical'))
                )
              );
            case 'electrical':
              return (
                provider.services?.some(
                  (service) =>
                    service &&
                    (service.toLowerCase().includes('electrical') ||
                      service.toLowerCase().includes('power') ||
                      service.toLowerCase().includes('generator'))
                ) ||
                provider.specializations?.some(
                  (spec) =>
                    spec &&
                    (spec.toLowerCase().includes('electrical') ||
                      spec.toLowerCase().includes('power') ||
                      spec.toLowerCase().includes('generator'))
                )
              );
            case 'hydraulics':
              return (
                provider.services?.some((service) => service && service.toLowerCase().includes('hydraulic')) ||
                provider.specializations?.some((spec) => spec && spec.toLowerCase().includes('hydraulic'))
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
        provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.services?.some((service) => service && service.toLowerCase().includes(searchTerm.toLowerCase())) ||
        provider.specializations?.some((spec) => spec && spec.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'all' || provider.type === selectedType;
      const matchesPricing = selectedPricing === 'all' || provider.pricing === selectedPricing;
      const matchesDistance = !provider.distance || provider.distance <= maxDistance;
      const matchesServiceType =
        selectedServiceTypes.includes('all') ||
        selectedServiceTypes.some((serviceType) => {
          switch (serviceType) {
            case 'mechanics':
              return provider.services?.some(
                (service) =>
                  service &&
                  (service.toLowerCase().includes('repair') ||
                    service.toLowerCase().includes('maintenance') ||
                    service.toLowerCase().includes('auto') ||
                    service.toLowerCase().includes('fleet'))
              );
            case 'welders':
              return (
                provider.services?.some(
                  (service) => service && (service.toLowerCase().includes('welding') || service.toLowerCase().includes('fabrication'))
                ) ||
                provider.specializations?.some(
                  (spec) => spec && (spec.toLowerCase().includes('welding') || spec.toLowerCase().includes('fabrication'))
                )
              );
            case 'engineers':
              return (
                provider.services?.some(
                  (service) =>
                    service &&
                    (service.toLowerCase().includes('engineering') ||
                      service.toLowerCase().includes('systems') ||
                      service.toLowerCase().includes('design'))
                ) ||
                provider.specializations?.some(
                  (spec) => spec && (spec.toLowerCase().includes('engineering') || spec.toLowerCase().includes('technical'))
                )
              );
            case 'electrical':
              return (
                provider.services?.some(
                  (service) =>
                    service &&
                    (service.toLowerCase().includes('electrical') ||
                      service.toLowerCase().includes('power') ||
                      service.toLowerCase().includes('generator'))
                ) ||
                provider.specializations?.some(
                  (spec) =>
                    spec &&
                    (spec.toLowerCase().includes('electrical') ||
                      spec.toLowerCase().includes('power') ||
                      spec.toLowerCase().includes('generator'))
                )
              );
            case 'hydraulics':
              return (
                provider.services?.some((service) => service && service.toLowerCase().includes('hydraulic')) ||
                provider.specializations?.some((spec) => spec && spec.toLowerCase().includes('hydraulic'))
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
          <p className="text-muted-foreground">
            {userLocation
              ? 'Maintenance and repair companies near your location'
              : 'Find maintenance and repair companies in your area'
            }
          </p>
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

      {/* Location Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Location</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Location</label>
                <Select
                  value={formData.location}
                  onValueChange={handleCitySelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city or use your location" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAJOR_CITIES.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="flex items-center gap-2"
              >
                {locationLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <Locate className="h-4 w-4" />
                )}
                Use My Location
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Service Type</label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Search Radius</label>
                <Select
                  value={formData.radius}
                  onValueChange={(value) => setFormData({ ...formData, radius: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 miles</SelectItem>
                    <SelectItem value="25">25 miles</SelectItem>
                    <SelectItem value="50">50 miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={!formData.lat || !formData.lng}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Providers
                </Button>
              </div>
            </div>
          </form>

          {userLocation && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Locate className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
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
                    <SelectItem value="50">Within 50 miles</SelectItem>
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
            <ServiceProviderMap
              providers={filteredProviders}
              selectedServiceTypes={selectedServiceTypes}
              userLocation={userLocation}
            />
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
                  {!userLocation && (
                    <Button
                      onClick={getCurrentLocation}
                      className="mt-4"
                      disabled={locationLoading}
                    >
                      <Locate className="h-4 w-4 mr-2" />
                      Use My Location
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredProviders.map((provider, index) => (
              <Card key={provider.placeId || provider.id || `provider-${index}`} className="hover:shadow-md transition-shadow">
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
                          {provider.subscriptionTier && provider.subscriptionTier !== 'none' && provider.subscriptionTier !== '' && (
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
                      {provider.services?.slice(0, 4).map((service, index) => (
                        service && (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        )
                      ))}
                      {provider.services && provider.services.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{provider.services.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  {provider.specializations && provider.specializations.length > 0 && (
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
                  {provider.certifications && provider.certifications.length > 0 && (
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
