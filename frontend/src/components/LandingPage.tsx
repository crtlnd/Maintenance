import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Star, Users, TrendingUp, Shield, Clock, Zap, Bot, ChevronDown, Play, Menu, X, Brain, MessageSquare, AlertTriangle, Shapes } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      title: "AI-Powered Maintenance Insights",
      description: "Ask Casey anything: 'Which asset is at greatest risk?' or 'What maintenance should I prioritize?' Get intelligent answers instantly.",
      benefits: ["Natural language queries", "Predictive failure analysis", "Smart task prioritization"]
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
      title: "AI Chat Assistant",
      description: "Your personal maintenance expert available 24/7. Get instant answers about your assets, maintenance history, and optimization strategies.",
      benefits: ["24/7 AI support", "Asset-specific guidance", "Maintenance best practices"]
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
      title: "AI Risk Analysis",
      description: "Advanced AI algorithms analyze your maintenance data to identify potential failures before they happen, saving thousands in downtime.",
      benefits: ["Failure prediction", "Risk scoring", "Cost impact analysis"]
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      title: "AI Predictive Analytics",
      description: "Machine learning models analyze patterns in your maintenance data to optimize schedules and predict optimal intervention times.",
      benefits: ["Predictive scheduling", "Pattern recognition", "Performance optimization"]
    },
    {
      icon: <Shapes className="h-8 w-8 text-indigo-600" />,
      title: "Smart Asset Management",
      description: "AI-enhanced asset tracking with intelligent recommendations for maintenance intervals and lifecycle management.",
      benefits: ["Intelligent tracking", "Lifecycle optimization", "Smart recommendations"]
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "AI-Powered Service Network",
      description: "Connect with qualified maintenance professionals using AI matching based on your specific needs, location, and asset requirements.",
      benefits: ["AI provider matching", "Skill-based selection", "Performance tracking"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "Facilities Manager",
      company: "TechCorp Industries",
      quote: "Casey's AI insights predicted a pump failure 3 weeks before it would have happened. The AI chat feature is like having a maintenance expert on call 24/7.",
      rating: 5,
      savings: "$22,000/month"
    },
    {
      name: "Mike Rodriguez",
      title: "Plant Manager",
      company: "ManufacturingPlus",
      quote: "The AI risk analysis identified our most critical failure points. We prevented a $75,000 breakdown by following Casey's AI recommendations.",
      rating: 5,
      savings: "$18,500/month"
    },
    {
      name: "Lisa Chen",
      title: "Maintenance Director",
      company: "Global Logistics",
      quote: "I can ask Casey 'What equipment needs attention?' and get instant, intelligent answers. The AI has revolutionized how we manage maintenance.",
      rating: 5,
      savings: "$31,200/month"
    }
  ];

  const stats = [
    { number: "67%", label: "Reduction in Unplanned Downtime" },
    { number: "85%", label: "Faster Problem Resolution" },
    { number: "500+", label: "AI-Powered Companies" },
    { number: "24/7", label: "AI Assistant Availability" }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: "$20",
      period: "per month",
      description: "For small operations with AI-powered maintenance insights",
      features: [
        "Up to 5 assets",
        "AI-powered maintenance insights",
        "AI chat assistant",
        "Basic risk analysis",
        "Maintenance tracking",
        "Email support",
        "7-day free trial"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "AI-Powered Pro",
      price: "$50",
      period: "per month",
      description: "Full AI suite for unlimited assets with advanced analytics",
      features: [
        "Unlimited assets",
        "Advanced AI insights & predictions",
        "24/7 AI chat assistant",
        "AI risk analysis & alerts",
        "Predictive maintenance AI",
        "Team collaboration",
        "Priority AI support",
        "7-day free trial"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise AI",
      price: "$449",
      period: "per year",
      description: "Maximum AI power with enterprise features and dedicated support",
      features: [
        "Unlimited assets",
        "Full AI suite & custom models",
        "Dedicated AI specialist",
        "Advanced predictive analytics",
        "Custom AI integrations",
        "White-label options",
        "Enterprise SLA",
        "7-day free trial"
      ],
      cta: "Start Free Trial",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="/src/assets/casey-logo.jpg"
                alt="Casey"
                className="h-10 w-auto"
              />
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">AI Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Success Stories</a>
              <Button variant="ghost" onClick={onLogin}>Login</Button>
              <Button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-700">
                Try AI Free
              </Button>
            </div>
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900">AI Features</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Success Stories</a>
                <Button variant="ghost" onClick={onLogin} className="justify-start">Login</Button>
                <Button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-700">
                  Try AI Free
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Brain className="h-4 w-4" />
                AI-Powered Maintenance Platform
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Ask Your Maintenance System Anything with AI
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8">
                "Which asset is at greatest risk?" "What maintenance should I prioritize today?" Casey's AI gives you instant, intelligent answers to optimize your operations and prevent costly failures.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200"
                >
                  Start AI-Powered Maintenance Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span>AI-powered insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Setup in under 5 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
            {/* Hero Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1748347568194-c8cd8edd27da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwbWFpbnRlbmFuY2UlMjBmYWN0b3J5JTIwZXF1aXBtZW50fGVufDF8fHx8MTc1NTk4NzAxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="AI-powered industrial maintenance dashboard"
                  className="w-full h-auto"
                />
              </div>
              {/* Floating AI Stats Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-4 border">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-gray-600">AI Prevented</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">3 Failures</div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-lg shadow-xl p-4 border">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-gray-600">AI Optimized</span>
                </div>
                <div className="text-2xl font-bold text-green-600">$47k Saved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI-Driven Results</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Stop Guessing. Start Knowing with AI.
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-700">No way to predict which equipment will fail next</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-700">Maintenance decisions based on guesswork and outdated schedules</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-700">No intelligent insights about asset health and optimization</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-700">Reactive maintenance costing thousands in emergency repairs</p>
                </div>
              </div>
              <p className="text-xl text-gray-700 font-medium">
                Casey's AI transforms maintenance from reactive to predictive.
              </p>
            </div>
            <div>
              <Card className="p-8 shadow-xl border-0 bg-gradient-to-br from-purple-50 to-indigo-50">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">With Casey's AI, You Get:</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Brain className="h-6 w-6 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Predictive AI insights</strong> that prevent failures before they happen</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>24/7 AI assistant</strong> that answers any maintenance question instantly</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Smart optimization</strong> recommendations based on your data</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Risk analysis</strong> that identifies your most critical assets</p>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-white rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">Average AI-Driven ROI</div>
                    <div className="text-3xl font-bold text-gray-900">420%</div>
                    <div className="text-sm text-gray-600">in the first year</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Brain className="h-4 w-4" />
              Powered by Advanced AI
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI-Enhanced Maintenance Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature is enhanced with artificial intelligence to make your maintenance operations smarter, faster, and more predictive.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    {feature.icon}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <Brain className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              See how companies are using Casey's AI to transform their maintenance operations
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 shadow-lg border-0 bg-white">
                <CardContent className="p-0">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.title}</div>
                      <div className="text-sm text-gray-600">{testimonial.company}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">AI-Driven Savings</div>
                      <div className="text-lg font-bold text-green-600">{testimonial.savings}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your AI-Powered Plan
            </h2>
            <p className="text-xl text-gray-600">
              7-Day Free Trial with full AI features. No credit card required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`p-8 shadow-lg border-2 relative ${
                plan.popular
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 mt-8'
                  : 'border-gray-200 bg-white'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm">
                      <Brain className="h-3 w-3 mr-1 inline" />
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        {feature.includes('AI') ? (
                          <Brain className="h-5 w-5 text-purple-500 flex-shrink-0" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        )}
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={onGetStarted}
                    className={`w-full py-3 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">All plans include AI-powered features:</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <span>🧠 AI insights & predictions</span>
              <span>💬 24/7 AI chat support</span>
              <span>🔒 Enterprise security</span>
              <span>📈 Advanced analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Maintenance with AI?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join companies already preventing failures and optimizing operations with Casey's AI-powered platform.
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium shadow-xl"
          >
            Start AI-Powered Maintenance Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm mt-6 opacity-75">
            Full AI features • No credit card required • 7-day free trial
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img
                  src="/src/assets/casey-logo.jpg"
                  alt="Casey"
                  className="h-8 w-auto filter brightness-0 invert"
                />
              </div>
              <p className="text-gray-400">
                AI-powered maintenance management for forward-thinking teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">AI Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">AI Insights</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">AI Chat</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Risk Analysis</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Predictive AI</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Research</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Casey. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
