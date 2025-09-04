import { NotificationService } from './notifications';

export class NotificationIntegration {
  private static notificationService = NotificationService.getInstance();

  // Get user's notification preferences from localStorage
  private static getNotificationPreferences(): any {
    try {
      const saved = localStorage.getItem('notificationPreferences');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      return null;
    }
  }

  // Send task assignment notification
  public static async notifyTaskAssignment(
    task: any,
    asset: any,
    assignedToUserId?: string
  ): Promise<void> {
    const preferences = this.getNotificationPreferences();
    if (!preferences) {
      console.log('No notification preferences found - skipping notification');
      return;
    }

    // Check if user wants task assignment notifications
    const shouldSendEmail = preferences.email?.taskAssignment && preferences.contactInfo?.email;
    const shouldSendSMS = preferences.sms?.taskAssignment && preferences.contactInfo?.phone;

    if (shouldSendEmail || shouldSendSMS) {
      try {
        const result = await this.notificationService.notifyTaskAssignment(
          task,
          asset,
          shouldSendEmail ? preferences.contactInfo.email : undefined,
          shouldSendSMS ? preferences.contactInfo.phone : undefined
        );

        console.log('Task assignment notification sent:', result);
      } catch (error) {
        console.error('Error sending task assignment notification:', error);
      }
    } else {
      console.log('Task assignment notifications disabled by user preferences');
    }
  }

  // Send task completion notification
  public static async notifyTaskCompletion(
    task: any,
    asset: any,
    completedBy: string,
    supervisorEmail?: string,
    supervisorPhone?: string
  ): Promise<void> {
    const preferences = this.getNotificationPreferences();
    if (!preferences) return;

    const shouldSendEmail = preferences.email?.taskCompletion && preferences.contactInfo?.email;
    const shouldSendSMS = preferences.sms?.taskCompletion && preferences.contactInfo?.phone;

    if (shouldSendEmail || shouldSendSMS) {
      try {
        const result = await this.notificationService.notifyTaskCompletion(
          task,
          asset,
          completedBy,
          shouldSendEmail ? (supervisorEmail || preferences.contactInfo.email) : undefined,
          shouldSendSMS ? (supervisorPhone || preferences.contactInfo.phone) : undefined
        );

        console.log('Task completion notification sent:', result);
      } catch (error) {
        console.error('Error sending task completion notification:', error);
      }
    } else {
      console.log('Task completion notifications disabled by user preferences');
    }
  }

  // Send overdue task notification
  public static async notifyOverdueTask(
    task: any,
    asset: any,
    managerEmail?: string,
    managerPhone?: string
  ): Promise<void> {
    const preferences = this.getNotificationPreferences();
    if (!preferences) return;

    const shouldSendEmail = preferences.email?.overdueTasks && preferences.contactInfo?.email;
    const shouldSendSMS = preferences.sms?.overdueTasks && preferences.contactInfo?.phone;

    if (shouldSendEmail || shouldSendSMS) {
      try {
        const result = await this.notificationService.notifyOverdueTask(
          task,
          asset,
          shouldSendEmail ? (managerEmail || preferences.contactInfo.email) : undefined,
          shouldSendSMS ? (managerPhone || preferences.contactInfo.phone) : undefined
        );

        console.log('Overdue task notification sent:', result);
      } catch (error) {
        console.error('Error sending overdue task notification:', error);
      }
    } else {
      console.log('Overdue task notifications disabled by user preferences');
    }
  }

  // Check for overdue tasks and send notifications
  public static async checkAndNotifyOverdueTasks(
    maintenanceTasks: any[],
    assets: any[]
  ): Promise<void> {
    const now = new Date();

    for (const task of maintenanceTasks) {
      // Skip if task is already completed
      if (task.status === 'completed') continue;

      // Check if task is overdue
      const dueDate = new Date(task.nextDue);
      if (dueDate < now && task.status !== 'overdue') {
        // Find the associated asset
        const asset = assets.find(a => a.id === task.assetId);
        if (asset) {
          await this.notifyOverdueTask(task, asset);
          console.log(`Task "${task.description}" for ${asset.name} is now overdue`);
        }
      }
    }
  }
}
