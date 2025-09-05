const express = require('express');
const Asset = require('../../models/asset');
const { getUserQuery } = require('./helpers/permissions');

const router = express.Router();

// Main dashboard endpoint with organization support
router.get('/', async (req, res) => {
  try {
    // Get user query with organization permissions
    const userQuery = await getUserQuery(req.auth.userId);

    // Get overdue tasks count
    const assetsWithOverdueTasks = await Asset.find({
      ...userQuery,
      'maintenanceTasks.status': 'overdue'
    });
    const overdueTasks = assetsWithOverdueTasks.reduce((count, asset) => {
      return count + asset.maintenanceTasks.filter(task => task.status === 'overdue').length;
    }, 0);

    // Get upcoming maintenance (next 7 days)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const assetsWithUpcomingMaintenance = await Asset.find({
      ...userQuery,
      $or: [
        {
          nextServiceDate: {
            $gte: new Date(),
            $lte: sevenDaysFromNow,
          }
        },
        {
          'maintenanceTasks.dueDate': {
            $gte: new Date(),
            $lte: sevenDaysFromNow,
          },
          'maintenanceTasks.status': { $ne: 'completed' }
        }
      ]
    });

    // Asset health distribution
    const assetHealth = await Asset.aggregate([
      { $match: userQuery },
      {
        $group: {
          _id: { $ifNull: ['$condition', 'good'] },
          count: { $sum: 1 }
        }
      },
    ]);

    // Asset status distribution
    const assetStatus = await Asset.aggregate([
      { $match: userQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
    ]);

    // Total asset count
    const totalAssets = await Asset.countDocuments(userQuery);

    res.send({
      overdueTasks,
      upcomingMaintenance: assetsWithUpcomingMaintenance.length,
      assetHealth,
      assetStatus,
      totalAssets
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Asset statistics endpoint
router.get('/stats', async (req, res) => {
  try {
    // Get user query with organization permissions
    const userQuery = await getUserQuery(req.auth.userId);

    // Get all assets for detailed analysis
    const assets = await Asset.find(userQuery);

    const stats = {
      total: assets.length,
      byType: {},
      byManufacturer: {},
      byLocation: {},
      byCondition: {},
      byStatus: {},
      averageAge: 0,
      totalValue: 0,
      maintenanceStats: {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        pendingTasks: 0
      },
      analysisStats: {
        totalFMEA: 0,
        totalRCA: 0,
        highRiskFMEA: 0,
        openAnalysis: 0
      }
    };

    const currentYear = new Date().getFullYear();

    assets.forEach(asset => {
      // Count by type
      stats.byType[asset.type] = (stats.byType[asset.type] || 0) + 1;

      // Count by manufacturer
      stats.byManufacturer[asset.manufacturer] = (stats.byManufacturer[asset.manufacturer] || 0) + 1;

      // Count by location
      stats.byLocation[asset.location] = (stats.byLocation[asset.location] || 0) + 1;

      // Count by condition
      const condition = asset.condition || 'good';
      stats.byCondition[condition] = (stats.byCondition[condition] || 0) + 1;

      // Count by status
      stats.byStatus[asset.status] = (stats.byStatus[asset.status] || 0) + 1;

      // Calculate average age
      if (asset.yearManufactured) {
        stats.averageAge += currentYear - asset.yearManufactured;
      }

      // Sum total value
      if (asset.purchasePrice) {
        stats.totalValue += asset.purchasePrice;
      }

      // Maintenance task statistics
      if (asset.maintenanceTasks && asset.maintenanceTasks.length > 0) {
        asset.maintenanceTasks.forEach(task => {
          stats.maintenanceStats.totalTasks++;

          switch (task.status) {
            case 'completed':
              stats.maintenanceStats.completedTasks++;
              break;
            case 'overdue':
              stats.maintenanceStats.overdueTasks++;
              break;
            case 'pending':
            case 'in-progress':
              stats.maintenanceStats.pendingTasks++;
              break;
          }
        });
      }

      // Analysis statistics
      if (asset.fmea && asset.fmea.length > 0) {
        stats.analysisStats.totalFMEA += asset.fmea.length;
        asset.fmea.forEach(fmea => {
          if (fmea.rpn >= 200) stats.analysisStats.highRiskFMEA++;
          if (fmea.status === 'Open') stats.analysisStats.openAnalysis++;
        });
      }

      if (asset.rca && asset.rca.length > 0) {
        stats.analysisStats.totalRCA += asset.rca.length;
        asset.rca.forEach(rca => {
          if (rca.status === 'Open') stats.analysisStats.openAnalysis++;
        });
      }
    });

    // Calculate average age
    const assetsWithAge = assets.filter(a => a.yearManufactured).length;
    if (assetsWithAge > 0) {
      stats.averageAge = Math.round(stats.averageAge / assetsWithAge);
    }

    res.send(stats);
  } catch (error) {
    console.error('Error fetching asset statistics:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Maintenance overview endpoint
router.get('/maintenance', async (req, res) => {
  try {
    // Get user query with organization permissions
    const userQuery = await getUserQuery(req.auth.userId);

    // Get assets with maintenance data
    const assets = await Asset.find(userQuery).select('id name maintenanceTasks nextServiceDate');

    const maintenanceOverview = {
      overdueTasks: [],
      upcomingTasks: [],
      recentlyCompleted: [],
      serviceSchedule: []
    };

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    assets.forEach(asset => {
      // Check for upcoming service dates
      if (asset.nextServiceDate && asset.nextServiceDate >= now && asset.nextServiceDate <= sevenDaysFromNow) {
        maintenanceOverview.serviceSchedule.push({
          assetId: asset.id,
          assetName: asset.name,
          serviceDate: asset.nextServiceDate,
          type: 'scheduled_service'
        });
      }

      // Process maintenance tasks
      if (asset.maintenanceTasks && asset.maintenanceTasks.length > 0) {
        asset.maintenanceTasks.forEach(task => {
          const taskWithAsset = {
            ...task.toObject(),
            assetId: asset.id,
            assetName: asset.name
          };

          // Overdue tasks
          if (task.status === 'overdue') {
            maintenanceOverview.overdueTasks.push(taskWithAsset);
          }

          // Upcoming tasks (due in next 7 days)
          else if (task.dueDate && task.status !== 'completed') {
            const dueDate = new Date(task.dueDate);
            if (dueDate >= now && dueDate <= sevenDaysFromNow) {
              maintenanceOverview.upcomingTasks.push(taskWithAsset);
            }
          }

          // Recently completed (last 30 days)
          else if (task.status === 'completed' && task.completedDate) {
            const completedDate = new Date(task.completedDate);
            if (completedDate >= thirtyDaysAgo) {
              maintenanceOverview.recentlyCompleted.push(taskWithAsset);
            }
          }
        });
      }
    });

    // Sort arrays by priority/date
    maintenanceOverview.overdueTasks.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    maintenanceOverview.upcomingTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    maintenanceOverview.recentlyCompleted.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
    maintenanceOverview.serviceSchedule.sort((a, b) => new Date(a.serviceDate) - new Date(b.serviceDate));

    res.send(maintenanceOverview);
  } catch (error) {
    console.error('Error fetching maintenance overview:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// Asset performance metrics endpoint
router.get('/performance', async (req, res) => {
  try {
    // Get user query with organization permissions
    const userQuery = await getUserQuery(req.auth.userId);

    const assets = await Asset.find(userQuery);

    const performance = {
      reliability: {
        mtbf: 0, // Mean Time Between Failures
        mttr: 0, // Mean Time To Repair
        availability: 0
      },
      utilization: {
        averageHours: 0,
        utilizationRate: 0
      },
      costs: {
        totalMaintenanceCost: 0,
        averageCostPerAsset: 0,
        costByType: {}
      },
      trends: {
        failuresByMonth: {},
        maintenanceByMonth: {},
        costsByMonth: {}
      }
    };

    let totalOperatingHours = 0;
    let totalMaintenanceTime = 0;
    let totalFailures = 0;
    let totalRepairTime = 0;
    let assetsWithHours = 0;

    assets.forEach(asset => {
      // Operating hours and utilization
      if (asset.operatingHours > 0) {
        totalOperatingHours += asset.operatingHours;
        assetsWithHours++;
      }

      // Process RCA entries for failure analysis
      if (asset.rca && asset.rca.length > 0) {
        totalFailures += asset.rca.length;

        asset.rca.forEach(rca => {
          // Add to maintenance costs
          if (rca.cost) {
            performance.costs.totalMaintenanceCost += rca.cost;

            // Cost by asset type
            if (!performance.costs.costByType[asset.type]) {
              performance.costs.costByType[asset.type] = 0;
            }
            performance.costs.costByType[asset.type] += rca.cost;
          }

          // Track trends by month
          const failureMonth = new Date(rca.failureDate).toISOString().substring(0, 7);
          performance.trends.failuresByMonth[failureMonth] =
            (performance.trends.failuresByMonth[failureMonth] || 0) + 1;
        });
      }

      // Process maintenance tasks
      if (asset.maintenanceTasks && asset.maintenanceTasks.length > 0) {
        asset.maintenanceTasks.forEach(task => {
          if (task.status === 'completed' && task.actualHours) {
            totalMaintenanceTime += task.actualHours;
            totalRepairTime += task.actualHours;
          }

          // Track maintenance trends
          if (task.completedDate) {
            const completedMonth = new Date(task.completedDate).toISOString().substring(0, 7);
            performance.trends.maintenanceByMonth[completedMonth] =
              (performance.trends.maintenanceByMonth[completedMonth] || 0) + 1;
          }
        });
      }
    });

    // Calculate metrics
    if (assetsWithHours > 0) {
      performance.utilization.averageHours = Math.round(totalOperatingHours / assetsWithHours);

      // Assume 8760 hours per year as maximum
      performance.utilization.utilizationRate =
        Math.round((performance.utilization.averageHours / 8760) * 100);
    }

    if (totalFailures > 0 && totalOperatingHours > 0) {
      performance.reliability.mtbf = Math.round(totalOperatingHours / totalFailures);
    }

    if (totalFailures > 0 && totalRepairTime > 0) {
      performance.reliability.mttr = Math.round(totalRepairTime / totalFailures);
    }

    // Availability = (Total Time - Downtime) / Total Time
    const totalTime = totalOperatingHours + totalMaintenanceTime;
    if (totalTime > 0) {
      performance.reliability.availability =
        Math.round(((totalTime - totalMaintenanceTime) / totalTime) * 100);
    }

    // Cost calculations
    if (assets.length > 0) {
      performance.costs.averageCostPerAsset =
        Math.round(performance.costs.totalMaintenanceCost / assets.length);
    }

    res.send(performance);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

module.exports = router;
