import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Phone, Mail, ExternalLink, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SEOHead, generateProviderListingSEO } from '../../utils/seo';

interface Provider {
  id: number;
  name: string;
  location: string;
  state: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  description: string;
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  priceRange: string;
  serviceArea: string;
  certifications: string[];
  availability: 'available' | 'busy' | 'unavailable';
  responseTime: string;
}

interface SEOProvidersViewProps {
  providers: Provider[];
}

export function SEOProvidersView({ providers }: SEOProvidersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [filteredProviders, setFilteredProviders] = useState(providers);

  // Extract unique locations and services for filters
  const locations = [...new Set(providers.map(p => p.location))];
  const services = [...new Set(providers.flatMap(p => p.specialties))];

  useEffect(() => {
    let filtered = providers;

    if (searchTerm) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        provider.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(provider => provider.location === locationFilter);
    }

    if (serviceFilter) {
      filtered = filtered.filter(provider => provider.specialties.includes(serviceFilter));
    }

    setFilteredProviders(filtered);
  }, [searchTerm, locationFilter, serviceFilter, providers]);

  // Generate SEO data based on current filters
  const seoData = generateProviderListingSEO(locationFilter, serviceFilter);

  // Update structured data with actual providers
  const enhancedStructuredData = {
    ...seoData.structuredData,
    numberOfItems: filteredProviders.length,
    itemListElement: filteredProviders.slice(0, 10).map((provider, index) => ({
      "@type": "LocalBusiness",
      "position": index + 1,
      "name": provider.name,
      "description": provider.description,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": provider.location,
        "addressRegion": provider.state,
        "addressCountry": "US"
      },
      "telephone": provider.contact.phone,
      "email": provider.contact.email,
      "url": provider.contact.website,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": provider.rating,
        "reviewCount": provider.reviewCount
      },
      "serviceArea": provider.serviceArea,
      "priceRange": provider.priceRange
    }))
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        structuredData={enhancedStructuredData}
        canonicalUrl={`https://caseyuptime.com/providers${locationFilter ? `/${locationFilter.toLowerCase().replace(' ', '-')}` : ''}${serviceFilter ? `/${serviceFilter.toLowerCase().replace(' ', '-')}` : ''}`}
      />

      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Find Maintenance Service Providers
                {locationFilter && ` in ${locationFilter}`}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
                Connect with certified professionals for all your maintenance needs. 
                Compare ratings, get quotes, and book services with trusted providers in your area.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search providers, services, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Services</SelectItem>
                    {services.map(service => (
                      <SelectItem key={service} value={service}>{service}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredProviders.length} of {providers.length} providers
                {(locationFilter || serviceFilter) && (
                  <span className="ml-2">
                    {locationFilter && `in ${locationFilter}`}
                    {locationFilter && serviceFilter && ' for '}
                    {serviceFilter && `${serviceFilter} services`}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Provider Grid */}
          {filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">No providers found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map((provider) => (
                <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{provider.name}</CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground truncate">
                            {provider.location}, {provider.state}
                          </span>
                        </div>
                      </div>
                      <Badge className={getAvailabilityColor(provider.availability)}>
                        {provider.availability}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {renderStars(provider.rating)}
                      </div>
                      <span className="text-sm font-medium">{provider.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({provider.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1">
                      {provider.specialties.slice(0, 3).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {provider.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{provider.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {provider.description}
                    </p>

                    {/* Key Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Price Range:</span>
                        <span className="font-medium">{provider.priceRange}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Response Time:</span>
                        <span className="font-medium">{provider.responseTime}</span>
                      </div>
                    </div>

                    {/* Contact Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      {provider.contact.website && (
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More (for pagination) */}
          {filteredProviders.length >= 12 && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Load More Providers
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}