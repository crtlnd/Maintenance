import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Star, Users, TrendingUp, Shield, Clock, Zap, Bot, ChevronDown, Play, Menu, X } from 'lucide-react';
import caseyUptimeLogo from 'figma:asset/b0281f1af0d4ecb0182aeab92b8439ecbadd5431.png';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      title: "Smart Asset Management",
      description: "Track all your equipment, machinery, and infrastructure in one centralized platform with real-time status updates.",
      benefits: ["Eliminate spreadsheets", "Real-time visibility", "Asset lifecycle tracking"]
    },
    {
      icon: <Clock className="h-8 w-8 text-green-600" />,
      title: "Preventive Maintenance",
      description: "Schedule and automate maintenance tasks to prevent costly breakdowns and extend asset lifespan.",
      benefits: ["Automated scheduling", "Maintenance reminders", "Task management"]
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Team Collaboration",
      description: "Coordinate maintenance activities across your team with task assignments and progress tracking.",
      benefits: ["Team assignments", "Progress tracking", "Communication tools"]
    },
    {
      icon: <Bot className="h-8 w-8 text-orange-600" />,
      title: "AI-Powered Insights",
      description: "Get intelligent recommendations for maintenance optimization and predictive analytics.",
      benefits: ["Predictive maintenance", "Cost optimization", "Risk assessment"]
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "FMEA & Risk Analysis",
      description: "Identify potential failures before they happen with built-in risk assessment tools.",
      benefits: ["Failure mode analysis", "Risk prioritization", "Safety compliance"]
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Service Provider Network",
      description: "Connect with qualified maintenance professionals when you need external expertise.",
      benefits: ["Verified providers", "Local specialists", "Quick response times"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "Facilities Manager",
      company: "TechCorp Industries",
      quote: "Casey Uptime transformed our maintenance operations. We've reduced unexpected downtime by 45% and saved thousands in reactive maintenance costs.",
      rating: 5,
      savings: "$15,000/month"
    },
    {
      name: "Mike Rodriguez",
      title: "Plant Manager",
      company: "ManufacturingPlus",
      quote: "The AI insights helped us prevent a major equipment failure that would have cost us $50,000. ROI was immediate.",
      rating: 5,
      savings: "$8,200/month"
    },
    {
      name: "Lisa Chen",
      title: "Maintenance Director",
      company: "Global Logistics",
      quote: "Finally, a maintenance platform that actually works for our team. Setup was quick and the interface is intuitive.",
      rating: 5,
      savings: "$12,500/month"
    }
  ];

  const stats = [
    { number: "45%", label: "Reduction in Downtime" },
    { number: "60%", label: "Lower Maintenance Costs" },
    { number: "500+", label: "Companies Trust Us" },
    { number: "99.9%", label: "Platform Uptime" }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 5 assets",
        "Basic maintenance tracking",
        "Task management",
        "Email support"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Professional",
      price: "$20",
      period: "per month",
      description: "For growing maintenance teams",
      features: [
        "Unlimited assets",
        "Advanced reporting",
        "Team collaboration",
        "Priority support",
        "FMEA analysis"
      ],
      cta: "Get Started",
      popular: true
    },
    {
      name: "AI-Powered",
      price: "$50",
      period: "per month",
      description: "Maximum efficiency with AI insights",
      features: [
        "Everything in Professional",
        "AI-powered recommendations",
        "Predictive maintenance",
        "Advanced analytics",
        "Custom integrations"
      ],
      cta: "Get Started",
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
                src={caseyUptimeLogo} 
                alt="Casey Uptime" 
                className="h-12 w-auto"
              />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
              <Button variant="ghost" onClick={onLogin}>Login</Button>
              <Button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-700">
                Get Started Free
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
                <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Reviews</a>
                <Button variant="ghost" onClick={onLogin} className="justify-start">Login</Button>
                <Button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-700">
                  Get Started Free
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
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Stop Reactive Maintenance.
                <br />
                <span className="text-blue-600">Start Preventing Problems.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8">
                Casey Uptime helps maintenance teams reduce downtime by 45% with smart asset management, 
                preventive scheduling, and AI-powered insights. Join 500+ companies already saving thousands.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200"
                >
                  Start Free - No Credit Card Required
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Start with free plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Setup in under 5 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No long-term contracts</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1748347568194-c8cd8edd27da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwbWFpbnRlbmFuY2UlMjBmYWN0b3J5JTIwZXF1aXBtZW50fGVufDF8fHx8MTc1NTk4NzAxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Industrial maintenance equipment in modern factory"
                  className="w-full h-auto"
                />
              </div>
              {/* Floating Stats Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-4 border">
                <div className="text-2xl font-bold text-green-600">45%</div>
                <div className="text-sm text-gray-600">Less Downtime</div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-lg shadow-xl p-4 border">
                <div className="text-2xl font-bold text-blue-600">$2.4k</div>
                <div className="text-sm text-gray-600">Avg Monthly Savings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
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
                Are You Tired of Maintenance Fires?
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-700">Equipment breaks down unexpectedly, causing costly downtime</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-700">Maintenance schedules tracked in spreadsheets and sticky notes</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-700">No visibility into asset health or maintenance history</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-700">Team struggles to coordinate and communicate effectively</p>
                </div>
              </div>
              <p className="text-xl text-gray-700 font-medium">
                Casey Uptime transforms reactive maintenance into proactive success.
              </p>
            </div>
            <div>
              <Card className="p-8 shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">With Casey Uptime, You Get:</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Predictable maintenance</strong> that prevents breakdowns</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Complete asset visibility</strong> in one centralized platform</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>AI-powered insights</strong> for smarter decisions</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Team coordination</strong> that actually works</p>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-white rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">Average ROI</div>
                    <div className="text-3xl font-bold text-gray-900">280%</div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Modern Maintenance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed by maintenance professionals, for maintenance professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border-0">
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
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
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

      {/* Social Proof Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Join the Maintenance Revolution
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Thousands of maintenance professionals trust Casey Uptime to keep their operations running smoothly. 
                From small facilities to enterprise operations, we're the platform teams choose for success.
              </p>
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm opacity-75">Companies</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">10,000+</div>
                  <div className="text-sm opacity-75">Assets Managed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">99.9%</div>
                  <div className="text-sm opacity-75">Uptime</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1632910121591-29e2484c0259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWludGVuYW5jZSUyMHRlYW0lMjBjb2xsYWJvcmF0aW9uJTIwZGFzaGJvYXJkfGVufDF8fHx8MTc1NTk4NzAyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Team collaboration dashboard"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Maintenance Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See how companies like yours are transforming their maintenance operations
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
                      <div className="text-sm text-gray-500">Monthly Savings</div>
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
              Choose Your Maintenance Success Plan
            </h2>
            <p className="text-xl text-gray-600">
              Start with our free plan, upgrade when you're ready. Test all features risk-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`p-8 shadow-lg border-2 relative ${
                plan.popular 
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50' 
                  : 'border-gray-200 bg-white'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
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
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={onGetStarted}
                    className={`w-full py-3 ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
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
            <p className="text-gray-600 mb-4">All plans include:</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <span>✓ Email & chat support</span>
              <span>✓ 99.9% uptime SLA</span>
              <span>✓ Data export & backups</span>
              <span>✓ SSL security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Maintenance Operations?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 500+ companies already saving thousands with smarter maintenance management.
            Start your free account today - no credit card required.
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium shadow-xl"
          >
            Start Free Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm mt-6 opacity-75">
            No setup fees • Cancel anytime
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
                  src={caseyUptimeLogo} 
                  alt="Casey Uptime" 
                  className="h-10 w-auto filter brightness-0 invert"
                />
              </div>
              <p className="text-gray-400">
                Modern maintenance management for forward-thinking teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Casey Uptime. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}