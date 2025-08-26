import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  ArrowUp,
  ArrowDown,
  Target,
  Zap,
  CheckCircle,
  AlertTriangle,
  Activity,
  Users,
  Clock,
  MapPin,
  Star
} from 'lucide-react';
import { MatchingRule } from '../../types';
import { adminMatchingRules } from '../../data/initialData';

export function AdminMatchingView() {
  const [rules, setRules] = useState<MatchingRule[]>(adminMatchingRules);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<Partial<MatchingRule> | null>(null);

  const handleToggleRule = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const handlePriorityChange = (ruleId: string, direction: 'up' | 'down') => {
    const ruleIndex = rules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) return;

    const newRules = [...rules];
    const targetIndex = direction === 'up' ? ruleIndex - 1 : ruleIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < rules.length) {
      [newRules[ruleIndex], newRules[targetIndex]] = [newRules[targetIndex], newRules[ruleIndex]];
      
      // Update priority values
      newRules.forEach((rule, index) => {
        rule.priority = index + 1;
      });
      
      setRules(newRules);
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const handleSaveRule = (rule: MatchingRule) => {
    if (editingRule) {
      setRules(rules.map(r => r.id === rule.id ? rule : r));
      setEditingRule(null);
    } else if (newRule) {
      const id = `rule_${Date.now()}`;
      const completeRule: MatchingRule = {
        ...rule,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin_001',
        priority: rules.length + 1
      };
      setRules([...rules, completeRule]);
      setNewRule(null);
    }
  };

  const startNewRule = () => {
    setNewRule({
      name: '',
      description: '',
      isActive: true,
      conditions: {},
      actions: {}
    });
  };

  const RuleEditor = ({ rule, onSave, onCancel }: { 
    rule: Partial<MatchingRule>; 
    onSave: (rule: MatchingRule) => void; 
    onCancel: () => void; 
  }) => {
    const [editedRule, setEditedRule] = useState<Partial<MatchingRule>>(rule);

    return (
      <Card className="mb-4 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {rule.id ? 'Edit Rule' : 'Create New Rule'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={editedRule.name || ''}
                onChange={(e) => setEditedRule({ ...editedRule, name: e.target.value })}
                placeholder="Enter rule name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="active">Status</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={editedRule.isActive || false}
                  onCheckedChange={(checked) => setEditedRule({ ...editedRule, isActive: checked })}
                />
                <span className="text-sm">
                  {editedRule.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedRule.description || ''}
              onChange={(e) => setEditedRule({ ...editedRule, description: e.target.value })}
              placeholder="Describe what this rule does"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Conditions</h4>
              
              <div className="space-y-2">
                <Label>Service Types</Label>
                <Input
                  placeholder="Emergency Repair, Maintenance, etc."
                  value={editedRule.conditions?.serviceTypes?.join(', ') || ''}
                  onChange={(e) => setEditedRule({
                    ...editedRule,
                    conditions: {
                      ...editedRule.conditions,
                      serviceTypes: e.target.value.split(', ').filter(s => s.trim())
                    }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Rating Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    min="1"
                    max="5"
                    step="0.1"
                    value={editedRule.conditions?.ratings?.min || ''}
                    onChange={(e) => setEditedRule({
                      ...editedRule,
                      conditions: {
                        ...editedRule.conditions,
                        ratings: {
                          ...editedRule.conditions?.ratings,
                          min: parseFloat(e.target.value) || 0,
                          max: editedRule.conditions?.ratings?.max || 5
                        }
                      }
                    })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    min="1"
                    max="5"
                    step="0.1"
                    value={editedRule.conditions?.ratings?.max || ''}
                    onChange={(e) => setEditedRule({
                      ...editedRule,
                      conditions: {
                        ...editedRule.conditions,
                        ratings: {
                          min: editedRule.conditions?.ratings?.min || 0,
                          max: parseFloat(e.target.value) || 5
                        }
                      }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Response Time</Label>
                <Input
                  placeholder="< 2 hours, Same day, etc."
                  value={editedRule.conditions?.responseTime || ''}
                  onChange={(e) => setEditedRule({
                    ...editedRule,
                    conditions: {
                      ...editedRule.conditions,
                      responseTime: e.target.value
                    }
                  })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Actions</h4>
              
              <div className="space-y-2">
                <Label>Boost Score</Label>
                <div className="space-y-2">
                  <Slider
                    value={[editedRule.actions?.boostScore || 0]}
                    onValueChange={(value) => setEditedRule({
                      ...editedRule,
                      actions: {
                        ...editedRule.actions,
                        boostScore: value[0]
                      }
                    })}
                    max={100}
                    step={5}
                  />
                  <div className="text-sm text-muted-foreground">
                    Boost: +{editedRule.actions?.boostScore || 0} points
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editedRule.actions?.autoMatch || false}
                    onCheckedChange={(checked) => setEditedRule({
                      ...editedRule,
                      actions: {
                        ...editedRule.actions,
                        autoMatch: checked
                      }
                    })}
                  />
                  <Label>Auto Match</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Automatically match when conditions are met
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editedRule.actions?.requireApproval || false}
                    onCheckedChange={(checked) => setEditedRule({
                      ...editedRule,
                      actions: {
                        ...editedRule.actions,
                        requireApproval: checked
                      }
                    })}
                  />
                  <Label>Require Approval</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Admin approval required for matches
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={() => onSave(editedRule as MatchingRule)}>
              <Save className="h-4 w-4 mr-2" />
              Save Rule
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Matching Logic</h1>
          <p className="text-muted-foreground">
            Configure automated matching rules between customers and service providers.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Button onClick={startNewRule}>
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Matching Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.filter(r => r.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {rules.length} total rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Match Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7h</div>
            <p className="text-xs text-muted-foreground">
              15% improvement this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Successful matches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Matches</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">64%</div>
            <p className="text-xs text-muted-foreground">
              Automatically processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* New Rule Editor */}
      {newRule && (
        <RuleEditor
          rule={newRule}
          onSave={handleSaveRule}
          onCancel={() => setNewRule(null)}
        />
      )}

      {/* Rules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2>Matching Rules</h2>
          <p className="text-sm text-muted-foreground">
            Rules are processed in priority order (higher priority first)
          </p>
        </div>

        {rules.map((rule) => (
          <div key={rule.id}>
            {editingRule === rule.id ? (
              <RuleEditor
                rule={rule}
                onSave={handleSaveRule}
                onCancel={() => setEditingRule(null)}
              />
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePriorityChange(rule.id, 'up')}
                          disabled={rule.priority === 1}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          #{rule.priority}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePriorityChange(rule.id, 'down')}
                          disabled={rule.priority === rules.length}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {rule.name}
                          <Badge className={rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {rule.isActive ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{rule.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => handleToggleRule(rule.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRule(rule.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Conditions</h4>
                      <div className="space-y-2 text-sm">
                        {rule.conditions.serviceTypes && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Services: {rule.conditions.serviceTypes.join(', ')}</span>
                          </div>
                        )}
                        {rule.conditions.ratings && (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-muted-foreground" />
                            <span>Rating: {rule.conditions.ratings.min} - {rule.conditions.ratings.max}</span>
                          </div>
                        )}
                        {rule.conditions.responseTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Response: {rule.conditions.responseTime}</span>
                          </div>
                        )}
                        {rule.conditions.locations && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>Locations: {rule.conditions.locations.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Actions</h4>
                      <div className="space-y-2 text-sm">
                        {rule.actions.boostScore && (
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span>Boost Score: +{rule.actions.boostScore} points</span>
                          </div>
                        )}
                        {rule.actions.autoMatch && (
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                            <span>Auto Match Enabled</span>
                          </div>
                        )}
                        {rule.actions.requireApproval && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            <span>Requires Approval</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-muted-foreground">
                    <span>Created: {new Date(rule.createdAt).toLocaleDateString()}</span>
                    <span>Last Updated: {new Date(rule.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}