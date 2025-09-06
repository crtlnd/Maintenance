import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle, X, Filter, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface Notification {
  id: string;
  type: 'overdue' | 'due_today' | 'due_soon' | 'assignment' | 'failure' | 'completion' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assetName?: string;
  taskId?: string;
  read: boolean;
  dismissed: boolean;
}

export function NotificationView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high_priority'>('all');

  // Load notifications from localStorage or API
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // Get sample notifications based on maintenance data
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'overdue',
        title: 'Overdue Maintenance Task',
        message: 'Hydraulic System Inspection for Production Line A is 3 days overdue',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        priority: 'critical',
        assetName: 'Production Line A',
        taskId: 'MAINT-001',
        read: false,
        dismissed: false
      },
      {
        id: '2',
        type: 'due_today',
        title: 'Maintenance Due Today',
        message: 'Monthly calibration required for Precision Lathe CNC-450',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        priority: 'high',
        assetName: 'Precision Lathe CNC-450',
        taskId: 'MAINT-002',
        read: false,
        dismissed: false
      },
      {
        id: '3',
        type: 'assignment',
        title: 'New Task Assigned',
        message: 'Preventive maintenance task assigned: Belt replacement on Conveyor System B',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        priority: 'medium',
        assetName: 'Conveyor System B',
        taskId: 'MAINT-003',
        read: true,
        dismissed: false
      },
      {
        id: '4',
        type: 'failure',
        title: 'Asset Failure Alert',
        message: 'Temperature sensor malfunction detected on Industrial Boiler Unit 2',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        priority: 'critical',
        assetName: 'Industrial Boiler Unit 2',
        read: false,
        dismissed: false
      },
      {
        id: '5',
        type: 'completion',
        title: 'Task Completed',
        message: 'Oil change completed for Generator Unit 3 by John Smith',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        priority: 'low',
        assetName: 'Generator Unit 3',
        taskId: 'MAINT-004',
        read: true,
        dismissed: false
      },
      {
        id: '6',
        type: 'due_soon',
        title: 'Maintenance Due Tomorrow',
        message: 'Quarterly inspection scheduled for HVAC System - Main Building',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        priority: 'medium',
        assetName: 'HVAC System',
        taskId: 'MAINT-005',
        read: false,
        dismissed: false
      }
    ];

    setNotifications(sampleNotifications);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (notification.dismissed) return false;

    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'high_priority':
        return notification.priority === 'high' || notification.priority === 'critical';
      default:
        return true;
    }
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, dismissed: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'critical') {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }

    switch (type) {
      case 'overdue':
        return <Clock className="h-5 w-5 text-red-500" />;
      case 'due_today':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'due_soon':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'assignment':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'failure':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'completion':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read && !n.dismissed).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated on maintenance tasks, alerts, and system updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {unreadCount} unread
          </Badge>
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({notifications.filter(n => !n.dismissed).length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === 'high_priority' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('high_priority')}
        >
          High Priority ({notifications.filter(n => !n.dismissed && (n.priority === 'high' || n.priority === 'critical')).length})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground text-center">
                {filter === 'all' ? 'You\'re all caught up!' : `No ${filter.replace('_', ' ')} notifications to show.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all ${
                !notification.read ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-gray-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex items-center gap-3">
                    {getNotificationIcon(notification.type, notification.priority)}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatTimestamp(notification.timestamp)}</span>
                          {notification.assetName && (
                            <span>Asset: {notification.assetName}</span>
                          )}
                          {notification.taskId && (
                            <span>Task: {notification.taskId}</span>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.read && (
                            <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                              Mark as read
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => dismissNotification(notification.id)}>
                            Dismiss
                          </DropdownMenuItem>
                          {notification.taskId && (
                            <DropdownMenuItem>
                              View task details
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
