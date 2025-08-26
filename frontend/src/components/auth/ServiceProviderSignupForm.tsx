import React, { useState } from 'react';
import { ArrowLeft, Briefcase, Eye, EyeOff, Loader2, Check, Star, TrendingUp, Badge as BadgeIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { useAuth } from '../../utils/auth';
import { ServiceProviderPlan } from '../../types';
import { SERVICE_PROVIDER_PRICING_TIERS } from '../../utils/constants';

interface ServiceProviderSignupFormProps {
  onSwitchToLogin: () => void;
  onBack: () => void;
}

export function ServiceProviderSignupForm({ onSwitchToLogin, onBack }: ServiceProviderSignupFormProps) {
  const { signup } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: '',
    phone: '',
    website: '',
    address: '',
    services: [] as string[],
    certifications: [] as string[],
    selectedPlan: 'verified' as ServiceProviderPlan,
    acceptTerms: false,
    acceptMarketing: false
  });

  const businessTypes = [
    { value: 'dealer', label: 'Authorized Dealer' },
    { value: 'independent', label: 'Independent Service' },
    { value: 'specialized', label: 'Specialized Contractor' },
    { value: 'fleet', label: 'Fleet Services' }
  ];

  const availableServices = [
    'Preventive Maintenance',
    'Emergency Repairs',
    'Equipment Installation',
    'System Diagnostics',
    'Parts Supply',
    'Training Services',
    'Inspection Services',
    'Compliance Testing'
  ];

  const availableCertifications = [
    'ISO 9001',
    'ASE Certified',
    'OSHA Compliance',
    'EPA Certified',
    'Manufacturer Authorized',
    'Six Sigma',
    'Lean Manufacturing',
    'Safety Certified'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleArrayToggle = (field: 'services' | 'certifications', value: string) => {
    setFormData(prev => {
      const array = prev[field];
      const newArray = array.includes(value)
        ? array.filter(item => item !== value)
        : [...array, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handlePlanSelect = (plan: ServiceProviderPlan) => {
    setFormData(prev => ({ ...prev, selectedPlan: plan }));
  };

  const getPlanIcon = (plan: ServiceProviderPlan) => {
    switch (plan) {
      case 'verified':
        return <BadgeIcon className="h-5 w-5" />;
      case 'premium':
        return <Star className="h-5 w-5" />;
      case 'promoted':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <BadgeIcon className="h-5 w-5" />;
    }
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.businessName || !formData.businessType) {
      setError('Please provide business information');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.businessName,
        role: 'Service Provider',
        userType: 'service_provider',
        plan: formData.selectedPlan,
        businessInfo: {
          type: formData.businessType as any,
          services: formData.services,
          certifications: formData.certifications,
          phone: formData.phone,
          website: formData.website,
          address: formData.address
        }
      });

      if (!success) {
        setError('Signup failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold">Personal Information</h4>
        <p className="text-sm text-muted-foreground">Join 2,500+ successful service providers</p>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Quick setup
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Instant access
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="John"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="john@company.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Create a strong password"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          placeholder="Confirm your password"
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold">Business Information</h4>
        <p className="text-sm text-muted-foreground">Help customers find your expertise</p>
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-green-50 rounded-full text-xs text-green-700 border border-green-200">
          <Star className="h-3 w-3" />
          Complete profiles get 3x more inquiries
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name *</Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => handleInputChange('businessName', e.target.value)}
          placeholder="Your Service Company"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type *</Label>
        <Select onValueChange={(value) => handleInputChange('businessType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://yourcompany.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Business Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="123 Business St, City, State 12345"
        />
      </div>

      {/* Services */}
      <div className="space-y-2">
        <Label>Services Offered</Label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {availableServices.map((service) => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox
                id={service}
                checked={formData.services.includes(service)}
                onCheckedChange={() => handleArrayToggle('services', service)}
              />
              <label htmlFor={service} className="text-sm font-normal cursor-pointer">
                {service}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-2">
        <Label>Certifications</Label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {availableCertifications.map((cert) => (
            <div key={cert} className="flex items-center space-x-2">
              <Checkbox
                id={cert}
                checked={formData.certifications.includes(cert)}
                onCheckedChange={() => handleArrayToggle('certifications', cert)}
              />
              <label htmlFor={cert} className="text-sm font-normal cursor-pointer">
                {cert}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold">Choose Your Plan</h4>
        <p className="text-sm text-muted-foreground">Start earning more with the right plan for your business</p>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            No setup fees
          </div>
          <div className="flex items-center gap-1 text-blue-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Cancel anytime
          </div>
          <div className="flex items-center gap-1 text-purple-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            30-day trial
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {SERVICE_PROVIDER_PRICING_TIERS.map((tier) => (
          <Card 
            key={tier.plan} 
            className={`cursor-pointer transition-all ${
              formData.selectedPlan === tier.plan 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:shadow-md'
            } ${tier.isPopular ? 'relative' : ''}`}
            onClick={() => handlePlanSelect(tier.plan)}
          >
            {tier.isPopular && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground text-xs">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    formData.selectedPlan === tier.plan 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {getPlanIcon(tier.plan)}
                  </div>
                  <div>
                    <h4 className="font-medium">{tier.name}</h4>
                    <div className="text-2xl font-bold">
                      ${tier.price}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  formData.selectedPlan === tier.plan 
                    ? 'bg-primary border-primary' 
                    : 'border-muted-foreground'
                }`}>
                  {formData.selectedPlan === tier.plan && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
              </div>
              
              <ul className="mt-4 space-y-1 text-sm">
                {tier.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {tier.features.length > 4 && (
                  <li className="text-muted-foreground">
                    +{tier.features.length - 4} more features
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))
            }
          />
          <label htmlFor="acceptTerms" className="text-sm cursor-pointer">
            I accept the Terms of Service and Privacy Policy *
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceptMarketing"
            checked={formData.acceptMarketing}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, acceptMarketing: checked as boolean }))
            }
          />
          <label htmlFor="acceptMarketing" className="text-sm cursor-pointer">
            I'd like to receive marketing updates and tips
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-1 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={currentStep === 1 ? onBack : handlePrevStep}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Join Our Service Provider Network</CardTitle>
                <CardDescription className="text-base">
                  Step {currentStep} of 3: {
                    currentStep === 1 ? 'Personal Information' :
                    currentStep === 2 ? 'Business Details' :
                    'Choose Your Plan'
                  }
                </CardDescription>
              </div>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="flex gap-2 mb-2">
            {[1, 2, 3].map((step) => (
              <div 
                key={step}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          {/* Step descriptions */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className={currentStep >= 1 ? 'text-primary font-medium' : ''}>Personal</span>
            <span className={currentStep >= 2 ? 'text-primary font-medium' : ''}>Business</span>
            <span className={currentStep >= 3 ? 'text-primary font-medium' : ''}>Plan</span>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="flex gap-3">
              {currentStep < 3 ? (
                <Button type="button" onClick={handleNextStep} className="w-full">
                  Continue
                </Button>
              ) : (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    `Create Account - $${SERVICE_PROVIDER_PRICING_TIERS.find(t => t.plan === formData.selectedPlan)?.price}/month`
                  )}
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 space-y-4">
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 py-4 border-t">
              <div className="text-center">
                <div className="text-sm font-medium text-foreground">2,500+</div>
                <div className="text-xs text-muted-foreground">Active Providers</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-foreground">4.8/5</div>
                <div className="text-xs text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-foreground">$2.3M+</div>
                <div className="text-xs text-muted-foreground">Revenue Generated</div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}