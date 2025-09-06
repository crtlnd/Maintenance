const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const Asset = require('../../models/asset');
const User = require('../../models/user');
const { getAssetQuery, getDeleteAssetQuery } = require('./helpers/permissions');

const router = express.Router();

// Get all assets for the authenticated user and their organization
router.get(
  '/',
  [query('location').optional().trim()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      const { location, type, status } = req.query;

      // Get base query with organization permissions
      const query = await getAssetQuery(req.auth.userId);

      // Add optional filters
      if (location) query.location = location;
      if (type) query.type = type;
      if (status) query.status = status;

      const assets = await Asset.find(query).sort({ createdAt: -1 });
      res.send(assets);
    } catch (error) {
      console.error('Error fetching assets:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// Get single asset by ID
router.get(
  '/:id',
  [param('id').isInt().withMessage('Asset ID must be an integer')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      const assetId = parseInt(req.params.id);

      // Get query with organization permissions
      const query = await getAssetQuery(req.auth.userId, { id: assetId });

      const asset = await Asset.findOne(query);

      if (!asset) {
        return res.status(404).send({ error: 'Asset not found' });
      }

      res.send(asset);
    } catch (error) {
      console.error('Error fetching asset:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// Create new asset
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('type').trim().notEmpty().withMessage('Type is required'),
    body('manufacturer').trim().notEmpty().withMessage('Manufacturer is required'),
    body('model').trim().notEmpty().withMessage('Model is required'),
    body('serialNumber').trim().notEmpty().withMessage('Serial number is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('organization').trim().notEmpty().withMessage('Organization is required'),
    body('yearManufactured').optional().isInt({ min: 1900, max: new Date().getFullYear() }),
    body('operatingHours').optional().isNumeric(),
    body('status').optional().isIn(['operational', 'maintenance', 'down', 'retired']),
    body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      // Check user exists and subscription limits
      const user = await User.findById(req.auth.userId);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }

      if (user.subscriptionTier === 'Basic' && user.assetCount >= 5) {
        return res.status(403).send({ error: 'Asset limit reached for Basic plan' });
      }

      // Check if serial number already exists
      const existingAsset = await Asset.findOne({ serialNumber: req.body.serialNumber });
      if (existingAsset) {
        return res.status(400).send({ error: 'Asset with this serial number already exists' });
      }

      // Generate new ID
      const existingAssets = await Asset.find().select('id');
      const newId = existingAssets.length > 0 ? Math.max(...existingAssets.map(a => a.id)) + 1 : 1;

      // Create asset with enhanced data
      const assetData = {
        id: newId,
        userId: req.auth.userId,
        createdBy: req.auth.userId,           // Fixed: Add required createdBy field
        organizationId: user.organizationId,  // Fixed: Add required organizationId field
        ...req.body,
        // Set defaults for optional fields
        operatingHours: req.body.operatingHours || 0,
        status: req.body.status || 'operational',
        condition: req.body.condition || 'good',
        maintenanceTasks: req.body.maintenanceTasks || [],
        specifications: req.body.specifications || {},
        images: req.body.images || [],
        documents: req.body.documents || [],
      };

      const newAsset = await Asset.create(assetData);

      // Update user asset count
      await User.updateOne(
        { _id: req.auth.userId },
        { $inc: { assetCount: 1 }, $push: { assets: newAsset._id } }
      );

      res.status(201).send(newAsset);
    } catch (error) {
      console.error('Error creating asset:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// Update asset
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Asset ID must be an integer'),
    body('name').optional().trim().notEmpty(),
    body('manufacturer').optional().trim().notEmpty(),
    body('model').optional().trim().notEmpty(),
    body('location').optional().trim().notEmpty(),
    body('operatingHours').optional().isNumeric(),
    body('status').optional().isIn(['operational', 'maintenance', 'down', 'retired']),
    body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      const assetId = parseInt(req.params.id);
      const updateData = { ...req.body };

      // Get query with organization permissions
      const query = await getAssetQuery(req.auth.userId, { id: assetId });

      const updatedAsset = await Asset.findOneAndUpdate(
        query,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!updatedAsset) {
        return res.status(404).send({ error: 'Asset not found' });
      }

      res.send(updatedAsset);
    } catch (error) {
      console.error('Error updating asset:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// Update asset status
router.put(
  '/:id/status',
  [
    param('id').isInt().withMessage('Asset ID must be an integer'),
    body('status').isIn(['operational', 'maintenance', 'down', 'retired']).withMessage('Invalid status'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      const assetId = parseInt(req.params.id);
      const { status } = req.body;

      // Get query with organization permissions
      const query = await getAssetQuery(req.auth.userId, { id: assetId });

      const updatedAsset = await Asset.findOneAndUpdate(
        query,
        { $set: { status } },
        { new: true }
      );

      if (!updatedAsset) {
        return res.status(404).send({ error: 'Asset not found' });
      }

      res.send(updatedAsset);
    } catch (error) {
      console.error('Error updating asset status:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// Delete asset
router.delete(
  '/:id',
  [param('id').isInt().withMessage('Asset ID must be an integer')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      const assetId = parseInt(req.params.id);

      // Use secure delete query (owner only)
      const query = getDeleteAssetQuery(req.auth.userId, assetId);

      const deletedAsset = await Asset.findOneAndDelete(query);

      if (!deletedAsset) {
        return res.status(404).send({ error: 'Asset not found or you do not have permission to delete it' });
      }

      // Update user asset count
      await User.updateOne(
        { _id: req.auth.userId },
        {
          $inc: { assetCount: -1 },
          $pull: { assets: deletedAsset._id }
        }
      );

      res.send({ message: 'Asset deleted successfully' });
    } catch (error) {
      console.error('Error deleting asset:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

module.exports = router;
