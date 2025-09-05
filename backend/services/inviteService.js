const crypto = require('crypto');
const TeamInvitation = require('../models/teamInvitation');
const Organization = require('../models/organization');

class InviteService {
  /**
   * Generate an invitation URL for sharing
   * @param {Object} invitation - TeamInvitation document
   * @param {string} baseUrl - Base URL for the frontend
   * @returns {string} Complete invitation URL
   */
  static generateInviteUrl(invitation, baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173') {
    return `${baseUrl}/join-organization?token=${invitation.token}`;
  }

  /**
   * Create invitation and return shareable link
   * @param {Object} params - Invitation parameters
   * @param {string} params.email - Invitee email
   * @param {string} params.organizationId - Organization ID
   * @param {string} params.invitedBy - User ID of inviter
   * @param {string} params.role - Role for the invitee
   * @returns {Object} Invitation data with URL
   */
  static async createInvitation({ email, organizationId, invitedBy, role = 'technician' }) {
    try {
      // Check if organization exists
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }

      // Check for existing pending invitation
      const existingInvitation = await TeamInvitation.findByEmailAndOrganization(email, organizationId);
      if (existingInvitation) {
        // Return existing invitation URL
        return {
          invitation: existingInvitation,
          inviteUrl: this.generateInviteUrl(existingInvitation),
          isNew: false
        };
      }

      // Generate a unique token for the invitation
      const token = crypto.randomBytes(32).toString('hex');

      // Create new invitation
      const invitation = new TeamInvitation({
        email: email.toLowerCase(),
        organizationId,
        invitedBy,
        role,
        token: token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });

      await invitation.save();

      const inviteUrl = this.generateInviteUrl(invitation);

      return {
        invitation,
        inviteUrl,
        isNew: true,
        organization: {
          name: organization.name,
          type: organization.type
        }
      };
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  }

  /**
   * Validate invitation token
   * @param {string} token - Invitation token
   * @returns {Object|null} Invitation data or null if invalid
   */
  static async validateInvitation(token) {
    try {
      const invitation = await TeamInvitation.findByToken(token)
        .populate('organizationId', 'name type settings')
        .populate('invitedBy', 'firstName lastName email');

      if (!invitation) {
        return null;
      }

      if (invitation.isExpired()) {
        // Mark as expired
        invitation.status = 'expired';
        await invitation.save();
        return null;
      }

      return {
        invitation,
        organization: invitation.organizationId,
        invitedBy: invitation.invitedBy,
        isValid: true
      };
    } catch (error) {
      console.error('Error validating invitation:', error);
      return null;
    }
  }

  /**
   * Get invitation statistics for an organization
   * @param {string} organizationId - Organization ID
   * @returns {Object} Invitation statistics
   */
  static async getInvitationStats(organizationId) {
    try {
      const [pending, accepted, expired, cancelled] = await Promise.all([
        TeamInvitation.countDocuments({ organizationId, status: 'pending', expiresAt: { $gt: new Date() } }),
        TeamInvitation.countDocuments({ organizationId, status: 'accepted' }),
        TeamInvitation.countDocuments({ organizationId, status: 'expired' }),
        TeamInvitation.countDocuments({ organizationId, status: 'cancelled' })
      ]);

      return {
        pending,
        accepted,
        expired,
        cancelled,
        total: pending + accepted + expired + cancelled
      };
    } catch (error) {
      console.error('Error getting invitation stats:', error);
      throw error;
    }
  }

  /**
   * Clean up expired invitations (utility method)
   * This can be called periodically to clean up the database
   */
  static async cleanupExpiredInvitations() {
    try {
      const result = await TeamInvitation.cleanupExpired();
      console.log(`Cleaned up ${result.deletedCount} expired invitations`);
      return result;
    } catch (error) {
      console.error('Error cleaning up expired invitations:', error);
      throw error;
    }
  }

  /**
   * Future: Send email invitation
   * Placeholder for when email service is added
   * @param {Object} invitation - Invitation data
   * @param {string} inviteUrl - Invitation URL
   */
  static async sendEmailInvitation(invitation, inviteUrl) {
    // TODO: Implement email sending
    // For now, just log that we would send an email
    console.log(`Would send email invitation to ${invitation.email} with URL: ${inviteUrl}`);

    // Future implementation would use services like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Postmark

    return {
      sent: false,
      message: 'Email service not implemented yet - use share link feature'
    };
  }
}

module.exports = InviteService;
