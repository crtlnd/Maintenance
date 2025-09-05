const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Organization = require('../models/organization');
const Asset = require('../models/asset');
const auth = require('../middleware/auth');

// POST /api/organization/create - Create new organization (users without org only)
router.post('/create', auth, async (req, res) => {
  try {
    const { name, type = 'internal' } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Organization name is required' });
    }

    const user = await User.findById(req.user.id);

    // Check if user already has an organization
    if (user.hasOrganization()) {
      return res.status(400).json({ message: 'You are already part of an organization' });
    }

    // Create new organization
    const organization = new Organization({
      name: name.trim(),
      type,
      createdBy: user._id,
      settings: {
        allowExternalAccess: false,
        dataSharing: {
          assets: true,
          maintenance: true
        }
      }
    });

    await organization.save();

    // Update user to be owner of the organization and upgrade to professional
    user.organizationId = organization._id;
    user.organizationRole = 'owner';
    user.subscriptionTier = 'Professional';
    user.subscription.plan = 'Professional';
    user.subscription.status = 'active';

    await user.save();

    res.status(201).json({
      success: true,
      data: {
        organization: {
          id: organization._id,
          name: organization.name,
          type: organization.type,
          settings: organization.settings,
          createdAt: organization.createdAt
        },
        user: {
          id: user._id,
          organizationRole: user.organizationRole,
          subscriptionTier: user.subscriptionTier
        }
      },
      message: 'Organization created successfully'
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/organization/info - Get organization information
router.get('/info', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.hasOrganization()) {
      return res.status(404).json({ message: 'User not part of any organization' });
    }

    const organization = await Organization.findById(user.organizationId)
      .populate('createdBy', 'firstName lastName email');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Get organization stats
    const memberCount = await User.countDocuments({
      organizationId: organization._id,
      isActive: true
    });

    const assetCount = await Asset.countDocuments({
      organizationId: organization._id,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        organization: {
          id: organization._id,
          name: organization.name,
          type: organization.type,
          settings: organization.settings,
          createdBy: organization.createdBy,
          createdAt: organization.createdAt,
          subscription: organization.subscription
        },
        stats: {
          memberCount,
          assetCount
        },
        userRole: user.organizationRole
      }
    });
  } catch (error) {
    console.error('Error fetching organization info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/organization/settings - Update organization settings (owners only)
router.put('/settings', auth, async (req, res) => {
  try {
    const { name, settings } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.isOrganizationOwner()) {
      return res.status(403).json({ message: 'Only organization owners can update settings' });
    }

    if (!user.hasOrganization()) {
      return res.status(404).json({ message: 'User not part of any organization' });
    }

    const organization = await Organization.findById(user.organizationId);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Update fields if provided
    if (name && name.trim().length > 0) {
      organization.name = name.trim();
    }

    if (settings) {
      if (settings.allowExternalAccess !== undefined) {
        organization.settings.allowExternalAccess = settings.allowExternalAccess;
      }

      if (settings.dataSharing) {
        if (settings.dataSharing.assets !== undefined) {
          organization.settings.dataSharing.assets = settings.dataSharing.assets;
        }
        if (settings.dataSharing.maintenance !== undefined) {
          organization.settings.dataSharing.maintenance = settings.dataSharing.maintenance;
        }
      }
    }

    await organization.save();

    res.json({
      success: true,
      data: {
        organization: {
          id: organization._id,
          name: organization.name,
          type: organization.type,
          settings: organization.settings,
          updatedAt: organization.updatedAt
        }
      },
      message: 'Organization settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating organization settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/organization/leave - Leave organization (non-owners only)
router.delete('/leave', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.hasOrganization()) {
      return res.status(400).json({ message: 'You are not part of any organization' });
    }

    // Prevent owners from leaving if they're the last owner
    if (user.isOrganizationOwner()) {
      const ownerCount = await User.countDocuments({
        organizationId: user.organizationId,
        organizationRole: 'owner',
        isActive: true
      });

      if (ownerCount <= 1) {
        return res.status(400).json({
          message: 'Cannot leave organization. You are the last owner. Transfer ownership or delete the organization first.'
        });
      }
    }

    // Remove user from organization
    user.organizationId = null;
    user.organizationRole = 'technician';
    user.subscriptionTier = 'Basic'; // Downgrade back to basic
    user.subscription.plan = 'Basic';

    await user.save();

    res.json({
      success: true,
      message: 'Successfully left the organization'
    });
  } catch (error) {
    console.error('Error leaving organization:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/organization/delete - Delete organization (owners only)
router.delete('/delete', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.isOrganizationOwner()) {
      return res.status(403).json({ message: 'Only organization owners can delete the organization' });
    }

    if (!user.hasOrganization()) {
      return res.status(404).json({ message: 'User not part of any organization' });
    }

    const organizationId = user.organizationId;

    // Get all members of the organization
    const allMembers = await User.find({
      organizationId: organizationId,
      isActive: true
    });

    // Remove all members from the organization
    for (const member of allMembers) {
      member.organizationId = null;
      member.organizationRole = 'technician';
      member.subscriptionTier = 'Basic';
      member.subscription.plan = 'Basic';
      await member.save();
    }

    // Note: In a real application, you might want to handle assets differently
    // For now, we'll keep assets but mark them as orphaned
    await Asset.updateMany(
      { organizationId: organizationId },
      {
        $unset: { organizationId: 1 },
        $set: { updatedAt: new Date() }
      }
    );

    // Delete the organization
    await Organization.findByIdAndDelete(organizationId);

    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/organization/assets - Get organization assets
router.get('/assets', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.hasOrganization()) {
      return res.status(404).json({ message: 'User not part of any organization' });
    }

    const { status, type, location, page = 1, limit = 50 } = req.query;

    // Build filter
    const filter = { organizationId: user.organizationId, isActive: true };

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (location) filter.location = location;

    // Get assets with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const assets = await Asset.find(filter)
      .select('-fmea -rca -rcm') // Exclude large analysis data for list view
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName')
      .populate('lastModifiedBy', 'firstName lastName');

    const totalAssets = await Asset.countDocuments(filter);

    res.json({
      success: true,
      data: {
        assets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalAssets,
          pages: Math.ceil(totalAssets / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching organization assets:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/organization/dashboard - Get organization dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.hasOrganization()) {
      return res.status(404).json({ message: 'User not part of any organization' });
    }

    // Get organization stats in parallel
    const [
      memberCount,
      assetStats,
      maintenanceDue,
      recentAssets
    ] = await Promise.all([
      User.countDocuments({ organizationId: user.organizationId, isActive: true }),
      Asset.getMaintenanceStats(user.organizationId),
      Asset.findMaintenanceDue(user.organizationId, 7), // Next 7 days
      Asset.findByOrganization(user.organizationId)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name type status location createdAt')
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          memberCount,
          assetStats: assetStats[0] || {
            total: 0,
            operational: 0,
            maintenance: 0,
            down: 0,
            overdue: 0
          }
        },
        maintenanceDue: maintenanceDue.length,
        recentAssets
      }
    });
  } catch (error) {
    console.error('Error fetching organization dashboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
