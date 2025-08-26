import React, { useState } from 'react';
import { Check, Crown, Zap, Building, Star, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../utils/auth';
import { SubscriptionPlan } from '../../types';
import { PRICING_TIERS } from '../../utils/constants';

export function CustomerPricingSection() {
  const { user, upgradePlan } = useAuth();
  const [loading, setLoading] = useState<SubscriptionPlan | null>(null);
  const [success, setSuccess] = useState(false);

  const currentPlan = user?.subscription.plan || 'free';

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return;

    setLoading(plan);
    try {
      const success = await upgradePlan(plan);
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

  const getButtonText = (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return 'Current Plan';
    if (plan === 'free') return currentPlan !== 'free' ? 'Downgrade' : 'Current Plan';
    return 'Upgrade';
  };

  const getButtonVariant = (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return 'secondary';
    return 'default';
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'free':
        return <Zap className="h-5 w-5" />;
      case 'pro':
        return <Crown className="h-5 w-5" />;
      case 'ai-powered':
        return <Bot className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const isButtonDisabled = (plan: SubscriptionPlan) => {
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
        {PRICING_TIERS?.map((tier) => (
          <Card 
            key={tier.plan} 
            className={`relative ${tier.isPopular ? 'ring-2 ring-primary' : ''} ${
              tier.plan === currentPlan ? 'bg-primary/5 border-primary' : ''
            }`}
          >
            {tier.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
            )}
            {tier.plan === currentPlan && (
              <div className="absolute -top-3 right-4">
                <Badge variant="secondary">
                  Current
                </Badge>
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
                  {typeof tier.price === 'number' ? (
                    <>
                      ${tier.price}
                      <span className="text-base font-normal text-muted-foreground">
                        {tier.price > 0 ? '/month' : ''}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl">{tier.price}</span>
                  )}
                </div>
                <CardDescription>
                  {tier.assetLimit === 'unlimited' ? 'Unlimited' : `Up to ${tier.assetLimit}`} assets, {' '}
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
      {user && user.userType === 'customer' && (
        <Card>
          <CardHeader>
            <CardTitle>Current Usage</CardTitle>
            <CardDescription>
              Track your current usage against your plan limits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Assets</span>
                  <span>
                    5 of {user.subscription.assetLimit === 'unlimited' ? '∞' : user.subscription.assetLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ 
                      width: user.subscription.assetLimit === 'unlimited' 
                        ? '1%' 
                        : `${Math.min((5 / (user.subscription.assetLimit as number)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Team Members</span>
                  <span>
                    {user.organization?.subscription.usedSeats || 1} of {user.subscription.seatLimit === 'unlimited' ? '∞' : user.subscription.seatLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ 
                      width: user.subscription.seatLimit === 'unlimited' 
                        ? '1%' 
                        : `${Math.min(((user.organization?.subscription.usedSeats || 1) / (user.subscription.seatLimit as number)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Features CTA */}
      <Card className="border-2 border-dashed border-muted-foreground/25">
        <CardContent className="p-6 text-center space-y-4">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h4>Need AI-powered insights?</h4>
            <p className="text-muted-foreground">
              Upgrade to AI-Powered plan for intelligent diagnostics, predictive maintenance scheduling, and personalized maintenance recommendations.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => handleUpgrade('ai-powered')}
            disabled={currentPlan === 'ai-powered' || loading !== null}
          >
            {currentPlan === 'ai-powered' ? 'Current Plan' : 'Upgrade to AI-Powered'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}