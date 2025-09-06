import React, { useState, useEffect } from 'react';
import { TrendingUp, Brain, Settings, Calendar, Wrench, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import AIModelSelector from '../ui/AIModelSelector';
import aiService from '../../../services/aiService';

const AIPredictiveView = ({ assets = [] }) => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [timeframe, setTimeframe] = useState('30d');
  const [lastAnalysis, setLastAnalysis] = useState(null);

  const timeframes = [
    { value: '7d', label: '7 Days', description: 'Short-term predictions' },
    { value: '30d', label: '30 Days', description: 'Monthly outlook' },
    { value: '90d', label: '90 Days', description: 'Quarterly forecast' },
    { value: '180d', label: '6 Months', description: 'Semi-annual planning' },
    { value: '1y', label: '1 Year', description: 'Annual maintenance planning' }
  ];

  const runPredictiveAnalysis = async () => {
    setLoading(true);
    try {
      const result = await aiService.getPredictiveAnalysis(assets, timeframe, {
        model: selectedModel,
        includeFailureProbabilities: true,
        includeMaintenanceSchedule: true,
        includeCostEstimates: true
      });

      setPredictions(result);
      setLastAnalysis(new Date());
    } catch (error) {
      console.error('Predictive analysis error:', error);
      setPredictions({
        error: 'Failed to generate predictive analysis. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assets.length > 0) {
      runPredictiveAnalysis();
    }
  }, [assets.length, timeframe]);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimeframe = (tf) => {
    return timeframes.find(t => t.value === tf)?.label || tf;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">AI Predictive Maintenance</h1>
            <p className="text-gray-600">
              Forecast equipment failures and optimize maintenance schedules
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((tf) => (
                <SelectItem key={tf.value} value={tf.value}>
                  <div>
                    <div className="font-medium">{tf.label}</div>
                    <div className="text-xs text-gray-500">{tf.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowModelSelector(!showModelSelector)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Model
          </Button>

          <Button
            onClick={runPredictiveAnalysis}
            disabled={loading}
          >
            {loading ? (
              <Brain className="h-4 w-4 mr-2 animate-pulse" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            Analyze
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
            <h3 className="text-lg font-semibold mb-2">Generating Predictions...</h3>
            <p className="text-gray-600">
              AI is analyzing patterns and forecasting maintenance needs for the next {formatTimeframe(timeframe)}
            </p>
          </CardContent>
        </Card>
      )}

      {predictions && !loading && (
        <div className="space-y-6">
          {predictions.error ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-red-600">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>{predictions.error}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="failures" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="failures">Predicted Failures</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance Schedule</TabsTrigger>
                <TabsTrigger value="insights">Insights & Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="failures" className="space-y-4">
                {/* Predicted Failures */}
                {predictions.structured?.predictedFailures && predictions.structured.predictedFailures.length > 0 ? (
                  <div className="space-y-4">
                    {predictions.structured.predictedFailures.map((failure, index) => (
                      <Card key={index} className="border-l-4 border-orange-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                                <h3 className="font-semibold">{failure.asset || `Asset ${index + 1}`}</h3>
                                {failure.priority && (
                                  <Badge className={getPriorityColor(failure.priority)}>
                                    {failure.priority}
                                  </Badge>
                                )}
                              </div>

                              <p className="text-gray-700 mb-2">{failure.description}</p>

                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                {failure.probability && (
                                  <div className="flex items-center space-x-1">
                                    <span>Probability:</span>
                                    <Badge variant="outline">{failure.probability}</Badge>
                                  </div>
                                )}

                                {failure.estimatedDate && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{failure.estimatedDate}</span>
                                  </div>
                                )}

                                {failure.estimatedCost && (
                                  <div className="flex items-center space-x-1">
                                    <span>Est. Cost:</span>
                                    <Badge variant="outline">{failure.estimatedCost}</Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <h3 className="text-lg font-semibold mb-2">No Failures Predicted</h3>
                      <p className="text-gray-600">
                        Great news! No significant failures are predicted for the next {formatTimeframe(timeframe)}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="maintenance" className="space-y-4">
                {/* Recommended Maintenance Schedule */}
                {predictions.structured?.maintenanceSchedule && predictions.structured.maintenanceSchedule.length > 0 ? (
                  <div className="space-y-4">
                    {predictions.structured.maintenanceSchedule.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <Wrench className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">{item.task || `Maintenance Task ${index + 1}`}</h3>
                                <p className="text-gray-700 mb-2">{item.description}</p>

                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  {item.scheduledDate && (
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{item.scheduledDate}</span>
                                    </div>
                                  )}

                                  {item.estimatedDuration && (
                                    <div className="flex items-center space-x-1">
                                      <Clock className="h-4 w-4" />
                                      <span>{item.estimatedDuration}</span>
                                    </div>
                                  )}

                                  {item.estimatedCost && (
                                    <span>Cost: {item.estimatedCost}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {item.priority && (
                              <Badge className={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No Maintenance Scheduled</h3>
                      <p className="text-gray-600">
                        No specific maintenance tasks are recommended for the next {formatTimeframe(timeframe)}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                {/* Summary Insights */}
                {predictions.structured?.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Predictive Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{predictions.structured.summary}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Key Insights */}
                {predictions.structured?.keyInsights && predictions.structured.keyInsights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {predictions.structured.keyInsights.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-gray-700">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Cost Projections */}
                {predictions.structured?.costProjections && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Projections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(predictions.structured.costProjections).map(([type, cost]) => (
                          <div key={type} className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{cost}</div>
                            <div className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Detailed Analysis */}
                {predictions.response && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Predictive Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none text-gray-700">
                        {predictions.response.split('\n').map((paragraph, index) => (
                          paragraph.trim() && <p key={index} className="mb-2">{paragraph}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Analysis Metadata */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>Model: {aiService.getModelConfig(selectedModel)?.name}</span>
                  <span>Timeframe: {formatTimeframe(timeframe)}</span>
                  {predictions.cost && <span>Cost: ${predictions.cost.toFixed(4)}</span>}
                </div>
                {lastAnalysis && <span>Generated: {lastAnalysis.toLocaleString()}</span>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!predictions && !loading && assets.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Assets to Analyze</h3>
            <p className="text-gray-600">Add some assets to begin predictive analysis</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIPredictiveView;
