import React, { useState } from 'react';
import { Bot, Zap, TrendingUp, Shield, Clock, ArrowRight, CheckCircle, Star, Sparkles, Brain, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

interface AIAssistantUpgradeViewProps {
  currentPlan: 'free' | 'pro';
}

export function AIAssistantUpgradeView({ currentPlan }: AIAssistantUpgradeViewProps) {
  const { upgradePlan } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const success = await upgradePlan('ai-powered');
      if (success) {
        toast.success('🎉 Congratulations! You now have access to AI-powered features!');
        // Force a page reload to update the UI
        window.location.reload();
      } else {
        toast.error('Upgrade failed. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const aiFeatures = [
    {
      icon: <Brain className="h-8 w-8 text-blue-500" />,
      title: "Intelligent Asset Analysis",
      description: "AI analyzes your asset data to identify patterns, predict failures, and recommend optimizations.",
      benefit: "Reduce unexpected downtime by up to 40%"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-500" />,
      title: "Predictive Maintenance",
      description: "Machine learning algorithms predict when equipment needs maintenance before problems occur.",
      benefit: "Extend asset lifespan by 25-30%"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
      title: "Smart Scheduling",
      description: "AI optimizes maintenance schedules based on usage patterns, criticality, and resource availability.",
      benefit: "Improve maintenance efficiency by 35%"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "Automated Insights",
      description: "Get instant recommendations and insights from your maintenance data with natural language queries.",
      benefit: "Save 10+ hours per week on reporting"
    },
    {
      icon: <Shield className="h-8 w-8 text-red-500" />,
      title: "Risk Assessment",
      description: "Advanced algorithms identify high-risk scenarios and prioritize critical maintenance tasks.",
      benefit: "Prevent 90% of safety incidents"
    },
    {
      icon: <Clock className="h-8 w-8 text-indigo-500" />,
      title: "Real-time Optimization",
      description: "Continuous AI monitoring adjusts recommendations based on real-time performance data.",
      benefit: "Optimize costs by 20-25%"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "Maintenance Manager at TechCorp",
      quote: "The AI Assistant has transformed our maintenance strategy. We've reduced downtime by 45% in just 3 months.",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      title: "Operations Director at ManufacturingPlus",
      quote: "Predictive maintenance insights helped us avoid a $50k equipment failure. The ROI was immediate.",
      rating: 5
    }
  ];

  const pricingComparison = {
    free: {
      features: ["Up to 5 assets", "Basic reporting", "Manual scheduling", "Email support"]
    },
    pro: {
      features: ["Unlimited assets", "Advanced reporting", "Team collaboration", "Priority support"]
    },
    aiPowered: {
      features: ["Everything in Pro", "AI-powered insights", "Predictive maintenance", "Smart optimization", "Custom AI models"]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl">
              <Bot className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Unlock the Power of AI-Driven Maintenance
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Transform your maintenance operations with intelligent insights, predictive analytics, 
            and automated optimization. See how AI can revolutionize your workflow.
          </p>
          
          {/* Current Plan Badge */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-gray-500">Current plan:</span>
            <Badge variant="outline" className="capitalize font-medium">
              {currentPlan}
            </Badge>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium">
              AI-Powered
            </Badge>
          </div>

          {/* Main CTA */}
          <Button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200"
          >
            {isUpgrading ? (
              <>
                <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                Upgrading...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Upgrade to AI-Powered - $50/month
              </>
            )}
          </Button>
          
          <p className="text-sm text-gray-500 mt-3">
            ✅ Cancel anytime • ✅ Instant access
          </p>
        </div>

        {/* AI Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            What You'll Get with AI Assistant
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">{feature.benefit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Demo Preview */}
        <div className="mb-16">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-4">See AI Assistant in Action</CardTitle>
              <p className="text-blue-100">Here's what the AI Assistant interface looks like:</p>
            </CardHeader>
            <CardContent>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">AI Assistant</div>
                    <div className="text-sm text-blue-200">Analyzing your maintenance data...</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                    <div className="font-medium mb-2">🔍 Predictive Insight</div>
                    <div className="text-sm text-blue-100">
                      "Your Conveyor Belt #CB-001 shows signs of belt misalignment. Based on vibration patterns, 
                      I recommend scheduling maintenance within 5-7 days to prevent unexpected failure."
                    </div>
                  </div>
                  
                  <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                    <div className="font-medium mb-2">💡 Optimization Recommendation</div>
                    <div className="text-sm text-green-100">
                      "Scheduling pump maintenance during next Tuesday's planned downtime could save 
                      $2,400 in production costs compared to reactive maintenance."
                    </div>
                  </div>
                  
                  <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
                    <div className="font-medium mb-2">⚠️ Risk Alert</div>
                    <div className="text-sm text-yellow-100">
                      "High-priority: Boiler pressure readings are approaching critical thresholds. 
                      Immediate inspection recommended."
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-sm text-gray-300 italic">
                    💬 Ask me anything: "What assets need attention this week?" or "Show me cost savings opportunities"
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-medium text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.title}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Compare Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <Card className={`border-2 ${currentPlan === 'free' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Free</CardTitle>
                <div className="text-3xl font-bold">$0</div>
                <div className="text-sm text-gray-500">per month</div>
                {currentPlan === 'free' && (
                  <Badge className="bg-blue-100 text-blue-800">Current Plan</Badge>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pricingComparison.free.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className={`border-2 ${currentPlan === 'pro' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Pro</CardTitle>
                <div className="text-3xl font-bold">$20</div>
                <div className="text-sm text-gray-500">per month</div>
                {currentPlan === 'pro' && (
                  <Badge className="bg-blue-100 text-blue-800">Current Plan</Badge>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pricingComparison.pro.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* AI-Powered Plan */}
            <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 text-xs font-medium">
                RECOMMENDED
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">AI-Powered</CardTitle>
                <div className="text-3xl font-bold">$50</div>
                <div className="text-sm text-gray-500">per month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pricingComparison.aiPowered.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isUpgrading ? 'Upgrading...' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ROI Calculator */}
        <Card className="mb-16 border-0 shadow-xl bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-800">Calculate Your ROI</CardTitle>
            <p className="text-green-600">See how much you could save with AI-powered maintenance</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">40%</div>
                <div className="text-sm text-gray-600">Reduction in unexpected downtime</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2">25%</div>
                <div className="text-sm text-gray-600">Extension in asset lifespan</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-2">$2,400</div>
                <div className="text-sm text-gray-600">Average monthly savings</div>
              </div>
            </div>
            <div className="text-center mt-6">
              <div className="text-lg font-medium text-gray-800">
                Typical payback period: <span className="text-green-600 font-bold">2-3 months</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <div className="text-center">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-gray-900 to-blue-900 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Maintenance?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of maintenance professionals who are already using AI to optimize their operations.
              </p>
              <Button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-medium shadow-xl"
              >
                {isUpgrading ? (
                  <>
                    <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                    Upgrading to AI-Powered...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Start Your AI Journey Today
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Instant activation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}