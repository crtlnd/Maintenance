import React, { useState } from 'react';
import { Check, Crown, Zap, Star, TrendingUp, Badge as BadgeIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../utils/auth';
import { ServiceProviderPlan } from '../../types';
import { SERVICE_PROVIDER_PRICING_TIERS } from '../../utils/constants';

export function ServiceProviderPricingSection() {
  const { user, upgradePlan } = useAuth();
  const [loading, setLoading] = useState<ServiceProviderPlan | null>(null);
  const [success, setSuccess] = useState(false);

  const currentPlan = user?.serviceProviderProfile?.subscription.plan || 'verified';

  const handleUpgrade = async (plan: ServiceProviderPlan) => {
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

  const getButtonText = (plan: ServiceProviderPlan) => {
    if (plan === currentPlan) return 'Current Plan';
    return 'Upgrade';
  };

  const getButtonVariant = (plan: ServiceProviderPlan) => {
    if (plan === currentPlan) return 'secondary';
    return 'default';
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

  const isButtonDisabled = (plan: ServiceProviderPlan) => {
    return plan === currentPlan || loading !== null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3>Service Provider Plans</h3>
        <p className="text-muted-foreground">
          Choose the plan that best helps you connect with customers and grow your business.
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
        {SERVICE_PROVIDER_PRICING_TIERS?.map((tier) => (
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
                  Professional service provider features
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

      {/* Current Benefits */}
      {user?.serviceProviderProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Your Current Benefits</CardTitle>
            <CardDescription>
              Features included with your current plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className={`text-2xl mb-2 ${
                  user.serviceProviderProfile.isVerified ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {user.serviceProviderProfile.isVerified ? '✓' : '✗'}
                </div>
                <h4 className="font-medium">Verified Badge</h4>
                <p className="text-sm text-muted-foreground">
                  {user.serviceProviderProfile.isVerified ? 'Active' : 'Not included'}
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className={`text-2xl mb-2 ${
                  user.serviceProviderProfile.canDirectMessage ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {user.serviceProviderProfile.canDirectMessage ? '✓' : '✗'}
                </div>
                <h4 className="font-medium">Direct Messaging</h4>
                <p className="text-sm text-muted-foreground">
                  {user.serviceProviderProfile.canDirectMessage ? 'Active' : 'Not included'}
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className={`text-2xl mb-2 ${
                  user.serviceProviderProfile.isPromoted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {user.serviceProviderProfile.isPromoted ? '✓' : '✗'}
                </div>
                <h4 className="font-medium">Promoted Listings</h4>
                <p className="text-sm text-muted-foreground">
                  {user.serviceProviderProfile.isPromoted ? 'Active' : 'Not included'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROI Information */}
      <Card className="border-2 border-dashed border-muted-foreground/25">
        <CardContent className="p-6 text-center space-y-4">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h4>Maximize Your Return on Investment</h4>
            <p className="text-muted-foreground">
              Service providers typically see a 300-500% ROI within the first 3 months of upgrading to Premium or Promoted plans.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-600">+150%</div>
              <div className="text-muted-foreground">Lead Generation</div>
            </div>
            <div>
              <div className="font-medium text-green-600">+75%</div>
              <div className="text-muted-foreground">Conversion Rate</div>
            </div>
            <div>
              <div className="font-medium text-purple-600">+200%</div>
              <div className="text-muted-foreground">Customer Trust</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}