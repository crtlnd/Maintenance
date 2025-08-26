import React, { useState } from 'react';
import { FileText, CheckCircle, Circle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';

interface SEOTaskProps {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'completed' | 'pending' | 'in-progress';
  files: string[];
  codeExample?: string;
  testingSteps?: string[];
}

function SEOTask({ title, description, priority, status, files, codeExample, testingSteps }: SEOTaskProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Circle className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <Circle className="h-4 w-4 text-gray-400" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
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

  return (
    <Card className="mb-4">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Badge className={getPriorityColor()} variant="secondary">
            {priority}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Files to modify:</h4>
              <div className="flex flex-wrap gap-1">
                {files.map((file, index) => (
                  <code key={index} className="text-xs bg-muted px-2 py-1 rounded">
                    {file}
                  </code>
                ))}
              </div>
            </div>

            {codeExample && (
              <div>
                <h4 className="text-sm font-medium mb-2">Code example:</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  <code>{codeExample}</code>
                </pre>
              </div>
            )}

            {testingSteps && (
              <div>
                <h4 className="text-sm font-medium mb-2">Testing steps:</h4>
                <ol className="text-sm space-y-1">
                  {testingSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function SEOImplementationGuide() {
  const phase1Tasks: SEOTaskProps[] = [
    {
      title: "Dynamic Meta Tags Implementation",
      description: "Implement dynamic meta tags for all application views",
      priority: "high",
      status: "completed",
      files: ["App.tsx", "utils/seo.tsx", "components/auth/AuthPage.tsx"],
      codeExample: `// In App.tsx
const getSEOData = () => {
  switch (currentView) {
    case 'assets':
      return generateAssetManagementSEO();
    case 'providers':
      return generateProviderListingSEO();
    // ... other cases
  }
};

return (
  <>
    <SEOHead {...getSEOData()} />
    {/* App content */}
  </>
);`,
      testingSteps: [
        "Navigate between different views",
        "Check document title updates in browser tab",
        "Use browser dev tools to inspect meta tags",
        "Verify Open Graph tags with Facebook debugger"
      ]
    },
    {
      title: "Google Analytics 4 Integration",
      description: "Add GA4 tracking script and configure page view tracking",
      priority: "high",
      status: "pending",
      files: ["index.html", "utils/analytics.ts"],
      codeExample: `<!-- In index.html head section -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>`,
      testingSteps: [
        "Replace GA_MEASUREMENT_ID with actual tracking ID",
        "Test page view tracking in GA4 real-time reports",
        "Verify custom events are firing correctly",
        "Check conversion goals are properly configured"
      ]
    },
    {
      title: "Structured Data for Service Providers",
      description: "Add LocalBusiness schema markup for service provider listings",
      priority: "high",
      status: "completed",
      files: ["components/views/SEOProvidersView.tsx", "utils/seo.tsx"],
      codeExample: `const providerSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": provider.name,
  "description": provider.description,
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": provider.rating,
    "reviewCount": provider.reviewCount
  }
};`,
      testingSteps: [
        "Use Google's Structured Data Testing Tool",
        "Verify LocalBusiness markup is valid",
        "Check that ratings and reviews appear correctly",
        "Test rich snippets in search results"
      ]
    },
    {
      title: "Sitemap Generation",
      description: "Create automated sitemap generation for all routes and provider pages",
      priority: "medium",
      status: "completed",
      files: ["utils/sitemap-generator.ts", "utils/routing.ts"],
      codeExample: `// Generate sitemap XML
const generator = new SitemapGenerator('https://caseyuptime.com');
const sitemapXML = generator.generateXML();
const robotsTxt = generator.generateRobotsTxt();`,
      testingSteps: [
        "Generate sitemap XML file",
        "Validate XML format",
        "Submit sitemap to Google Search Console",
        "Verify all important pages are included"
      ]
    },
    {
      title: "Robots.txt Configuration",
      description: "Create robots.txt file with proper crawling instructions",
      priority: "medium",
      status: "pending",
      files: ["public/robots.txt"],
      codeExample: `User-agent: *
Allow: /

# Disallow private areas
Disallow: /account
Disallow: /admin

# Sitemap location
Sitemap: https://caseyuptime.com/sitemap.xml`,
      testingSteps: [
        "Place robots.txt in public directory",
        "Test robots.txt file is accessible at /robots.txt",
        "Verify private areas are properly disallowed",
        "Check sitemap reference is correct"
      ]
    },
    {
      title: "Core Web Vitals Monitoring",
      description: "Implement performance monitoring and optimization",
      priority: "medium",
      status: "pending",
      files: ["utils/performance.ts", "App.tsx"],
      codeExample: `// Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);`,
      testingSteps: [
        "Install web-vitals package",
        "Implement performance monitoring",
        "Set up performance budget alerts",
        "Monitor Core Web Vitals in production"
      ]
    }
  ];

  const toolsAndResources = [
    {
      name: "Google Search Console",
      description: "Monitor search performance and submit sitemaps",
      url: "https://search.google.com/search-console"
    },
    {
      name: "Google Analytics 4",
      description: "Track user behavior and conversions",
      url: "https://analytics.google.com"
    },
    {
      name: "Structured Data Testing Tool",
      description: "Validate schema markup",
      url: "https://search.google.com/test/rich-results"
    },
    {
      name: "PageSpeed Insights",
      description: "Test Core Web Vitals performance",
      url: "https://pagespeed.web.dev"
    },
    {
      name: "Facebook Sharing Debugger",
      description: "Test Open Graph tags",
      url: "https://developers.facebook.com/tools/debug"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">SEO Implementation Guide</h1>
        <p className="text-muted-foreground">
          Comprehensive guide for implementing SEO features in the Maintenance Manager application.
        </p>
      </div>

      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This guide is for development reference only. SEO annotations are visible in development mode
          to help ensure proper implementation of all SEO requirements.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="phase1" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="phase1">Phase 1 Tasks</TabsTrigger>
          <TabsTrigger value="testing">Testing & Validation</TabsTrigger>
          <TabsTrigger value="tools">Tools & Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="phase1" className="space-y-4">
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold">Phase 1: Core SEO Implementation</h2>
            <p className="text-muted-foreground">
              Essential SEO elements that must be implemented before production deployment.
            </p>
            
            {phase1Tasks.map((task, index) => (
              <SEOTask key={index} {...task} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold">Testing & Validation Checklist</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Pre-Deployment Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Meta Tags Validation</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• All pages have unique titles and descriptions</li>
                    <li>• Open Graph tags work correctly on social platforms</li>
                    <li>• Meta tags update dynamically on navigation</li>
                    <li>• Private pages have noindex tags</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Structured Data Validation</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• LocalBusiness schema is valid and complete</li>
                    <li>• Organization schema is properly configured</li>
                    <li>• Breadcrumb markup works on all pages</li>
                    <li>• Review and rating schema displays correctly</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Technical SEO</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Sitemap is accessible and contains all pages</li>
                    <li>• Robots.txt properly configured</li>
                    <li>• Canonical URLs prevent duplicate content</li>
                    <li>• Core Web Vitals meet Google standards</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold">SEO Tools & Resources</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {toolsAndResources.map((tool, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{tool.name}</CardTitle>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                    <a 
                      href={tool.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Open Tool →
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Development Commands</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    npm run build:seo
                  </code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate sitemap and robots.txt files for production
                  </p>
                </div>
                
                <div>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    npm run validate:seo
                  </code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Run SEO validation tests and structured data checks
                  </p>
                </div>
                
                <div>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    npm run performance:audit
                  </code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Run Lighthouse performance audit
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}