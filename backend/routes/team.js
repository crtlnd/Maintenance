const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Organization = require('../models/organization');
const TeamInvitation = require('../models/teamInvitation');
const InviteService = require('../services/inviteService');
const auth = require('../middleware/auth');

// GET /api/team/members - Get team members for user's organization
router.get('/members', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.hasOrganization()) {
      return res.status(400).json({ message: 'User not part of any organization' });
    }

    // Find all team members in the same organization
    const teamMembers = await User.findByOrganization(user.organizationId)
      .select('-password -stripeCustomerId -stripeSubscriptionId')
      .populate('organizationId', 'name type')
      .sort({ organizationRole: -1, firstName: 1 }); // Owners first, then alphabetical

    res.json({
      success: true,
      data: teamMembers,
      organization: teamMembers[0]?.organizationId || null
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/team/invite - Create team invitation (owners only)
router.post('/invite', auth, async (req, res) => {
  try {
    const { email, role = 'technician' } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findById(req.user.id);

    // Check if user can invite members
    if (!user.canInviteMembers()) {
      return res.status(403).json({ message: 'Only organization owners can invite members' });
    }

    if (!user.hasOrganization()) {
      return res.status(400).json({ message: 'User not part of any organization' });
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.organizationId && existingUser.organizationId.equals(user.organizationId)) {
      return res.status(400).json({ message: 'User is already a member of this organization' });
    }

    // Use invite service to create invitation
    const result = await InviteService.createInvitation({
      email,
      organizationId: user.organizationId,
      invitedBy: user._id,
      role
    });

    const statusCode = result.isNew ? 201 : 200;
    const message = result.isNew ? 'Invitation created successfully' : 'Invitation already exists';

    res.status(statusCode).json({
      success: true,
      data: {
        invitation: {
          id: result.invitation._id,
          email: result.invitation.email,
          role: result.invitation.role,
          status: result.invitation.status,
          expiresAt: result.invitation.expiresAt,
          createdAt: result.invitation.createdAt
        },
        inviteUrl: result.inviteUrl,
        organization: result.organization,
        isNew: result.isNew
      },
      message
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/team/invitations - Get pending invitations for organization (owners only)
router.get('/invitations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.canInviteMembers()) {
      return res.status(403).json({ message: 'Only organization owners can view invitations' });
    }

    if (!user.hasOrganization()) {
      return res.status(400).json({ message: 'User not part of any organization' });
    }

    const invitations = await TeamInvitation.findPendingByOrganization(user.organizationId)
      .populate('invitedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: invitations
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/team/invitation/:token/validate - Validate invitation token (public route for unauthenticated users)
router.get('/invitation/:token/validate', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Invitation token is required' });
    }

    // Use invite service to validate invitation
    const validationResult = await InviteService.validateInvitation(token);

    if (!validationResult) {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }

    res.json({
      success: true,
      invitation: validationResult.invitation,
      organization: validationResult.organization,
      invitedBy: validationResult.invitedBy,
      isValid: validationResult.isValid
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/team/invitation/:token/accept - Accept invitation (requires authentication)
router.post('/invitation/:token/accept', auth, async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Invitation token is required' });
    }

    const user = await User.findById(req.user.id);

    // Check if user is already part of an organization
    if (user.hasOrganization()) {
      return res.status(400).json({ message: 'You are already part of an organization' });
    }

    // Use invite service to validate invitation
    const validationResult = await InviteService.validateInvitation(token);

    if (!validationResult) {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }

    const { invitation, organization } = validationResult;

    // Check if invitation email matches user email
    if (invitation.email !== user.email.toLowerCase()) {
      return res.status(403).json({ message: 'This invitation is not for your email address' });
    }

    // Upgrade user to professional plan (as per requirements)
    user.organizationId = invitation.organizationId;
    user.organizationRole = invitation.role;
    user.subscriptionTier = 'Professional';
    user.subscription.plan = 'Professional';
    user.subscription.status = 'active';

    await user.save();

    // Mark invitation as accepted
    await invitation.accept(user._id);

    res.json({
      success: true,
      data: {
        organization,
        role: invitation.role,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationRole: user.organizationRole,
          subscriptionTier: user.subscriptionTier
        }
      },
      message: 'Successfully joined organization'
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/team/join - Join organization via invitation token
router.post('/join', auth, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Invitation token is required' });
    }

    const user = await User.findById(req.user.id);

    // Check if user is already part of an organization
    if (user.hasOrganization()) {
      return res.status(400).json({ message: 'You are already part of an organization' });
    }

    // Use invite service to validate invitation
    const validationResult = await InviteService.validateInvitation(token);

    if (!validationResult) {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }

    const { invitation, organization } = validationResult;

    // Check if invitation email matches user email
    if (invitation.email !== user.email.toLowerCase()) {
      return res.status(403).json({ message: 'This invitation is not for your email address' });
    }

    // Upgrade user to professional plan (as per requirements)
    user.organizationId = invitation.organizationId;
    user.organizationRole = invitation.role;
    user.subscriptionTier = 'Professional';
    user.subscription.plan = 'Professional';
    user.subscription.status = 'active';

    await user.save();

    // Mark invitation as accepted
    await invitation.accept(user._id);

    res.json({
      success: true,
      data: {
        organization,
        role: invitation.role,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationRole: user.organizationRole,
          subscriptionTier: user.subscriptionTier
        }
      },
      message: 'Successfully joined organization'
    });
  } catch (error) {
    console.error('Error joining organization:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/team/members/:memberId/role - Update member role (owners only)
router.put('/members/:memberId/role', auth, async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;

    if (!role || !['owner', 'technician'].includes(role)) {
      return res.status(400).json({ message: 'Valid role is required (owner or technician)' });
    }

    const user = await User.findById(req.user.id);

    if (!user.canInviteMembers()) {
      return res.status(403).json({ message: 'Only organization owners can update member roles' });
    }

    const memberToUpdate = await User.findById(memberId);

    if (!memberToUpdate) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if member is in the same organization
    if (!memberToUpdate.organizationId || !memberToUpdate.organizationId.equals(user.organizationId)) {
      return res.status(403).json({ message: 'Member not in your organization' });
    }

    // Prevent removing the last owner
    if (memberToUpdate.organizationRole === 'owner' && role === 'technician') {
      const ownerCount = await User.countDocuments({
        organizationId: user.organizationId,
        organizationRole: 'owner',
        isActive: true
      });

      if (ownerCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last owner from the organization' });
      }
    }

    memberToUpdate.organizationRole = role;
    await memberToUpdate.save();

    res.json({
      success: true,
      data: {
        id: memberToUpdate._id,
        firstName: memberToUpdate.firstName,
        lastName: memberToUpdate.lastName,
        email: memberToUpdate.email,
        organizationRole: memberToUpdate.organizationRole
      },
      message: 'Member role updated successfully'
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/team/members/:memberId - Remove team member (owners only)
router.delete('/members/:memberId', auth, async (req, res) => {
  try {
    const { memberId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user.canInviteMembers()) {
      return res.status(403).json({ message: 'Only organization owners can remove members' });
    }

    const memberToRemove = await User.findById(memberId);

    if (!memberToRemove) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if member is in the same organization
    if (!memberToRemove.organizationId || !memberToRemove.organizationId.equals(user.organizationId)) {
      return res.status(403).json({ message: 'Member not in your organization' });
    }

    // Prevent removing self
    if (memberToRemove._id.equals(user._id)) {
      return res.status(400).json({ message: 'Cannot remove yourself from the organization' });
    }

    // Prevent removing the last owner
    if (memberToRemove.organizationRole === 'owner') {
      const ownerCount = await User.countDocuments({
        organizationId: user.organizationId,
        organizationRole: 'owner',
        isActive: true
      });

      if (ownerCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last owner from the organization' });
      }
    }

    // Remove from organization (keep user account but remove org association)
    memberToRemove.organizationId = null;
    memberToRemove.organizationRole = 'technician';
    memberToRemove.subscriptionTier = 'Basic'; // Downgrade back to basic
    memberToRemove.subscription.plan = 'Basic';

    await memberToRemove.save();

    res.json({
      success: true,
      message: 'Member removed from organization successfully'
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/team/invitations/:invitationId - Cancel invitation (owners only)
router.delete('/invitations/:invitationId', auth, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user.canInviteMembers()) {
      return res.status(403).json({ message: 'Only organization owners can cancel invitations' });
    }

    const invitation = await TeamInvitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if invitation belongs to user's organization
    if (!invitation.organizationId.equals(user.organizationId)) {
      return res.status(403).json({ message: 'Invitation not from your organization' });
    }

    await invitation.cancel();

    res.json({
      success: true,
      message: 'Invitation cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
