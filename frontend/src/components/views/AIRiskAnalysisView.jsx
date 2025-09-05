// frontend/src/components/views/AIRiskAnalysisView.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, TrendingDown, Clock, Loader2, RefreshCw, Target, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import aiService from '../../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';

function AIRiskAnalysisView({ assets = [] }) {
  const { user } = useAuth();
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRunComplete, setAutoRunComplete] = useState(false);

  // Risk levels with colors
  const riskLevels = {
    high: { color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50', label: 'High Risk' },
    medium: { color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50', label: 'Medium Risk' },
    low: { color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50', label: 'Low Risk' }
  };

  // Predefined risk analysis types
  const riskAnalysisTypes = [
    {
      id: 'overall',
      title: 'Overall Risk Assessment',
      description: 'Comprehensive risk analysis of all assets',
      icon: AlertTriangle,
      query: 'Provide a comprehensive risk assessment of my maintenance portfolio. Identify high-priority assets that need immediate attention and rank them by risk level.'
    },
    {
      id: 'financial',
      title: 'Financial Risk Analysis',
      description: 'Cost impact and financial risk assessment',
      icon: DollarSign,
      query: 'Analyze the financial risks in my maintenance portfolio. What are the potential costs of failures and which assets pose the highest financial risk?'
    },
    {
      id: 'safety',
      title: 'Safety Risk Assessment',
      description: 'Safety-critical asset risk evaluation',
      icon: Shield,
      query: 'Identify safety-critical assets and assess safety risks. Which equipment poses the highest safety risk if it fails?'
    },
    {
      id: 'operational',
      title: 'Operational Risk Analysis',
      description: 'Impact on operations and productivity',
      icon: Target,
      query: 'Analyze operational risks and the impact on productivity. Which asset failures would most disrupt operations?'
    }
  ];

  // Auto-run overall risk analysis on component mount
  useEffect(() => {
    if (!autoRunComplete && assets.length > 0) {
      runRiskAnalysis(riskAnalysisTypes[0].query, 'overall');
      setAutoRunComplete(true);
    }
  }, [assets, autoRunComplete]);

  // Run risk analysis
  const runRiskAnalysis = async (query, analysisId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiService.getRiskAnalysis(query);
      setRiskAnalysis({
        ...response,
        analysisId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting risk analysis:', error);
      setError(error.message || 'Failed to get risk analysis');
    } finally {
      setLoading(false);
    }
  };

  // Handle analysis type selection
  const handleAnalysisType = (analysisType) => {
    runRiskAnalysis(analysisType.query, analysisType.id);
  };

  // Mock risk metrics for display (in real app, this would come from AI analysis)
  const mockRiskMetrics = {
    highRisk: assets.filter(a => a.status === 'needs_attention' || a.status === 'critical').length,
    mediumRisk: assets.filter(a => a.status === 'maintenance').length,
    lowRisk: assets.filter(a => a.status === 'operational').length,
    totalAssets: assets.length
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h1 className="text-2xl font-bold">AI Risk Analysis</h1>
            <p className="text-gray-600">Intelligent risk assessment for your maintenance portfolio</p>
          </div>
        </div>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          Credits: {user?.aiCredits || user?.credits || 100}
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{mockRiskMetrics.highRisk}</p>
              </div>
              <div className="w-3 h-8 bg-red-500 rounded"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{mockRiskMetrics.mediumRisk}</p>
              </div>
              <div className="w-3 h-8 bg-yellow-500 rounded"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">{mockRiskMetrics.lowRisk}</p>
              </div>
              <div className="w-3 h-8 bg-green-500 rounded"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-blue-600">{mockRiskMetrics.totalAssets}</p>
              </div>
              <div className="w-3 h-8 bg-blue-500 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {riskAnalysisTypes.map((analysisType) => {
              const IconComponent = analysisType.icon;
              const isActive = riskAnalysis?.analysisId === analysisType.id;

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
              <AlertTriangle className="h-4 w-4" />
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
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-red-600" />
                <p className="text-gray-600">Analyzing risk factors...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Analysis Results */}
      {riskAnalysis && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Analysis Results
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {riskAnalysisTypes.find(t => t.id === riskAnalysis.analysisId)?.title || 'Analysis'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runRiskAnalysis(
                    riskAnalysisTypes.find(t => t.id === riskAnalysis.analysisId)?.query ||
                    'Refresh risk analysis',
                    riskAnalysis.analysisId
                  )}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Risk Assessment */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risk Assessment Summary
              </h3>
              <div className="text-sm text-red-700 whitespace-pre-wrap">
                {riskAnalysis.response}
              </div>
            </div>

            {/* Structured Recommendations */}
            {riskAnalysis.structured?.recommendations && riskAnalysis.structured.recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Priority Actions
                </h3>
                <div className="space-y-3">
                  {riskAnalysis.structured.recommendations.map((rec, index) => {
                    const priority = index === 0 ? 'high' : index < 3 ? 'medium' : 'low';
                    const riskLevel = riskLevels[priority];

                    return (
                      <div key={index} className={`flex items-start gap-3 p-4 rounded-lg border ${riskLevel.bgColor}`}>
                        <div className={`w-8 h-8 rounded-full ${riskLevel.color} text-white text-sm flex items-center justify-center flex-shrink-0`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <div className={`text-sm font-medium ${riskLevel.textColor}`}>
                              Priority {index + 1}
                            </div>
                            <Badge variant="outline" className={`text-xs ${riskLevel.textColor}`}>
                              {riskLevel.label}
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
              <span>Analysis Type: {riskAnalysis.analysisType}</span>
              <span>Generated: {formatTime(riskAnalysis.timestamp)}</span>
              <span>Data Included: {riskAnalysis.dataIncluded ? 'Yes' : 'No'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Mitigation Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Mitigation Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Preventive Measures</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Regular condition monitoring</li>
                <li>• Scheduled preventive maintenance</li>
                <li>• Operator training and procedures</li>
                <li>• Environmental controls</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Risk Monitoring</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time performance tracking</li>
                <li>• Trend analysis and alerts</li>
                <li>• Failure mode identification</li>
                <li>• Regular risk assessments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIRiskAnalysisView;
