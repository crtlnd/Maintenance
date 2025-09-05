const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Asset = require('../../models/asset');
const { getAssetQuery } = require('./helpers/permissions');

const router = express.Router();

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

      // Get query with organization permissions
      const query = await getAssetQuery(req.auth.userId, { id: assetId });

      const updatedAsset = await Asset.findOneAndUpdate(
        query,
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

      // Get query with organization permissions
      const baseQuery = await getAssetQuery(req.auth.userId, {
        id: assetId,
        'maintenanceTasks.id': taskId
      });

      const updatedAsset = await Asset.findOneAndUpdate(
        baseQuery,
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

// Get maintenance tasks for an asset
router.get(
  '/:id/tasks',
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

      const asset = await Asset.findOne(query).select('maintenanceTasks');

      if (!asset) {
        return res.status(404).send({ error: 'Asset not found' });
      }

      res.send(asset.maintenanceTasks || []);
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// Delete maintenance task
router.delete(
  '/:id/tasks/:taskId',
  [
    param('id').isInt().withMessage('Asset ID must be an integer'),
    param('taskId').notEmpty().withMessage('Task ID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      const assetId = parseInt(req.params.id);
      const taskId = req.params.taskId;

      // Get query with organization permissions
      const query = await getAssetQuery(req.auth.userId, { id: assetId });

      const updatedAsset = await Asset.findOneAndUpdate(
        query,
        { $pull: { maintenanceTasks: { id: taskId } } },
        { new: true }
      );

      if (!updatedAsset) {
        return res.status(404).send({ error: 'Asset not found' });
      }

      res.send({ message: 'Maintenance task deleted successfully' });
    } catch (error) {
      console.error('Error deleting maintenance task:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// Get all maintenance tasks across all assets (for organization dashboard)
router.get(
  '/all/tasks',
  async (req, res) => {
    try {
      // Get query with organization permissions
      const query = await getAssetQuery(req.auth.userId);

      const assets = await Asset.find(query).select('id name maintenanceTasks');

      // Flatten all maintenance tasks with asset info
      const allTasks = assets.reduce((tasks, asset) => {
        const assetTasks = (asset.maintenanceTasks || []).map(task => ({
          ...task.toObject(),
          assetId: asset.id,
          assetName: asset.name
        }));
        return tasks.concat(assetTasks);
      }, []);

      // Sort by due date (overdue first, then by due date)
      allTasks.sort((a, b) => {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (b.status === 'overdue' && a.status !== 'overdue') return 1;

        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;

        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      res.send(allTasks);
    } catch (error) {
      console.error('Error fetching all maintenance tasks:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

module.exports = router;
