import React from 'react';

interface DashboardProps {
  assets: any[];
  maintenanceData: any[];
}

export default function Dashboard({ assets, maintenanceData }: DashboardProps) {
  return (
    <div className="p-6">
      <h2>Dashboard</h2>
      <p>View your dashboard here.</p>
    </div>
  );
}
