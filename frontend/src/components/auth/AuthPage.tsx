import React, { useState } from 'react';
import { Wrench, Zap, Shield, BarChart3, Check, Crown } from 'lucide-react';
import caseyUptimeLogo from 'figma:asset/b0281f1af0d4ecb0182aeab92b8439ecbadd5431.png';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ServiceProviderSignupForm } from './ServiceProviderSignupForm';
import { UserTypeSelection } from './UserTypeSelection';
import { PRICING_TIERS } from '../../utils/constants';
import { UserType } from '../../types';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);

  const features = [
    {
      icon: Wrench,
      title: 'Asset Management',
      description: 'Track and manage all your equipment and machinery in one place'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'FMEA, RCA, and RCM analysis tools for comprehensive maintenance planning'
    },
    {
      icon: Zap,
      title: 'Smart Scheduling',
      description: 'Automated maintenance scheduling based on operating hours and conditions'
    },
    {
      icon: Shield,
      title: 'Reliable & Secure',
      description: 'Enterprise-grade security with reliable data backup and protection'
    }
  ];

  const handleUserTypeSelect = (userType: UserType) => {
    setSelectedUserType(userType);
    setShowUserTypeSelection(false);
    setIsLogin(false);
  };

  const handleBackToLogin = () => {
    setIsLogin(true);
    setShowUserTypeSelection(false);
    setSelectedUserType(null);
  };

  const handleBackToUserTypeSelection = () => {
    setShowUserTypeSelection(true);
    setSelectedUserType(null);
  };

  // Show user type selection
  if (showUserTypeSelection) {
    return (
      <UserTypeSelection 
        onSelectUserType={handleUserTypeSelect}
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation Header */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={caseyUptimeLogo} 
                alt="Casey Uptime" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Maintenance Manager</h1>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Already have an account?
              </span>
              <button
                onClick={() => {
                  if (isLogin) {
                    setShowUserTypeSelection(true);
                  } else {
                    setIsLogin(true);
                    setShowUserTypeSelection(false);
                    setSelectedUserType(null);
                  }
                }}
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Left side - Content varies by signup type */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-8 py-12">
          <div className="max-w-lg">
            {selectedUserType === 'service_provider' ? (
              // Service Provider Benefits
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    Grow Your Service Business
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Connect with businesses that need your expertise and grow your maintenance service business.
                  </p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                      <Wrench className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Find Quality Customers</h3>
                      <p className="text-sm text-muted-foreground">Access a network of businesses actively seeking maintenance services</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Increase Your Revenue</h3>
                      <p className="text-sm text-muted-foreground">Premium providers report 40% increase in monthly bookings</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Smart Matching</h3>
                      <p className="text-sm text-muted-foreground">Our AI matches you with jobs that fit your skills and location</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                      <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Professional Tools</h3>
                      <p className="text-sm text-muted-foreground">Access invoicing, scheduling, and customer management tools</p>
                    </div>
                  </div>
                </div>

                {/* Success Stats */}
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-4">Join 2,500+ Service Providers</h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">$2.3M+</div>
                      <div className="text-xs text-muted-foreground">Revenue Generated</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">15K+</div>
                      <div className="text-xs text-muted-foreground">Jobs Completed</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <p className="text-sm text-muted-foreground text-center">
                      "This platform doubled my business in 6 months" - Mike T., HVAC Specialist
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Customer Features and Pricing (original content)
              <div>
                {/* Features */}
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    Professional Maintenance Management
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Streamline your maintenance operations with powerful FMEA, RCA, and RCM tools.
                  </p>

                  <div className="space-y-6">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                          <feature.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Pricing Overview */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Choose Your Plan</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {PRICING_TIERS?.slice(0, 3).map((tier) => (
                      <Card key={tier.plan} className={`relative ${tier.isPopular ? 'ring-2 ring-primary' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{tier.name}</h4>
                                {tier.isPopular && (
                                  <Badge className="bg-primary text-primary-foreground">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {tier.assetLimit} assets, {tier.seatLimit} seat{tier.seatLimit !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {typeof tier.price === 'number' ? (
                                  tier.price === 0 ? 'Free' : `${tier.price}/mo`
                                ) : (
                                  tier.price
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enterprise plans available with unlimited assets and custom pricing
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="flex-1 flex items-center justify-center p-8 lg:max-w-md xl:max-w-lg">
          <div className="w-full">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
              <img 
                src={caseyUptimeLogo} 
                alt="Casey Uptime" 
                className="h-10 w-auto"
              />
              <h1 className="text-xl font-semibold text-foreground">Maintenance Manager</h1>
            </div>

            {isLogin ? (
              <LoginForm onSwitchToSignup={() => setShowUserTypeSelection(true)} />
            ) : selectedUserType === 'service_provider' ? (
              <ServiceProviderSignupForm 
                onSwitchToLogin={handleBackToLogin}
                onBack={handleBackToUserTypeSelection}
              />
            ) : selectedUserType === 'customer' ? (
              <SignupForm 
                onSwitchToLogin={handleBackToLogin}
                onBack={handleBackToUserTypeSelection}
              />
            ) : (
              <SignupForm 
                onSwitchToLogin={handleBackToLogin}
                onBack={handleBackToUserTypeSelection}
              />
            )}

            {/* Mobile Content Preview */}
            <div className="lg:hidden mt-8">
              {selectedUserType === 'service_provider' ? (
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-3">Join Our Network:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>Find customers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>Grow revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>Smart matching</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>Pro tools</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs text-green-700 text-center">
                      2,500+ providers • $2.3M+ revenue generated
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-3">Free Plan Includes:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>5 assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>1 seat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>Basic FMEA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>Task scheduling</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-700">
                      Upgrade anytime for more assets, team collaboration, and advanced features
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}