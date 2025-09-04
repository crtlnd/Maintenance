// backend/routes/assets.js - Enhanced version
const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const Asset = require('../models/asset');
const User = require('../models/user');

module.exports = () => {
  // Get all assets for the authenticated user
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
        const query = { userId: req.auth.userId };

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
        const asset = await Asset.findOne({ id: assetId, userId: req.auth.userId });

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

        const updatedAsset = await Asset.findOneAndUpdate(
          { id: assetId, userId: req.auth.userId },
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

  // Update asset status (existing endpoint)
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

        const updatedAsset = await Asset.findOneAndUpdate(
          { id: assetId, userId: req.auth.userId },
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

  // Add maintenance task to asset
  router.post(
    '/:id/tasks',
    [
      param('id').isInt().withMessage('Asset ID must be an integer'),
      body('title').trim().notEmpty().withMessage('Task title is required'),
      body('description').optional().trim(),
      body('type').optional().isIn(['preventive', 'corrective', 'predictive', 'inspection']),
      body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
      body('assignedTo').optional().trim(),
      body('estimatedHours').optional().isNumeric(),
      body('dueDate').optional().isISO8601(),
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }

        const assetId = parseInt(req.params.id);
        const taskData = {
          id: Date.now().toString(), // Simple ID generation
          ...req.body,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const updatedAsset = await Asset.findOneAndUpdate(
          { id: assetId, userId: req.auth.userId },
          { $push: { maintenanceTasks: taskData } },
          { new: true }
        );

        if (!updatedAsset) {
          return res.status(404).send({ error: 'Asset not found' });
        }

        res.status(201).send(taskData);
      } catch (error) {
        console.error('Error adding maintenance task:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  // Update maintenance task
  router.put(
    '/:id/tasks/:taskId',
    [
      param('id').isInt().withMessage('Asset ID must be an integer'),
      param('taskId').notEmpty().withMessage('Task ID is required'),
      body('status').optional().isIn(['pending', 'in-progress', 'completed', 'overdue']),
      body('actualHours').optional().isNumeric(),
      body('notes').optional().trim(),
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }

        const assetId = parseInt(req.params.id);
        const taskId = req.params.taskId;
        const updateData = { ...req.body, updatedAt: new Date() };

        // If marking as completed, set completion date
        if (req.body.status === 'completed') {
          updateData.completedDate = new Date();
        }

        const updatedAsset = await Asset.findOneAndUpdate(
          {
            id: assetId,
            userId: req.auth.userId,
            'maintenanceTasks.id': taskId
          },
          {
            $set: Object.keys(updateData).reduce((acc, key) => {
              acc[`maintenanceTasks.$.${key}`] = updateData[key];
              return acc;
            }, {})
          },
          { new: true }
        );

        if (!updatedAsset) {
          return res.status(404).send({ error: 'Asset or task not found' });
        }

        const updatedTask = updatedAsset.maintenanceTasks.find(task => task.id === taskId);
        res.send(updatedTask);
      } catch (error) {
        console.error('Error updating maintenance task:', error);
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
        const deletedAsset = await Asset.findOneAndDelete({
          _id: assetId,
          userId: req.auth.userId
        });

        if (!deletedAsset) {
          return res.status(404).send({ error: 'Asset not found' });
        }

        // Update user asset count
        await User.updateOne(
          { id: req.auth.userId },
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

  // Dashboard endpoint (enhanced)
  router.get('/dashboard', async (req, res) => {
    try {
      const userId = req.auth.userId;

      // Get overdue tasks count
      const assetsWithOverdueTasks = await Asset.find({
        userId,
        'maintenanceTasks.status': 'overdue'
      });
      const overdueTasks = assetsWithOverdueTasks.reduce((count, asset) => {
        return count + asset.maintenanceTasks.filter(task => task.status === 'overdue').length;
      }, 0);

      // Get upcoming maintenance (next 7 days)
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const assetsWithUpcomingMaintenance = await Asset.find({
        userId,
        $or: [
          {
            nextServiceDate: {
              $gte: new Date(),
              $lte: sevenDaysFromNow,
            }
          },
          {
            'maintenanceTasks.dueDate': {
              $gte: new Date(),
              $lte: sevenDaysFromNow,
            },
            'maintenanceTasks.status': { $ne: 'completed' }
          }
        ]
      });

      // Asset health distribution
      const assetHealth = await Asset.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: { $ifNull: ['$condition', 'good'] },
            count: { $sum: 1 }
          }
        },
      ]);

      // Asset status distribution
      const assetStatus = await Asset.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
      ]);

      // Total asset count
      const totalAssets = await Asset.countDocuments({ userId });

      res.send({
        overdueTasks,
        upcomingMaintenance: assetsWithUpcomingMaintenance.length,
        assetHealth,
        assetStatus,
        totalAssets
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).send({ error: 'Server error' });
    }
  });

  // FMEA endpoint (existing, unchanged)
  router.post(
    '/fmea',
    [
      body('assetId').isInt().withMessage('Asset ID must be an integer'),
      body('failureMode').trim().notEmpty().withMessage('Failure mode is required'),
      body('severity').isInt({ min: 1, max: 10 }).withMessage('Severity must be between 1 and 10'),
      body('occurrence').isInt({ min: 1, max: 10 }).withMessage('Occurrence must be between 1 and 10'),
      body('detection').isInt({ min: 1, max: 10 }).withMessage('Detection must be between 1 and 10'),
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }

        const { assetId, failureMode, severity, occurrence, detection } = req.body;
        const rpn = severity * occurrence * detection;
        const fmeaEntry = { assetId, failureMode, severity, occurrence, detection, rpn, timestamp: new Date() };

        const updatedAsset = await Asset.findOneAndUpdate(
          { id: assetId, userId: req.auth.userId },
          { $push: { fmea: fmeaEntry } },
          { new: true }
        );

        if (!updatedAsset) {
          return res.status(404).send({ error: 'Asset not found' });
        }

        res.send(fmeaEntry);
      } catch (error) {
        console.error('Error adding FMEA entry:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  return router;
};
