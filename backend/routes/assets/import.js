const express = require('express');
const { body, validationResult } = require('express-validator');
const Asset = require('../../models/asset');
const User = require('../../models/user');

const router = express.Router();

// Bulk import assets from CSV
router.post(
  '/',
  [
    body('assets').isArray().withMessage('Assets must be an array'),
    body('assets.*.name').trim().notEmpty().withMessage('Asset name is required'),
    body('assets.*.type').trim().notEmpty().withMessage('Asset type is required'),
    body('assets.*.manufacturer').trim().notEmpty().withMessage('Manufacturer is required'),
    body('assets.*.model').trim().notEmpty().withMessage('Model is required'),
    body('assets.*.location').trim().notEmpty().withMessage('Location is required'),
    body('assets.*.organization').trim().notEmpty().withMessage('Organization is required'),
    body('assets.*.serialNumber').optional().trim(),
    body('assets.*.yearManufactured').optional().isInt({ min: 1900, max: new Date().getFullYear() }),
    body('assets.*.operatingHours').optional().isNumeric(),
    body('assets.*.status').optional().isIn(['operational', 'maintenance', 'down', 'retired']),
    body('assets.*.condition').optional().isIn(['excellent', 'good', 'fair', 'poor']),
    body('assets.*.purchaseDate').optional().isISO8601(),
    body('assets.*.purchasePrice').optional().isNumeric(),
    body('assets.*.warrantyExpiration').optional().isISO8601(),
    body('assets.*.lastServiceDate').optional().isISO8601(),
    body('assets.*.nextServiceDate').optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return res.status(400).send({
          error: 'Validation failed',
          details: validationErrors.array()
        });
      }

      const { assets } = req.body;
      const userId = req.auth.userId;

      // Check user exists and subscription limits
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }

      // Check subscription limits
      const currentAssetCount = await Asset.countDocuments({ userId });
      const newAssetCount = currentAssetCount + assets.length;

      if (user.subscriptionTier === 'Basic' && newAssetCount > 5) {
        return res.status(403).send({
          error: `Asset limit exceeded. Basic plan allows 5 assets. You currently have ${currentAssetCount} assets and are trying to import ${assets.length} more.`
        });
      }

      // Get existing asset IDs to generate new ones
      const existingAssets = await Asset.find().select('id').sort({ id: -1 }).limit(1);
      let nextId = existingAssets.length > 0 ? existingAssets[0].id + 1 : 1;

      // Get existing serial numbers for duplicate checking
      const existingSerialNumbers = await Asset.find({
        serialNumber: { $exists: true, $ne: null }
      }).select('serialNumber');
      const existingSerialSet = new Set(existingSerialNumbers.map(a => a.serialNumber));

      // Process assets and handle missing/duplicate serial numbers
      const processedAssets = [];
      const processingErrors = [];
      const warnings = [];

      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        const rowNumber = i + 2; // +2 because CSV starts at row 2

        try {
          // Generate ID
          const assetId = nextId++;

          // Handle serial number
          let serialNumber = asset.serialNumber;
          if (!serialNumber || serialNumber.trim() === '') {
            // Auto-generate serial number
            const timestamp = Date.now();
            serialNumber = `GEN-${timestamp}-${assetId}`;
            warnings.push({
              row: rowNumber,
              asset: asset.name,
              message: `Auto-generated serial number: ${serialNumber}`
            });
          } else {
            // Check for duplicates (including other assets in this batch)
            if (existingSerialSet.has(serialNumber)) {
              // Auto-generate with suffix to avoid duplicate
              const timestamp = Date.now();
              const originalSerial = serialNumber;
              serialNumber = `${originalSerial}-GEN-${timestamp}`;
              warnings.push({
                row: rowNumber,
                asset: asset.name,
                message: `Duplicate serial number detected. Changed from '${originalSerial}' to '${serialNumber}'`
              });
            }
            existingSerialSet.add(serialNumber); // Add to set for next iterations
          }

          // Process dates
          const processDate = (dateStr) => {
            if (!dateStr) return undefined;
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? undefined : date;
          };

          // Create processed asset
          const processedAsset = {
            id: assetId,
            userId,
            name: asset.name.trim(),
            type: asset.type.trim(),
            manufacturer: asset.manufacturer.trim(),
            model: asset.model.trim(),
            serialNumber,
            location: asset.location.trim(),
            organization: asset.organization.trim(),

            // Optional fields with defaults
            status: asset.status || 'operational',
            condition: asset.condition || 'good',
            operatingHours: asset.operatingHours || 0,
            yearManufactured: asset.yearManufactured || undefined,

            // Date fields
            purchaseDate: processDate(asset.purchaseDate),
            warrantyExpiration: processDate(asset.warrantyExpiration),
            lastServiceDate: processDate(asset.lastServiceDate),
            nextServiceDate: processDate(asset.nextServiceDate),

            // Financial fields
            purchasePrice: asset.purchasePrice || undefined,

            // Initialize empty arrays/objects for complex fields
            maintenanceTasks: [],
            specifications: {},
            images: [],
            documents: [],
            alerts: [],
            fmea: [],
            rca: [],
            rcm: [],

            // Timestamps
            createdAt: new Date(),
            updatedAt: new Date()
          };

          processedAssets.push(processedAsset);

        } catch (assetError) {
          processingErrors.push({
            row: rowNumber,
            asset: asset.name || 'Unknown',
            error: assetError.message
          });
        }
      }

      // If there were processing errors, return them
      if (processingErrors.length > 0) {
        return res.status(400).send({
          error: 'Some assets could not be processed',
          errors: processingErrors,
          warnings,
          processedCount: processedAssets.length,
          totalCount: assets.length
        });
      }

      // Bulk insert assets
      let insertedAssets = [];
      try {
        insertedAssets = await Asset.insertMany(processedAssets, { ordered: false });

        // Update user asset count and asset references
        await User.updateOne(
          { _id: userId },
          {
            $inc: { assetCount: insertedAssets.length },
            $push: { assets: { $each: insertedAssets.map(a => a._id) } }
          }
        );

      } catch (insertError) {
        console.error('Bulk insert error:', insertError);

        // Handle partial failures
        if (insertError.writeErrors) {
          const successfulInserts = insertError.insertedDocs || [];
          const failedInserts = insertError.writeErrors.map(err => ({
            row: err.index + 2,
            asset: processedAssets[err.index]?.name || 'Unknown',
            error: err.errmsg
          }));

          return res.status(207).send({ // 207 = Multi-Status
            message: 'Partial success',
            inserted: successfulInserts.length,
            failed: failedInserts.length,
            total: processedAssets.length,
            warnings,
            errors: failedInserts,
            assets: successfulInserts
          });
        }

        throw insertError; // Re-throw if not a partial failure
      }

      // Success response
      res.status(201).send({
        message: 'Assets imported successfully',
        imported: insertedAssets.length,
        total: assets.length,
        warnings,
        assets: insertedAssets
      });

    } catch (error) {
      console.error('Error importing assets:', error);
      res.status(500).send({
        error: 'Server error during import',
        details: error.message
      });
    }
  }
);

// Get import template/example
router.get(
  '/template',
  (req, res) => {
    const template = {
      headers: [
        'name',
        'type',
        'manufacturer',
        'model',
        'serialNumber',
        'location',
        'organization',
        'yearManufactured',
        'operatingHours',
        'status',
        'condition',
        'purchaseDate',
        'purchasePrice',
        'warrantyExpiration',
        'lastServiceDate',
        'nextServiceDate'
      ],
      example: {
        name: 'Conveyor Belt #1',
        type: 'Conveyor System',
        manufacturer: 'BeltCorp',
        model: 'BC-2000',
        serialNumber: 'BC2000-001',
        location: 'Production Floor A',
        organization: 'Manufacturing Plant',
        yearManufactured: 2020,
        operatingHours: 8760,
        status: 'operational',
        condition: 'good',
        purchaseDate: '2020-01-15',
        purchasePrice: 25000,
        warrantyExpiration: '2025-01-15',
        lastServiceDate: '2024-06-01',
        nextServiceDate: '2024-12-01'
      },
      validValues: {
        status: ['operational', 'maintenance', 'down', 'retired'],
        condition: ['excellent', 'good', 'fair', 'poor']
      },
      notes: [
        'All fields with * are required',
        'Dates should be in YYYY-MM-DD format',
        'Serial numbers will be auto-generated if left empty',
        'Duplicate serial numbers will be automatically modified',
        'Basic plan users are limited to 5 assets total'
      ]
    };

    res.send(template);
  }
);

// Validate import data before processing
router.post(
  '/validate',
  [
    body('assets').isArray().withMessage('Assets must be an array'),
  ],
  async (req, res) => {
    try {
      const { assets } = req.body;
      const userId = req.auth.userId;

      // Check user subscription limits
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }

      const currentAssetCount = await Asset.countDocuments({ userId });
      const newAssetCount = currentAssetCount + assets.length;

      const validation = {
        valid: true,
        errors: [],
        warnings: [],
        summary: {
          totalAssets: assets.length,
          currentAssetCount,
          newAssetCount,
          subscriptionLimit: user.subscriptionTier === 'Basic' ? 5 : 'unlimited'
        }
      };

      // Check subscription limits
      if (user.subscriptionTier === 'Basic' && newAssetCount > 5) {
        validation.valid = false;
        validation.errors.push({
          type: 'subscription_limit',
          message: `Asset limit exceeded. Basic plan allows 5 assets. You currently have ${currentAssetCount} assets and are trying to import ${assets.length} more.`
        });
      }

      // Validate required fields
      const requiredFields = ['name', 'type', 'manufacturer', 'model', 'location', 'organization'];

      assets.forEach((asset, index) => {
        const rowNumber = index + 2;

        requiredFields.forEach(field => {
          if (!asset[field] || !asset[field].trim()) {
            validation.valid = false;
            validation.errors.push({
              row: rowNumber,
              field,
              message: `${field} is required`,
              asset: asset.name || 'Unknown'
            });
          }
        });

        // Check for missing serial numbers (will be auto-generated)
        if (!asset.serialNumber || !asset.serialNumber.trim()) {
          validation.warnings.push({
            row: rowNumber,
            message: 'Serial number will be auto-generated',
            asset: asset.name || 'Unknown'
          });
        }
      });

      // Check for duplicate serial numbers within the batch
      const serialNumbers = assets
        .map(asset => asset.serialNumber)
        .filter(sn => sn && sn.trim());

      const duplicateSerials = serialNumbers.filter((sn, index) =>
        serialNumbers.indexOf(sn) !== index
      );

      if (duplicateSerials.length > 0) {
        validation.warnings.push({
          message: `Duplicate serial numbers detected: ${duplicateSerials.join(', ')}. These will be automatically modified.`
        });
      }

      res.send(validation);
    } catch (error) {
      console.error('Error validating import data:', error);
      res.status(500).send({ error: 'Server error during validation' });
    }
  }
);

module.exports = router;
