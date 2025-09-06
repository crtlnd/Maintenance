import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, DollarSign, Loader2, RefreshCw, BarChart, Settings, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import AIModelSelector from '../ui/AIModelSelector';
import aiService from '../../../services/aiService';

const AIInsightsView = ({ assets = [] }) => {
  const [insights, setInsights] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const analysisTypes = [
    {
      id: 'risk_analysis',
      title: 'Risk Assessment',
      description: 'Identify high-priority maintenance risks',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      recommendedModel: 'gpt-4-turbo'
    },
    {
      id: 'predictive_maintenance',
      title: 'Predictive Analysis',
      description: 'Forecast potential equipment failures',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      recommendedModel: 'gpt-4-turbo'
    },
    {
      id: 'cost_optimization',
      title: 'Cost Optimization',
      description: 'Find ways to reduce maintenance costs',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      recommendedModel: 'gpt-3.5-turbo'
    },
    {
      id: 'performance_insights',
      title: 'Performance Insights',
      description: 'Analyze asset performance trends',
      icon: BarChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      recommendedModel: 'gpt-3.5-turbo'
    }
  ];

  const runAnalysis = async (analysisType) => {
    setLoading(true);
    setActiveAnalysis(analysisType);

    try {
      const analysisConfig = analysisTypes.find(a => a.id === analysisType);
      const modelToUse = selectedModel || analysisConfig.recommendedModel;

      let result;
      switch (analysisType) {
        case 'risk_analysis':
          result = await aiService.analyzeRisk(assets, { model: modelToUse });
          break;
        case 'predictive_maintenance':
          result = await aiService.getPredictiveAnalysis(assets, '30d', { model: modelToUse });
          break;
        case 'cost_optimization':
          result = await aiService.optimizeCosts({ assets }, { model: modelToUse });
          break;
        default:
          result = await aiService.getInsights(analysisType, { assets }, { model: modelToUse });
      }

      setInsights(prev => ({
        ...prev,
        [analysisType]: result
      }));

      // Add to history
      setAnalysisHistory(prev => [{
        id: Date.now(),
        type: analysisType,
        timestamp: new Date(),
        model: modelToUse,
        cost: result.cost,
        summary: result.structured?.summary
      }, ...prev.slice(0, 9)]); // Keep last 10

    } catch (error) {
      console.error('Analysis error:', error);
      setInsights(prev => ({
        ...prev,
        [analysisType]: {
          error: 'Failed to generate insights. Please try again.',
          timestamp: new Date()
        }
      }));
    } finally {
      setLoading(false);
      setActiveAnalysis(null);
    }
  };

  const runAllAnalyses = async () => {
    for (const analysis of analysisTypes) {
      await runAnalysis(analysis.id);
      // Small delay between analyses to prevent overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getModelBadgeColor = (modelId) => {
    const model = aiService.getModelConfig(modelId);
    if (model?.tier === 'premium') return 'bg-purple-100 text-purple-700';
    if (model?.tier === 'standard') return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">AI Insights</h1>
            <p className="text-gray-600">
              Smart analysis of your maintenance data using AI
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
            onClick={runAllAnalyses}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Run All Analyses
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

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insights">Current Insights</TabsTrigger>
          <TabsTrigger value="history">Analysis History</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {/* Quick Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analysisTypes.map((analysis) => (
              <Card
                key={analysis.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => runAnalysis(analysis.id)}
              >
                <CardContent className="p-4">
                  <div className={`w-12 h-12 rounded-lg ${analysis.bgColor} flex items-center justify-center mb-3`}>
                    <analysis.icon className={`h-6 w-6 ${analysis.color}`} />
                  </div>

                  <h3 className="font-semibold mb-1">{analysis.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{analysis.description}</p>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {aiService.getModelConfig(analysis.recommendedModel)?.name}
                    </Badge>

                    {loading && activeAnalysis === analysis.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Button size="sm" variant="outline">
                        Analyze
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Results */}
          <div className="space-y-4">
            {Object.entries(insights).map(([type, result]) => {
              const analysisConfig = analysisTypes.find(a => a.id === type);
              if (!analysisConfig || !result) return null;

              return (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <analysisConfig.icon className={`h-5 w-5 ${analysisConfig.color}`} />
                      <span>{analysisConfig.title}</span>
                      {result.model && (
                        <Badge className={getModelBadgeColor(result.model)}>
                          {aiService.getModelConfig(result.model)?.name}
                        </Badge>
                      )}
                      {result.cost && (
                        <Badge variant="outline">
                          ${result.cost.toFixed(4)}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {result.error ? (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                          {result.error}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary */}
                        {result.structured?.summary && (
                          <div>
                            <h4 className="font-medium mb-2">Summary</h4>
                            <p className="text-gray-700">{result.structured.summary}</p>
                          </div>
                        )}

                        {/* Recommendations */}
                        {result.structured?.recommendations && result.structured.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Recommendations</h4>
                            <ul className="space-y-1">
                              {result.structured.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="text-blue-600 mt-1">•</span>
                                  <span className="text-gray-700">{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Full Response */}
                        {result.response && (
                          <div>
                            <h4 className="font-medium mb-2">Detailed Analysis</h4>
                            <div className="prose prose-sm max-w-none text-gray-700">
                              {result.response.split('\n').map((paragraph, index) => (
                                <p key={index} className="mb-2">{paragraph}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="text-xs text-gray-500 pt-2 border-t">
                          Generated on {formatTimestamp(result.analysisMetadata?.timestamp || result.timestamp)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
            </CardHeader>
            <CardContent>
              {analysisHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No analyses run yet</p>
              ) : (
                <div className="space-y-3">
                  {analysisHistory.map((item) => {
                    const analysisConfig = analysisTypes.find(a => a.id === item.type);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {analysisConfig && (
                            <analysisConfig.icon className={`h-5 w-5 ${analysisConfig.color}`} />
                          )}
                          <div>
                            <p className="font-medium">{analysisConfig?.title}</p>
                            <p className="text-sm text-gray-600">{formatTimestamp(item.timestamp)}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge className={getModelBadgeColor(item.model)}>
                            {aiService.getModelConfig(item.model)?.name}
                          </Badge>
                          {item.cost && (
                            <Badge variant="outline">
                              ${item.cost.toFixed(4)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIInsightsView;
