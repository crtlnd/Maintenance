const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const Asset = require('../models/asset');

module.exports = () => {
  router.get(
    '/',
    [query('location').optional().trim()],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const { location } = req.query;
        const query = location ? { location } : {};
        const assets = await Asset.find(query);
        res.send(assets);
      } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  router.post(
    '/',
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('location').trim().notEmpty().withMessage('Location is required'),
      body('organization').trim().notEmpty().withMessage('Organization is required'),
      body('subAsset').optional().trim(),
      body('industry').optional().isIn(['oil/gas', 'construction', 'manufacturing', 'other']).withMessage('Invalid industry'),
      body('status').optional().isIn(['active', 'overdue', 'maintenance']).withMessage('Invalid status'),
      body('condition').optional().isIn(['good', 'fair', 'poor']).withMessage('Invalid condition')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const { name, location, organization, subAsset, industry, status, nextDueDate, condition } = req.body;
        const existingAssets = await Asset.find().select('id');
        const newId = existingAssets.length > 0 ? Math.max(...existingAssets.map(a => a.id)) + 1 : 1;
        const newAsset = await Asset.create({
          id: newId,
          name,
          location,
          organization,
          subAsset,
          industry,
          status,
          nextDueDate,
          condition
        });
        res.send(newAsset);
      } catch (error) {
        console.error('Error creating asset:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  router.put(
    '/:id/status',
    [
      param('id').isInt().withMessage('Asset ID must be an integer'),
      body('status').isIn(['active', 'overdue', 'maintenance']).withMessage('Status must be "active", "overdue", or "maintenance"')
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
          { id: assetId },
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

  router.get('/dashboard', async (req, res) => {
    try {
      const overdueTasks = await Asset.countDocuments({ status: 'overdue' });
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      console.log('Seven days from now:', sevenDaysFromNow);
      const allAssets = await Asset.find().select('id nextDueDate status');
      console.log('All assets with nextDueDate:', allAssets.map(asset => ({ id: asset.id, nextDueDate: asset.nextDueDate, status: asset.status })));
      const upcomingMaintenanceAssets = await Asset.find({
        nextDueDate: {
          $gte: new Date(),
          $lte: sevenDaysFromNow
        },
        status: { $ne: 'overdue' }
      });
      console.log('Upcoming maintenance assets:', upcomingMaintenanceAssets);
      const assetHealth = await Asset.aggregate([
        { $group: { _id: { $ifNull: ['$condition', 'good'] }, count: { $sum: 1 } } }
      ]);
      res.send({ overdueTasks, upcomingMaintenance: upcomingMaintenanceAssets.length, assetHealth });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).send({ error: 'Server error' });
    }
  });

  router.post(
    '/fmea',
    [
      body('assetId').isInt().withMessage('Asset ID must be an integer'),
      body('failureMode').trim().notEmpty().withMessage('Failure mode is required'),
      body('severity').isInt({ min: 1, max: 10 }).withMessage('Severity must be between 1 and 10'),
      body('occurrence').isInt({ min: 1, max: 10 }).withMessage('Occurrence must be between 1 and 10'),
      body('detection').isInt({ min: 1, max: 10 }).withMessage('Detection must be between 1 and 10')
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
          { id: assetId },
          {
            $push: { fmea: fmeaEntry },
            $setOnInsert: {
              status: 'active',
              condition: 'good',
              name: 'New Asset',
              location: 'Unknown',
              organization: 'Unknown'
            }
          },
          { upsert: true, new: true }
        );
        res.send({ ...fmeaEntry, ...updatedAsset.toObject() });
      } catch (error) {
        console.error('Error adding FMEA entry:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  return router;
};
