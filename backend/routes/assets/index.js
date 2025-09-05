const express = require('express');

// Import all sub-modules
const crudRoutes = require('./crud');
const maintenanceRoutes = require('./maintenance');
const analysisRoutes = require('./analysis');
const importRoutes = require('./import');
const dashboardRoutes = require('./dashboard');

const router = express.Router();

// Mount all route modules
router.use('/', crudRoutes);           // Basic CRUD operations
router.use('/', maintenanceRoutes);    // Maintenance task operations
router.use('/', analysisRoutes);       // FMEA and RCA operations
router.use('/import', importRoutes);   // Bulk import operations
router.use('/dashboard', dashboardRoutes); // Dashboard and statistics

module.exports = router;
