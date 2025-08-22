const express = require('express');
const router = express.Router();
const Asset = require('../models/asset');

module.exports = () => {
  router.post('/', async (req, res) => {
    try {
      const { assetId, problem, whys, fishbone } = req.body;
      if (!assetId || !problem || !whys || whys.length !== 5) {
        return res.status(400).send({ error: 'Asset ID, problem, and exactly 5 "whys" are required' });
      }
      const rcaEntry = {
        problem,
        whys,
        fishbone: fishbone || {}, // Optional fishbone diagram data
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
  });

  router.get('/:assetId', async (req, res) => {
    try {
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
  });

  return router;
};
