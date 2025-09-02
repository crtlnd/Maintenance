// frontend/src/components/account/CustomerPricingSection.tsx
import React, { useState } from 'react';
import { Check, Crown, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../utils/auth';

export function CustomerPricingSection() {
  const { user, upgradePlan } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const currentPlan = user?.subscriptionTier || 'Basic';

  const PRICING_TIERS = [
    {
      plan: 'Basic',
      name: 'Basic',
      price: 20,
      assetLimit: 5,
      seatLimit: 1,
      isPopular: false,
      features: [
        'Up to 5 assets',
        'AI-powered maintenance insights',
        'Maintenance tracking',
        'Task management',
        'Email support',
        '7-day free trial (credit card required)',
      ],
    },
    {
      plan: 'Professional',
      name: 'Professional',
      price: 50,
      assetLimit: 'unlimited',
      seatLimit: '1',
      isPopular: true,
      features: [
        'Unlimited assets',
        'AI-powered maintenance insights',
        'Advanced reporting',
        'Team collaboration',
        'Priority support',
        'FMEA analysis',
        '7-day free trial (credit card required)',
      ],
    },
    {
      plan: 'Annual',
      name: 'Annual',
      price: 449,
      assetLimit: 'unlimited',
      seatLimit: 'unlimited',
      isPopular: false,
      features: [
        'Unlimited assets',
        'AI-powered maintenance insights',
        'Advanced reporting',
        'Team collaboration',
        'Priority support',
        'FMEA analysis',
        '7-day free trial (credit card required)',
      ],
    },
  ];

  // frontend/src/components/account/CustomerPricingSection.tsx (partial update)
const handleUpgrade = async (plan: string) => {
  console.log('Attempting to upgrade to:', plan, 'Current plan:', currentPlan);
  if (plan === currentPlan) {
    console.log('Plan is already active, skipping upgrade');
    return;
  }
  setLoading(plan);
  try {
    const success = await upgradePlan(plan);
    console.log('Upgrade result:', success);
    if (success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  } catch (error) {
    console.error('Upgrade failed:', error);
  } finally {
    setLoading(null);
  }
};

  const getButtonText = (plan: string) => {
    if (plan === currentPlan) return 'Current Plan';
    return 'Upgrade';
  };

  const getButtonVariant = (plan: string) => {
    if (plan === currentPlan) return 'secondary';
    return 'default';
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'Basic':
        return <Zap className="h-5 w-5" />;
      case 'Professional':
        return <Crown className="h-5 w-5" />;
      case 'Annual':
        return <Crown className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const isButtonDisabled = (plan: string) => {
    return plan === currentPlan || loading !== null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3>Maintenance Management Plans</h3>
        <p className="text-muted-foreground">
          Choose the plan that best fits your maintenance management needs.
        </p>
      </div>
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4" />
          <AlertDescription className="text-green-800">
            Your subscription has been updated successfully!
          </AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING_TIERS.map((tier) => (
          <Card
            key={tier.plan}
            className={`relative ${tier.isPopular ? 'ring-2 ring-primary' : ''} ${
              tier.plan === currentPlan ? 'bg-primary/5 border-primary' : ''
            }`}
          >
            {tier.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
            )}
            {tier.plan === currentPlan && (
              <div className="absolute -top-3 right-4">
                <Badge variant="secondary">Current</Badge>
              </div>
            )}
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${
                  tier.plan === currentPlan ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {getPlanIcon(tier.plan)}
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">
                  ${tier.price}
                  <span className="text-base font-normal text-muted-foreground">
                    {tier.plan === 'Annual' ? '/year' : '/month'}
                  </span>
                </div>
                <CardDescription>
                  {tier.assetLimit === 'unlimited' ? 'Unlimited' : `Up to ${tier.assetLimit}`} assets,{' '}
                  {tier.seatLimit === 'unlimited' ? 'unlimited' : tier.seatLimit} seat{tier.seatLimit !== 1 ? 's' : ''}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={getButtonVariant(tier.plan)}
                disabled={isButtonDisabled(tier.plan)}
                onClick={() => handleUpgrade(tier.plan)}
              >
                {loading === tier.plan ? 'Processing...' : getButtonText(tier.plan)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Current Usage */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Current Usage</CardTitle>
            <CardDescription>Track your current usage against your plan limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Assets</span>
                  <span>
                    {user.assetCount} of {user.subscriptionTier === 'Basic' ? 5 : '∞'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: user.subscriptionTier === 'Basic'
                        ? `${Math.min((user.assetCount / 5) * 100, 100)}%`
                        : '1%',
                    }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Team Members</span>
                  <span>1 of {user.subscriptionTier === 'Basic' ? 1 : '∞'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: user.subscriptionTier === 'Basic' ? '100%' : '1%',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
