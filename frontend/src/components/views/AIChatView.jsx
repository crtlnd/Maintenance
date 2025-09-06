import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Settings, Loader2, DollarSign, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import AIModelSelector from '../ui/AIModelSelector';
import aiService from '../../../services/aiService';

const AIChatView = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    messagesCount: 0,
    totalCost: 0,
    tokensUsed: 0
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    const welcomeMessage = {
      id: Date.now(),
      type: 'assistant',
      content: "Hello! I'm your AI maintenance assistant. I can help you with maintenance planning, risk analysis, troubleshooting, and insights based on your data. What would you like to know?",
      timestamp: new Date(),
      model: selectedModel
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get user context (you might want to pass actual user data here)
      const context = {
        userId: 'current-user',
        sessionId: 'chat-session',
        conversationHistory: messages.slice(-5) // Last 5 messages for context
      };

      const response = await aiService.chat(inputMessage, context, {
        model: selectedModel
      });

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.response || response.message,
        timestamp: new Date(),
        model: selectedModel,
        cost: response.cost,
        tokensUsed: response.usage?.totalTokens
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update session stats
      setSessionStats(prev => ({
        messagesCount: prev.messagesCount + 1,
        totalCost: prev.totalCost + (response.cost || 0),
        tokensUsed: prev.tokensUsed + (response.usage?.totalTokens || 0)
      }));

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: "I'm sorry, I encountered an error processing your message. Please try again.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearChat = () => {
    setMessages([]);
    setSessionStats({ messagesCount: 0, totalCost: 0, tokensUsed: 0 });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold">AI Assistant</h1>
              <p className="text-sm text-gray-500">
                Powered by {aiService.getModelConfig(selectedModel)?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Session Stats */}
            <div className="flex items-center space-x-3 text-sm text-gray-500 mr-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{sessionStats.messagesCount}</span>
              </div>
              {sessionStats.totalCost > 0 && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span>${sessionStats.totalCost.toFixed(4)}</span>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModelSelector(!showModelSelector)}
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Model Selector */}
        {showModelSelector && (
          <div className="mt-4">
            <AIModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              variant="compact"
              showDetails={true}
            />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.isError
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'assistant' && (
                  <Bot className={`h-5 w-5 mt-0.5 ${message.isError ? 'text-red-500' : 'text-blue-600'}`} />
                )}
                {message.type === 'user' && (
                  <User className="h-5 w-5 mt-0.5 text-white" />
                )}

                <div className="flex-1">
                  <div className="prose prose-sm max-w-none">
                    <p className={message.isError ? 'text-red-700' : ''}>{message.content}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{formatTimestamp(message.timestamp)}</span>

                    {message.type === 'assistant' && !message.isError && (
                      <div className="flex items-center space-x-2">
                        {message.model && (
                          <Badge variant="outline" className="text-xs">
                            {aiService.getModelConfig(message.model)?.name}
                          </Badge>
                        )}
                        {message.cost && (
                          <span className="text-xs">${message.cost.toFixed(4)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <div className="flex items-center space-x-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about maintenance, assets, or get insights..."
              disabled={isLoading}
              className="pr-20"
            />

            {selectedModel && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Badge variant="outline" className="text-xs">
                  {aiService.getModelConfig(selectedModel)?.name.split(' ')[0]}
                </Badge>
              </div>
            )}
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          Using {aiService.getModelConfig(selectedModel)?.name} •
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default AIChatView;
