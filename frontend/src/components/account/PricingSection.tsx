import React from 'react';
import { useAuth } from '../../utils/auth';
import { CustomerPricingSection } from './CustomerPricingSection';
import { ServiceProviderPricingSection } from './ServiceProviderPricingSection';

export function PricingSection() {
  const { user } = useAuth();

  if (!user) return null;

  // Show different pricing sections based on user type
  if (user.userType === 'service_provider') {
    return <ServiceProviderPricingSection />;
  }

  return <CustomerPricingSection />;
}