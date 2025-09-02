import React from 'react';

interface ServiceProvidersProps {
  serviceProviders: any[];
  setServiceProviders: (data: any[]) => void;
}

export default function ServiceProviders({ serviceProviders, setServiceProviders }: ServiceProvidersProps) {
  return (
    <div className="p-6">
      <h2>Service Providers</h2>
      <p>Manage service providers here.</p>
    </div>
  );
}
