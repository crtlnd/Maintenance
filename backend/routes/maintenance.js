// backend/routes/maintenance.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const MaintenanceTask = require('../models/maintenanceTask');
const Asset = require('../models/asset');

module.exports = () => {
  const router = express.Router();

  // GET /api/maintenance/tasks - Get all maintenance tasks for user
  router.get('/tasks', async (req, res) => {
    try {
      const { assetId, status, priority, taskType } = req.query;

      // Build filter object - use req.auth.userId for user ID (from express-jwt)
      const filter = { userId: req.auth.userId };

      if (assetId) filter.assetId = parseInt(assetId);
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (taskType) filter.taskType = taskType;

      // Find tasks and sort by nextDue date
      const tasks = await MaintenanceTask.find(filter)
        .sort({ nextDue: 1, priority: -1 })
        .lean();

      // Update overdue status for each task
      const updatedTasks = tasks.map(task => {
        if ((task.status === 'scheduled' || task.status === 'in-progress') && task.nextDue) {
          const dueDate = new Date(task.nextDue);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (dueDate < today) {
            task.status = 'overdue';
          }
        }
        return task;
      });

      res.json(updatedTasks);
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance tasks' });
    }
  });

  // GET /api/maintenance/tasks/:id - Get single maintenance task
  router.get('/tasks/:id', async (req, res) => {
    try {
      const task = await MaintenanceTask.findOne({
        _id: req.params.id,
        userId: req.auth.userId
      });

      if (!task) {
        return res.status(404).json({ error: 'Maintenance task not found' });
      }

      // Update overdue status
      if (task.updateOverdueStatus) {
        task.updateOverdueStatus();
      }

      res.json(task);
    } catch (error) {
      console.error('Error fetching maintenance task:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance task' });
    }
  });

  // POST /api/maintenance/tasks - Create new maintenance task
  router.post('/tasks', [
    body('assetId').isInt().withMessage('Asset ID must be an integer'),
    body('taskType').isIn(['preventive', 'predictive', 'condition-based', 'corrective']).withMessage('Invalid task type'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('frequency').trim().notEmpty().withMessage('Frequency is required'),
    body('nextDue').isISO8601().withMessage('Next due date must be a valid date'),
    body('estimatedDuration').trim().notEmpty().withMessage('Estimated duration is required'),
    body('responsible').trim().notEmpty().withMessage('Responsible person is required'),
    body('responsibleEmail').isEmail().withMessage('Valid email is required')
  ], async (req, res) => {
    console.log('🔧 Maintenance POST route hit');
    console.log('🔧 Request body:', req.body);
    console.log('🔧 User ID from JWT:', req.auth?.userId);
    console.log('🔧 Full auth object:', JSON.stringify(req.auth, null, 2));

    try {
      const errors = validationResult(req);
      console.log('🔧 Validation errors:', errors.array());
      if (!errors.isEmpty()) {
        console.log('🔧 Validation failed, returning 400');
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        assetId,
        taskType,
        description,
        frequency,
        hoursInterval,
        lastCompleted,
        nextDue,
        estimatedDuration,
        responsible,
        responsibleEmail,
        responsiblePhone,
        priority,
        status
      } = req.body;

      console.log('🔧 Looking for asset:', { assetId, userId: req.auth.userId });

      // Verify asset belongs to user
      const asset = await Asset.findOne({
        id: assetId,
        userId: req.auth.userId
      });

      console.log('🔧 Asset found:', asset ? 'Yes' : 'No');

      if (!asset) {
        console.log('🔧 Asset not found, returning 404');
        return res.status(404).json({ error: 'Asset not found' });
      }

      console.log('🔧 Creating maintenance task...');

      // Create maintenance task
      const maintenanceTask = new MaintenanceTask({
        userId: req.auth.userId,
        assetId,
        taskType,
        description,
        frequency,
        hoursInterval: hoursInterval || 0,
        lastCompleted: lastCompleted || null,
        nextDue,
        estimatedDuration,
        responsible,
        responsibleEmail,
        responsiblePhone: responsiblePhone || '',
        priority: priority || 'medium',
        status: status || 'scheduled'
      });

      await maintenanceTask.save();
      console.log('🔧 Task saved successfully');

      // Add auto-incrementing id for frontend compatibility
      const taskWithId = maintenanceTask.toObject();
      taskWithId.id = taskWithId._id.toString();

      console.log('🔧 Returning task:', taskWithId);
      res.status(201).json(taskWithId);
    } catch (error) {
      console.error('🔧 Error creating maintenance task:', error);
      res.status(500).json({ error: 'Failed to create maintenance task' });
    }
  });

  // PUT /api/maintenance/tasks/:id - Update maintenance task
  router.put('/tasks/:id', async (req, res) => {
    try {
      const updates = req.body;

      // Remove fields that shouldn't be updated directly
      delete updates._id;
      delete updates.userId;
      delete updates.createdAt;

      const task = await MaintenanceTask.findOneAndUpdate(
        { _id: req.params.id, userId: req.auth.userId },
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!task) {
        return res.status(404).json({ error: 'Maintenance task not found' });
      }

      // Add id for frontend compatibility
      const taskWithId = task.toObject();
      taskWithId.id = taskWithId._id.toString();

      res.json(taskWithId);
    } catch (error) {
      console.error('Error updating maintenance task:', error);
      res.status(500).json({ error: 'Failed to update maintenance task' });
    }
  });

  // PUT /api/maintenance/tasks/:id/complete - Complete maintenance task
  router.put('/tasks/:id/complete', [
    body('completedBy').trim().notEmpty().withMessage('Completed by is required'),
    body('completionNotes').trim().notEmpty().withMessage('Completion notes are required')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { completedBy, completionNotes } = req.body;

      const task = await MaintenanceTask.findOneAndUpdate(
        { _id: req.params.id, userId: req.auth.userId },
        {
          status: 'completed',
          completedBy,
          completionNotes,
          completedAt: new Date(),
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!task) {
        return res.status(404).json({ error: 'Maintenance task not found' });
      }

      // Add id for frontend compatibility
      const taskWithId = task.toObject();
      taskWithId.id = taskWithId._id.toString();

      res.json(taskWithId);
    } catch (error) {
      console.error('Error completing maintenance task:', error);
      res.status(500).json({ error: 'Failed to complete maintenance task' });
    }
  });

  // DELETE /api/maintenance/tasks/:id - Delete maintenance task
  router.delete('/tasks/:id', async (req, res) => {
    try {
      const task = await MaintenanceTask.findOneAndDelete({
        _id: req.params.id,
        userId: req.auth.userId
      });

      if (!task) {
        return res.status(404).json({ error: 'Maintenance task not found' });
      }

      res.json({ message: 'Maintenance task deleted successfully' });
    } catch (error) {
      console.error('Error deleting maintenance task:', error);
      res.status(500).json({ error: 'Failed to delete maintenance task' });
    }
  });

  // GET /api/maintenance/tasks/due-soon - Get tasks due within 7 days
  router.get('/tasks/due-soon', async (req, res) => {
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const tasks = await MaintenanceTask.find({
        userId: req.auth.userId,
        status: { $in: ['scheduled', 'in-progress'] },
        nextDue: {
          $gte: today.toISOString().split('T')[0],
          $lte: nextWeek.toISOString().split('T')[0]
        }
      }).sort({ nextDue: 1 });

      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks due soon:', error);
      res.status(500).json({ error: 'Failed to fetch tasks due soon' });
    }
  });

  // GET /api/maintenance/dashboard - Get maintenance dashboard data
  router.get('/dashboard', async (req, res) => {
    try {
      const userId = req.auth.userId;

      // Get task counts by status
      const [totalTasks, scheduledTasks, overdueTasks, completedTasks, inProgressTasks] = await Promise.all([
        MaintenanceTask.countDocuments({ userId }),
        MaintenanceTask.countDocuments({ userId, status: 'scheduled' }),
        MaintenanceTask.countDocuments({ userId, status: 'overdue' }),
        MaintenanceTask.countDocuments({ userId, status: 'completed' }),
        MaintenanceTask.countDocuments({ userId, status: 'in-progress' })
      ]);

      // Get tasks due this week
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const tasksDueThisWeek = await MaintenanceTask.countDocuments({
        userId,
        status: { $in: ['scheduled', 'in-progress'] },
        nextDue: {
          $gte: today.toISOString().split('T')[0],
          $lte: nextWeek.toISOString().split('T')[0]
        }
      });

      // Get recent completions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const recentCompletions = await MaintenanceTask.countDocuments({
        userId,
        status: 'completed',
        completedAt: { $gte: thirtyDaysAgo }
      });

      res.json({
        totalTasks,
        scheduledTasks,
        overdueTasks,
        completedTasks,
        inProgressTasks,
        tasksDueThisWeek,
        recentCompletions
      });
    } catch (error) {
      console.error('Error fetching maintenance dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });

  return router;
};
