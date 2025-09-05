const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Asset = require('../models/asset');
const axios = require('axios');
const router = express.Router();

module.exports = () => {
  // Enhanced AI insights endpoint
  router.post(
    '/insights',
    [
      body('query').trim().notEmpty().withMessage('Query is required'),
      body('includeData').optional().isBoolean().withMessage('includeData must be boolean'),
      body('analysisType').optional().isIn(['predictive', 'risk', 'optimization', 'general']).withMessage('Invalid analysis type')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { query, includeData = true, analysisType = 'general' } = req.body;

        const user = await User.findOne({ id: req.auth.userId });
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        if (user.subscriptionTier !== 'ai-powered') {
          return res.status(403).json({ error: 'AI-Powered plan required' });
        }

        let contextData = '';

        if (includeData) {
          // Fetch user's maintenance data
          const assets = await Asset.find({ userId: req.auth.userId }).lean();

          // Prepare structured data for AI analysis
          const dataContext = prepareDataContext(assets, analysisType);
          contextData = dataContext;
        }

        // Enhanced prompt with context
        const enhancedPrompt = buildAnalysisPrompt(query, contextData, analysisType);

        console.log('Sending enhanced request to Grok API');

        const response = await axios.post(
          'https://api.x.ai/v1/chat/completions',
          {
            model: 'grok-4',
            messages: [
              {
                role: 'system',
                content: 'You are a maintenance and reliability expert AI assistant. Analyze maintenance data and provide actionable insights based on industry best practices. Focus on practical recommendations, risk identification, and optimization opportunities.'
              },
              {
                role: 'user',
                content: enhancedPrompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.3 // Lower temperature for more focused analysis
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.XAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const aiResponse = response.data.choices[0].message.content;

        // Parse and structure the response
        const structuredResponse = parseAIResponse(aiResponse, analysisType);

        res.json({
          response: aiResponse,
          structured: structuredResponse,
          analysisType,
          dataIncluded: includeData
        });

      } catch (error) {
        console.error('Error in AI insights:', {
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data
          } : null
        });
        res.status(500).json({ error: 'Server error' });
      }
    }
  );

  // Specific analysis endpoints
  router.post('/risk-analysis', async (req, res) => {
    // Delegate to insights with risk analysis type
    req.body.analysisType = 'risk';
    req.body.query = req.body.query || 'Analyze the risk profile of my assets and identify high-priority maintenance needs';
    return router.handle(req, res);
  });

  router.post('/predictive-analysis', async (req, res) => {
    req.body.analysisType = 'predictive';
    req.body.query = req.body.query || 'Predict potential failures and recommend preventive maintenance schedules';
    return router.handle(req, res);
  });

  // Keep original query endpoint for backwards compatibility
  router.post(
    '/query',
    [
      body('query').trim().notEmpty().withMessage('Query is required')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }

        const { query } = req.body;
        const user = await User.findOne({ id: req.auth.userId });

        if (!user) {
          return res.status(404).send({ error: 'User not found' });
        }

        if (user.subscriptionTier !== 'ai-powered') {
          return res.status(403).send({ error: 'AI-Powered plan required' });
        }

        const response = await axios.post(
          'https://api.x.ai/v1/chat/completions',
          {
            model: 'grok-4',
            messages: [{ role: 'user', content: query }],
            max_tokens: 500
          },
          { headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}` } }
        );

        res.send({ response: response.data.choices[0].message.content });
      } catch (error) {
        console.error('Error querying Grok:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  return router;
};

// Helper function to prepare data context for AI analysis
function prepareDataContext(assets, analysisType) {
  const summary = {
    totalAssets: assets.length,
    assetTypes: {},
    maintenanceStats: {
      totalTasks: 0,
      overdueTasks: 0,
      completedTasks: 0
    },
    riskMetrics: {
      highRiskFMEA: 0,
      totalFailures: 0,
      avgCostPerFailure: 0
    }
  };

  let totalFailureCost = 0;
  let failureCount = 0;

  assets.forEach(asset => {
    // Asset type distribution
    summary.assetTypes[asset.type] = (summary.assetTypes[asset.type] || 0) + 1;

    // Maintenance task analysis
    if (asset.maintenanceTasks) {
      summary.maintenanceStats.totalTasks += asset.maintenanceTasks.length;
      asset.maintenanceTasks.forEach(task => {
        if (task.status === 'overdue') summary.maintenanceStats.overdueTasks++;
        if (task.status === 'completed') summary.maintenanceStats.completedTasks++;
      });
    }

    // FMEA risk analysis
    if (asset.fmea) {
      asset.fmea.forEach(fmea => {
        if (fmea.rpn >= 150) summary.riskMetrics.highRiskFMEA++;
      });
    }

    // RCA cost analysis
    if (asset.rca) {
      asset.rca.forEach(rca => {
        failureCount++;
        totalFailureCost += (rca.cost || rca.costImpact || 0);
      });
    }
  });

  if (failureCount > 0) {
    summary.riskMetrics.totalFailures = failureCount;
    summary.riskMetrics.avgCostPerFailure = totalFailureCost / failureCount;
  }

  // Format context based on analysis type
  if (analysisType === 'risk') {
    return `Risk Analysis Data:
- Total Assets: ${summary.totalAssets}
- High-Risk FMEA Items: ${summary.riskMetrics.highRiskFMEA}
- Total Failures: ${summary.riskMetrics.totalFailures}
- Average Cost per Failure: $${summary.riskMetrics.avgCostPerFailure.toFixed(2)}
- Overdue Tasks: ${summary.maintenanceStats.overdueTasks}`;
  }

  if (analysisType === 'predictive') {
    return `Predictive Maintenance Data:
- Asset Portfolio: ${JSON.stringify(summary.assetTypes)}
- Maintenance Performance: ${summary.maintenanceStats.completedTasks}/${summary.maintenanceStats.totalTasks} tasks completed
- Failure History: ${summary.riskMetrics.totalFailures} incidents
- Asset Ages and Operating Hours: ${assets.map(a => `${a.type}: ${a.operatingHours || 'N/A'} hours`).join(', ')}`;
  }

  // General analysis format
  return `Maintenance Data Summary:
Assets: ${summary.totalAssets} total (${Object.entries(summary.assetTypes).map(([type, count]) => `${count} ${type}`).join(', ')})
Maintenance: ${summary.maintenanceStats.completedTasks}/${summary.maintenanceStats.totalTasks} tasks completed, ${summary.maintenanceStats.overdueTasks} overdue
Risk Profile: ${summary.riskMetrics.highRiskFMEA} high-risk items, ${summary.riskMetrics.totalFailures} historical failures
Financial Impact: $${totalFailureCost.toFixed(2)} total failure costs`;
}

// Helper function to build analysis prompts
function buildAnalysisPrompt(userQuery, dataContext, analysisType) {
  const basePrompt = `Based on the following maintenance data, please ${userQuery}

Data Context:
${dataContext}

Please provide:`;

  switch (analysisType) {
    case 'risk':
      return `${basePrompt}
1. Risk assessment of current asset portfolio
2. Prioritized list of assets/components requiring immediate attention
3. Recommended risk mitigation strategies
4. Cost-benefit analysis of preventive vs reactive maintenance`;

    case 'predictive':
      return `${basePrompt}
1. Failure prediction analysis based on historical data
2. Optimal maintenance scheduling recommendations
3. Asset lifecycle insights and replacement planning
4. Performance optimization opportunities`;

    case 'optimization':
      return `${basePrompt}
1. Efficiency improvements in current maintenance processes
2. Resource allocation recommendations
3. Cost reduction opportunities
4. Performance benchmarking insights`;

    default:
      return `${basePrompt}
1. Key insights and trends from the data
2. Actionable recommendations
3. Areas of concern or opportunity
4. Next steps for improvement`;
  }
}

// Helper function to parse and structure AI responses
function parseAIResponse(response, analysisType) {
  // Basic parsing - you could enhance this with more sophisticated NLP
  const sections = response.split(/\d+\./);

  return {
    summary: sections[0]?.trim() || '',
    recommendations: sections.slice(1).map(section => section.trim()).filter(s => s.length > 0),
    type: analysisType,
    timestamp: new Date().toISOString()
  };
}
