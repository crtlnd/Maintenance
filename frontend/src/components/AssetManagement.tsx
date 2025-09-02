
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Asset } from '../../types';

interface AssetManagementProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
}

function AssetManagement({ assets, setAssets }: AssetManagementProps) {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Asset Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Manage your assets here.</p>
          <div className="mt-4">
            {assets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assets found.</p>
            ) : (
              <ul className="space-y-2">
                {assets.map((asset) => (
                  <li key={asset.id} className="text-sm">
                    {asset.name} ({asset.type}) - {asset.location}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AssetManagement;

