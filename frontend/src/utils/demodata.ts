// Demo data creation utilities
export const demoAssets = [
  {
    name: "Hydraulic Excavator CAT 320",
    type: "Excavator",
    manufacturer: "Caterpillar",
    modelNumber: "320D2L",
    serialNumber: "CAT0320DL2024001",
    location: "Construction Site A - Building 1",
    condition: "Good" as const,
    status: "Operational" as const,
    operatingHours: 1247,
    lastMaintenance: "2024-11-15",
    nextDueDate: "2024-12-15",
    specifications: {
      power: "122 kW",
      operatingWeight: "20,300 kg",
      bucketCapacity: "1.0 m³"
    },
    purchaseDate: "2024-01-15",
    purchasePrice: 285000,
    warrantyExpiration: "2027-01-15",
    isDemo: true
  },
  {
    name: "Forklift Toyota 8FGU25",
    type: "Forklift",
    manufacturer: "Toyota",
    modelNumber: "8FGU25",
    serialNumber: "TOY8FGU25240002",
    location: "Warehouse B - Loading Dock",
    condition: "Fair" as const,
    status: "Maintenance" as const,
    operatingHours: 3456,
    lastMaintenance: "2024-10-28",
    nextDueDate: "2024-12-01",
    specifications: {
      power: "56 kW",
      liftCapacity: "2,500 kg",
      maxLiftHeight: "4.5 m"
    },
    purchaseDate: "2022-06-10",
    purchasePrice: 45000,
    warrantyExpiration: "2025-06-10",
    isDemo: true
  },
  {
    name: "Air Compressor Atlas Copco GA22",
    type: "Compressor",
    manufacturer: "Atlas Copco",
    modelNumber: "GA22VSD+",
    serialNumber: "ATC22VSD240003",
    location: "Plant C - Compressor Room",
    condition: "Excellent" as const,
    status: "Operational" as const,
    operatingHours: 891,
    lastMaintenance: "2024-11-20",
    nextDueDate: "2025-01-20",
    specifications: {
      power: "22 kW",
      airFlow: "4.1 m³/min",
      workingPressure: "8-13 bar"
    },
    purchaseDate: "2024-03-22",
    purchasePrice: 28500,
    warrantyExpiration: "2027-03-22",
    isDemo: true
  }
];

export const createDemoMaintenanceTasks = async (
  demoAssetIds: number[],
  setMaintenanceData: (fn: (prev: any[]) => any[]) => void
) => {
  if (demoAssetIds.length < 3) return;

  const demoMaintenanceTasks = [
    // Excavator Tasks (demoAssetIds[0])
    {
      assetId: demoAssetIds[0],
      taskType: 'preventive' as const,
      description: 'Replace hydraulic filter and check fluid levels',
      frequency: 'Every 250 hours',
      hoursInterval: 250,
      lastCompleted: '2024-11-15',
      nextDue: '2024-12-15',
      estimatedDuration: '2 hours',
      responsible: 'Mike Johnson',
      responsibleEmail: 'mike.johnson@demo.com',
      responsiblePhone: '(555) 123-4567',
      priority: 'medium' as const,
      status: 'scheduled' as const,
      isDemo: true
    },
    {
      assetId: demoAssetIds[0],
      taskType: 'preventive' as const,
      description: 'Engine oil and filter change',
      frequency: 'Every 500 hours',
      hoursInterval: 500,
      lastCompleted: '2024-10-15',
      nextDue: '2024-12-30',
      estimatedDuration: '1.5 hours',
      responsible: 'Mike Johnson',
      responsibleEmail: 'mike.johnson@demo.com',
      priority: 'high' as const,
      status: 'scheduled' as const,
      cost: 85,
      isDemo: true
    },
    {
      assetId: demoAssetIds[0],
      taskType: 'preventive' as const,
      description: 'Inspect and adjust track tension',
      frequency: 'Weekly',
      hoursInterval: 40,
      lastCompleted: '2024-11-25',
      nextDue: '2024-12-02',
      estimatedDuration: '45 minutes',
      responsible: 'Mike Johnson',
      responsibleEmail: 'mike.johnson@demo.com',
      priority: 'medium' as const,
      status: 'scheduled' as const,
      cost: 35,
      isDemo: true
    },

    // Forklift Tasks (demoAssetIds[1])
    {
      assetId: demoAssetIds[1],
      taskType: 'corrective' as const,
      description: 'Replace worn brake pads - safety critical',
      frequency: 'As needed',
      hoursInterval: 0,
      lastCompleted: '2024-10-28',
      nextDue: '2024-12-01',
      estimatedDuration: '3 hours',
      responsible: 'Sarah Chen',
      responsibleEmail: 'sarah.chen@demo.com',
      responsiblePhone: '(555) 234-5678',
      priority: 'high' as const,
      status: 'in_progress' as const,
      cost: 320,
      isDemo: true
    },
    {
      assetId: demoAssetIds[1],
      taskType: 'preventive' as const,
      description: 'Check tire pressure and inspect for wear',
      frequency: 'Daily',
      hoursInterval: 8,
      lastCompleted: '2024-11-28',
      nextDue: '2024-11-29',
      estimatedDuration: '15 minutes',
      responsible: 'Sarah Chen',
      responsibleEmail: 'sarah.chen@demo.com',
      priority: 'medium' as const,
      status: 'overdue' as const,
      cost: 25,
      isDemo: true
    },
    {
      assetId: demoAssetIds[1],
      taskType: 'preventive' as const,
      description: 'Inspect mast chains and lubricate pivot points',
      frequency: 'Every 200 hours',
      hoursInterval: 200,
      lastCompleted: '2024-09-15',
      nextDue: '2024-12-10',
      estimatedDuration: '1 hour',
      responsible: 'Sarah Chen',
      responsibleEmail: 'sarah.chen@demo.com',
      priority: 'medium' as const,
      status: 'scheduled' as const,
      cost: 75,
      isDemo: true
    },

    // Air Compressor Tasks (demoAssetIds[2])
    {
      assetId: demoAssetIds[2],
      taskType: 'preventive' as const,
      description: 'Clean air intake filter and check connections',
      frequency: 'Monthly',
      hoursInterval: 160,
      lastCompleted: '2024-11-20',
      nextDue: '2024-12-20',
      estimatedDuration: '30 minutes',
      responsible: 'David Rodriguez',
      responsibleEmail: 'david.rodriguez@demo.com',
      responsiblePhone: '(555) 345-6789',
      priority: 'medium' as const,
      status: 'scheduled' as const,
      cost: 45,
      isDemo: true
    },
    {
      assetId: demoAssetIds[2],
      taskType: 'preventive' as const,
      description: 'Change compressor oil and oil filter',
      frequency: 'Every 1000 hours',
      hoursInterval: 1000,
      lastCompleted: '2024-08-20',
      nextDue: '2024-12-25',
      estimatedDuration: '1.5 hours',
      responsible: 'David Rodriguez',
      responsibleEmail: 'david.rodriguez@demo.com',
      priority: 'high' as const,
      status: 'scheduled' as const,
      cost: 180,
      isDemo: true
    },
    {
      assetId: demoAssetIds[2],
      taskType: 'preventive' as const,
      description: 'Test safety relief valve operation',
      frequency: 'Quarterly',
      hoursInterval: 500,
      lastCompleted: '2024-09-20',
      nextDue: '2024-12-20',
      estimatedDuration: '1 hour',
      responsible: 'David Rodriguez',
      responsibleEmail: 'david.rodriguez@demo.com',
      priority: 'high' as const,
      status: 'scheduled' as const,
      cost: 120,
      isDemo: true
    }
  ];

  // Add demo maintenance tasks directly to state
  for (const task of demoMaintenanceTasks) {
    try {
      const taskWithId = { ...task, id: Date.now() + Math.random() };
      setMaintenanceData(prev => [...prev, taskWithId]);
      console.log(`Demo task created for asset ${task.assetId}`);
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error('Error adding demo task:', error);
    }
  }
};

export const createDemoFMEAData = (
  demoAssetIds: number[],
  setFmeaData: (fn: (prev: any[]) => any[]) => void
) => {
  if (demoAssetIds.length < 3) return;

  const demoFMEAData = [
    // Excavator FMEA
    {
      assetId: demoAssetIds[0],
      component: 'Hydraulic System',
      failureMode: 'Hydraulic pump failure',
      effect: 'Complete loss of boom/bucket movement',
      severity: 9,
      cause: 'Contaminated hydraulic fluid',
      occurrence: 4,
      detection: 'Pressure monitoring system',
      detectability: 3,
      rpn: 108,
      actions: 'Implement fluid analysis program, install filtration system',
      isDemo: true
    },
    {
      assetId: demoAssetIds[0],
      component: 'Engine',
      failureMode: 'Engine overheating',
      effect: 'Automatic shutdown, potential engine damage',
      severity: 8,
      cause: 'Blocked radiator or coolant leak',
      occurrence: 3,
      detection: 'Temperature sensors and visual inspection',
      detectability: 2,
      rpn: 48,
      actions: 'Regular radiator cleaning, coolant level checks',
      isDemo: true
    },
    {
      assetId: demoAssetIds[0],
      component: 'Track System',
      failureMode: 'Track derailment',
      effect: 'Machine immobilization, potential safety hazard',
      severity: 7,
      cause: 'Improper track tension or worn track pins',
      occurrence: 2,
      detection: 'Daily visual inspection',
      detectability: 2,
      rpn: 28,
      actions: 'Regular tension adjustment, pin wear monitoring',
      isDemo: true
    },

    // Forklift FMEA
    {
      assetId: demoAssetIds[1],
      component: 'Brake System',
      failureMode: 'Brake failure',
      effect: 'Unable to stop safely, potential accidents',
      severity: 10,
      cause: 'Worn brake pads or brake fluid leak',
      occurrence: 3,
      detection: 'Daily brake test and visual inspection',
      detectability: 2,
      rpn: 60,
      actions: 'Regular brake inspections, brake fluid monitoring',
      isDemo: true
    },
    {
      assetId: demoAssetIds[1],
      component: 'Steering System',
      failureMode: 'Loss of steering control',
      effect: 'Inability to maneuver safely',
      severity: 9,
      cause: 'Steering cylinder failure or low hydraulic fluid',
      occurrence: 2,
      detection: 'Operator feedback and steering response test',
      detectability: 3,
      rpn: 54,
      actions: 'Regular steering system inspection, fluid level checks',
      isDemo: true
    },
    {
      assetId: demoAssetIds[1],
      component: 'Mast Assembly',
      failureMode: 'Mast chain failure',
      effect: 'Fork carriage drops, load damage, safety risk',
      severity: 8,
      cause: 'Chain wear or improper lubrication',
      occurrence: 3,
      detection: 'Visual inspection and load test',
      detectability: 2,
      rpn: 48,
      actions: 'Regular chain inspection, proper lubrication schedule',
      isDemo: true
    },

    // Air Compressor FMEA
    {
      assetId: demoAssetIds[2],
      component: 'Electric Motor',
      failureMode: 'Motor burnout',
      effect: 'No compressed air production',
      severity: 7,
      cause: 'Overheating due to blocked ventilation',
      occurrence: 2,
      detection: 'Temperature monitoring and current draw',
      detectability: 2,
      rpn: 28,
      actions: 'Regular cleaning of motor housing, ventilation checks',
      isDemo: true
    },
    {
      assetId: demoAssetIds[2],
      component: 'Pressure Vessel',
      failureMode: 'Tank rupture',
      effect: 'Catastrophic failure, safety hazard',
      severity: 10,
      cause: 'Corrosion or manufacturing defect',
      occurrence: 1,
      detection: 'Regular pressure testing and visual inspection',
      detectability: 3,
      rpn: 30,
      actions: 'Annual pressure vessel inspection, corrosion monitoring',
      isDemo: true
    },
    {
      assetId: demoAssetIds[2],
      component: 'Control System',
      failureMode: 'Pressure switch failure',
      effect: 'Compressor runs continuously or fails to start',
      severity: 5,
      cause: 'Electrical contact wear or contamination',
      occurrence: 4,
      detection: 'Pressure monitoring and switch testing',
      detectability: 2,
      rpn: 40,
      actions: 'Regular switch cleaning and calibration',
      isDemo: true
    }
  ];

  // Add FMEA data to state
  const fmeaWithIds = demoFMEAData.map(entry => ({
    ...entry,
    id: Date.now() + Math.random()
  }));
  setFmeaData(prev => [...prev, ...fmeaWithIds]);
  console.log('Demo FMEA data added');
};

export const createDemoRCAData = (
  demoAssetIds: number[],
  setRcaData: (fn: (prev: any[]) => any[]) => void
) => {
  if (demoAssetIds.length < 3) return;

  const demoRCAData = [
    {
      assetId: demoAssetIds[0],
      incidentDate: '2024-10-15',
      description: 'Hydraulic system failure during operation',
      impact: 'Machine downtime for 8 hours, missed project deadline',
      rootCause: 'Contaminated hydraulic fluid due to damaged seals',
      why1: 'Why did the hydraulic system fail? - Contaminated fluid damaged internal components',
      why2: 'Why was the fluid contaminated? - Damaged seals allowed dirt ingress',
      why3: 'Why were the seals damaged? - Seals exceeded service life',
      why4: 'Why were seals not replaced? - No preventive maintenance schedule',
      why5: 'Why was there no PM schedule? - Lack of maintenance planning',
      correctiveActions: [
        'Replace all hydraulic seals',
        'Flush and replace hydraulic fluid',
        'Implement 250-hour seal inspection schedule',
        'Install hydraulic fluid contamination monitoring'
      ],
      preventiveActions: [
        'Create comprehensive PM schedule',
        'Train operators on contamination prevention',
        'Install high-efficiency filtration system'
      ],
      responsible: 'Mike Johnson',
      targetDate: '2024-12-01',
      status: 'in_progress',
      cost: 8500,
      isDemo: true
    },
    {
      assetId: demoAssetIds[1],
      incidentDate: '2024-10-28',
      description: 'Brake failure during load handling',
      impact: 'Near miss accident, load damage, operator concern',
      rootCause: 'Worn brake pads not replaced according to schedule',
      why1: 'Why did the brakes fail? - Brake pads completely worn',
      why2: 'Why were brake pads worn? - Exceeded replacement interval',
      why3: 'Why were they not replaced on time? - Missed maintenance schedule',
      why4: 'Why was maintenance missed? - Inadequate tracking system',
      why5: 'Why was tracking inadequate? - No digital maintenance management',
      correctiveActions: [
        'Replace brake pads immediately',
        'Inspect entire brake system',
        'Test brake performance before return to service'
      ],
      preventiveActions: [
        'Implement digital maintenance tracking',
        'Create brake inspection checklist',
        'Train operators on brake wear signs'
      ],
      responsible: 'Sarah Chen',
      targetDate: '2024-12-15',
      status: 'in_progress',
      cost: 2800,
      isDemo: true
    },
    {
      assetId: demoAssetIds[2],
      incidentDate: '2024-11-01',
      description: 'Compressor motor overheating and automatic shutdown',
      impact: 'Production line stopped for 4 hours, delayed shipments',
      rootCause: 'Motor ventilation blocked by accumulated dust',
      why1: 'Why did the motor overheat? - Insufficient air circulation',
      why2: 'Why was air circulation insufficient? - Ventilation holes blocked',
      why3: 'Why were ventilation holes blocked? - Dust accumulation',
      why4: 'Why did dust accumulate? - No regular cleaning schedule',
      why5: 'Why was there no cleaning schedule? - Overlooked in maintenance plan',
      correctiveActions: [
        'Clean motor housing and ventilation',
        'Check motor windings for damage',
        'Test motor operation under load'
      ],
      preventiveActions: [
        'Schedule weekly motor cleaning',
        'Install dust filters in compressor room',
        'Implement temperature monitoring'
      ],
      responsible: 'David Rodriguez',
      targetDate: '2024-12-10',
      status: 'planned',
      cost: 1200,
      isDemo: true
    }
  ];

  // Add RCA data to state
  const rcaWithIds = demoRCAData.map(entry => ({
    ...entry,
    id: Date.now() + Math.random()
  }));
  setRcaData(prev => [...prev, ...rcaWithIds]);
  console.log('Demo RCA data added');
};

export const createCompleteDemo = async (
  handleAddAsset: (asset: any) => number,
  setMaintenanceData: (fn: (prev: any[]) => any[]) => void,
  setFmeaData: (fn: (prev: any[]) => any[]) => void,
  setRcaData: (fn: (prev: any[]) => any[]) => void
) => {
  console.log('Creating complete demo dataset...');

  // Add demo assets and collect IDs
  const assetIds: number[] = [];
  for (const asset of demoAssets) {
    try {
      const newAssetId = handleAddAsset(asset);
      assetIds.push(newAssetId);
      console.log(`Demo asset created with ID: ${newAssetId}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error adding demo asset:', error);
    }
  }

  // Create demo data with actual asset IDs
  if (assetIds.length === 3) {
    console.log('Creating demo data for assets:', assetIds);

    // Add a small delay to ensure assets are fully added to state
    await new Promise(resolve => setTimeout(resolve, 200));

    await createDemoMaintenanceTasks(assetIds, setMaintenanceData);

    // Add delays between data creation to prevent state conflicts
    await new Promise(resolve => setTimeout(resolve, 100));
    createDemoFMEAData(assetIds, setFmeaData);

    await new Promise(resolve => setTimeout(resolve, 100));
    createDemoRCAData(assetIds, setRcaData);

    console.log('Complete demo data creation finished');
  }

  localStorage.setItem('demoMode', 'true');
};
