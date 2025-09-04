import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Building, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../utils/auth';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    role: '',
  });
  const [selectedPlan, setSelectedPlan] = useState('Basic'); // Default plan
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    'Maintenance Manager',
    'Maintenance Technician',
    'Plant Manager',
    'Operations Manager',
    'Reliability Engineer',
    'Facility Manager',
    'Other',
  ];

  const plans = [
    { name: 'Basic', price: '$20', period: 'per month', priceId: 'price_1S2E1zGi9H80HINUlSIJ5u1v', description: 'For small operations managing up to 5 assets' },
    { name: 'Professional', price: '$50', period: 'per month', priceId: 'price_1S2E2rGi9H80HINU3SVfZwFn', description: 'For operations with unlimited assets' },
    { name: 'Annual', price: '$449', period: 'per year', priceId: 'price_1S2E3nGi9H80HINU7PLjhbQs', description: 'Maximum savings for unlimited assets' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.company || !formData.role) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsLoading(true);
    try {
      console.log('Starting signup process with data:', JSON.stringify({ ...formData, plan: selectedPlan }, null, 2));
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const signupResponse = await signup(
        {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          role: formData.role,
          username: formData.email,
          consent: true,
          plan: selectedPlan,
        },
        controller.signal
      );
      clearTimeout(timeoutId);
      if (!signupResponse.success) {
        console.error('Signup API failed');
        setError('Failed to create account. Please try again.');
        setIsLoading(false);
        return;
      }
      console.log('Signup API succeeded');
      const token = signupResponse.token || localStorage.getItem('token');
      if (!token) {
        console.error('No token found after signup');
        setError('Authentication error. Please try again.');
        setIsLoading(false);
        return;
      }
      const selectedPlanData = plans.find((plan) => plan.name === selectedPlan);
      if (!selectedPlanData) {
        console.error('Selected plan not found');
        setError('Invalid plan selected. Please try again.');
        setIsLoading(false);
        return;
      }
      console.log('Sending request to create-checkout-session:', {
        priceId: selectedPlanData.priceId,
        email: formData.email,
        plan: selectedPlan,
      });
      const response = await fetch('http://localhost:3000/api/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: selectedPlanData.priceId,
          email: formData.email,
          plan: selectedPlan,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Stripe checkout session failed:', JSON.stringify(errorData, null, 2));
        setError('Failed to initiate subscription. Please try again.');
        setIsLoading(false);
        return;
      }
      const { url } = await response.json();
      console.log('Received Stripe Checkout URL:', url);
      if (!url) {
        console.error('No URL returned from create-checkout-session');
        setError('Failed to initiate subscription. Please try again.');
        setIsLoading(false);
        return;
      }
      window.location.href = url; // Redirect to Stripe Checkout
    } catch (err) {
      console.error('Signup process error:', err.message, err.stack);
      setError(err.name === 'TimeoutError' ? 'Request timed out. Please try again.' : 'An error occurred during signup. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Get started with Maintenance Manager!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-6">Choose Your Plan</h3>
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedPlan === plan.name ? 'border-blue-500 border-2 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                <h4 className="text-lg font-bold mb-2">{plan.name}</h4>
                <p className="text-xl font-semibold mb-2">{plan.price}<span className="text-sm font-normal text-gray-600">/{plan.period}</span></p>
                <p className="text-sm text-gray-600 leading-relaxed">{plan.description}</p>
              </Card>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="first-name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john.doe@company.com"
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Your Company Name"
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                required
              >
                <SelectTrigger id="role" className="pl-10">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password"
                className="pl-10 pr-10"
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
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm password"
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={onSwitchToLogin}
            >
              Sign in
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
