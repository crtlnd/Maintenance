import React from 'react';
import { Users, Wrench, ArrowRight, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { UserType } from '../../types';

interface UserTypeSelectionProps {
  onSelectUserType: (userType: UserType) => void;
  onBack: () => void;
}

export function UserTypeSelection({ onSelectUserType, onBack }: UserTypeSelectionProps) {
  const userTypes = [
    {
      type: 'customer' as UserType,
      title: 'Maintenance Manager',
      description: 'I manage equipment and maintenance operations',
      icon: Wrench,
      features: [
        'Asset management and tracking',
        'FMEA, RCA, and RCM analysis',
        'Task scheduling and planning',
        'Team collaboration tools',
        'Service provider connections'
      ],
      pricing: 'Starting at $0/month',
      buttonText: 'Continue as Customer'
    },
    {
      type: 'service_provider' as UserType,
      title: 'Service Provider',
      description: 'I provide maintenance and repair services',
      icon: Users,
      features: [
        'Professional service listings',
        'Customer lead generation',
        'Direct client communication',
        'Verified provider badges',
        'Promoted listing options'
      ],
      pricing: 'Starting at $20/month',
      buttonText: 'Continue as Service Provider',
      isPopular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation Header */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Wrench className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Maintenance Manager</h1>
              </div>
            </div>
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Choose Your Account Type
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the option that best describes your role to get a customized experience 
              and access to the right features for your needs.
            </p>
          </div>

          {/* User Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {userTypes.map((userType) => (
              <Card 
                key={userType.type} 
                className={`relative transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  userType.isPopular ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelectUserType(userType.type)}
              >
                {userType.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Popular Choice
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mx-auto mb-4">
                    <userType.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{userType.title}</CardTitle>
                  <CardDescription className="text-base">
                    {userType.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-medium">What you get:</h4>
                    <ul className="space-y-2">
                      {userType.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-4">{userType.pricing}</p>
                    <Button 
                      className="w-full group"
                      onClick={() => onSelectUserType(userType.type)}
                    >
                      {userType.buttonText}
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't worry - you can switch between account types later in your settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}