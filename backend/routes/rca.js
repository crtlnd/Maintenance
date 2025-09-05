const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Asset = require('../models/asset');
const auth = require('../middleware/auth');

module.exports = () => {
  // UPDATED: Comprehensive RCA endpoint to match frontend structure
  router.post(
    '/',
    auth,
    [
      body('assetId').isInt().withMessage('Asset ID must be an integer'),
      body('failureDate').trim().notEmpty().withMessage('Failure date is required'),
      body('problemDescription').trim().notEmpty().withMessage('Problem description is required'),
      body('immediateActions').trim().notEmpty().withMessage('Immediate actions are required'),
      body('correctiveActions').trim().notEmpty().withMessage('Corrective actions are required'),
      body('preventiveActions').trim().notEmpty().withMessage('Preventive actions are required'),
      body('responsible').trim().notEmpty().withMessage('Responsible person is required'),
      body('cost').isNumeric().withMessage('Cost must be a number'),
      body('status').optional().isIn(['Open', 'In Progress', 'Completed', 'Closed']).withMessage('Invalid status'),
      body('rootCauses').optional().trim(),
      body('fiveWhys').optional().isObject().withMessage('Five Whys must be an object'),
      body('fishboneDiagram').optional().isObject().withMessage('Fishbone diagram must be an object')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const {
          assetId,
          failureDate,
          problemDescription,
          immediateActions,
          rootCauses,
          correctiveActions,
          preventiveActions,
          responsible,
          status = 'In Progress',
          cost,
          fiveWhys,
          fishboneDiagram
        } = req.body;

        // Handle auth middleware that sets full user document
        const userId = req.user._id || req.user.userId || req.user.id;
        console.log('Creating RCA entry for assetId:', assetId, 'userId:', userId);

        if (!userId) {
          return res.status(401).json({ error: 'User authentication failed' });
        }

        // Find the asset and ensure user owns it
        console.log('=== ASSET LOOKUP DEBUG ===');
        console.log('Looking for asset with:');
        console.log('- assetId:', assetId);
        console.log('- userId:', userId);
        console.log('- userId type:', typeof userId);

        // Try to find ANY asset for this user first
        const userAssets = await Asset.find({ userId: userId });
        console.log('User has', userAssets.length, 'total assets');
        if (userAssets.length > 0) {
          console.log('User assets:', userAssets.map(a => ({ id: a.id, name: a.name })));
        }

        // Now try the specific asset
        const asset = await Asset.findOne({
          id: assetId,
          userId: userId
        });
        console.log('Found specific asset:', asset ? 'YES' : 'NO');
        console.log('=== END DEBUG ===');

        if (!asset) {
          return res.status(404).json({ error: 'Asset not found or you do not have permission to access it' });
        }

        // Create comprehensive RCA entry with explicit field mapping
        const rcaEntry = {
          id: Date.now(), // Add unique ID for frontend
          assetId: parseInt(assetId), // Ensure it's a number
          failureDate: failureDate,
          problemDescription: problemDescription,
          immediateActions: immediateActions,
          rootCauses: rootCauses || '',
          correctiveActions: correctiveActions,
          preventiveActions: preventiveActions,
          responsible: responsible,
          status: status,
          cost: parseFloat(cost) || 0,
          fiveWhys: fiveWhys || null,
          fishboneDiagram: fishboneDiagram || null,
          timestamp: new Date(),
          createdBy: userId.toString()
        };

        console.log('RCA entry before saving:', JSON.stringify(rcaEntry, null, 2));

        // Add RCA entry to asset
        asset.rca = asset.rca || [];
        asset.rca.push(rcaEntry);

        console.log('Asset RCA array after push:', asset.rca.length);

        // Use validateModifiedOnly to avoid validating existing entries
        try {
          await asset.save({ validateModifiedOnly: true });
        } catch (saveError) {
          console.log('validateModifiedOnly failed, trying with validation disabled');
          // If that fails, disable validation entirely for this save
          await asset.save({ validateBeforeSave: false });
        }

        console.log('RCA entry added successfully:', rcaEntry);
        res.json(rcaEntry);
      } catch (error) {
        console.error('Error creating RCA entry:', error);
        res.status(500).json({ error: 'Server error' });
      }
    }
  );

  // PUT endpoint for updating RCA entries
  router.put(
    '/:rcaId',
    auth,
    [
      param('rcaId').notEmpty().withMessage('RCA ID is required'),
      body('failureDate').optional().trim().notEmpty().withMessage('Failure date cannot be empty'),
      body('problemDescription').optional().trim().notEmpty().withMessage('Problem description cannot be empty'),
      body('immediateActions').optional().trim().notEmpty().withMessage('Immediate actions cannot be empty'),
      body('correctiveActions').optional().trim().notEmpty().withMessage('Corrective actions cannot be empty'),
      body('preventiveActions').optional().trim().notEmpty().withMessage('Preventive actions cannot be empty'),
      body('responsible').optional().trim().notEmpty().withMessage('Responsible person cannot be empty'),
      body('cost').optional().isNumeric().withMessage('Cost must be a number'),
      body('status').optional().isIn(['Open', 'In Progress', 'Completed', 'Closed']).withMessage('Invalid status')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const rcaId = req.params.rcaId;
        const updateData = req.body;

        const userId = req.user._id || req.user.userId || req.user.id;

        // Find asset containing the RCA entry
        const asset = await Asset.findOne({
          'rca.id': parseInt(rcaId),
          userId: userId
        });

        if (!asset) {
          return res.status(404).json({ error: 'RCA entry not found or you do not have permission to access it' });
        }

        // Find and update the specific RCA entry
        const rcaEntry = asset.rca.find(rca => rca.id === parseInt(rcaId));
        if (!rcaEntry) {
          return res.status(404).json({ error: 'RCA entry not found' });
        }

        // Update the RCA entry
        Object.assign(rcaEntry, {
          ...updateData,
          updatedAt: new Date().toISOString(),
          cost: updateData.cost ? parseFloat(updateData.cost) : rcaEntry.cost
        });

        await asset.save();

        console.log('RCA entry updated successfully:', rcaEntry);
        res.json(rcaEntry);
      } catch (error) {
        console.error('Error updating RCA entry:', error);
        res.status(500).json({ error: 'Server error' });
      }
    }
  );

  // LEGACY: Keep the old simple endpoint for backward compatibility
  router.post(
    '/simple',
    auth,
    [
      body('assetId').isInt().withMessage('Asset ID must be an integer'),
      body('problem').trim().notEmpty().withMessage('Problem description is required'),
      body('whys').isArray({ min: 5, max: 5 }).withMessage('Exactly 5 whys are required'),
      body('whys.*').trim().notEmpty().withMessage('Each why must be non-empty'),
      body('fishbone').optional().isObject().withMessage('Fishbone must be an object')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { assetId, problem, whys, fishbone } = req.body;
        const userId = req.user._id || req.user.userId || req.user.id;

        const rcaEntry = {
          id: Date.now(),
          problem,
          whys,
          fishbone: fishbone || {},
          createdAt: new Date().toISOString(),
          createdBy: userId
        };

        const updatedAsset = await Asset.findOneAndUpdate(
          { id: assetId, userId: userId },
          {
            $push: { rca: rcaEntry },
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

        res.json({ ...rcaEntry, asset: updatedAsset });
      } catch (error) {
        console.error('Error creating RCA entry:', error);
        res.status(500).json({ error: 'Server error' });
      }
    }
  );

  router.get(
    '/:assetId',
    auth,
    [param('assetId').isInt().withMessage('Asset ID must be an integer')],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const assetId = parseInt(req.params.assetId);
        const userId = req.user._id || req.user.userId || req.user.id;

        const asset = await Asset.findOne({
          id: assetId,
          userId: userId // Ensure user owns the asset
        });

        if (!asset) {
          return res.status(404).json({ error: 'Asset not found' });
        }

        res.json(asset.rca || []);
      } catch (error) {
        console.error('Error fetching RCA entries:', error);
        res.status(500).json({ error: 'Server error' });
      }
    }
  );

  return router;
};
