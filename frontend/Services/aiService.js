// frontend/services/aiService.js
export class AIService {
  constructor() {
    this.baseURL = '/api/ai';
    this.defaultModel = 'grok-3-mini';
    this.models = new Map();
    this.initializeModels();
  }

  initializeModels() {
    // Default Grok model configurations (will be updated from server)
    const grokModels = [
      {
        id: 'grok-3-mini',
        name: 'Grok 3 Mini',
        provider: 'X.AI',
        credits: 1,
        description: 'Fast and efficient for standard maintenance analysis',
        maxTokens: 1000,
        temperature: 0.3,
        tier: 'basic'
      },
      {
        id: 'grok-3',
        name: 'Grok 3',
        provider: 'X.AI',
        credits: 3,
        description: 'Enhanced reasoning for complex maintenance scenarios',
        maxTokens: 1500,
        temperature: 0.3,
        tier: 'standard'
      },
      {
        id: 'grok-4',
        name: 'Grok 4',
        provider: 'X.AI',
        credits: 5,
        description: 'Advanced analysis with deeper insights and recommendations',
        maxTokens: 2000,
        temperature: 0.2,
        tier: 'premium'
      }
    ];

    grokModels.forEach(model => {
      this.models.set(model.id, model);
    });
  }

  /**
   * Get available AI models from server
   */
  async getModels() {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Update local models with server data
        if (data.models) {
          this.models.clear();
          Object.entries(data.models).forEach(([id, config]) => {
            this.models.set(id, {
              id,
              name: config.name,
              provider: 'X.AI',
              credits: config.credits,
              description: config.description,
              maxTokens: config.maxTokens,
              temperature: config.temperature,
              tier: config.credits <= 1 ? 'basic' : config.credits <= 3 ? 'standard' : 'premium'
            });
          });
        }

        return Array.from(this.models.values());
      }
    } catch (error) {
      console.log('Using default models, server unavailable:', error.message);
    }

    // Fallback to local models if server is unavailable
    return Array.from(this.models.values());
  }

  /**
   * Get model configuration by ID
   */
  getModelConfig(modelId) {
    return this.models.get(modelId) || this.models.get(this.defaultModel);
  }

  /**
   * Set the default model for requests
   */
  setDefaultModel(modelId) {
    if (this.models.has(modelId)) {
      this.defaultModel = modelId;
    }
  }

  /**
   * Enhanced chat method using your backend /query endpoint
   */
  async chat(message, context = {}, options = {}) {
    const modelId = options.model || this.defaultModel;

    try {
      const response = await fetch(`${this.baseURL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          query: message,
          model: modelId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        response: result.response,
        model: result.model,
        creditsUsed: result.creditsUsed,
        remainingCredits: result.remainingCredits
      };
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  }

  /**
   * Enhanced insights analysis using your backend /insights endpoint
   */
  async getInsights(analysisType, data, options = {}) {
    const modelId = options.model || this.getRecommendedModel(analysisType);

    try {
      const response = await fetch(`${this.baseURL}/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          query: this.buildAnalysisQuery(analysisType, data),
          analysisType: this.mapAnalysisType(analysisType),
          includeData: true,
          model: modelId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Insights request failed: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        response: result.response,
        structured: result.structured,
        model: result.model,
        creditsUsed: result.creditsUsed,
        remainingCredits: result.remainingCredits,
        analysisMetadata: {
          modelUsed: this.getModelConfig(result.model)?.name,
          analysisType,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('AI insights error:', error);
      throw error;
    }
  }

  /**
   * Map frontend analysis types to backend types
   */
  mapAnalysisType(analysisType) {
    const typeMap = {
      'risk_analysis': 'risk',
      'predictive_maintenance': 'predictive',
      'cost_optimization': 'optimization',
      'performance_insights': 'general'
    };
    return typeMap[analysisType] || 'general';
  }

  /**
   * Build analysis query based on type
   */
  buildAnalysisQuery(analysisType, data) {
    const queries = {
      'risk_analysis': 'Analyze the risk profile of my assets and identify high-priority maintenance needs',
      'predictive_maintenance': 'Predict potential failures and recommend preventive maintenance schedules',
      'cost_optimization': 'Identify cost optimization opportunities in my maintenance operations',
      'performance_insights': 'Provide insights on asset performance trends and optimization opportunities'
    };
    return queries[analysisType] || 'Analyze my maintenance data and provide actionable insights';
  }

  /**
   * Risk analysis using specific backend endpoint
   */
  async analyzeRisk(assets, options = {}) {
    const modelId = options.model || 'grok-3'; // Use standard model for risk analysis

    try {
      const response = await fetch(`${this.baseURL}/risk-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          model: modelId,
          includeData: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Risk analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        response: result.response,
        structured: result.structured,
        model: result.model,
        creditsUsed: result.creditsUsed,
        remainingCredits: result.remainingCredits
      };
    } catch (error) {
      console.error('Risk analysis error:', error);
      throw error;
    }
  }

  /**
   * Predictive analysis using backend endpoint
   */
  async getPredictiveAnalysis(assets, timeframe = '30d', options = {}) {
    const modelId = options.model || 'grok-3'; // Use standard model for predictions

    try {
      const response = await fetch(`${this.baseURL}/predictive-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          model: modelId,
          includeData: true,
          timeframe: timeframe
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Predictive analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        response: result.response,
        structured: result.structured,
        model: result.model,
        creditsUsed: result.creditsUsed,
        remainingCredits: result.remainingCredits
      };
    } catch (error) {
      console.error('Predictive analysis error:', error);
      throw error;
    }
  }

  /**
   * Cost optimization analysis
   */
  async optimizeCosts(data, options = {}) {
    return this.getInsights('cost_optimization', data, {
      ...options,
      model: options.model || 'grok-3-mini' // Use basic model for cost optimization
    });
  }

  /**
   * Get recommended model for specific analysis types
   */
  getRecommendedModel(analysisType) {
    const recommendations = {
      'risk_analysis': 'grok-3',
      'predictive_maintenance': 'grok-3',
      'cost_optimization': 'grok-3-mini',
      'performance_insights': 'grok-3-mini',
      'general_chat': 'grok-3-mini'
    };

    return recommendations[analysisType] || this.defaultModel;
  }

  /**
   * Get user's AI credits
   */
  async getCredits() {
    try {
      const response = await fetch(`${this.baseURL}/credits`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          credits: data.credits,
          models: data.models
        };
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }

    return { credits: 0, models: {} };
  }

  /**
   * Calculate estimated cost in credits for analysis
   */
  calculateCost(modelId) {
    const model = this.getModelConfig(modelId);
    return model?.credits || 1;
  }

  /**
   * Get authentication token
   */
  getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  /**
   * Validate model availability and user permissions
   */
  async validateModelAccess(modelId) {
    try {
      const creditsData = await this.getCredits();
      const model = this.getModelConfig(modelId);

      return creditsData.credits >= (model?.credits || 1);
    } catch (error) {
      console.error('Model validation error:', error);
      return false;
    }
  }

  /**
   * Get usage statistics (placeholder for future implementation)
   */
  async getUsageStats(timeframe = '24h') {
    try {
      const response = await fetch(`${this.baseURL}/usage?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }

    return null;
  }
}

// Create and export singleton instance
const aiService = new AIService();
export default aiService;
