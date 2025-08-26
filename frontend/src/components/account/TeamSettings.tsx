import React, { useState } from 'react';
import { Plus, Mail, MoreHorizontal, UserX, Crown, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../utils/auth';
import { TeamMember } from '../../types';

export function TeamSettings() {
  const { user, canAddTeamMember, getSeatLimit } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Maintenance Technician');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const mockTeamMembers: TeamMember[] = [
    {
      id: user?.id || '1',
      email: user?.email || 'john.doe@company.com',
      firstName: user?.firstName || 'John',
      lastName: user?.lastName || 'Doe',
      role: user?.role || 'Maintenance Manager',
      status: 'active',
      joinedAt: user?.createdAt || new Date().toISOString(),
      lastActive: user?.lastLogin || new Date().toISOString(),
    }
  ];

  const handleInvite = async () => {
    if (!inviteEmail || !canAddTeamMember()) return;

    setIsInviting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would send an invitation
    setInviteEmail('');
    setInviteRole('Maintenance Technician');
    setIsInviting(false);
    setShowInviteDialog(false);
  };

  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return null;
    }
  };

  const canInvite = canAddTeamMember();
  const seatLimit = getSeatLimit();
  const usedSeats = user?.organization?.subscription.usedSeats || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3>Team Management</h3>
          <p className="text-muted-foreground">
            Invite team members to collaborate on maintenance management.
          </p>
        </div>
        
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button disabled={!canInvite}>
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your maintenance management team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Input
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  placeholder="e.g., Maintenance Technician"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInviteDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleInvite} 
                  disabled={!inviteEmail || isInviting}
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Seat Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Seat Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Used Seats</span>
            <span className="text-sm font-medium">
              {usedSeats} of {seatLimit === 'unlimited' ? '∞' : seatLimit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                seatLimit !== 'unlimited' && usedSeats >= (seatLimit as number) 
                  ? 'bg-destructive' 
                  : 'bg-primary'
              }`}
              style={{ 
                width: seatLimit === 'unlimited' 
                  ? '10%' 
                  : `${Math.min((usedSeats / (seatLimit as number)) * 100, 100)}%` 
              }}
            ></div>
          </div>
          {!canInvite && (
            <p className="text-xs text-muted-foreground mt-2">
              Upgrade your plan to add more team members
            </p>
          )}
        </CardContent>
      </Card>

      {!canInvite && user?.subscription.plan === 'free' && (
        <Alert>
          <Crown className="h-4 w-4" />
          <AlertDescription>
            You're on the Free plan which includes 1 seat. Upgrade to Basic or higher to invite team members.
          </AlertDescription>
        </Alert>
      )}

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team members and their access permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTeamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage />
                    <AvatarFallback>
                      {member.firstName[0]}{member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      {member.id === user?.id && (
                        <Crown className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(member.status)}
                  
                  {member.id !== user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Resend Invitation
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <UserX className="h-4 w-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                  {member.id === user?.id && (
                    <Badge variant="outline">Owner</Badge>
                  )}
                </div>
              </div>
            ))}

            {mockTeamMembers.length === 1 && (
              <div className="text-center py-8 text-muted-foreground">
                <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No other team members yet</p>
                <p className="text-sm">Invite colleagues to collaborate on maintenance management</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Features */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center space-y-4">
          <div className="space-y-2">
            <h4>Coming Soon: Advanced Team Features</h4>
            <p className="text-sm text-muted-foreground">
              Role-based permissions, task assignments, and team activity tracking
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}