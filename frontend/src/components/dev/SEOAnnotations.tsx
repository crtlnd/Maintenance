import React, { useState } from 'react';
import { Eye, EyeOff, Search, FileText, BarChart3, MapPin, Tag, Globe, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface SEOAnnotationProps {
  type: 'meta' | 'analytics' | 'sitemap' | 'schema' | 'robots' | 'performance';
  title: string;
  description: string;
  requirements: string[];
  location: string;
  priority: 'high' | 'medium' | 'low';
  status?: 'implemented' | 'pending' | 'review';
  className?: string;
}

export function SEOAnnotation({
  type,
  title,
  description,
  requirements,
  location,
  priority,
  status = 'pending',
  className = ''
}: SEOAnnotationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeIcon = () => {
    switch (type) {
      case 'meta': return <Tag className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'sitemap': return <MapPin className="h-4 w-4" />;
      case 'schema': return <FileText className="h-4 w-4" />;
      case 'robots': return <Search className="h-4 w-4" />;
      case 'performance': return <Globe className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'meta': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'analytics': return 'bg-green-50 text-green-700 border-green-200';
      case 'sitemap': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'schema': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'robots': return 'bg-red-50 text-red-700 border-red-200';
      case 'performance': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'implemented': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`border-dashed border-2 ${getTypeColor()} ${className}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-black/5 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTypeIcon()}
                <CardTitle className="text-sm font-medium">SEO: {title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor()} variant="secondary">
                  {priority}
                </Badge>
                <Badge className={getStatusColor()} variant="secondary">
                  {status}
                </Badge>
                {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{description}</p>
              
              <div className="space-y-2">
                <div className="text-xs font-medium text-foreground">Location:</div>
                <code className="text-xs bg-black/10 px-2 py-1 rounded">{location}</code>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-foreground">Requirements:</div>
                <ul className="space-y-1">
                  {requirements.map((req, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                      <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Global SEO Annotations Toggle
export function SEOAnnotationsToggle() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('seo-annotations-visible') !== 'false'; // Default to true
    }
    return true;
  });

  const toggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    if (typeof window !== 'undefined') {
      localStorage.setItem('seo-annotations-visible', newVisibility.toString());
      // Toggle CSS class on body
      document.body.classList.toggle('hide-seo-annotations', !newVisibility);
    }
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.toggle('hide-seo-annotations', !isVisible);
    }
  }, [isVisible]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* SEO Dev Mode Status Indicator */}
      {isVisible && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-pulse">
          🔍 SEO Dev Mode Active
        </div>
      )}
      
      {/* Toggle Button */}
      <Button
        onClick={toggleVisibility}
        variant={isVisible ? "default" : "outline"}
        size="sm"
        className={`shadow-lg transition-all duration-200 ${
          isVisible 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0' 
            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
        }`}
      >
        {isVisible ? (
          <>
            <X className="h-4 w-4 mr-2" />
            Exit SEO Mode
          </>
        ) : (
          <>
            <Search className="h-4 w-4 mr-2" />
            SEO Annotations
          </>
        )}
      </Button>
      
      {/* Helper Text */}
      {!isVisible && (
        <div className="text-xs text-muted-foreground bg-white px-2 py-1 rounded shadow-sm border">
          Click to view SEO development notes
        </div>
      )}
    </div>
  );
}

// Predefined SEO annotations for different parts of the app
export const SEO_ANNOTATIONS = {
  APP_ROOT: {
    type: 'meta' as const,
    title: 'App Root Meta Tags',
    description: 'Dynamic meta tags based on current view with fallback defaults',
    requirements: [
      'Dynamic title based on currentView state',
      'View-specific descriptions and keywords',
      'Open Graph tags for social sharing',
      'Twitter Card metadata',
      'Canonical URLs for each view'
    ],
    location: 'App.tsx - MainApp component return statement',
    priority: 'high' as const,
    status: 'implemented' as const
  },
  
  AUTH_PAGE: {
    type: 'meta' as const,
    title: 'Authentication Pages Meta Tags',
    description: 'Specific meta tags for login/signup pages with proper indexing',
    requirements: [
      'Separate meta tags for login vs signup',
      'Service provider signup gets different meta tags',
      'No-index for certain auth states',
      'Structured data for organization'
    ],
    location: 'AuthPage.tsx - conditional rendering',
    priority: 'high' as const,
    status: 'implemented' as const
  },

  PROVIDER_LISTINGS: {
    type: 'schema' as const,
    title: 'Provider Listings Schema',
    description: 'Local business schema markup for service provider listings',
    requirements: [
      'LocalBusiness schema for each provider',
      'Aggregate rating markup',
      'Service area definitions',
      'Contact information structure',
      'Review schema integration'
    ],
    location: 'SEOProvidersView.tsx - provider cards',
    priority: 'high' as const,
    status: 'implemented' as const
  },

  SITEMAP_GENERATION: {
    type: 'sitemap' as const,
    title: 'Dynamic Sitemap Generation',
    description: 'Automated sitemap creation for all routes and provider pages',
    requirements: [
      'Main application routes',
      'Location-based provider pages',
      'Service category pages',
      'Individual provider profiles',
      'Proper priority and change frequency'
    ],
    location: 'utils/sitemap-generator.ts',
    priority: 'medium' as const,
    status: 'implemented' as const
  },

  ANALYTICS_INTEGRATION: {
    type: 'analytics' as const,
    title: 'Google Analytics 4',
    description: 'GA4 integration with proper event tracking',
    requirements: [
      'GA4 script in document head',
      'Page view tracking for route changes',
      'Custom events for key actions',
      'Goal tracking for conversions',
      'E-commerce tracking for subscriptions'
    ],
    location: 'index.html or App.tsx head section',
    priority: 'high' as const,
    status: 'pending' as const
  },

  ROBOTS_TXT: {
    type: 'robots' as const,
    title: 'Robots.txt Configuration',
    description: 'Proper robots.txt for search engine crawling',
    requirements: [
      'Allow crawling of public pages',
      'Disallow private/account areas',
      'Sitemap location reference',
      'Crawl delay configuration',
      'User-agent specific rules'
    ],
    location: 'public/robots.txt',
    priority: 'medium' as const,
    status: 'pending' as const
  },

  PERFORMANCE_MONITORING: {
    type: 'performance' as const,
    title: 'Core Web Vitals',
    description: 'Performance monitoring and optimization',
    requirements: [
      'Web Vitals measurement script',
      'Image optimization checks',
      'Bundle size monitoring',
      'Lazy loading implementation',
      'Performance budget alerts'
    ],
    location: 'App.tsx and component level',
    priority: 'medium' as const,
    status: 'review' as const
  }
};