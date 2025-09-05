// frontend/src/components/views/AIPredictiveView.jsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Zap, Clock, Loader2, RefreshCw, Activity, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import aiService from '../../../Services/aiService';
import { useAuth } from '../../contexts/AuthContext';

function AIPredictiveView({ assets = [] }) {
  const { user } = useAuth();
  const [predictiveAnalysis, setPredictiveAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRunComplete, setAutoRunComplete] = useState(false);

  // Prediction timeframes
  const timeFrames = [
    {
      id: '7days',
      title: '7 Days',
      description: 'Immediate attention needed',
      query: 'What maintenance issues or potential failures should I expect in the next 7 days? What immediate actions should I take?'
    },
    {
      id: '30days',
      title: '30 Days',
      description: 'Short-term planning',
      query: 'Predict potential failures and maintenance needs for the next 30 days. What should I plan for?'
    },
    {
      id: '90days',
      title: '90 Days',
      description: 'Quarterly planning',
      query: 'What maintenance activities and potential issues should I expect in the next 90 days? Help me plan quarterly maintenance.'
    },
    {
      id: '1year',
      title: '1 Year',
      description: 'Annual planning',
      query: 'Provide a 1-year predictive maintenance outlook. What major maintenance activities and replacements should I budget for?'
    }
  ];

  // Analysis types
  const analysisTypes = [
    {
      id: 'failures',
      title: 'Failure Prediction',
      description: 'Predict when assets are likely to fail',
      icon: Zap,
      query: 'Analyze failure patterns and predict which assets are most likely to fail soon. Provide timelines and confidence levels.'
    },
    {
      id: 'maintenance',
      title: 'Maintenance Scheduling',
      description: 'Optimize maintenance schedules',
      icon: Calendar,
      query: 'Optimize my maintenance schedules based on asset condition and usage patterns. When should each asset receive maintenance?'
    },
    {
      id: 'performance',
      title: 'Performance Trends',
      description: 'Analyze performance degradation',
      icon: Activity,
      query: 'Analyze performance trends and predict when assets will need attention based on declining performance metrics.'
    },
    {
      id: 'lifecycle',
      title: 'Lifecycle Planning',
      description: 'Plan asset replacements',
      icon: Wrench,
      query: 'Analyze asset lifecycles and predict optimal replacement timing. Help me plan for end-of-life replacements.'
    }
  ];

  // Auto-run 30-day prediction on component mount
  useEffect(() => {
    if (!autoRunComplete && assets.length > 0) {
      runPredictiveAnalysis(timeFrames[1].query, '30days');
      setAutoRunComplete(true);
    }
  }, [assets, autoRunComplete]);

  // Run predictive analysis
  const runPredictiveAnalysis = async (query, analysisId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiService.getPredictiveAnalysis(query);
      setPredictiveAnalysis({
        ...response,
        analysisId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting predictive analysis:', error);
      setError(error.message || 'Failed to get predictive analysis');
    } finally {
      setLoading(false);
    }
  };

  // Handle timeframe selection
  const handleTimeFrame = (timeFrame) => {
    runPredictiveAnalysis(timeFrame.query, timeFrame.id);
  };

  // Handle analysis type selection
  const handleAnalysisType = (analysisType) => {
    runPredictiveAnalysis(analysisType.query, analysisType.id);
  };

  // Mock predictive metrics (in real app, this would come from AI analysis)
  const mockMetrics = {
    assetsAtRisk: Math.ceil(assets.length * 0.15),
    upcomingMaintenance: Math.ceil(assets.length * 0.25),
    optimalPerformance: Math.ceil(assets.length * 0.6),
    reliabilityScore: 85
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">AI Predictive Analysis</h1>
            <p className="text-gray-600">Predict failures and optimize maintenance schedules</p>
          </div>
        </div>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          Credits: {user?.aiCredits || user?.credits || 100}
        </div>
      </div>

      {/* Predictive Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assets at Risk</p>
                <p className="text-2xl font-bold text-red-600">{mockMetrics.assetsAtRisk}</p>
                <p className="text-xs text-gray-500">Next 30 days</p>
              </div>
              <Zap className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{mockMetrics.upcomingMaintenance}</p>
                <p className="text-xs text-gray-500">Scheduled soon</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Optimal Performance</p>
                <p className="text-2xl font-bold text-green-600">{mockMetrics.optimalPerformance}</p>
                <p className="text-xs text-gray-500">Running well</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reliability Score</p>
                <p className="text-2xl font-bold text-blue-600">{mockMetrics.reliabilityScore}%</p>
                <Progress value={mockMetrics.reliabilityScore} className="mt-2" />
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Frame Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Prediction Timeframe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {timeFrames.map((timeFrame) => {
              const isActive = predictiveAnalysis?.analysisId === timeFrame.id;

              return (
                <Button
                  key={timeFrame.id}
                  variant={isActive ? "default" : "outline"}
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => handleTimeFrame(timeFrame)}
                  disabled={loading}
                >
                  <div className="flex flex-col items-start gap-1 w-full">
                    <span className="font-semibold">{timeFrame.title}</span>
                    <span className="text-xs opacity-80">{timeFrame.description}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analysisTypes.map((analysisType) => {
              const IconComponent = analysisType.icon;
              const isActive = predictiveAnalysis?.analysisId === analysisType.id;

              return (
                <Button
                  key={analysisType.id}
                  variant={isActive ? "default" : "outline"}
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => handleAnalysisType(analysisType)}
                  disabled={loading}
                >
                  <div className="flex flex-col items-start gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      <span className="font-semibold text-sm">{analysisType.title}</span>
                    </div>
                    <p className="text-xs opacity-80 text-left">
                      {analysisType.description}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <TrendingUp className="h-4 w-4" />
              <span>{error}</span>
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
                <p className="text-gray-600">Analyzing patterns and predicting outcomes...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictive Analysis Results */}
      {predictiveAnalysis && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Predictive Analysis Results
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {timeFrames.find(t => t.id === predictiveAnalysis.analysisId)?.title ||
                   analysisTypes.find(t => t.id === predictiveAnalysis.analysisId)?.title ||
                   'Analysis'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentQuery =
                      timeFrames.find(t => t.id === predictiveAnalysis.analysisId)?.query ||
                      analysisTypes.find(t => t.id === predictiveAnalysis.analysisId)?.query ||
                      'Refresh predictive analysis';
                    runPredictiveAnalysis(currentQuery, predictiveAnalysis.analysisId);
                  }}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Prediction */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Predictive Analysis
              </h3>
              <div className="text-sm text-blue-700 whitespace-pre-wrap">
                {predictiveAnalysis.response}
              </div>
            </div>

            {/* Structured Predictions */}
            {predictiveAnalysis.structured?.recommendations && predictiveAnalysis.structured.recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Recommended Actions
                </h3>
                <div className="space-y-3">
                  {predictiveAnalysis.structured.recommendations.map((rec, index) => {
                    const urgency = index === 0 ? 'urgent' : index < 3 ? 'medium' : 'low';
                    const urgencyColors = {
                      urgent: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
                      medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
                      low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' }
                    };
                    const colors = urgencyColors[urgency];

                    return (
                      <div key={index} className={`flex items-start gap-3 p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                        <div className={`w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center flex-shrink-0`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <div className={`text-sm font-medium ${colors.text}`}>
                              Action {index + 1}
                            </div>
                            <Badge className={`text-xs ${colors.badge}`}>
                              {urgency === 'urgent' ? 'Urgent' : urgency === 'medium' ? 'Medium Priority' : 'Low Priority'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-700">{rec}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Analysis Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
              <span>Analysis Type: {predictiveAnalysis.analysisType}</span>
              <span>Generated: {formatTime(predictiveAnalysis.timestamp)}</span>
              <span>Data Included: {predictiveAnalysis.dataIncluded ? 'Yes' : 'No'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictive Maintenance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Predictive Maintenance Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Data Collection</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Continuous condition monitoring</li>
                <li>• Historical performance tracking</li>
                <li>• Environmental factor logging</li>
                <li>• Maintenance history records</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Optimization Strategies</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Condition-based scheduling</li>
                <li>• Predictive model refinement</li>
                <li>• Resource planning optimization</li>
                <li>• Performance benchmarking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIPredictiveView;
