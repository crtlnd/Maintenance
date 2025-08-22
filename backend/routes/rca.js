const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Asset = require('../models/asset');

module.exports = () => {
  router.post(
    '/',
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
          return res.status(400).send({ errors: errors.array() });
        }
        const { assetId, problem, whys, fishbone } = req.body;
        const rcaEntry = {
          problem,
          whys,
          fishbone: fishbone || {},
          timestamp: new Date()
        };
        const updatedAsset = await Asset.findOneAndUpdate(
          { id: assetId },
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
        res.send({ ...rcaEntry, asset: updatedAsset });
      } catch (error) {
        console.error('Error creating RCA entry:', error);
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
        res.send(asset.rca || []);
      } catch (error) {
        console.error('Error fetching RCA entries:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  return router;
};
