const express = require('express');
const router = express.Router();

module.exports = (assets) => {
  router.get('/', async (req, res) => {
    const { location } = req.query;
    const query = location ? { location } : {};
    const result = await assets.find(query).toArray();
    res.send(result);
  });

  router.post('/', async (req, res) => {
    const { name, location, status = 'active', nextDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), condition = 'good' } = req.body;
    if (!name || !location) {
      return res.status(400).send({ error: 'Name and location are required' });
    }
    const existingIds = await assets.distinct('id');
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const newAsset = { id: newId, name, location, status, nextDueDate, condition };
    await assets.insertOne(newAsset);
    res.send(newAsset);
  });

  router.put('/:id/status', async (req, res) => {
    const assetId = parseInt(req.params.id);
    const { status } = req.body;
    if (!status || !['active', 'overdue', 'maintenance'].includes(status)) {
      return res.status(400).send({ error: 'Status must be "active", "overdue", or "maintenance"' });
    }
    const result = await assets.updateOne({ id: assetId }, { $set: { status } });
    if (result.matchedCount === 0) {
      return res.status(404).send({ error: 'Asset not found' });
    }
    const updatedAsset = await assets.findOne({ id: assetId });
    res.send(updatedAsset);
  });

  router.get('/dashboard', async (req, res) => {
    const overdueTasks = await assets.countDocuments({ status: 'overdue' });
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    console.log('Seven days from now:', sevenDaysFromNow);
    const allAssets = await assets.find().toArray();
    console.log('All assets with nextDueDate:', allAssets.map(asset => ({ id: asset.id, nextDueDate: asset.nextDueDate, status: asset.status })));
    const upcomingMaintenanceAssets = await assets.aggregate([
      {
        $addFields: {
          nextDueDateAsDate: {
            $cond: {
              if: { $ne: [{ $type: '$nextDueDate' }, 'missing'] },
              then: { $toDate: { $ifNull: ['$nextDueDate', null] } },
              else: null
            }
          }
        }
      },
      {
        $match: {
          nextDueDateAsDate: {
            $gte: new Date(),
            $lte: sevenDaysFromNow
          },
          status: { $ne: 'overdue' }
        }
      }
    ]).toArray();
    console.log('Upcoming maintenance assets:', upcomingMaintenanceAssets);
    const assetHealth = await assets.aggregate([
      { $group: { _id: { $ifNull: ['$condition', 'good'] }, count: { $sum: 1 } } }
    ]).toArray();
    res.send({ overdueTasks, upcomingMaintenance: upcomingMaintenanceAssets.length, assetHealth });
  });

  router.post('/fmea', async (req, res) => {
    console.log('FMEA request body:', req.body);
    let body = req.body || {};
    console.log('FMEA parsed body:', body);
    if (Object.keys(body).length === 0 && req.headers['content-type'] === 'application/json') {
      console.error('FMEA body parsing failed, raw body not available');
      return res.status(400).send({ error: 'Invalid JSON body' });
    }
    const { assetId, failureMode, severity, occurrence, detection } = body;
    if (!assetId || !failureMode || !severity || !occurrence || !detection) {
      return res.status(400).send({ error: 'All fields (assetId, failureMode, severity, occurrence, detection) are required' });
    }
    const rpn = severity * occurrence * detection;
    const fmeaEntry = { assetId, failureMode, severity, occurrence, detection, rpn, timestamp: new Date() };
    await assets.updateOne(
      { id: assetId },
      { $push: { fmea: fmeaEntry }, $setOnInsert: { status: "active", condition: "good", name: "New Asset", location: "Unknown" } },
      { upsert: true }
    );
    const updatedDoc = await assets.findOne({ id: assetId });
    res.send({ ...fmeaEntry, ...updatedDoc });
  });

  return router;
};
