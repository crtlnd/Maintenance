// frontend/src/components/views/AIChatView.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Loader2, AlertCircle, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import aiService from '../../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';

function AIChatView() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on component mount
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your AI maintenance assistant. I can help you with asset management, maintenance planning, risk analysis, and answer questions about your equipment. What would you like to know?",
        timestamp: new Date()
      }
    ]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Call your AI service
      const response = await aiService.chat(userMessage.content);

      const aiMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to get AI response');

      const errorMessage = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const suggestedQuestions = [
    "What assets need maintenance this week?",
    "How can I reduce maintenance costs?",
    "What are the highest risk items in my portfolio?",
    "Show me predictive maintenance recommendations",
    "What's the optimal maintenance schedule for pumps?"
  ];

  const handleSuggestedQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">AI Chat Assistant</h1>
            <p className="text-gray-600">Ask questions about your maintenance operations</p>
          </div>
        </div>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          Credits: {user?.aiCredits || user?.credits || 0}
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Chat with AI Assistant</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Start a conversation with your AI assistant</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}

                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isError
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user'
                        ? 'text-blue-200'
                        : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Suggested Questions (only show when no messages) */}
          {messages.length <= 1 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your maintenance operations..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIChatView;
