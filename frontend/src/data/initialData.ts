import { Asset, FMEAEntry, RCAEntry, MaintenanceTask, ServiceProvider, MaintenanceRequest, AdminUser, Payment, MatchingRule, AdminMetrics } from '../types';

export const initialAssets: Asset[] = [
  {
    id: 1,
    name: "Truck #001",
    modelNumber: "F-150",
    serialNumber: "TRK001-2023",
    type: "Vehicle",
    manufacturer: "Ford",
    location: "Houston Depot",
    condition: "Good",
    lastMaintenance: "2024-01-15",
    installDate: "2023-01-15",
    operatingHours: 2450,
    specifications: {
      power: "375 HP",
      capacity: "3,325 lbs",
      weight: "4,021 lbs"
    },
    maintenanceSchedule: {
      oilChange: "Every 250 hours",
      filterReplacement: "Every 500 hours",
      inspection: "Every 100 hours"
    }
  },
  {
    id: 2,
    name: "Generator A2",
    modelNumber: "CAT-3516",
    serialNumber: "GEN002-2023",
    type: "Equipment",
    manufacturer: "Caterpillar",
    location: "Site B",
    condition: "Fair",
    lastMaintenance: "2024-01-10",
    installDate: "2022-06-10",
    operatingHours: 8750,
    specifications: {
      power: "2000 kW",
      voltage: "480V",
      weight: "24,000 lbs"
    },
    maintenanceSchedule: {
      oilChange: "Every 500 hours",
      filterReplacement: "Every 1000 hours",
      inspection: "Every 250 hours",
      overhaul: "Every 8000 hours"
    }
  }
];

export const initialFMEAData: FMEAEntry[] = [
  {
    id: 1,
    assetId: 2,
    component: "Engine Oil System",
    failureMode: "Oil Leak",
    effects: "Engine damage, environmental contamination",
    severity: 8,
    causes: "Worn gasket, loose connection",
    occurrence: 4,
    controls: "Regular inspection, pressure testing",
    detection: 6,
    rpn: 192,
    actions: "Implement torque specifications training",
    responsible: "J. Smith",
    dueDate: "2024-02-15",
    status: "In Progress"
  },
  {
    id: 2,
    assetId: 1,
    component: "Brake System",
    failureMode: "Brake Pad Wear",
    effects: "Reduced braking performance, safety risk",
    severity: 9,
    causes: "Normal wear, aggressive driving",
    occurrence: 5,
    controls: "Scheduled maintenance, monitoring",
    detection: 3,
    rpn: 135,
    actions: "Enhance driver training program",
    responsible: "M. Johnson",
    dueDate: "2024-02-28",
    status: "Pending"
  }
];

export const initialRCAData: RCAEntry[] = [
  {
    id: 1,
    assetId: 2,
    failureDate: "2024-01-05",
    problemDescription: "Generator unexpected shutdown during peak load",
    immediateActions: "Switched to backup generator, isolated faulty unit",
    rootCauses: "Cooling system radiator blockage caused overheating protection to trigger",
    correctiveActions: "Cleaned radiator, replaced thermostat, updated cooling system monitoring",
    preventiveActions: "Implement monthly radiator inspection, upgrade monitoring system",
    responsible: "M. Johnson",
    status: "Complete",
    cost: 2500
  },
  {
    id: 2,
    assetId: 1,
    failureDate: "2024-01-20",
    problemDescription: "Truck transmission failure during delivery route",
    immediateActions: "Vehicle towed to maintenance facility, delivery rescheduled",
    rootCauses: "Transmission fluid contamination due to failed seal",
    correctiveActions: "Replaced transmission seals, fluid flush and replacement",
    preventiveActions: "Implement transmission fluid analysis program",
    responsible: "Fleet Manager",
    status: "Complete",
    cost: 3200
  }
];

export const initialMaintenanceData: MaintenanceTask[] = [
  {
    id: 1,
    assetId: 2,
    taskType: 'preventive',
    description: "Engine oil change and filter replacement",
    frequency: "Every 500 hours",
    hoursInterval: 500,
    lastCompleted: "2024-01-10",
    nextDue: "2024-03-15",
    estimatedDuration: "4 hours",
    responsible: "Engine Technician",
    responsibleEmail: "engine.tech@company.com",
    responsiblePhone: "+1 (555) 201-0001",
    priority: 'medium',
    status: 'scheduled'
  },
  {
    id: 2,
    assetId: 1,
    taskType: 'condition-based',
    description: "Brake system inspection",
    frequency: "Every 100 hours",
    hoursInterval: 100,
    lastCompleted: "2024-01-15",
    nextDue: "2024-02-20",
    estimatedDuration: "2 hours",
    responsible: "Safety Inspector",
    responsibleEmail: "safety@company.com",
    responsiblePhone: "+1 (555) 201-0002",
    priority: 'high',
    status: 'overdue'
  },
  {
    id: 3,
    assetId: 1,
    taskType: 'preventive',
    description: "Engine oil change",
    frequency: "Every 250 hours",
    hoursInterval: 250,
    lastCompleted: "2024-01-15",
    nextDue: "2024-02-15",
    estimatedDuration: "2 hours",
    responsible: "Maintenance Technician",
    responsibleEmail: "maintenance@company.com",
    responsiblePhone: "+1 (555) 201-0003",
    priority: 'medium',
    status: 'scheduled'
  },
  {
    id: 4,
    assetId: 2,
    taskType: 'predictive',
    description: "Vibration analysis and bearing inspection",
    frequency: "Every 1000 hours",
    hoursInterval: 1000,
    lastCompleted: "2024-01-10",
    nextDue: "2024-04-15",
    estimatedDuration: "3 hours",
    responsible: "Vibration Analyst",
    responsibleEmail: "vibration@company.com",
    responsiblePhone: "+1 (555) 201-0004",
    priority: 'medium',
    status: 'scheduled'
  },
  {
    id: 5,
    assetId: 1,
    taskType: 'preventive',
    description: "Tire rotation and pressure check",
    frequency: "Every 100 hours",
    hoursInterval: 100,
    lastCompleted: "2024-01-25",
    nextDue: "2024-02-20",
    estimatedDuration: "30 minutes",
    responsible: "Maintenance Technician",
    responsibleEmail: "maintenance@company.com",
    responsiblePhone: "+1 (555) 201-0003",
    priority: 'low',
    status: 'scheduled'
  }
];

export const initialMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 1,
    customerId: 'cust_001',
    customerName: 'John Smith',
    customerCompany: 'Industrial Solutions Inc.',
    assetId: 1,
    assetName: 'Hydraulic Press HP-2000',
    assetLocation: 'Production Floor A',
    serviceType: 'Emergency Repair',
    description: 'Hydraulic press is experiencing pressure loss and unusual noises. Production is currently halted.',
    priority: 'urgent',
    requestDate: '2024-08-14T08:30:00Z',
    preferredDate: '2024-08-15T09:00:00Z',
    status: 'open',
    budget: '$2,000 - $5,000',
    contactInfo: {
      phone: '+1 (555) 123-4567',
      email: 'j.smith@industrialsolutions.com'
    }
  },
  {
    id: 2,
    customerId: 'cust_002',
    customerName: 'Sarah Johnson',
    customerCompany: 'Manufacturing Corp',
    assetId: 2,
    assetName: 'Conveyor Belt CB-100',
    assetLocation: 'Warehouse B',
    serviceType: 'Preventive Maintenance',
    description: 'Scheduled quarterly maintenance for conveyor system including belt inspection and motor servicing.',
    priority: 'medium',
    requestDate: '2024-08-13T14:15:00Z',
    preferredDate: '2024-08-20T08:00:00Z',
    status: 'open',
    budget: '$500 - $1,000',
    contactInfo: {
      phone: '+1 (555) 987-6543',
      email: 's.johnson@manufacturingcorp.com'
    }
  },
  {
    id: 3,
    customerId: 'cust_003',
    customerName: 'Mike Davis',
    customerCompany: 'Power Plant Operations',
    assetId: 3,
    assetName: 'Generator G-500',
    assetLocation: 'Power House 1',
    serviceType: 'Inspection & Testing',
    description: 'Annual generator inspection and performance testing required for compliance.',
    priority: 'high',
    requestDate: '2024-08-12T10:00:00Z',
    preferredDate: '2024-08-25T07:00:00Z',
    status: 'quoted',
    budget: '$1,500 - $3,000',
    contactInfo: {
      phone: '+1 (555) 456-7890',
      email: 'm.davis@powerplantops.com'
    }
  },
  {
    id: 4,
    customerId: 'cust_001',
    customerName: 'John Smith',
    customerCompany: 'Industrial Solutions Inc.',
    assetId: 4,
    assetName: 'Air Compressor AC-750',
    assetLocation: 'Utility Room',
    serviceType: 'Repair',
    description: 'Air compressor not building pressure. Suspect valve or seal issue.',
    priority: 'high',
    requestDate: '2024-08-11T16:45:00Z',
    preferredDate: '2024-08-18T13:00:00Z',
    status: 'in-progress',
    budget: '$800 - $1,500',
    contactInfo: {
      phone: '+1 (555) 123-4567',
      email: 'j.smith@industrialsolutions.com'
    }
  },
  {
    id: 5,
    customerId: 'cust_004',
    customerName: 'Lisa Chen',
    customerCompany: 'Food Processing LLC',
    assetId: 5,
    assetName: 'Packaging Machine PM-300',
    assetLocation: 'Line 2',
    serviceType: 'Upgrade',
    description: 'Looking to upgrade packaging machine control system for better efficiency.',
    priority: 'low',
    requestDate: '2024-08-10T11:20:00Z',
    preferredDate: '2024-09-01T10:00:00Z',
    status: 'open',
    budget: '$5,000 - $10,000',
    contactInfo: {
      phone: '+1 (555) 234-5678',
      email: 'l.chen@foodprocessing.com'
    }
  }
];

export const adminUsers: AdminUser[] = [
  {
    id: 'user_001',
    email: 'john.smith@industrialsolutions.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'Maintenance Manager',
    company: 'Industrial Solutions Inc.',
    department: 'Operations',
    phone: '+1 (555) 123-4567',
    createdAt: '2024-01-15T00:00:00Z',
    lastLogin: '2024-08-14T14:30:00Z',
    userType: 'customer',
    status: 'active',
    subscription: {
      plan: 'pro',
      status: 'active',
      expiresAt: '2024-12-15T00:00:00Z',
      assetLimit: 100,
      seatLimit: 5
    },
    organization: {
      id: 'org_001',
      name: 'Industrial Solutions Inc.',
      memberCount: 3
    }
  },
  {
    id: 'user_002',
    email: 'sarah.johnson@manufacturingcorp.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'Fleet Manager',
    company: 'Manufacturing Corp',
    department: 'Logistics',
    phone: '+1 (555) 987-6543',
    createdAt: '2024-02-01T00:00:00Z',
    lastLogin: '2024-08-14T09:15:00Z',
    userType: 'customer',
    status: 'active',
    subscription: {
      plan: 'basic',
      status: 'active',
      expiresAt: '2024-09-01T00:00:00Z',
      assetLimit: 20,
      seatLimit: 2
    },
    organization: {
      id: 'org_002',
      name: 'Manufacturing Corp',
      memberCount: 2
    }
  },
  {
    id: 'prov_001',
    email: 'contact@houstoncatdealer.com',
    firstName: 'Mike',
    lastName: 'Davis',
    role: 'Service Manager',
    company: 'Houston CAT Dealer',
    phone: '+1 (713) 466-4000',
    createdAt: '2024-01-10T00:00:00Z',
    lastLogin: '2024-08-14T16:45:00Z',
    userType: 'service_provider',
    status: 'active',
    subscription: {
      plan: 'promoted',
      status: 'active',
      expiresAt: '2024-09-10T00:00:00Z'
    },
    serviceProviderProfile: {
      businessName: 'Houston CAT Dealer',
      type: 'dealer',
      isVerified: true,
      rating: 4.8,
      reviewCount: 247
    }
  },
  {
    id: 'prov_002',
    email: 'dispatch@apexfleet.com',
    firstName: 'Lisa',
    lastName: 'Chen',
    role: 'Operations Director',
    company: 'Apex Fleet Services',
    phone: '+1 (713) 694-7500',
    createdAt: '2024-01-20T00:00:00Z',
    lastLogin: '2024-08-14T11:20:00Z',
    userType: 'service_provider',
    status: 'active',
    subscription: {
      plan: 'premium',
      status: 'active',
      expiresAt: '2024-10-20T00:00:00Z'
    },
    serviceProviderProfile: {
      businessName: 'Apex Fleet Services',
      type: 'fleet',
      isVerified: true,
      rating: 4.6,
      reviewCount: 189
    }
  },
  {
    id: 'user_003',
    email: 'pending.user@example.com',
    firstName: 'Robert',
    lastName: 'Wilson',
    role: 'Maintenance Technician',
    company: 'Small Manufacturing Co.',
    createdAt: '2024-08-10T00:00:00Z',
    lastLogin: '2024-08-10T00:00:00Z',
    userType: 'customer',
    status: 'pending',
    subscription: {
      plan: 'free',
      status: 'trial',
      expiresAt: '2024-08-24T00:00:00Z',
      assetLimit: 5,
      seatLimit: 1
    }
  }
];

export const adminPayments: Payment[] = [
  {
    id: 'pay_001',
    userId: 'user_001',
    userEmail: 'john.smith@industrialsolutions.com',
    userName: 'John Smith',
    amount: 99.00,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'Credit Card (****4242)',
    subscriptionPlan: 'pro',
    transactionDate: '2024-07-15T00:00:00Z',
    nextBillingDate: '2024-08-15T00:00:00Z',
    invoiceUrl: '/invoices/inv_001.pdf'
  },
  {
    id: 'pay_002',
    userId: 'user_002',
    userEmail: 'sarah.johnson@manufacturingcorp.com',
    userName: 'Sarah Johnson',
    amount: 29.00,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'Credit Card (****5555)',
    subscriptionPlan: 'basic',
    transactionDate: '2024-08-01T00:00:00Z',
    nextBillingDate: '2024-09-01T00:00:00Z',
    invoiceUrl: '/invoices/inv_002.pdf'
  },
  {
    id: 'pay_003',
    userId: 'prov_001',
    userEmail: 'contact@houstoncatdealer.com',
    userName: 'Mike Davis',
    amount: 500.00,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'ACH Transfer',
    subscriptionPlan: 'promoted',
    transactionDate: '2024-08-10T00:00:00Z',
    nextBillingDate: '2024-09-10T00:00:00Z',
    invoiceUrl: '/invoices/inv_003.pdf'
  },
  {
    id: 'pay_004',
    userId: 'prov_002',
    userEmail: 'dispatch@apexfleet.com',
    userName: 'Lisa Chen',
    amount: 100.00,
    currency: 'USD',
    status: 'pending',
    paymentMethod: 'Credit Card (****9999)',
    subscriptionPlan: 'premium',
    transactionDate: '2024-08-14T00:00:00Z',
    nextBillingDate: '2024-09-14T00:00:00Z'
  },
  {
    id: 'pay_005',
    userId: 'user_004',
    userEmail: 'failed@example.com',
    userName: 'Failed User',
    amount: 29.00,
    currency: 'USD',
    status: 'failed',
    paymentMethod: 'Credit Card (****1234)',
    subscriptionPlan: 'basic',
    transactionDate: '2024-08-13T00:00:00Z'
  }
];

export const adminMatchingRules: MatchingRule[] = [
  {
    id: 'rule_001',
    name: 'Emergency Priority Matching',
    description: 'Prioritize urgent requests and match with providers that have 24/7 availability',
    isActive: true,
    priority: 1,
    conditions: {
      serviceTypes: ['Emergency Repair', 'Critical Maintenance'],
      responseTime: '< 2 hours',
      ratings: { min: 4.5, max: 5.0 }
    },
    actions: {
      boostScore: 50,
      autoMatch: false,
      requireApproval: true
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-07-20T00:00:00Z',
    createdBy: 'admin_001'
  },
  {
    id: 'rule_002',
    name: 'Geographic Proximity',
    description: 'Match customers with providers within 10 miles for routine maintenance',
    isActive: true,
    priority: 2,
    conditions: {
      serviceTypes: ['Preventive Maintenance', 'Routine Service'],
      locations: ['Houston Metro Area']
    },
    actions: {
      boostScore: 25,
      autoMatch: true,
      requireApproval: false
    },
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-06-15T00:00:00Z',
    createdBy: 'admin_001'
  },
  {
    id: 'rule_003',
    name: 'Certification Matching',
    description: 'Match specialized equipment with certified providers',
    isActive: true,
    priority: 3,
    conditions: {
      certifications: ['CAT Certified', 'NETA Certified', 'AWS Welding Certified'],
      serviceTypes: ['Specialized Repair', 'Technical Service']
    },
    actions: {
      boostScore: 40,
      autoMatch: false,
      requireApproval: false
    },
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-08-01T00:00:00Z',
    createdBy: 'admin_001'
  },
  {
    id: 'rule_004',
    name: 'Budget-Friendly Options',
    description: 'Promote budget providers for cost-conscious customers',
    isActive: false,
    priority: 4,
    conditions: {
      pricing: ['budget'],
      serviceTypes: ['Basic Maintenance', 'Oil Change', 'Tire Service']
    },
    actions: {
      boostScore: 15,
      autoMatch: true,
      requireApproval: false
    },
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-08-10T00:00:00Z',
    createdBy: 'admin_002'
  }
];

export const adminMetrics: AdminMetrics = {
  totalUsers: 1247,
  activeUsers: 1156,
  totalProviders: 342,
  verifiedProviders: 289,
  totalRequests: 5832,
  completedRequests: 5124,
  monthlyRevenue: 87450,
  churnRate: 3.2,
  averageMatchTime: 4.7,
  successfulMatches: 4967
};

export const initialServiceProviders: ServiceProvider[] = [
  {
    id: 1,
    name: "Houston CAT Dealer",
    type: 'dealer',
    services: ['Preventive Maintenance', 'Major Repairs', 'Parts Supply', 'Emergency Service'],
    specializations: ['Caterpillar Equipment', 'Generators', 'Heavy Machinery'],
    address: "4502 Westway Park Blvd, Houston, TX 77041",
    distance: 0.3,
    phone: "(713) 466-4000",
    email: "service@houstoncatdealer.com",
    website: "www.houstoncatdealer.com",
    rating: 4.8,
    reviewCount: 247,
    certifications: ['CAT Certified', 'ASE Certified', 'EPA Certified'],
    responseTime: "< 2 hours",
    availability: '24/7',
    pricing: 'premium',
    lastContacted: "2024-01-20",
    notes: "Primary dealer for all CAT equipment. Excellent for major overhauls."
  },
  {
    id: 2,
    name: "Apex Fleet Services",
    type: 'fleet',
    services: ['Fleet Maintenance', 'Preventive Care', 'Roadside Assistance', 'DOT Inspections'],
    specializations: ['Commercial Vehicles', 'Fleet Management', 'Compliance'],
    address: "8945 Kempwood Dr, Houston, TX 77080",
    distance: 0.7,
    phone: "(713) 694-7500",
    email: "dispatch@apexfleet.com",
    website: "www.apexfleetservices.com",
    rating: 4.6,
    reviewCount: 189,
    certifications: ['DOT Certified', 'ASE Master Technician', 'FMCSA Registered'],
    responseTime: "< 1 hour",
    availability: '24/7',
    pricing: 'mid-range',
    lastContracted: "2024-01-15",
    notes: "Great for routine fleet maintenance and emergency response."
  },
  {
    id: 3,
    name: "Power Systems Repair Co",
    type: 'specialized',
    services: ['Generator Repair', 'Electrical Systems', 'Control Systems', 'Load Testing'],
    specializations: ['Industrial Generators', 'Power Electronics', 'UPS Systems'],
    address: "12507 Northwest Fwy, Houston, TX 77040",
    distance: 0.9,
    phone: "(713) 462-8811",
    email: "service@powersysrepair.com",
    rating: 4.9,
    reviewCount: 156,
    certifications: ['EGSA Certified', 'NETA Certified', 'Electrical License'],
    responseTime: "< 3 hours",
    availability: 'on-call',
    pricing: 'premium',
    notes: "Specialists in generator and power system repairs. Highly technical expertise."
  },
  {
    id: 4,
    name: "Reliable Mobile Mechanics",
    type: 'independent',
    services: ['On-Site Repairs', 'Diagnostics', 'Oil Changes', 'Minor Repairs'],
    specializations: ['Mobile Service', 'Light Maintenance', 'Quick Repairs'],
    address: "Mobile Service - Houston Metro Area",
    distance: 0.5,
    phone: "(713) 555-0123",
    email: "info@reliablemobile.com",
    rating: 4.4,
    reviewCount: 94,
    certifications: ['ASE Certified', 'Insured & Bonded'],
    responseTime: "< 4 hours",
    availability: 'business-hours',
    pricing: 'budget',
    notes: "Cost-effective mobile service for routine maintenance and minor repairs."
  },
  {
    id: 5,
    name: "Industrial Equipment Solutions",
    type: 'specialized',
    services: ['Heavy Equipment Repair', 'Hydraulic Systems', 'Welding', 'Parts Fabrication'],
    specializations: ['Hydraulics', 'Heavy Machinery', 'Custom Fabrication'],
    address: "7838 N Freeway, Houston, TX 77076",
    distance: 0.8,
    phone: "(713) 691-2100",
    email: "shop@iesequipment.com",
    website: "www.iesequipment.com",
    rating: 4.7,
    reviewCount: 132,
    certifications: ['AWS Welding Certified', 'NFPA Certified', 'Safety Trained'],
    responseTime: "< 6 hours",
    availability: 'business-hours',
    pricing: 'mid-range',
    notes: "Excellent for hydraulic system repairs and custom fabrication work."
  },
  {
    id: 6,
    name: "QuickFix Auto & Fleet",
    type: 'independent',
    services: ['Auto Repair', 'Fleet Service', 'Tire Service', 'Brake Repair'],
    specializations: ['Light Vehicles', 'Brake Systems', 'Tires'],
    address: "5623 Airline Dr, Houston, TX 77076",
    distance: 0.6,
    phone: "(713) 695-4400",
    email: "service@quickfixfleet.com",
    rating: 4.2,
    reviewCount: 78,
    certifications: ['ASE Certified', 'State Inspection License'],
    responseTime: "Same day",
    availability: 'business-hours',
    pricing: 'budget',
    notes: "Good for basic vehicle maintenance and tire services."
  },
  {
    id: 7,
    name: "Expert Welding & Fabrication",
    type: 'specialized',
    services: ['Structural Welding', 'Metal Fabrication', 'Pipe Welding', 'Certified Welding'],
    specializations: ['AWS Certified Welding', 'Structural Steel', 'Pipeline Work'],
    address: "3421 Harrisburg Blvd, Houston, TX 77003",
    distance: 1.2,
    phone: "(713) 228-5000",
    email: "jobs@expertwelding.com",
    website: "www.expertwelding.com",
    rating: 4.9,
    reviewCount: 203,
    certifications: ['AWS D1.1 Certified', 'ASME Certified', 'API 1104 Certified'],
    responseTime: "< 4 hours",
    availability: 'business-hours',
    pricing: 'premium',
    notes: "Top-tier welding specialists for critical structural and pipeline work."
  },
  {
    id: 8,
    name: "Houston Engineering Solutions",
    type: 'specialized',
    services: ['Engineering Consulting', 'System Design', 'Technical Support', 'Project Management'],
    specializations: ['Mechanical Engineering', 'Process Engineering', 'Technical Analysis'],
    address: "1450 Lake Robbins Dr, The Woodlands, TX 77380",
    distance: 2.1,
    phone: "(281) 367-4000",
    email: "contact@houstonengineering.com",
    website: "www.houstonengineering.com",
    rating: 4.7,
    reviewCount: 87,
    certifications: ['PE Licensed', 'ISO 9001 Certified', 'OSHA 30-Hour'],
    responseTime: "1-2 days",
    availability: 'business-hours',
    pricing: 'premium',
    notes: "Professional engineering services for complex industrial projects."
  },
  {
    id: 9,
    name: "Metro Electrical Services",
    type: 'specialized',
    services: ['Electrical Maintenance', 'Power System Repair', 'Motor Control', 'Lighting Systems'],
    specializations: ['Industrial Electrical', 'Motor Drives', 'PLC Systems'],
    address: "6789 Antoine Dr, Houston, TX 77091",
    distance: 1.5,
    phone: "(713) 462-7800",
    email: "service@metroelectrical.com",
    rating: 4.5,
    reviewCount: 124,
    certifications: ['Master Electrician License', 'NECA Member', 'OSHA Certified'],
    responseTime: "< 3 hours",
    availability: '24/7',
    pricing: 'mid-range',
    notes: "Reliable electrical services for industrial and commercial facilities."
  },
  {
    id: 10,
    name: "Precision Hydraulics Repair",
    type: 'specialized',
    services: ['Hydraulic System Repair', 'Cylinder Rebuild', 'Pump Service', 'Hose Assembly'],
    specializations: ['Hydraulic Cylinders', 'Hydraulic Pumps', 'Mobile Hydraulics'],
    address: "4821 Telephone Rd, Houston, TX 77087",
    distance: 1.8,
    phone: "(713) 641-2500",
    email: "shop@precisionhydraulics.com",
    website: "www.precisionhydraulics.com",
    rating: 4.6,
    reviewCount: 156,
    certifications: ['NFPA Certified', 'Parker Authorized', 'Bosch Rexroth Certified'],
    responseTime: "< 5 hours",
    availability: 'business-hours',
    pricing: 'mid-range',
    notes: "Specialized hydraulic system repair with fast turnaround times."
  }
];
