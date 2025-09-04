import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Save, TestTube } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { useAuth } from '../../utils/auth';
import { NotificationPreferences } from '../../types';
import { NotificationService } from '../../utils/notifications';

export function NotificationSettings() {
  const { user, updateNotificationPreferences } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [testingNotifications, setTestingNotifications] = useState(false);
  const [testResult, setTestResult] = useState<{ email: boolean; sms: boolean } | null>(null);

  const [preferences, setPreferences] = useState<NotificationPreferences>(
    user?.notificationPreferences || {
      maintenanceDue: true,
      maintenanceOverdue: true,
      assetFailures: true,
      highRiskFMEA: true,
      taskAssignments: true,
      systemUpdates: false,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      digestFrequency: 'daily',
    }
  );

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess(false);

    // Save to your auth context (existing functionality)
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateNotificationPreferences(preferences);

    // FIXED: Save to localStorage for NotificationService integration
    const notificationPrefs = {
      email: {
        taskAssignment: preferences.taskAssignments,
        taskCompletion: true,
        overdueTasks: preferences.maintenanceOverdue,
        maintenanceReminders: preferences.maintenanceDue,
      },
      sms: {
        taskAssignment: preferences.smsNotifications && preferences.taskAssignments,
        taskCompletion: preferences.smsNotifications,
        overdueTasks: preferences.smsNotifications && preferences.maintenanceOverdue,
        urgentAlerts: preferences.smsNotifications && preferences.assetFailures,
      },
      contactInfo: {
        email: user?.email || '',
        phone: '+1-555-0123', // Add a default phone or get from user profile
      },
    };

    localStorage.setItem('notificationPreferences', JSON.stringify(notificationPrefs));
    console.log('Saved notification preferences:', notificationPrefs);

    setIsSaving(false);
    setSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  };

  const testNotifications = async () => {
    setTestingNotifications(true);
    const notificationService = NotificationService.getInstance();

    try {
      const mockTask = {
        id: 'test-task',
        description: 'Test Maintenance Task - Notification Integration',
        responsible: user?.firstName + ' ' + user?.lastName || 'Test User',
        taskType: 'preventive' as const,
        priority: 'medium' as const,
        frequency: 'Weekly',
        estimatedDuration: '2 hours',
        nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
      };

      const mockAsset = {
        id: 1,
        name: 'Test Industrial Equipment',
        type: 'Manufacturing Equipment',
        location: 'Production Floor A',
      };

      // Test the notification service
      const result = await notificationService.notifyTaskAssignment(
        mockTask,
        mockAsset,
        preferences.emailNotifications ? user?.email : undefined,
        preferences.smsNotifications ? '+1-555-TEST' : undefined
      );

      setTestResult(result);
    } catch (error) {
      console.error('Error testing notifications:', error);
      setTestResult({ email: false, sms: false });
    } finally {
      setTestingNotifications(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const notificationTypes = [
    {
      key: 'maintenanceDue' as const,
      title: 'Maintenance Due',
      description: 'Get notified when maintenance tasks are approaching their due date',
      icon: Bell,
    },
    {
      key: 'maintenanceOverdue' as const,
      title: 'Maintenance Overdue',
      description: 'Alert when maintenance tasks are past their due date',
      icon: Bell,
    },
    {
      key: 'assetFailures' as const,
      title: 'Asset Failures',
      description: 'Immediate alerts for asset failures and critical issues',
      icon: Bell,
    },
    {
      key: 'highRiskFMEA' as const,
      title: 'High Risk FMEA Items',
      description: 'Notifications for FMEA items with high risk priority numbers',
      icon: Bell,
    },
    {
      key: 'taskAssignments' as const,
      title: 'Task Assignments',
      description: 'Get notified when maintenance tasks are assigned to you',
      icon: Bell,
    },
    {
      key: 'systemUpdates' as const,
      title: 'System Updates',
      description: 'Notifications about new features and system maintenance',
      icon: Bell,
    },
  ];

  const deliveryMethods = [
    {
      key: 'emailNotifications' as const,
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail,
    },
    {
      key: 'pushNotifications' as const,
      title: 'Push Notifications',
      description: 'Browser push notifications when using the web app',
      icon: Smartphone,
    },
    {
      key: 'smsNotifications' as const,
      title: 'SMS Notifications',
      description: 'Text message notifications for critical alerts (Pro plan)',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3>Notification Settings</h3>
        <p className="text-muted-foreground">
          Configure how and when you want to receive notifications about your assets and maintenance tasks.
        </p>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            Notification preferences updated successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which events you want to be notified about.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationTypes.map((type, index) => (
            <div key={type.key}>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-lg">
                  <type.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">{type.title}</Label>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    <Switch
                      checked={preferences[type.key] as boolean}
                      onCheckedChange={(checked) => updatePreference(type.key, checked)}
                    />
                  </div>
                </div>
              </div>
              {index < notificationTypes.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Methods</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {deliveryMethods.map((method, index) => (
            <div key={method.key}>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-lg">
                  <method.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">{method.title}</Label>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <Switch
                      checked={preferences[method.key] as boolean}
                      onCheckedChange={(checked) => updatePreference(method.key, checked)}
                      disabled={method.key === 'smsNotifications' && user?.subscription.plan === 'free'}
                    />
                  </div>
                </div>
              </div>
              {index < deliveryMethods.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}

          <Separator />

          <div className="space-y-2">
            <Label>Email Digest Frequency</Label>
            <Select
              value={preferences.digestFrequency}
              onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'never') =>
                updatePreference('digestFrequency', value)
              }
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Receive a summary of maintenance activities and alerts.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Notifications
          </CardTitle>
          <CardDescription>
            Send a test notification to verify your settings are working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {testResult && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                <strong>Test Results:</strong> Email: {testResult.email ? 'Sent' : 'Failed'},
                SMS: {testResult.sms ? 'Sent' : 'Failed'}
                <br />
                <span className="text-sm">Check the browser console for detailed notification logs</span>
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={testNotifications}
            disabled={testingNotifications}
            variant="outline"
          >
            {testingNotifications ? (
              <>
                <TestTube className="h-4 w-4 mr-2 animate-pulse" />
                Sending Test...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Send Test Notification
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Save className="h-4 w-4 mr-2 animate-pulse" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>

      {user?.subscription.plan === 'free' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Upgrade for More Features</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Get SMS notifications, advanced alert customization, and priority support with our Pro plan.
                </p>
                <Button variant="outline" size="sm" className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-100">
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
