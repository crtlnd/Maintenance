import React, { useState, useEffect } from 'react';
import { Plus, Mail, MoreHorizontal, UserX, Crown, User as UserIcon, Copy, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { teamApi, copyInviteUrl } from '../../../Services/teamApi.js';

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  organizationRole: 'owner' | 'technician';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  role?: string; // Job title
}

interface Invitation {
  _id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  invitedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function TeamSettings() {
  const { user, canInviteMembers, hasOrganization, isOrganizationOwner, organization, createOrganization } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('technician');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Organization creation state
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false);
  const [orgName, setOrgName] = useState(user?.company || '');
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);

  // Join organization state
  const [joinToken, setJoinToken] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Load team data on mount and when organization changes
  useEffect(() => {
    if (hasOrganization()) {
      loadTeamData();
    } else {
      setLoading(false);
    }
  }, [hasOrganization, organization]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [membersResponse, invitationsResponse] = await Promise.all([
        teamApi.getMembers(),
        canInviteMembers() ? teamApi.getInvitations() : Promise.resolve({ data: [] })
      ]);

      if (membersResponse.success) {
        setTeamMembers(membersResponse.data);
      }

      if (invitationsResponse.success || invitationsResponse.data) {
        setInvitations(invitationsResponse.data || []);
      }
    } catch (err: any) {
      console.error('Error loading team data:', err);
      setError(err.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) return;

    setIsCreatingOrg(true);
    setError(null);

    try {
      const success = await createOrganization(orgName.trim(), 'internal');

      if (success) {
        setShowCreateOrgDialog(false);
        setOrgName('');
        // The AuthContext should automatically update, but let's reload team data
        await loadTeamData();
      }
    } catch (err: any) {
      console.error('Error creating organization:', err);
      setError(err.message || 'Failed to create organization');
    } finally {
      setIsCreatingOrg(false);
    }
  };

  const handleJoinOrganization = async () => {
    if (!joinToken.trim()) return;

    setIsJoining(true);
    setError(null);

    try {
      const response = await teamApi.joinOrganization(joinToken.trim());

      if (response.success) {
        // Refresh the page or redirect to show they're now in the org
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Error joining organization:', err);
      setError(err.message || 'Failed to join organization');
    } finally {
      setIsJoining(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !canInviteMembers()) return;

    setIsInviting(true);
    setError(null);

    try {
      const response = await teamApi.inviteMember(inviteEmail, inviteRole);

      if (response.success) {
        setInviteUrl(response.data.inviteUrl);
        setInviteSuccess(true);

        // Refresh invitations list
        if (canInviteMembers()) {
          const invitationsResponse = await teamApi.getInvitations();
          if (invitationsResponse.success) {
            setInvitations(invitationsResponse.data);
          }
        }
      }
    } catch (err: any) {
      console.error('Error creating invitation:', err);
      setError(err.message || 'Failed to create invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopyInviteUrl = async () => {
    if (!inviteUrl) return;

    try {
      await copyInviteUrl(inviteUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the organization?`)) {
      return;
    }

    try {
      const response = await teamApi.removeMember(memberId);
      if (response.success) {
        // Refresh team members
        await loadTeamData();
      }
    } catch (err: any) {
      console.error('Error removing member:', err);
      setError(err.message || 'Failed to remove member');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await teamApi.cancelInvitation(invitationId);
      if (response.success) {
        // Refresh invitations
        const invitationsResponse = await teamApi.getInvitations();
        if (invitationsResponse.success) {
          setInvitations(invitationsResponse.data);
        }
      }
    } catch (err: any) {
      console.error('Error cancelling invitation:', err);
      setError(err.message || 'Failed to cancel invitation');
    }
  };

  const resetInviteDialog = () => {
    setInviteEmail('');
    setInviteRole('technician');
    setInviteUrl(null);
    setInviteSuccess(false);
    setCopySuccess(false);
    setError(null);
    setShowInviteDialog(false);
  };

  const getStatusBadge = (member: TeamMember) => {
    if (member.isActive) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'owner' ? (
      <Badge variant="outline" className="text-yellow-700 border-yellow-300">
        <Crown className="h-3 w-3 mr-1" />
        Owner
      </Badge>
    ) : (
      <Badge variant="outline">Technician</Badge>
    );
  };

  if (!hasOrganization()) {
    return (
      <div className="space-y-6">
        <div>
          <h3>Team Management</h3>
          <p className="text-muted-foreground">
            Create or join an organization to start collaborating with your team.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started with Team Collaboration</CardTitle>
            <CardDescription>
              Create an organization for your company or join an existing one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Create Organization */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Create Organization</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Start a new organization and invite team members.
                </p>
                <Dialog open={showCreateOrgDialog} onOpenChange={setShowCreateOrgDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Organization
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Organization</DialogTitle>
                      <DialogDescription>
                        Create a new organization to manage assets and collaborate with your team.
                      </DialogDescription>
                    </DialogHeader>

                    {error && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="org-name">Organization Name</Label>
                        <Input
                          id="org-name"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          placeholder="Enter organization name"
                        />
                        {user?.company && orgName !== user.company && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOrgName(user.company)}
                            className="mt-2"
                          >
                            Use Company Name: {user.company}
                          </Button>
                        )}
                      </div>

                      <Alert className="border-blue-200 bg-blue-50">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          You'll be automatically upgraded to a Professional plan and become the organization owner.
                        </AlertDescription>
                      </Alert>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCreateOrgDialog(false);
                            setError(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateOrganization}
                          disabled={!orgName.trim() || isCreatingOrg}
                        >
                          {isCreatingOrg ? 'Creating...' : 'Create Organization'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Join Organization */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Join Organization</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter an invitation token from your team.
                </p>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste invitation token here"
                      value={joinToken}
                      onChange={(e) => setJoinToken(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleJoinOrganization}
                      disabled={!joinToken.trim() || isJoining}
                      className="flex-shrink-0"
                    >
                      {isJoining ? 'Joining...' : 'Join'}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Requires Professional subscription
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip:</strong> If your colleagues already created an organization for {user?.company || 'your company'},
                ask them to send you an invitation token instead of creating a duplicate organization.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3>Team Management</h3>
          <p className="text-muted-foreground">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3>Team Management</h3>
          <p className="text-muted-foreground">
            Invite team members to collaborate on maintenance management.
          </p>
        </div>

        <Dialog open={showInviteDialog} onOpenChange={(open) => {
          if (!open) resetInviteDialog();
          setShowInviteDialog(open);
        }}>
          <DialogTrigger asChild>
            <Button disabled={!canInviteMembers()}>
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                {inviteSuccess
                  ? "Share this invitation token with your team member to join the organization."
                  : "Send an invitation to join your maintenance management team."
                }
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {inviteSuccess && inviteUrl ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Invitation Token</Label>
                  <div className="flex gap-2">
                    <Input
                      value={inviteUrl.split('token=')[1] || inviteUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const token = inviteUrl.split('token=')[1] || inviteUrl;
                        navigator.clipboard.writeText(token);
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      }}
                      className="flex-shrink-0"
                    >
                      {copySuccess ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {copySuccess && (
                    <p className="text-sm text-green-600">Token copied to clipboard!</p>
                  )}
                </div>
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Share this token with your team member. They can paste it in Profile → Team → Join Organization. This invitation will expire in 30 days.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end">
                  <Button onClick={resetInviteDialog}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
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
                  <Label htmlFor="invite-role">Organization Role</Label>
                  <select
                    id="invite-role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="technician">Technician</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={resetInviteDialog}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInvite}
                    disabled={!inviteEmail || isInviting}
                  >
                    {isInviting ? 'Creating...' : 'Create Invitation'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Organization Info */}
      {organization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              {organization.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Team Members</span>
              <span className="text-sm font-medium">{teamMembers.length}</span>
            </div>
            {organization.assetCount !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Assets</span>
                <span className="text-sm font-medium">{organization.assetCount}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations */}
      {canInviteMembers() && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Invitations that haven't been accepted yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Role: {invitation.role} • Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelInvitation(invitation._id)}
                  >
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
            {teamMembers.map((member) => (
              <div key={member._id} className="flex items-center justify-between p-4 border rounded-lg">
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
                      {member._id === user?.id && (
                        <Badge variant="outline" className="text-blue-700 border-blue-300">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.role && (
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(member)}
                  {getRoleBadge(member.organizationRole)}

                  {member._id !== user?.id && canInviteMembers() && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemoveMember(member._id, `${member.firstName} ${member.lastName}`)}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}

            {teamMembers.length === 1 && (
              <div className="text-center py-8 text-muted-foreground">
                <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No other team members yet</p>
                <p className="text-sm">Invite colleagues to collaborate on maintenance management</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
