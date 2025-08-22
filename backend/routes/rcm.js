const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Asset = require('../models/asset');

module.exports = () => {
  router.post(
    '/',
    [
      body('assetId').isInt().withMessage('Asset ID must be an integer'),
      body('task').trim().notEmpty().withMessage('Maintenance task is required'),
      body('interval').isInt({ min: 1 }).withMessage('Interval must be a positive integer (days)'),
      body('criticality').isIn(['high', 'medium', 'low']).withMessage('Criticality must be high, medium, or low')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const { assetId, task, interval, criticality } = req.body;
        const rcmEntry = {
          task,
          interval,
          criticality,
          timestamp: new Date()
        };
        const updatedAsset = await Asset.findOneAndUpdate(
          { id: assetId },
          {
            $push: { rcm: rcmEntry },
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
        res.send({ ...rcmEntry, asset: updatedAsset });
      } catch (error) {
        console.error('Error creating RCM entry:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  router.get(
    '/:assetId',
    [param('assetId').isInt().withMessage('Asset ID must be an integer')],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const assetId = parseInt(req.params.assetId);
        const asset = await Asset.findOne({ id: assetId });
        if (!asset) {
          return res.status(404).send({ error: 'Asset not found' });
        }
        res.send(asset.rcm || []);
      } catch (error) {
        console.error('Error fetching RCM entries:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  return router;
};
