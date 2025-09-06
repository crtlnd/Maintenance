const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const Procedure = require('../models/procedure');
const User = require('../models/user');
const Asset = require('../models/asset');

const router = express.Router();

// Get all procedures for a specific asset
router.get(
  '/asset/:assetId',
  [param('assetId').isInt().withMessage('Asset ID must be an integer')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      const assetId = parseInt(req.params.assetId);

      // Verify user has access to this asset
      const user = await User.findById(req.auth.userId);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }

      const asset = await Asset.findOne({
        id: assetId,
        $or: [
          { userId: req.auth.userId },
          { organizationId: user.organizationId }
        ]
      });

      if (!asset) {
        return res.status(404).send({ error: 'Asset not found' });
      }

      // Get procedures for this asset
      const procedures = await Procedure.find({
        assetId: assetId,
        organizationId: user.organizationId
      }).sort({ createdAt: -1 });

      res.send(procedures);
    } catch (error) {
      console.error('Error fetching procedures:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// Create new procedure
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('assetId').isInt().withMessage('Asset ID must be an integer'),
    body('type').isIn(['standard', 'inspection', 'repair', 'custom']).withMessage('Invalid type'),
    body('priority').isIn(['urgent', 'important']).withMessage('Invalid priority'),
    body('estimatedTime').trim().notEmpty().withMessage('Estimated time is required'),
    body('tools').isArray().withMessage('Tools must be an array'),
    body('materials').isArray().withMessage('Materials must be an array'),
    body('people').isArray().withMessage('People must be an array'),
    body('safety').isArray().withMessage('Safety must be an array'),
    body('steps').isArray().withMessage('Steps must be an array'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      const user = await User.findById(req.auth.userId);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }

      // Verify asset exists and user has access
      const asset = await Asset.findOne({
        id: req.body.assetId,
        $or: [
          { userId: req.auth.userId },
          { organizationId: user.organizationId }
        ]
      });

      if (!asset) {
        return res.status(404).send({ error: 'Asset not found' });
      }

      // Generate new ID
      const existingProcedures = await Procedure.find().select('id');
      const newId = existingProcedures.length > 0 ? Math.max(...existingProcedures.map(p => p.id)) + 1 : 1;

      // Create procedure
      const procedureData = {
        id: newId,
        createdBy: req.auth.userId,
        organizationId: user.organizationId,
        assetType: asset.type,
        manufacturer: asset.manufacturer,
        model: asset.model,
        ...req.body
      };

      const newProcedure = await Procedure.create(procedureData);
      res.status(201).send(newProcedure);
    } catch (error) {
      console.error('Error creating procedure:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// Update procedure
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Procedure ID must be an integer'),
    body('title').optional().trim().notEmpty(),
    body('type').optional().isIn(['standard', 'inspection', 'repair', 'custom']),
    body('priority').optional().isIn(['urgent', 'important']),
    body('estimatedTime').optional().trim().notEmpty(),
    body('tools').optional().isArray(),
    body('materials').optional().isArray(),
    body('people').optional().isArray(),
    body('safety').optional().isArray(),
    body('steps').optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      const procedureId = parseInt(req.params.id);
      const user = await User.findById(req.auth.userId);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }

      const updatedProcedure = await Procedure.findOneAndUpdate(
        {
          id: procedureId,
          organizationId: user.organizationId
        },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedProcedure) {
        return res.status(404).send({ error: 'Procedure not found' });
      }

      res.send(updatedProcedure);
    } catch (error) {
      console.error('Error updating procedure:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// Delete procedure
router.delete(
  '/:id',
  [param('id').isInt().withMessage('Procedure ID must be an integer')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      const procedureId = parseInt(req.params.id);
      const user = await User.findById(req.auth.userId);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }

      const deletedProcedure = await Procedure.findOneAndDelete({
        id: procedureId,
        organizationId: user.organizationId
      });

      if (!deletedProcedure) {
        return res.status(404).send({ error: 'Procedure not found' });
      }

      res.send({ message: 'Procedure deleted successfully' });
    } catch (error) {
      console.error('Error deleting procedure:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

// Generate AI procedures for asset
router.post(
  '/generate/:assetId',
  [param('assetId').isInt().withMessage('Asset ID must be an integer')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }

      const assetId = parseInt(req.params.assetId);
      const user = await User.findById(req.auth.userId);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }

      // Verify asset exists and user has access
      const asset = await Asset.findOne({
        id: assetId,
        $or: [
          { userId: req.auth.userId },
          { organizationId: user.organizationId }
        ]
      });

      if (!asset) {
        return res.status(404).send({ error: 'Asset not found' });
      }

      // TODO: Implement AI generation logic here
      // For now, return a placeholder response
      res.send({
        message: 'AI procedure generation not implemented yet',
        asset: {
          id: asset.id,
          name: asset.name,
          manufacturer: asset.manufacturer,
          model: asset.model
        }
      });
    } catch (error) {
      console.error('Error generating procedures:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

module.exports = router;
