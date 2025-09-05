const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Asset = require('../models/asset');
const axios = require('axios');
const router = express.Router();

// Model configuration with credit costs and capabilities
const GROK_MODELS = {
  'grok-3-mini': {
    name: 'grok-3-mini',
    credits: 1,
    description: 'Fast and efficient for standard maintenance analysis',
    maxTokens: 1000,
    temperature: 0.3
  },
  'grok-3': {
    name: 'grok-3',
    credits: 3,
    description: 'Enhanced reasoning for complex maintenance scenarios',
    maxTokens: 1500,
    temperature: 0.3
  },
  'grok-4': {
    name: 'grok-4',
    credits: 5,
    description: 'Advanced analysis with deeper insights and recommendations',
    maxTokens: 2000,
    temperature: 0.2
  }
};

const DEFAULT_MODEL = 'grok-3-mini';

module.exports = () => {
  // Get available models endpoint
  router.get('/models', (req, res) => {
    res.json({
      models: GROK_MODELS,
      default: DEFAULT_MODEL
    });
  });

  // Enhanced AI insights endpoint
  router.post(
    '/insights',
    [
      body('query').trim().notEmpty().withMessage('Query is required'),
      body('includeData').optional().isBoolean().withMessage('includeData must be boolean'),
      body('analysisType').optional().isIn(['predictive', 'risk', 'optimization', 'general']).withMessage('Invalid analysis type'),
      body('model').optional().isIn(Object.keys(GROK_MODELS)).withMessage('Invalid model selection')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const {
          query,
          includeData = true,
          analysisType = 'general',
          model = DEFAULT_MODEL
        } = req.body;

        const user = await User.findOne({ _id: req.auth.userId });
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Check if user has enough credits
        const modelConfig = GROK_MODELS[model];
        const requiredCredits = modelConfig.credits;

        if ((user.aiCredits || 0) < requiredCredits) {
          return res.status(402).json({
            error: 'Insufficient credits',
            required: requiredCredits,
            available: user.aiCredits || 0,
            model: model
          });
        }

        let contextData = '';
        if (includeData) {
          const assets = await Asset.find({ userId: req.auth.userId }).lean();
          const dataContext = prepareDataContext(assets, analysisType);
          contextData = dataContext;
        }

        const enhancedPrompt = buildAnalysisPrompt(query, contextData, analysisType);

        console.log(`Sending request to Grok API using model: ${model} (${requiredCredits} credits)`);
        const response = await axios.post(
          'https://api.x.ai/v1/chat/completions',
          {
            model: modelConfig.name,
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
            max_tokens: modelConfig.maxTokens,
            temperature: modelConfig.temperature
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.XAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const aiResponse = response.data.choices[0].message.content;

        // Deduct credits from user account
        await User.findByIdAndUpdate(
          req.auth.userId,
          { $inc: { aiCredits: -requiredCredits } },
          { new: true }
        );

        const structuredResponse = parseAIResponse(aiResponse, analysisType);

        res.json({
          response: aiResponse,
          structured: structuredResponse,
          analysisType,
          dataIncluded: includeData,
          model: model,
          creditsUsed: requiredCredits,
          remainingCredits: (user.aiCredits || 0) - requiredCredits
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

  // Specific analysis endpoints with model selection
  router.post('/risk-analysis', async (req, res) => {
    req.body.analysisType = 'risk';
    req.body.query = req.body.query || 'Analyze the risk profile of my assets and identify high-priority maintenance needs';
    // Forward the request to the insights endpoint
    return await handleInsightsRequest(req, res);
  });

  router.post('/predictive-analysis', async (req, res) => {
    req.body.analysisType = 'predictive';
    req.body.query = req.body.query || 'Predict potential failures and recommend preventive maintenance schedules';
    return await handleInsightsRequest(req, res);
  });

  // Helper function to handle insights requests from specific endpoints
  async function handleInsightsRequest(req, res) {
    const insightsHandler = router.stack.find(layer =>
      layer.route && layer.route.path === '/insights' && layer.route.methods.post
    );
    if (insightsHandler) {
      return await insightsHandler.route.stack[1].handle(req, res);
    }
    return res.status(500).json({ error: 'Handler not found' });
  }

  // Keep original query endpoint for backwards compatibility
  router.post(
    '/query',
    [
      body('query').trim().notEmpty().withMessage('Query is required'),
      body('model').optional().isIn(Object.keys(GROK_MODELS)).withMessage('Invalid model selection')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }

        const { query, model = DEFAULT_MODEL } = req.body;
        const user = await User.findOne({ _id: req.auth.userId });

        if (!user) {
          return res.status(404).send({ error: 'User not found' });
        }

        const modelConfig = GROK_MODELS[model];
        const requiredCredits = modelConfig.credits;

        if ((user.aiCredits || 0) < requiredCredits) {
          return res.status(402).json({
            error: 'Insufficient credits',
            required: requiredCredits,
            available: user.aiCredits || 0,
            model: model
          });
        }

        const response = await axios.post(
          'https://api.x.ai/v1/chat/completions',
          {
            model: modelConfig.name,
            messages: [{ role: 'user', content: query }],
            max_tokens: modelConfig.maxTokens
          },
          { headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}` } }
        );

        // Deduct credits
        await User.findByIdAndUpdate(
          req.auth.userId,
          { $inc: { aiCredits: -requiredCredits } },
          { new: true }
        );

        res.send({
          response: response.data.choices[0].message.content,
          model: model,
          creditsUsed: requiredCredits,
          remainingCredits: (user.aiCredits || 0) - requiredCredits
        });

      } catch (error) {
        console.error('Error querying Grok:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  // User credits endpoint
  router.get('/credits', async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.auth.userId });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        credits: user.aiCredits || 0,
        models: GROK_MODELS
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Temporary debug route
  router.get('/debug-user', async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.auth.userId });
      console.log('User found:', user);
      res.json({
        userId: req.auth.userId,
        user: user,
        subscriptionTier: user?.subscriptionTier,
        aiCredits: user?.aiCredits || 0
      });
    } catch (error) {
      res.json({ error: error.message });
    }
  });

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
