import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
  noIndex?: boolean;
}

export function SEOHead({
  title = 'Maintenance Manager - Professional Asset Maintenance Platform',
  description = 'Comprehensive maintenance management platform connecting businesses with certified service providers. Manage assets, schedule maintenance, and find local experts.',
  keywords = 'maintenance management, asset management, service providers, facility maintenance, equipment maintenance, preventive maintenance',
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage = '/images/og-default.jpg',
  ogType = 'website',
  structuredData,
  noIndex = false
}: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tag
    const updateMetaTag = (attribute: string, value: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper function to update or create link tag
    const updateLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Basic meta tags
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);
    updateMetaTag('name', 'viewport', 'width=device-width, initial-scale=1');
    
    // Robots meta tag
    if (noIndex) {
      updateMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      updateMetaTag('name', 'robots', 'index, follow');
    }

    // Open Graph tags
    updateMetaTag('property', 'og:title', ogTitle || title);
    updateMetaTag('property', 'og:description', ogDescription || description);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:site_name', 'Maintenance Manager');

    // Twitter Card tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', ogTitle || title);
    updateMetaTag('name', 'twitter:description', ogDescription || description);
    updateMetaTag('name', 'twitter:image', ogImage);

    // Canonical URL
    if (canonicalUrl) {
      updateLinkTag('canonical', canonicalUrl);
    }

    // Structured data
    if (structuredData) {
      let scriptElement = document.querySelector('#structured-data') as HTMLScriptElement;
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'structured-data';
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function to remove structured data if component unmounts
    return () => {
      if (structuredData) {
        const scriptElement = document.querySelector('#structured-data');
        if (scriptElement) {
          scriptElement.remove();
        }
      }
    };
  }, [title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogImage, ogType, structuredData, noIndex]);

  return null; // This component doesn't render anything visible
}

// SEO utility functions for different page types
export const generateProviderListingSEO = (location?: string, serviceType?: string) => {
  const locationText = location ? ` in ${location}` : '';
  const serviceText = serviceType ? ` - ${serviceType}` : '';
  
  return {
    title: `Find Maintenance Service Providers${locationText}${serviceText} | Maintenance Manager`,
    description: `Connect with certified maintenance service providers${locationText}. Compare quotes, read reviews, and book${serviceText} services. Professional maintenance made easy.`,
    keywords: `maintenance services${locationText}, service providers, facility maintenance, equipment repair, preventive maintenance${serviceText}`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `Maintenance Service Providers${locationText}`,
      "description": `Directory of certified maintenance service providers${locationText}`,
      "numberOfItems": "50+", // This would be dynamic
      "itemListElement": [] // This would be populated with actual providers
    }
  };
};

export const generateProviderProfileSEO = (provider: any) => {
  return {
    title: `${provider.name} - Professional Maintenance Services | Maintenance Manager`,
    description: `${provider.name} offers professional maintenance services in ${provider.location}. Specializing in ${provider.specialties?.join(', ')}. View ratings, reviews, and contact information.`,
    keywords: `${provider.name}, maintenance services, ${provider.location}, ${provider.specialties?.join(', ')}`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": provider.name,
      "description": provider.description,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": provider.location,
        "addressRegion": provider.state,
        "addressCountry": "US"
      },
      "telephone": provider.contact?.phone,
      "email": provider.contact?.email,
      "aggregateRating": provider.rating ? {
        "@type": "AggregateRating",
        "ratingValue": provider.rating,
        "reviewCount": provider.reviewCount || 0
      } : undefined,
      "serviceArea": provider.serviceArea || provider.location,
      "priceRange": provider.priceRange || "$$"
    }
  };
};

export const generateAssetManagementSEO = () => {
  return {
    title: 'Asset Management Dashboard - Track & Maintain Equipment | Maintenance Manager',
    description: 'Professional asset management platform for tracking equipment, scheduling maintenance, and managing facility operations. FMEA, RCA, and predictive maintenance tools.',
    keywords: 'asset management, equipment tracking, maintenance scheduling, FMEA, RCA, facility management, preventive maintenance',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Maintenance Manager",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "description": "Comprehensive maintenance management platform for asset tracking and service provider connections",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free tier available"
      }
    }
  };
};

// Sitemap generation utility
export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemapUrls = (baseUrl: string = 'https://caseyuptime.com'): SitemapUrl[] => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return [
    // Main application pages
    {
      loc: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${baseUrl}/providers`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.9
    },
    {
      loc: `${baseUrl}/assets`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/auth/login`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.7
    },
    {
      loc: `${baseUrl}/auth/signup`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.7
    },
    
    // Service category pages (would be dynamically generated)
    {
      loc: `${baseUrl}/providers/hvac`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/providers/plumbing`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/providers/electrical`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/providers/general-maintenance`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.8
    },
    
    // Location-based pages (would be dynamically generated)
    {
      loc: `${baseUrl}/providers/new-york`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.7
    },
    {
      loc: `${baseUrl}/providers/los-angeles`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.7
    },
    {
      loc: `${baseUrl}/providers/chicago`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.7
    },
    
    // Combined location + service pages
    {
      loc: `${baseUrl}/providers/hvac/new-york`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.6
    },
    {
      loc: `${baseUrl}/providers/plumbing/los-angeles`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.6
    }
  ];
};

export const generateSitemapXML = (urls: SitemapUrl[]): string => {
  const urlElements = urls.map(url => {
    return `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
};