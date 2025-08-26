import { MaintenanceTask, Asset, User } from '../types';

// Mock notification service - in a real app this would integrate with email/SMS providers
export class NotificationService {
  private static instance: NotificationService;
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Mock email notification
  public async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    console.log('📧 Email Notification Sent:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Content:', content);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock success (in real app, this would return success/failure from email service)
    return Math.random() > 0.1; // 90% success rate
  }

  // Mock SMS notification
  public async sendSMS(to: string, message: string): Promise<boolean> {
    console.log('📱 SMS Notification Sent:');
    console.log('To:', to);
    console.log('Message:', message);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock success (in real app, this would return success/failure from SMS service)
    return Math.random() > 0.15; // 85% success rate
  }

  // Send maintenance task assignment notification
  public async notifyTaskAssignment(
    task: MaintenanceTask, 
    asset: Asset, 
    responsiblePersonEmail?: string,
    responsiblePersonPhone?: string
  ): Promise<{ emailSent: boolean; smsSent: boolean }> {
    const taskTypeFormatted = task.taskType.replace('-', ' ');
    const priorityEmoji = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
    
    // Email content
    const emailSubject = `${priorityEmoji} New Maintenance Task Assignment: ${asset.name}`;
    const emailContent = `
Dear ${task.responsible},

You have been assigned a new maintenance task:

Asset: ${asset.name} (${asset.type})
Location: ${asset.location}
Task: ${task.description}
Type: ${taskTypeFormatted}
Priority: ${task.priority.toUpperCase()}
Frequency: ${task.frequency}
Estimated Duration: ${task.estimatedDuration}
Due Date: ${task.nextDue}

Please ensure this task is completed by the due date. If you have any questions or need additional resources, please contact your supervisor.

Best regards,
Maintenance Management System
    `;

    // SMS content (shorter)
    const smsContent = `${priorityEmoji} New maintenance task: ${task.description} for ${asset.name}. Priority: ${task.priority}. Due: ${task.nextDue}. Duration: ${task.estimatedDuration}`;

    let emailSent = false;
    let smsSent = false;

    try {
      // Send email if email address is provided
      if (responsiblePersonEmail) {
        emailSent = await this.sendEmail(responsiblePersonEmail, emailSubject, emailContent);
      }

      // Send SMS if phone number is provided
      if (responsiblePersonPhone) {
        smsSent = await this.sendSMS(responsiblePersonPhone, smsContent);
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }

    return { emailSent, smsSent };
  }

  // Send task completion notification
  public async notifyTaskCompletion(
    task: MaintenanceTask,
    asset: Asset,
    completedBy: string,
    supervisorEmail?: string,
    supervisorPhone?: string
  ): Promise<{ emailSent: boolean; smsSent: boolean }> {
    const emailSubject = `✅ Maintenance Task Completed: ${asset.name}`;
    const emailContent = `
A maintenance task has been completed:

Asset: ${asset.name} (${asset.type})
Location: ${asset.location}
Task: ${task.description}
Completed by: ${completedBy}
Completed on: ${task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Just now'}
${task.completionNotes ? `Notes: ${task.completionNotes}` : ''}

The next scheduled maintenance for this task is: ${task.nextDue}

Best regards,
Maintenance Management System
    `;

    const smsContent = `✅ Task completed: ${task.description} for ${asset.name} by ${completedBy}`;

    let emailSent = false;
    let smsSent = false;

    try {
      if (supervisorEmail) {
        emailSent = await this.sendEmail(supervisorEmail, emailSubject, emailContent);
      }

      if (supervisorPhone) {
        smsSent = await this.sendSMS(supervisorPhone, smsContent);
      }
    } catch (error) {
      console.error('Error sending completion notifications:', error);
    }

    return { emailSent, smsSent };
  }

  // Send overdue task notification
  public async notifyOverdueTask(
    task: MaintenanceTask,
    asset: Asset,
    managerEmail?: string,
    managerPhone?: string
  ): Promise<{ emailSent: boolean; smsSent: boolean }> {
    const emailSubject = `🚨 OVERDUE: Maintenance Task for ${asset.name}`;
    const emailContent = `
ATTENTION: A maintenance task is overdue!

Asset: ${asset.name} (${asset.type})
Location: ${asset.location}
Task: ${task.description}
Assigned to: ${task.responsible}
Due Date: ${task.nextDue}
Priority: ${task.priority.toUpperCase()}

This task requires immediate attention. Please follow up with the assigned technician or reassign if necessary.

Best regards,
Maintenance Management System
    `;

    const smsContent = `🚨 OVERDUE: ${task.description} for ${asset.name}. Assigned to: ${task.responsible}. Due: ${task.nextDue}`;

    let emailSent = false;
    let smsSent = false;

    try {
      if (managerEmail) {
        emailSent = await this.sendEmail(managerEmail, emailSubject, emailContent);
      }

      if (managerPhone) {
        smsSent = await this.sendSMS(managerPhone, smsContent);
      }
    } catch (error) {
      console.error('Error sending overdue notifications:', error);
    }

    return { emailSent, smsSent };
  }
}

// Helper function to get responsible person contact info
// In a real app, this would query a user database
export function getResponsiblePersonContact(responsiblePersonName: string): {
  email?: string;
  phone?: string;
} {
  // Mock contact info - in a real app, this would come from a user database
  const mockContacts: Record<string, { email?: string; phone?: string }> = {
    'John Smith': { email: 'john.smith@company.com', phone: '+1-555-0101' },
    'Sarah Johnson': { email: 'sarah.johnson@company.com', phone: '+1-555-0102' },
    'Mike Brown': { email: 'mike.brown@company.com', phone: '+1-555-0103' },
    'Lisa Davis': { email: 'lisa.davis@company.com', phone: '+1-555-0104' },
    'Tom Wilson': { email: 'tom.wilson@company.com', phone: '+1-555-0105' },
    'Maintenance Team': { email: 'maintenance@company.com', phone: '+1-555-0199' }
  };

  return mockContacts[responsiblePersonName] || {};
}