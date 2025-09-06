// frontend/src/components/wrappers/AssetDetailWrappers.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AssetDetailView } from '../views/AssetDetailView';
import { maintenanceApi } from '../../../services/api';
import { NotificationIntegration } from '../../utils/notificationIntegration';

// Component to handle individual asset detail
export function AssetDetailWrapper({
  assets,
  fmeaData,
  rcaData,
  maintenanceData,
  setMaintenanceData,
  setAssets,
  setFmeaData,
  setRcaData
}) {
  const { id, assetId } = useParams(); // Try both id and assetId
  const navigate = useNavigate();

  // Add debugging
  console.log('AssetDetailWrapper Debug:', {
    urlParams: { id, assetId },
    finalId: id || assetId,
    finalIdParsed: parseInt((id || assetId) || '0'),
    assetsArray: assets,
    assetsLength: assets?.length,
    assetIds: assets?.map(a => ({ id: a.id, type: typeof a.id, name: a.name })),
    assets: assets
  });

  const finalId = id || assetId;
  const asset = assets?.find(a => a.id === parseInt(finalId || '0'));

  console.log('Asset lookup result:', {
    searchingForId: parseInt(finalId || '0'),
    foundAsset: asset,
    assetName: asset?.name
  });

  if (!asset) {
    return (
      <div className="p-6">
        <h2>Asset not found</h2>
        <p>Looking for asset ID: {finalId}</p>
        <p>Available assets: {assets?.length || 0}</p>
        <Button onClick={() => navigate('/')}>Back to Assets</Button>
      </div>
    );
  }

  return (
    <AssetDetailView
      asset={asset}
      fmeaData={fmeaData}
      rcaData={rcaData}
      maintenanceData={maintenanceData}
      defaultTab="overview"
      onBack={() => navigate('/')}
      onAddRCA={(rca) => {
        const newRCA = { ...rca, id: Date.now() };
        setRcaData((prev) => [...prev, newRCA]);
      }}
      onUpdateRCA={(updatedRCA) => {
        setRcaData((prev) =>
          prev.map(rca => rca.id === updatedRCA.id ? updatedRCA : rca)
        );
      }}
      onAddMaintenanceTask={async (task) => {
        try {
          const newTask = await maintenanceApi.createTask({
            ...task,
            assetId: asset.id
          });
          setMaintenanceData((prev) => [...prev, newTask]);
          await NotificationIntegration.notifyTaskAssignment(newTask, asset);
        } catch (error) {
          console.error('Error creating maintenance task:', error);
        }
      }}
      onEditAsset={(updatedAsset) => {
        setAssets((prev) => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
      }}
      onAddFMEA={(fmeaEntries) => {
        const newEntries = fmeaEntries.map(entry => ({
          ...entry,
          id: Date.now() + Math.random(),
        }));
        setFmeaData((prev) => [...prev, ...newEntries]);
      }}
      onAddProcedure={(procedure) => {
        console.log('Procedure created:', procedure);
        // TODO: Add procedure to state when we implement backend
      }}
    />
  );
}

// Component to handle asset detail with maintenance tab navigation
export function AssetDetailMaintenanceWrapper({
  assets,
  fmeaData,
  rcaData,
  maintenanceData,
  setMaintenanceData,
  setAssets,
  setFmeaData,
  setRcaData
}) {
  const { id, assetId } = useParams();
  const navigate = useNavigate();

  const finalId = id || assetId;
  const asset = assets?.find(a => a.id === parseInt(finalId || '0'));

  if (!asset) {
    return (
      <div className="p-6">
        <h2>Asset not found</h2>
        <p>Looking for asset ID: {finalId}</p>
        <p>Available assets: {assets?.length || 0}</p>
        <Button onClick={() => navigate('/')}>Back to Assets</Button>
      </div>
    );
  }

  return (
    <AssetDetailView
      asset={asset}
      fmeaData={fmeaData}
      rcaData={rcaData}
      maintenanceData={maintenanceData}
      defaultTab="maintenance"
      onBack={() => navigate('/')}
      onAddRCA={(rca) => {
        const newRCA = { ...rca, id: Date.now() };
        setRcaData((prev) => [...prev, newRCA]);
      }}
      onUpdateRCA={(updatedRCA) => {
        setRcaData((prev) =>
          prev.map(rca => rca.id === updatedRCA.id ? updatedRCA : rca)
        );
      }}
      onAddMaintenanceTask={async (task) => {
        try {
          const newTask = await maintenanceApi.createTask({
            ...task,
            assetId: asset.id
          });
          setMaintenanceData((prev) => [...prev, newTask]);
          await NotificationIntegration.notifyTaskAssignment(newTask, asset);
        } catch (error) {
          console.error('Error creating maintenance task:', error);
        }
      }}
      onEditAsset={(updatedAsset) => {
        setAssets((prev) => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
      }}
      onAddFMEA={(fmeaEntries) => {
        const newEntries = fmeaEntries.map(entry => ({
          ...entry,
          id: Date.now() + Math.random(),
        }));
        setFmeaData((prev) => [...prev, ...newEntries]);
      }}
      onAddProcedure={(procedure) => {
        console.log('Procedure created:', procedure);
        // TODO: Add procedure to state when we implement backend
      }}
    />
  );
}
