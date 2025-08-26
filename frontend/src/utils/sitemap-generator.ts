// Sitemap generation utility for production deployment
import { initialServiceProviders } from '../data/initialData';
import { generateSitemapUrls, generateSitemapXML, SitemapUrl } from './seo';
import { APP_ROUTES, SERVICE_PROVIDER_ROUTES, generateLocationRoutes } from './routing';

// Common service categories for SEO
const SERVICE_CATEGORIES = [
  'HVAC',
  'Plumbing', 
  'Electrical',
  'General Maintenance',
  'Landscaping',
  'Cleaning',
  'Security Systems',
  'Fire Safety'
];

// Common locations (this would be dynamically generated from your provider data)
const MAJOR_LOCATIONS = [
  'New York',
  'Los Angeles', 
  'Chicago',
  'Houston',
  'Phoenix',
  'Philadelphia',
  'San Antonio',
  'San Diego',
  'Dallas',
  'San Jose',
  'Austin',
  'Jacksonville',
  'Fort Worth',
  'Columbus',
  'Charlotte'
];

export class SitemapGenerator {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://caseyuptime.com') {
    this.baseUrl = baseUrl;
  }

  // Generate all sitemap URLs
  generateAllUrls(): SitemapUrl[] {
    const urls: SitemapUrl[] = [];
    const currentDate = new Date().toISOString().split('T')[0];

    // Add main application routes
    APP_ROUTES.forEach(route => {
      urls.push({
        loc: `${this.baseUrl}${route.path}`,
        lastmod: currentDate,
        changefreq: this.getChangeFreq(route.path),
        priority: route.priority
      });
    });

    // Add location-based and service-based provider routes
    const locationRoutes = generateLocationRoutes(MAJOR_LOCATIONS, SERVICE_CATEGORIES);
    locationRoutes.forEach(route => {
      urls.push({
        loc: `${this.baseUrl}${route.path}`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: route.priority
      });
    });

    // Add individual provider profile pages (if they become public)
    initialServiceProviders.forEach(provider => {
      const slug = this.generateProviderSlug(provider.name, provider.id);
      urls.push({
        loc: `${this.baseUrl}/provider/${slug}`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.6
      });
    });

    // Add authentication pages
    urls.push(
      {
        loc: `${this.baseUrl}/auth/login`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.7
      },
      {
        loc: `${this.baseUrl}/auth/signup`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.7
      },
      {
        loc: `${this.baseUrl}/auth/signup/service-provider`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.7
      }
    );

    // Add blog/content pages (future)
    this.addContentPages(urls, currentDate);

    return urls.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  private getChangeFreq(path: string): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' {
    if (path === '/') return 'daily';
    if (path.includes('/providers')) return 'weekly';
    if (path.includes('/auth')) return 'monthly';
    return 'weekly';
  }

  private generateProviderSlug(name: string, id: number): string {
    return `${name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}-${id}`;
  }

  private addContentPages(urls: SitemapUrl[], currentDate: string) {
    // Future content pages for SEO
    const contentPages = [
      {
        path: '/blog',
        priority: 0.8,
        changefreq: 'weekly' as const
      },
      {
        path: '/resources',
        priority: 0.7,
        changefreq: 'monthly' as const
      },
      {
        path: '/about',
        priority: 0.6,
        changefreq: 'monthly' as const
      },
      {
        path: '/contact',
        priority: 0.7,
        changefreq: 'monthly' as const
      },
      {
        path: '/pricing',
        priority: 0.8,
        changefreq: 'weekly' as const
      },
      {
        path: '/help',
        priority: 0.6,
        changefreq: 'monthly' as const
      }
    ];

    contentPages.forEach(page => {
      urls.push({
        loc: `${this.baseUrl}${page.path}`,
        lastmod: currentDate,
        changefreq: page.changefreq,
        priority: page.priority
      });
    });
  }

  // Generate sitemap XML
  generateXML(): string {
    const urls = this.generateAllUrls();
    return generateSitemapXML(urls);
  }

  // Generate sitemap index for large sites
  generateSitemapIndex(): string {
    const sitemaps = [
      {
        loc: `${this.baseUrl}/sitemap-main.xml`,
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        loc: `${this.baseUrl}/sitemap-providers.xml`,
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        loc: `${this.baseUrl}/sitemap-locations.xml`,
        lastmod: new Date().toISOString().split('T')[0]
      }
    ];

    const sitemapElements = sitemaps.map(sitemap => {
      return `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
  }

  // Generate robots.txt content
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Disallow private areas
Disallow: /account
Disallow: /admin
Disallow: /provider/account

# Allow important SEO pages
Allow: /providers
Allow: /auth
Allow: /

# Sitemap location
Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1

# Block specific bots if needed
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /`;
  }

  // Generate provider-specific structured data
  generateProviderStructuredData(provider: any) {
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": provider.name,
      "description": provider.description,
      "image": provider.logo || `${this.baseUrl}/images/provider-default.jpg`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": provider.address?.street,
        "addressLocality": provider.location,
        "addressRegion": provider.state,
        "postalCode": provider.address?.zipCode,
        "addressCountry": "US"
      },
      "geo": provider.coordinates ? {
        "@type": "GeoCoordinates",
        "latitude": provider.coordinates.lat,
        "longitude": provider.coordinates.lng
      } : undefined,
      "telephone": provider.contact?.phone,
      "email": provider.contact?.email,
      "url": provider.contact?.website,
      "aggregateRating": provider.rating ? {
        "@type": "AggregateRating",
        "ratingValue": provider.rating,
        "reviewCount": provider.reviewCount || 0,
        "bestRating": 5,
        "worstRating": 1
      } : undefined,
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": provider.coordinates?.lat,
          "longitude": provider.coordinates?.lng
        },
        "geoRadius": provider.serviceRadius || "25 miles"
      },
      "priceRange": provider.priceRange || "$$",
      "openingHours": provider.hours || "Mo-Fr 08:00-17:00",
      "paymentAccepted": "Cash, Credit Card, Check",
      "currenciesAccepted": "USD",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Maintenance Services",
        "itemListElement": provider.specialties?.map((specialty: string, index: number) => ({
          "@type": "OfferCatalog",
          "name": specialty,
          "position": index + 1
        }))
      }
    };
  }

  // For use in deployment scripts
  static async generateForDeployment(baseUrl: string) {
    const generator = new SitemapGenerator(baseUrl);
    
    return {
      sitemap: generator.generateXML(),
      sitemapIndex: generator.generateSitemapIndex(),
      robotsTxt: generator.generateRobotsTxt(),
      urls: generator.generateAllUrls()
    };
  }
}

// Export for use in build process
export const createSitemapFiles = async (outputDir: string, baseUrl: string) => {
  const generator = new SitemapGenerator(baseUrl);
  const fs = await import('fs');
  const path = await import('path');
  
  // Generate files
  const sitemap = generator.generateXML();
  const robotsTxt = generator.generateRobotsTxt();
  
  // Write files (this would be used in a Node.js build process)
  const sitemapPath = path.join(outputDir, 'sitemap.xml');
  const robotsPath = path.join(outputDir, 'robots.txt');
  
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
  
  console.log(`✅ Generated sitemap with ${generator.generateAllUrls().length} URLs`);
  console.log(`✅ Generated robots.txt`);
  
  return {
    sitemapPath,
    robotsPath,
    urlCount: generator.generateAllUrls().length
  };
};