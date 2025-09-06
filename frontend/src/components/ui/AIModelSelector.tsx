import React, { useState, useEffect } from 'react';
import { Brain, Zap, DollarSign, Info, ChevronDown, Check } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';

const AIModelSelector = ({
  selectedModel,
  onModelChange,
  showDetails = false,
  variant = 'default' // 'default', 'compact', 'inline'
}) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [modelDetails, setModelDetails] = useState({});

  const defaultModels = [
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      description: 'Most capable model for complex analysis',
      costPerToken: 0.01,
      speed: 'Medium',
      strengths: ['Complex reasoning', 'Detailed analysis', 'Technical accuracy'],
      bestFor: 'Risk analysis, detailed insights, complex maintenance planning',
      tier: 'premium',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      description: 'Fast and efficient for most tasks',
      costPerToken: 0.002,
      speed: 'Fast',
      strengths: ['Quick responses', 'Good accuracy', 'Cost effective'],
      bestFor: 'Chat, quick insights, routine analysis',
      tier: 'standard',
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'Anthropic',
      description: 'Ultra-fast responses for simple tasks',
      costPerToken: 0.001,
      speed: 'Very Fast',
      strengths: ['Ultra-fast', 'Cost efficient', 'Reliable'],
      bestFor: 'Simple queries, quick checks, basic analysis',
      tier: 'basic',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  useEffect(() => {
    // In production, this would fetch from your aiService
    // For now, we'll use the default models
    setModels(defaultModels);
    setLoading(false);
  }, []);

  const getCurrentModel = () => {
    return models.find(m => m.id === selectedModel) || models[0];
  };

  const handleModelSelect = (modelId) => {
    onModelChange(modelId);
    setShowDropdown(false);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Brain className="h-4 w-4 animate-pulse" />
        <span className="text-sm">Loading models...</span>
      </div>
    );
  }

  const currentModel = getCurrentModel();

  // Compact variant for inline use
  if (variant === 'compact') {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2"
        >
          <currentModel.icon className={`h-4 w-4 ${currentModel.color}`} />
          <span className="text-sm">{currentModel.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-50">
            <div className="p-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center space-x-2"
                >
                  <model.icon className={`h-4 w-4 ${model.color}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{model.name}</div>
                    <div className="text-xs text-gray-500">{model.description}</div>
                  </div>
                  {selectedModel === model.id && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full card layout
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Model Selection</span>
          </h3>
          {showDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Info className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid gap-3">
          {models.map((model) => (
            <Card
              key={model.id}
              className={`cursor-pointer transition-all ${
                selectedModel === model.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleModelSelect(model.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${model.bgColor}`}>
                      <model.icon className={`h-5 w-5 ${model.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold">{model.name}</h4>
                        <Badge variant={model.tier === 'premium' ? 'default' : 'secondary'}>
                          {model.tier}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{model.description}</p>

                      {showDetails && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Speed: {model.speed}</span>
                            <span>Cost: ${model.costPerToken}/1K tokens</span>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Best for:</p>
                            <p className="text-xs text-gray-600">{model.bestFor}</p>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {model.strengths.map((strength, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedModel === model.id && (
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedModel && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800">
              <currentModel.icon className="h-4 w-4" />
              <span className="text-sm font-medium">
                Selected: {currentModel.name}
              </span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {currentModel.bestFor}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIModelSelector;
