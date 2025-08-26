// URL and routing utilities for SEO-friendly paths
export interface RouteConfig {
  path: string;
  component: string;
  seoTitle: string;
  seoDescription: string;
  priority: number;
}

// Define all application routes for sitemap generation
export const APP_ROUTES: RouteConfig[] = [
  {
    path: '/',
    component: 'AssetsView',
    seoTitle: 'Asset Management Dashboard | Maintenance Manager',
    seoDescription: 'Professional asset management platform for tracking equipment and scheduling maintenance.',
    priority: 1.0
  },
  {
    path: '/assets',
    component: 'AssetsView',
    seoTitle: 'Asset Management - Track Equipment & Facilities | Maintenance Manager',
    seoDescription: 'Comprehensive asset tracking with FMEA analysis, maintenance scheduling, and performance monitoring.',
    priority: 0.9
  },
  {
    path: '/tasks',
    component: 'TaskListView',
    seoTitle: 'Maintenance Tasks & Work Orders | Maintenance Manager',
    seoDescription: 'Manage maintenance tasks, work orders, and preventive maintenance schedules efficiently.',
    priority: 0.8
  },
  {
    path: '/providers',
    component: 'ProvidersView',
    seoTitle: 'Find Maintenance Service Providers | Maintenance Manager',
    seoDescription: 'Connect with certified maintenance service providers. Compare quotes, ratings, and book services.',
    priority: 0.9
  },
  {
    path: '/ai-assistant',
    component: 'AIAssistantView',
    seoTitle: 'AI-Powered Maintenance Assistant | Maintenance Manager',
    seoDescription: 'Get intelligent maintenance recommendations and automated analysis with our AI assistant.',
    priority: 0.7
  },
  {
    path: '/account',
    component: 'AccountView',
    seoTitle: 'Account Settings & Subscription | Maintenance Manager',
    seoDescription: 'Manage your account settings, subscription, and billing information.',
    priority: 0.5
  }
];

// Service provider routes
export const SERVICE_PROVIDER_ROUTES: RouteConfig[] = [
  {
    path: '/provider/dashboard',
    component: 'ServiceProviderDashboardView',
    seoTitle: 'Service Provider Dashboard | Maintenance Manager',
    seoDescription: 'Manage your maintenance service business, view requests, and track performance.',
    priority: 0.8
  },
  {
    path: '/provider/requests',
    component: 'ServiceRequestsView',
    seoTitle: 'Service Requests & Opportunities | Maintenance Manager',
    seoDescription: 'View and respond to maintenance service requests from local businesses.',
    priority: 0.8
  },
  {
    path: '/provider/profile',
    component: 'ServiceProviderProfileView',
    seoTitle: 'Service Provider Profile | Maintenance Manager',
    seoDescription: 'Manage your service provider profile, certifications, and service areas.',
    priority: 0.7
  }
];

// Generate location-based routes for SEO
export const generateLocationRoutes = (locations: string[], services: string[]): RouteConfig[] => {
  const routes: RouteConfig[] = [];

  // Location-only routes
  locations.forEach(location => {
    routes.push({
      path: `/providers/${location.toLowerCase().replace(/\s+/g, '-')}`,
      component: 'ProvidersView',
      seoTitle: `Maintenance Service Providers in ${location} | Maintenance Manager`,
      seoDescription: `Find certified maintenance service providers in ${location}. Compare local experts, read reviews, and book services.`,
      priority: 0.7
    });
  });

  // Service-only routes
  services.forEach(service => {
    routes.push({
      path: `/providers/${service.toLowerCase().replace(/\s+/g, '-')}`,
      component: 'ProvidersView',
      seoTitle: `${service} Services & Providers | Maintenance Manager`,
      seoDescription: `Professional ${service.toLowerCase()} services. Find certified providers, compare quotes, and schedule maintenance.`,
      priority: 0.8
    });
  });

  // Combined location + service routes
  locations.forEach(location => {
    services.forEach(service => {
      routes.push({
        path: `/providers/${service.toLowerCase().replace(/\s+/g, '-')}/${location.toLowerCase().replace(/\s+/g, '-')}`,
        component: 'ProvidersView',
        seoTitle: `${service} Services in ${location} | Maintenance Manager`,
        seoDescription: `Find ${service.toLowerCase()} providers in ${location}. Local certified professionals for your maintenance needs.`,
        priority: 0.6
      });
    });
  });

  return routes;
};

// URL parameter parsing utilities
export const parseProviderFilters = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  
  // Remove 'providers' from the beginning
  if (segments[0] === 'providers') {
    segments.shift();
  }

  // Common service types
  const serviceTypes = [
    'hvac', 'plumbing', 'electrical', 'general-maintenance',
    'landscaping', 'cleaning', 'security', 'fire-safety'
  ];

  // Common locations (this would be populated from your data)
  const locations = [
    'new-york', 'los-angeles', 'chicago', 'houston', 'phoenix',
    'philadelphia', 'san-antonio', 'san-diego', 'dallas', 'san-jose'
  ];

  let serviceFilter = '';
  let locationFilter = '';

  segments.forEach(segment => {
    if (serviceTypes.includes(segment)) {
      serviceFilter = segment.replace('-', ' ');
    } else if (locations.includes(segment)) {
      locationFilter = segment.replace('-', ' ');
    }
  });

  return { serviceFilter, locationFilter };
};

// Generate breadcrumb data for SEO
export const generateBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: 'Home', url: '/', position: 1 }
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Format segment name
    let name = segment.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Special cases
    if (segment === 'providers') name = 'Service Providers';
    if (segment === 'ai-assistant') name = 'AI Assistant';
    
    breadcrumbs.push({
      name,
      url: currentPath,
      position: index + 2
    });
  });

  return breadcrumbs;
};

// Structured data for breadcrumbs
export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string, position: number}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map(crumb => ({
      "@type": "ListItem",
      "position": crumb.position,
      "name": crumb.name,
      "item": `https://caseyuptime.com${crumb.url}`
    }))
  };
};

// Robot.txt content generator
export const generateRobotsTxt = (baseUrl: string = 'https://caseyuptime.com') => {
  return `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin
Disallow: /account
Disallow: /provider/account

# Allow important pages
Allow: /providers
Allow: /auth
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1`;
};