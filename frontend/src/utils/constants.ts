import { PricingTier, ServiceProviderPricingTier } from '../types';

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    plan: 'free',
    price: 0,
    assetLimit: 5,
    seatLimit: 1,
    features: [
      'Up to 5 assets',
      '1 seat',
      'Asset Dashboard',
      'Task List',
      'FMEA',
      'RCA Tools',
      'Email Notifications',
      'Maintenance Schedule'
    ]
  },
  {
    name: 'Pro',
    plan: 'pro',
    price: 20,
    assetLimit: 'unlimited',
    seatLimit: 1,
    isPopular: true,
    features: [
      'Unlimited assets',
      '1 seat',
      'Asset Dashboard',
      'Task List',
      'FMEA',
      'RCA Tools',
      'Email Notifications',
      'Maintenance Schedule'
    ]
  },
  {
    name: 'AI-Powered',
    plan: 'ai-powered',
    price: 50,
    assetLimit: 'unlimited',
    seatLimit: 1,
    features: [
      'Everything in Pro',
      'AI Insights',
      'AI Diagnosis',
      'AI Support',
      'Customized for your assets',
      'Intelligent maintenance scheduling',
      'Predictive analytics',
      'Priority support'
    ]
  }
];

export const SERVICE_PROVIDER_PRICING_TIERS: ServiceProviderPricingTier[] = [
  {
    name: 'Verified',
    plan: 'verified',
    price: 20,
    features: [
      'Service provider listing',
      'Verified badge on profile',
      'Enhanced credibility',
      'Basic profile information',
      'Contact through platform',
      'Priority in search results',
      'Customer reviews and ratings',
      'Email support'
    ]
  },
  {
    name: 'Premium',
    plan: 'premium',
    price: 100,
    isPopular: true,
    features: [
      'Everything in Verified',
      'Direct messaging with customers',
      'Lead management tools',
      'Quote request notifications',
      'Advanced analytics',
      'Priority support'
    ]
  },
  {
    name: 'Promoted',
    plan: 'promoted',
    price: 500,
    features: [
      'Everything in Premium',
      'Top placement in listings',
      'Featured provider badge',
      'Premium listing highlights',
      'Enhanced visibility',
      'Dedicated account manager',
      'Custom marketing support'
    ]
  }
];