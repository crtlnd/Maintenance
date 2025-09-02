
import React, { useState } from 'react';
import { Bot, Send, Lightbulb, AlertTriangle, Package, TrendingUp, Handshake, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Asset, MaintenanceTask } from '../../types';

interface AIAssistantViewProps {
  assets: Asset[];
  maintenanceData: MaintenanceTask[];
}

interface AIResponse {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
  type: 'priority' | 'parts' | 'risk' | 'replacement' | 'contracts' | 'custom';
}

const SUGGESTED_PROMPTS = [
  {
    id: 'priority',
    text: "What planned maintenance should I prioritize to prevent failures?",
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'parts',
    text: "What parts should I have available in case something fails to prevent downtime?",
    icon: Package,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'risk',
    text: "What is my greatest risk for critical failure?",
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'replacement',
    text: "Should any of my assets be replaced with new equipment to save money in the long run?",
    icon: TrendingUp,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'contracts',
    text: "What service providers should I negotiate an emergency response contract with?",
    icon: Handshake,
    color: 'bg-purple-100 text-purple-800'
  }
];

function AIAssistantView({ assets, maintenanceData }: AIAssistantViewProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateMockResponse = (prompt: string, type: string): string => {
    const overdueTasks = maintenanceData.filter(task =>
      task.status === 'pending' && new Date(task.dueDate) < new Date()
    );
    const criticalAssets = assets.filter(asset => asset.criticality === 'critical');
    const highMaintenanceAssets = assets.filter(asset => {
      const assetTasks = maintenanceData.filter(task => task.assetId === asset.id);
      return assetTasks.length > 3;
    });

    switch (type) {
      case 'priority':
        return `Based on your current maintenance data, I recommend prioritizing these tasks:
**Immediate Priority (Overdue):**
${overdueTasks.length > 0 ? overdueTasks.slice(0, 3).map(task => {
          const asset = assets.find(a => a.id === task.assetId);
          return `• ${task.task} on ${asset?.name} (${Math.abs(Math.floor((new Date().getTime() - new Date(task.dueDate).getTime()) / (1000 * 3600 * 24)))} days overdue)`;
        }).join('\n') : '• No overdue tasks - great job staying on schedule!'}
**Critical Asset Focus:**
${criticalAssets.slice(0, 2).map(asset => {
          const pendingTasks = maintenanceData.filter(t => t.assetId === asset.id && t.status === 'pending');
          return `• ${asset.name}: ${pendingTasks.length} pending maintenance tasks`;
        }).join('\n')}
**Recommendation:** Focus on overdue tasks first, then prioritize preventive maintenance on critical assets to avoid unplanned downtime.`;
      case 'parts':
        return `Based on your asset portfolio and maintenance history, I recommend stocking these critical spare parts:
**High Priority Parts:**
${criticalAssets.map(asset => {
          const commonParts = ['filters', 'belts', 'seals', 'sensors'];
          const suggestedPart = commonParts[Math.floor(Math.random() * commonParts.length)];
          return `• ${asset.name}: ${suggestedPart} (critical asset - keep 2-3 units in stock)`;
        }).join('\n')}
**Medium Priority Parts:**
${assets.slice(0, 3).map(asset => {
          const parts = ['lubricants', 'gaskets', 'fuses', 'couplings'];
          const suggestedPart = parts[Math.floor(Math.random() * parts.length)];
          return `• ${asset.name}: ${suggestedPart}`;
        }).join('\n')}
**Inventory Strategy:** Maintain 30-60 days of critical parts inventory and establish supplier agreements for non-critical items with 24-48 hour delivery.`;
      case 'risk':
        return `Analysis of your maintenance data reveals these critical failure risks:
**Highest Risk Assets:**
${criticalAssets.slice(0, 2).map((asset, index) => {
          const overdueTasks = maintenanceData.filter(t => t.assetId === asset.id && t.status === 'pending' && new Date(t.dueDate) < new Date());
          const riskLevel = overdueTasks.length > 2 ? 'CRITICAL' : overdueTasks.length > 0 ? 'HIGH' : 'MEDIUM';
          return `• ${asset.name}: ${riskLevel} risk (${overdueTasks.length} overdue maintenance tasks)`;
        }).join('\n')}
**Risk Factors:**
• ${overdueTasks.length} overdue maintenance tasks across all assets
• ${criticalAssets.length} critical assets require immediate attention
• Assets with multiple pending tasks: ${highMaintenanceAssets.map(a => a.name).join(', ') || 'None identified'}
**Mitigation Strategy:** Implement condition-based monitoring on critical assets and create emergency response procedures for high-risk equipment.`;
      case 'replacement':
        return `Asset replacement analysis based on maintenance costs and reliability:
**Replacement Candidates:**
${highMaintenanceAssets.slice(0, 2).map(asset => {
          const assetTasks = maintenanceData.filter(task => task.assetId === asset.id);
          const avgAge = Math.floor(Math.random() * 10) + 8; // Mock age calculation
          return `• ${asset.name}: ${assetTasks.length} maintenance tasks, estimated ${avgAge} years old
  - High maintenance frequency indicates potential for replacement
  - ROI analysis recommended`;
        }).join('\n')}
**Keep Current:**
${assets.filter(a => !highMaintenanceAssets.includes(a)).slice(0, 2).map(asset => {
          return `• ${asset.name}: Low maintenance requirements, good condition`;
        }).join('\n')}
**Recommendation:** Conduct detailed cost-benefit analysis for high-maintenance assets. Consider factors like energy efficiency, reliability improvements, and maintenance cost savings.`;
      case 'contracts':
        return `Service provider contract recommendations based on your asset profile:
**Critical Services Needed:**
• Emergency electrical services (for critical electrical assets)
• HVAC emergency response (for climate-controlled environments)
• Mechanical repair services (for production equipment)
• Preventive maintenance contracts for specialized equipment
**Recommended Contract Structure:**
• 4-hour response time for critical assets
• 24-hour response for non-critical assets
• Performance-based contracts with uptime guarantees
• Preferred pricing for planned maintenance work
**Geographic Considerations:**
Ensure service providers can reach your ${assets.length > 10 ? 'multiple' : 'main'} facility within guaranteed response times.
**Next Steps:** Request quotes from 3-5 qualified service providers and negotiate service level agreements based on your asset criticality matrix.`;
      default:
        return `Based on your maintenance data and asset portfolio, here's my analysis:
Your facility manages ${assets.length} assets with ${maintenanceData.length} maintenance tasks.
**Key Insights:**
• ${criticalAssets.length} critical assets require focused attention
• ${overdueTasks.length} tasks are currently overdue
• Asset distribution: ${assets.length - criticalAssets.length} standard assets, ${criticalAssets.length} critical assets
**Recommendations:**
1. Prioritize overdue maintenance tasks to prevent failures
2. Implement predictive maintenance for critical assets
3. Review maintenance schedules for optimization opportunities
4. Consider service provider partnerships for specialized work
This analysis is based on your current data. For more specific insights, try one of the suggested prompts or ask about particular assets or maintenance challenges.`;
    }
  };

  const handleSuggestedPrompt = async (prompt: string, type: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const response: AIResponse = {
      id: Date.now().toString(),
      prompt,
      response: generateMockResponse(prompt, type),
      timestamp: new Date().toISOString(),
      type: type as AIResponse['type']
    };
    setResponses(prev => [response, ...prev]);
    setIsLoading(false);
  };

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim()) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const response: AIResponse = {
      id: Date.now().toString(),
      prompt: customPrompt,
      response: generateMockResponse(customPrompt, 'custom'),
      timestamp: new Date().toISOString(),
      type: 'custom'
    };
    setResponses(prev => [response, ...prev]);
    setCustomPrompt('');
    setIsLoading(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
          <Bot className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1>AI Maintenance Assistant</h1>
          <p className="text-muted-foreground">
            Get intelligent insights about your maintenance operations and asset management
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-medium">{assets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Critical Assets</p>
                <p className="text-2xl font-medium">{assets.filter(a => a.criticality === 'critical').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-medium">{maintenanceData.filter(t => t.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                <p className="text-2xl font-medium">
                  {maintenanceData.filter(task =>
                    task.status === 'pending' && new Date(task.dueDate) < new Date()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-8">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Suggested Questions
              </CardTitle>
              <CardDescription>
                Click on any prompt to get AI-powered insights about your maintenance operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt.id}
                    variant="outline"
                    className="h-auto p-6 justify-start text-left hover:bg-muted/50 transition-colors w-full"
                    onClick={() => handleSuggestedPrompt(prompt.text, prompt.id)}
                    disabled={isLoading}
                  >
                    <div className="flex items-start gap-4 w-full min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg flex-shrink-0">
                        <prompt.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left space-y-1 min-w-0 max-w-full">
                        <p className="font-medium leading-relaxed break-words whitespace-normal">
                          {prompt.text}
                        </p>
                        <p className="text-xs text-muted-foreground break-words whitespace-normal">
                          Get personalized recommendations based on your data
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ask Your Own Question</CardTitle>
              <CardDescription>
                Describe your specific maintenance challenge or question for personalized insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., How can I reduce maintenance costs for my HVAC system? What's the best maintenance schedule for my production line?"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-24 resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleCustomPrompt}
                size="lg"
                className="w-full"
                disabled={!customPrompt.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Analyzing your request...' : 'Ask AI Assistant'}
              </Button>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>
              AI-powered analysis of your maintenance data and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && responses.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-muted-foreground">Analyzing your maintenance data...</p>
                </div>
              </div>
            )}
            {responses.length === 0 && !isLoading && (
              <div className="text-center py-12 space-y-3">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Welcome to AI Maintenance Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a suggested question or ask your own to get started
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-6">
              {responses.map((response, index) => (
                <div key={response.id}>
                  {index > 0 && <Separator className="my-6" />}
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full flex-shrink-0 mt-0.5">
                          <Bot className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Question:</p>
                          <p className="text-sm mt-1">{response.prompt}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          AI Analysis
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(response.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-line text-sm leading-relaxed">
                          {response.response}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && responses.length > 0 && (
                <div className="flex items-center justify-center py-6">
                  <div className="text-center space-y-2">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                    <p className="text-sm text-muted-foreground">Processing your request...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AIAssistantView;

