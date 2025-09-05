// frontend/services/aiService.js

export class AIService {
  constructor() {
    this.baseURL = '/api/ai';
  }

  /**
   * Get AI insights with structured analysis
   */
  async getInsights(request) {
    try {
      console.log('Making AI insights request:', request);
      console.log('Token:', localStorage.getItem('token'));

      const response = await fetch(`${this.baseURL}/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(request)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);

        // Handle specific errors
        if (response.status === 404 && errorData.error === 'User not found') {
          throw new Error('Authentication issue - please try logging in again');
        }

        if (response.status === 403) {
          throw new Error('AI features require an upgraded subscription plan');
        }

        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI response:', data);
      return data;

    } catch (error) {
      console.error('Error getting AI insights:', error);

      // Return a mock response for testing if API fails
      if (error.message.includes('Authentication issue') || error.message.includes('User not found')) {
        console.log('Returning mock response for testing...');
        return {
          response: `Mock AI Analysis for testing:\n\nBased on your ${request.query}, here are some insights:\n\n1. Your maintenance data shows typical patterns\n2. Consider implementing predictive maintenance strategies\n3. Regular inspections can reduce unexpected failures\n\nThis is a mock response while we debug the authentication issue.`,
          structured: {
            summary: 'Mock analysis summary',
            recommendations: [
              'Review maintenance schedules',
              'Implement condition monitoring',
              'Update asset tracking systems'
            ],
            type: request.analysisType || 'general',
            timestamp: new Date().toISOString()
          },
          analysisType: request.analysisType || 'general',
          dataIncluded: request.includeData || false
        };
      }

      throw error;
    }
  }

  /**
   * Get risk analysis specifically
   */
  async getRiskAnalysis(query) {
    return this.getInsights({
      query: query || 'Analyze the risk profile of my assets and identify high-priority maintenance needs',
      analysisType: 'risk',
      includeData: true
    });
  }

  /**
   * Get predictive analysis specifically
   */
  async getPredictiveAnalysis(query) {
    return this.getInsights({
      query: query || 'Predict potential failures and recommend preventive maintenance schedules',
      analysisType: 'predictive',
      includeData: true
    });
  }

  /**
   * Chat with AI (backwards compatibility)
   */
  async chat(query) {
    try {
      console.log('Making AI chat request:', query);

      const response = await fetch(`${this.baseURL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Chat API Error:', errorData);

        // Return mock response for testing
        if (response.status === 404 || response.status === 403) {
          return {
            response: `Mock AI Assistant Response:\n\nRegarding "${query}":\n\nI understand you're asking about maintenance operations. While I work on connecting to the AI service, here are some general recommendations:\n\n• Regular preventive maintenance reduces unexpected failures\n• Keep detailed maintenance logs for better insights\n• Monitor asset performance trends\n• Consider predictive maintenance technologies\n\nThis is a temporary mock response while we resolve the connection issue.`
          };
        }

        throw new Error(errorData.error || 'Failed to get AI response');
      }

      return await response.json();

    } catch (error) {
      console.error('Error in AI chat:', error);

      // Return mock response if API fails
      return {
        response: `I'm currently experiencing connection issues with the AI service. This is a mock response for testing purposes.\n\nYour question: "${query}"\n\nGeneral maintenance guidance:\n• Focus on preventive maintenance\n• Monitor critical asset performance\n• Keep maintenance records updated\n• Plan for upcoming maintenance needs\n\nPlease check the browser console for technical details about the connection issue.`
      };
    }
  }

  /**
   * Quick analysis presets
   */
  async getQuickRiskAssessment() {
    return this.getInsights({
      query: 'Provide a quick risk assessment of my maintenance portfolio. What needs immediate attention?',
      analysisType: 'risk',
      includeData: true
    });
  }

  async getQuickPredictiveInsights() {
    return this.getInsights({
      query: 'What failures are likely in the next 30 days? What preventive actions should I take?',
      analysisType: 'predictive',
      includeData: true
    });
  }

  async getQuickCostOptimization() {
    return this.getInsights({
      query: 'How can I reduce maintenance costs while maintaining reliability?',
      analysisType: 'optimization',
      includeData: true
    });
  }

  /**
   * Check if user has AI access
   */
  async checkAIAccess() {
    try {
      const response = await fetch(`${this.baseURL}/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          query: 'Test access',
          includeData: false
        })
      });

      return response.status !== 403;
    } catch (error) {
      return false;
    }
  }
}

export const aiService = new AIService();
export default aiService;
