import React, { useState, useEffect } from 'react';
import { AlertTriangle, Brain, Settings, Shield, TrendingDown, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import AIModelSelector from '../ui/AIModelSelector';
import aiService from '../../../services/aiService';

const AIRiskAnalysisView = ({ assets = [] }) => {
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo'); // Default to premium for risk analysis
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);

  const runRiskAnalysis = async () => {
    setLoading(true);
    try {
      const result = await aiService.analyzeRisk(assets, {
        model: selectedModel,
        includeDetailedBreakdown: true,
        riskTimeframes: ['immediate', '30d', '90d', '1y']
      });

      setRiskAnalysis(result);
      setLastAnalysis(new Date());
    } catch (error) {
      console.error('Risk analysis error:', error);
      setRiskAnalysis({
        error: 'Failed to perform risk analysis. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assets.length > 0) {
      runRiskAnalysis();
    }
  }, [assets.length]);

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskScore = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 90;
      case 'high': return 70;
      case 'medium': return 50;
      case 'low': return 25;
      default: return 0;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-2xl font-bold">AI Risk Analysis</h1>
            <p className="text-gray-600">
              Intelligent assessment of maintenance risks across your assets
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowModelSelector(!showModelSelector)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Model Settings
          </Button>

          <Button
            onClick={runRiskAnalysis}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Analyze Risks
          </Button>
        </div>
      </div>

      {/* Model Selector */}
      {showModelSelector && (
        <AIModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          showDetails={true}
        />
      )}

      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Analyzing Risk Factors...</h3>
            <p className="text-gray-600">AI is evaluating your assets for potential risks</p>
          </CardContent>
        </Card>
      )}

      {riskAnalysis && !loading && (
        <div className="space-y-6">
          {riskAnalysis.error ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-red-600">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                  <p>{riskAnalysis.error}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Risk Summary */}
              {riskAnalysis.structured?.riskSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Risk Overview</span>
                      {lastAnalysis && (
                        <Badge variant="outline">
                          Last updated: {lastAnalysis.toLocaleTimeString()}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{riskAnalysis.structured.riskSummary}</p>

                    {riskAnalysis.structured.overallRiskLevel && (
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">Overall Risk Level:</span>
                        <Badge className={getRiskColor(riskAnalysis.structured.overallRiskLevel)}>
                          {riskAnalysis.structured.overallRiskLevel}
                        </Badge>
                        <Progress
                          value={getRiskScore(riskAnalysis.structured.overallRiskLevel)}
                          className="w-32"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* High Priority Risks */}
              {riskAnalysis.structured?.highPriorityRisks && riskAnalysis.structured.highPriorityRisks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      <span>High Priority Risks</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {riskAnalysis.structured.highPriorityRisks.map((risk, index) => (
                        <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-red-700">{risk.asset || `Risk ${index + 1}`}</h4>
                              <p className="text-gray-700">{risk.description}</p>
                              {risk.timeframe && (
                                <div className="flex items-center space-x-1 mt-1 text-sm text-gray-500">
                                  <Clock className="h-4 w-4" />
                                  <span>Expected timeframe: {risk.timeframe}</span>
                                </div>
                              )}
                            </div>
                            {risk.severity && (
                              <Badge className={getRiskColor(risk.severity)}>
                                {risk.severity}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Risk by Category */}
              {riskAnalysis.structured?.riskCategories && (
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Breakdown by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(riskAnalysis.structured.riskCategories).map(([category, data]) => (
                        <div key={category} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold capitalize">{category.replace('_', ' ')}</h4>
                            <Badge className={getRiskColor(data.level)}>
                              {data.level}
                            </Badge>
                          </div>
                          <p className="text-gray-700 text-sm mb-2">{data.description}</p>
                          <Progress value={getRiskScore(data.level)} className="w-full" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {riskAnalysis.structured?.recommendations && riskAnalysis.structured.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingDown className="h-5 w-5 text-green-600" />
                      <span>Risk Mitigation Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {riskAnalysis.structured.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700">{rec}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Analysis */}
              {riskAnalysis.response && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Risk Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {riskAnalysis.response.split('\n').map((paragraph, index) => (
                        paragraph.trim() && <p key={index} className="mb-2">{paragraph}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Metadata */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Model: {aiService.getModelConfig(selectedModel)?.name}</span>
                      {riskAnalysis.cost && <span>Cost: ${riskAnalysis.cost.toFixed(4)}</span>}
                    </div>
                    <span>Generated: {new Date().toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {!riskAnalysis && !loading && assets.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Assets to Analyze</h3>
            <p className="text-gray-600">Add some assets to begin risk analysis</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIRiskAnalysisView;
