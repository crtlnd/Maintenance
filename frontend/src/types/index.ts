export type Asset = {
  id: number;
  name: string;
  modelNumber: string;
  serialNumber: string;
  type: string;
  manufacturer: string;
  location: string;
  condition: string;
  lastMaintenance: string;
  installDate: string;
  operatingHours: number;
  criticality?: 'low' | 'medium' | 'high' | 'critical';
  specifications: {
    power?: string;
    capacity?: string;
    voltage?: string;
    weight?: string;
    dimensions?: string;
  };
  maintenanceSchedule: {
    oilChange?: string;
    filterReplacement?: string;
    inspection?: string;
    overhaul?: string;
  };
};

export type FailureMode = {
  id: string;
  failureMode: string;
  effects: string;
  severity: number;
  causes: string;
  occurrence: number;
  controls: string;
  detection: number;
  actions: string;
  responsible: string;
  dueDate: string;
  status: string;
};

export type FMEAEntry = {
  id: number;
  assetId: number;
  component: string;
  failureMode: string;
  effects: string;
  severity: number;
  causes: string;
  occurrence: number;
  controls: string;
  detection: number;
  rpn: number;
  actions: string;
  responsible: string;
  dueDate: string;
  status: string;
};

export type FiveWhys = {
  problem: string;
  why1: { question: string; answer: string };
  why2: { question: string; answer: string };
  why3: { question: string; answer: string };
  why4: { question: string; answer: string };
  why5: { question: string; answer: string };
  rootCause: string;
};

export type FishboneCause = {
  category: string;
  causes: string[];
};

export type FishboneDiagram = {
  problem: string;
  categories: FishboneCause[];
};

export type RCAEntry = {
  id: number;
  assetId: number;
  failureDate: string;
  problemDescription: string;
  immediateActions: string;
  rootCauses: string;
  correctiveActions: string;
  preventiveActions: string;
  responsible: string;
  status: string;
  cost: number;
  fiveWhys?: FiveWhys;
  fishboneDiagram?: FishboneDiagram;
};

export type MaintenanceTask = {
  id: number;
  assetId: number;
  taskType: 'preventive' | 'predictive' | 'condition-based';
  description: string;
  frequency: string;
  hoursInterval?: number;
  lastCompleted: string;
  nextDue: string;
  estimatedDuration: string;
  responsible: string;
  responsibleEmail?: string;
  responsiblePhone?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'overdue' | 'completed' | 'in-progress' | 'pending';
  completedAt?: string;
  completedBy?: string;
  completionNotes?: string;
  notificationsSent?: {
    email?: boolean;
    sms?: boolean;
    sentAt?: string;
  };
};

export type ServiceProvider = {
  id: number;
  placeId: string;
  name: string;
  description: string;
  serviceType: string;
  services: string[];
  address: string;
  phone: string;
  location: {
    city: string;
    coordinates: { type: string; coordinates: [number, number] };
  };
  radius: number;
  type: 'independent' | 'specialized' | 'dealer' | 'fleet';
  pricing: 'budget' | 'mid-range' | 'premium';
  rating: number;
  reviewCount: number;
  availability: string;
  specializations: string[];
  certifications: string[];
  website?: string;
  verified: boolean;
  subscriptionTier: 'none' | 'verified' | 'contact' | 'promoted';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
  distance?: number; // Optional, calculated by frontend or backend
  email?: string; // Optional, not in backend
  responseTime?: string; // Optional, not in backend
  lastContracted?: string; // Optional, not in backend
  notes?: string; // Optional, not in backend
  canDirectMessage?: boolean; // Optional, map to subscriptionTier === 'contact' or 'promoted'
  isPromoted?: boolean; // Optional, map to subscriptionTier === 'promoted'
};

export type NotificationPreferences = {
  maintenanceDue: boolean;
  maintenanceOverdue: boolean;
  assetFailures: boolean;
  highRiskFMEA: boolean;
  taskAssignments: boolean;
  systemUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  digestFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
};

export type UserType = 'customer' | 'service_provider' | 'admin';
export type SubscriptionPlan = 'free' | 'pro' | 'ai-powered';
export type ServiceProviderPlan = 'verified' | 'premium' | 'promoted';

export type PricingTier = {
  name: string;
  plan: SubscriptionPlan;
  price: number | string;
  assetLimit: number | 'unlimited';
  seatLimit: number | 'unlimited';
  features: string[];
  isPopular?: boolean;
  isEnterprise?: boolean;
};

export type ServiceProviderPricingTier = {
  name: string;
  plan: ServiceProviderPlan;
  price: number | string;
  features: string[];
  isPopular?: boolean;
};

export type TeamMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  invitedBy?: string;
  joinedAt?: string;
  lastActive?: string;
};

export type Organization = {
  id: string;
  name: string;
  owner: string;
  members: TeamMember[];
  subscription: {
    plan: SubscriptionPlan;
    status: 'active' | 'cancelled' | 'expired' | 'trial';
    expiresAt?: string;
    assetLimit: number | 'unlimited';
    seatLimit: number | 'unlimited';
    usedSeats: number;
  };
};

export type ServiceProviderProfile = {
  id: string;
  businessName: string;
  owner: string;
  subscription: {
    plan: ServiceProviderPlan;
    status: 'active' | 'cancelled' | 'expired' | 'trial';
    expiresAt?: string;
  };
  businessInfo: {
    type: 'dealer' | 'independent' | 'specialized' | 'fleet';
    services: string[];
    specializations: string[];
    address: string;
    phone: string;
    website?: string;
    certifications: string[];
    responseTime: string;
    availability: '24/7' | 'business-hours' | 'on-call';
    pricing: 'budget' | 'mid-range' | 'premium';
  };
  isVerified: boolean;
  canDirectMessage: boolean;
  isPromoted: boolean;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  company: string;
  department?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  userType: UserType;
  notificationPreferences: NotificationPreferences;
  organization?: Organization;
  serviceProviderProfile?: ServiceProviderProfile;
  subscription: {
    plan: SubscriptionPlan | ServiceProviderPlan;
    status: 'active' | 'cancelled' | 'expired' | 'trial';
    expiresAt?: string;
    assetLimit?: number | 'unlimited';
  };
};

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
};

export type TaskWithAsset = MaintenanceTask & {
  asset: Asset;
  hoursRemaining?: number;
  daysRemaining?: number;
  urgencyScore: number;
};

export type CurrentView = 'assets' | 'fmea' | 'rca' | 'rcm' | 'providers' | 'tasks' | 'ai-assistant' | 'account';
export type ServiceProviderView = 'dashboard' | 'requests' | 'profile' | 'account';
export type AdminView = 'dashboard' | 'users' | 'providers' | 'payments' | 'matching' | 'analytics' | 'account';
export type DetailView = 'list' | 'asset-detail';
export type AccountView = 'profile' | 'notifications' | 'billing' | 'security' | 'team';

export type MaintenanceRequest = {
  id: number;
  customerId: string;
  customerName: string;
  customerCompany: string;
  assetId: number;
  assetName: string;
  assetLocation: string;
  serviceType: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestDate: string;
  preferredDate: string;
  status: 'open' | 'quoted' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  budget?: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  attachments?: string[];
};

export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  company: string;
  department?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  userType: UserType;
  status: 'active' | 'suspended' | 'pending';
  subscription: {
    plan: SubscriptionPlan | ServiceProviderPlan;
    status: 'active' | 'cancelled' | 'expired' | 'trial';
    expiresAt?: string;
    assetLimit?: number | 'unlimited';
    seatLimit?: number | 'unlimited';
  };
  organization?: {
    id: string;
    name: string;
    memberCount: number;
  };
  serviceProviderProfile?: {
    businessName: string;
    type: 'dealer' | 'independent' | 'specialized' | 'fleet';
    isVerified: boolean;
    rating: number;
    reviewCount: number;
  };
};

export type Payment = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  subscriptionPlan: SubscriptionPlan | ServiceProviderPlan;
  transactionDate: string;
  nextBillingDate?: string;
  invoiceUrl?: string;
};

export type MatchingRule = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  conditions: {
    serviceTypes?: string[];
    locations?: string[];
    certifications?: string[];
    ratings?: {
      min: number;
      max: number;
    };
    responseTime?: string;
    pricing?: ('budget' | 'mid-range' | 'premium')[];
  };
  actions: {
    boostScore?: number;
    requireApproval?: boolean;
    autoMatch?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type AdminMetrics = {
  totalUsers: number;
  activeUsers: number;
  totalProviders: number;
  verifiedProviders: number;
  totalRequests: number;
  completedRequests: number;
  monthlyRevenue: number;
  churnRate: number;
  averageMatchTime: number;
  successfulMatches: number;
};
