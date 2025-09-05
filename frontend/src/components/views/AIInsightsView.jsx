// frontend/src/components/views/AIInsightsView.jsx
import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, DollarSign, Loader2, RefreshCw, Lightbulb, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import aiService from '../../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';

function AIInsightsView({ assets = [] }) {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customQuery, setCustomQuery] = useState('');
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  // Quick action buttons
  const quickActions = [
    {
      id: 'risk',
      title: 'Risk Assessment',
      description: 'Identify high-priority maintenance needs',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      query: 'Provide a quick risk assessment of my maintenance portfolio. What needs immediate attention?'
    },
    {
      id: 'predictive',
      title: 'Predictive Analysis',
      description: 'Predict potential failures in next 30 days',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      query: 'What failures are likely in the next 30 days? What preventive actions should I take?'
    },
    {
      id: 'optimization',
      title: 'Cost Optimization',
      description: 'Find ways to reduce maintenance costs',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      query: 'How can I reduce maintenance costs while maintaining reliability?'
    }
  ];

  // Get AI insights
  const getInsights = async (query, analysisType = 'general') => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await aiService.getInsights({
        query: query.trim(),
        analysisType,
        includeData: true
      });

      setInsights(response);

      // Add to recent analyses
      const newAnalysis = {
        id: Date.now(),
        query: query.trim(),
        type: analysisType,
        timestamp: new Date(),
        summary: response.structured?.summary || response.response.substring(0, 100) + '...'
      };

      setRecentAnalyses(prev => [newAnalysis, ...prev.slice(0, 4)]);

    } catch (error) {
      console.error('Error getting AI insights:', error);
      setError(error.message || 'Failed to get AI insights');
    } finally {
      setLoading(false);
    }
  };

  // Handle quick action
  const handleQuickAction = (action) => {
    getInsights(action.query, action.id);
  };

  // Handle custom query
  const handleCustomQuery = () => {
    getInsights(customQuery, 'general');
    setCustomQuery('');
  };

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomQuery();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">AI Insights</h1>
            <p className="text-gray-600">Get intelligent analysis of your maintenance data</p>
          </div>
        </div>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          Credits: {user?.aiCredits || user?.credits || 100}
        </div>
      </div>

      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Data Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{assets.length}</div>
              <div className="text-sm text-gray-600">Total Assets</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {assets.filter(a => a.status === 'operational').length}
              </div>
              <div className="text-sm text-gray-600">Operational</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {assets.filter(a => a.status === 'maintenance' || a.status === 'needs_attention').length}
              </div>
              <div className="text-sm text-gray-600">Need Attention</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Quick Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => handleQuickAction(action)}
                  disabled={loading}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <IconComponent className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div>
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Query */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a specific question about your maintenance data..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleCustomQuery}
              disabled={loading || !customQuery.trim()}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Analyze'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights Results */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Response */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Analysis</h3>
              <div className="text-sm text-blue-700 whitespace-pre-wrap">
                {insights.response}
              </div>
            </div>

            {/* Structured Recommendations */}
            {insights.structured?.recommendations && insights.structured.recommendations.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">Key Recommendations</h3>
                <div className="space-y-2">
                  {insights.structured.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 bg-gray-50 rounded p-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="text-sm text-gray-700">{rec}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
              <span>Analysis Type: {insights.analysisType}</span>
              <span>Data Included: {insights.dataIncluded ? 'Yes' : 'No'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Analyses */}
      {recentAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Recent Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => getInsights(analysis.query, analysis.type)}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">
                      {analysis.query}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {analysis.summary}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 ml-4">
                    {formatTime(analysis.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-600" />
                <p className="text-gray-600">Analyzing your maintenance data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AIInsightsView;
