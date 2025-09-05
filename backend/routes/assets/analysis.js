const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Asset = require('../../models/asset');
const { getAssetQuery } = require('./helpers/permissions');

const router = express.Router();

// FMEA ENDPOINTS

// Add FMEA entry to asset
router.post(
  '/fmea',
  [
    body('assetId').isInt().withMessage('Asset ID must be an integer'),
    body('component').trim().notEmpty().withMessage('Component is required'),
    body('failureMode').trim().notEmpty().withMessage('Failure mode is required'),
    body('effects').trim().notEmpty().withMessage('Effects are required'),
    body('severity').isInt({ min: 1, max: 10 }).withMessage('Severity must be between 1 and 10'),
    body('causes').trim().notEmpty().withMessage('Causes are required'),
    body('occurrence').isInt({ min: 1, max: 10 }).withMessage('Occurrence must be between 1 and 10'),
    body('controls').trim().notEmpty().withMessage('Controls are required'),
    body('detection').isInt({ min: 1, max: 10 }).withMessage('Detection must be between 1 and 10'),
    body('rpn').isInt({ min: 1, max: 1000 }).withMessage('RPN must be between 1 and 1000'),
    body('actions').trim().notEmpty().withMessage('Actions are required'),
    body('responsible').trim().notEmpty().withMessage('Responsible person is required'),
    body('dueDate').trim().notEmpty().withMessage('Due date is required'),
    body('status').optional().isIn(['Open', 'In Progress', 'Completed', 'Closed']).withMessage('Invalid status'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      const {
        assetId,
        component,
        failureMode,
        effects,
        severity,
        causes,
        occurrence,
        controls,
        detection,
        rpn,
        actions,
        responsible,
        dueDate,
        status = 'Open'
      } = req.body;

      // Verify RPN calculation matches frontend calculation
      const calculatedRPN = severity * occurrence * detection;
      if (rpn !== calculatedRPN) {
        return res.status(400).send({
          error: `RPN mismatch: expected ${calculatedRPN}, received ${rpn}`
        });
      }

      // Get query with organization permissions
      const query = await getAssetQuery(req.auth.userId, { id: assetId });

      // Create comprehensive FMEA entry
      const fmeaEntry = {
        assetId,
        component,
        failureMode,
        effects,
        severity,
        causes,
        occurrence,
        controls,
        detection,
        rpn,
        actions,
        responsible,
        dueDate,
        status,
        timestamp: new Date(),
        createdBy: req.auth.userId
      };

      const updatedAsset = await Asset.findOneAndUpdate(
        query,
        { $push: { fmea: fmeaEntry } },
        { new: true }
      );

      if (!updatedAsset) {
        return res.status(404).send({ error: 'Asset not found' });
      }

      console.log('FMEA entry added successfully:', fmeaEntry);
      res.send(fmeaEntry);
    } catch (error) {
      console.error('Error adding FMEA entry:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// Get FMEA entries for an asset
router.get(
  '/:id/fmea',
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

      const asset = await Asset.findOne(query).select('fmea');

      if (!asset) {
        return res.status(404).send({ error: 'Asset not found' });
      }

      res.send(asset.fmea || []);
    } catch (error) {
      console.error('Error fetching FMEA entries:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// RCA ENDPOINTS

// Add RCA entry to asset
router.post(
  '/rca',
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
        return res.status(400).send({ errors: errors.array() });
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
        status = 'Open',
        cost,
        fiveWhys,
        fishboneDiagram
      } = req.body;

      // Get query with organization permissions
      const query = await getAssetQuery(req.auth.userId, { id: assetId });

      // Create comprehensive RCA entry
      const rcaEntry = {
        assetId,
        failureDate,
        problemDescription,
        immediateActions,
        rootCauses: rootCauses || '',
        correctiveActions,
        preventiveActions,
        responsible,
        status,
        cost: parseFloat(cost) || 0,
        fiveWhys: fiveWhys || null,
        fishboneDiagram: fishboneDiagram || null,
        timestamp: new Date(),
        createdBy: req.auth.userId
      };

      const updatedAsset = await Asset.findOneAndUpdate(
        query,
        { $push: { rca: rcaEntry } },
        { new: true }
      );

      if (!updatedAsset) {
        return res.status(404).send({ error: 'Asset not found' });
      }

      console.log('RCA entry added successfully:', rcaEntry);
      res.send(rcaEntry);
    } catch (error) {
      console.error('Error adding RCA entry:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// Update RCA entry
router.put(
  '/rca/:rcaId',
  [
    param('rcaId').notEmpty().withMessage('RCA ID is required'),
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
        return res.status(400).send({ errors: errors.array() });
      }

      const rcaId = req.params.rcaId;
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

      // Get query with organization permissions
      const baseQuery = await getAssetQuery(req.auth.userId, { 'rca._id': rcaId });

      // Create updated RCA entry
      const updatedRCAData = {
        assetId,
        failureDate,
        problemDescription,
        immediateActions,
        rootCauses: rootCauses || '',
        correctiveActions,
        preventiveActions,
        responsible,
        status,
        cost: parseFloat(cost) || 0,
        fiveWhys: fiveWhys || null,
        fishboneDiagram: fishboneDiagram || null,
        updatedAt: new Date(),
        updatedBy: req.auth.userId
      };

      // Find the asset and update the specific RCA entry
      const updatedAsset = await Asset.findOneAndUpdate(
        baseQuery,
        {
          $set: {
            'rca.$': {
              ...updatedRCAData,
              _id: rcaId,
              timestamp: req.body.timestamp || new Date(), // Preserve original timestamp
              createdBy: req.body.createdBy // Preserve original creator
            }
          }
        },
        { new: true }
      );

      if (!updatedAsset) {
        return res.status(404).send({ error: 'RCA entry not found' });
      }

      // Find the updated RCA entry to return
      const updatedRCAEntry = updatedAsset.rca.find(rca => rca._id.toString() === rcaId);

      console.log('RCA entry updated successfully:', updatedRCAEntry);
      res.send(updatedRCAEntry);
    } catch (error) {
      console.error('Error updating RCA entry:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// Get RCA entries for an asset
router.get(
  '/:id/rca',
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

      const asset = await Asset.findOne(query).select('rca');

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

// Get all analysis data across organization (for reporting)
router.get(
  '/all/analysis',
  async (req, res) => {
    try {
      // Get query with organization permissions
      const query = await getAssetQuery(req.auth.userId);

      const assets = await Asset.find(query).select('id name fmea rca');

      const analysisData = {
        fmea: [],
        rca: [],
        summary: {
          totalFMEA: 0,
          totalRCA: 0,
          openFMEA: 0,
          openRCA: 0,
          highRiskFMEA: 0
        }
      };

      assets.forEach(asset => {
        // Process FMEA entries
        if (asset.fmea && asset.fmea.length > 0) {
          asset.fmea.forEach(fmea => {
            analysisData.fmea.push({
              ...fmea.toObject(),
              assetId: asset.id,
              assetName: asset.name
            });

            if (fmea.status === 'Open') analysisData.summary.openFMEA++;
            if (fmea.rpn >= 200) analysisData.summary.highRiskFMEA++;
          });
          analysisData.summary.totalFMEA += asset.fmea.length;
        }

        // Process RCA entries
        if (asset.rca && asset.rca.length > 0) {
          asset.rca.forEach(rca => {
            analysisData.rca.push({
              ...rca.toObject(),
              assetId: asset.id,
              assetName: asset.name
            });

            if (rca.status === 'Open') analysisData.summary.openRCA++;
          });
          analysisData.summary.totalRCA += asset.rca.length;
        }
      });

      // Sort by priority/date
      analysisData.fmea.sort((a, b) => b.rpn - a.rpn); // High RPN first
      analysisData.rca.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Recent first

      res.send(analysisData);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

module.exports = router;
