import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Calendar,
  Building,
  Wrench,
  MessageSquare
} from 'lucide-react';
import { MaintenanceRequest } from '../../types';
import { initialMaintenanceRequests } from '../../data/initialData';

export function ServiceRequestsView() {
  const [requests] = useState<MaintenanceRequest[]>(initialMaintenanceRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getRequestsByStatus = (status: string) => {
    if (status === 'available') {
      return filteredRequests.filter(req => req.status === 'open');
    }
    if (status === 'active') {
      return filteredRequests.filter(req => ['quoted', 'accepted', 'in-progress'].includes(req.status));
    }
    if (status === 'completed') {
      return filteredRequests.filter(req => req.status === 'completed');
    }
    return filteredRequests;
  };

  const handleQuoteRequest = (requestId: number) => {
    // This would handle sending a quote
    console.log('Quote request for:', requestId);
  };

  const handleAcceptRequest = (requestId: number) => {
    // This would handle accepting a request
    console.log('Accept request:', requestId);
  };

  const RequestCard = ({ request }: { request: MaintenanceRequest }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{request.assetName}</CardTitle>
            <CardDescription>
              {request.customerCompany} • {request.customerName}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getPriorityColor(request.priority)}>
              {request.priority === 'urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
            </Badge>
            <Badge className={getStatusColor(request.status)}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Wrench className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Service Type:</span>
                <span className="ml-1 font-medium">{request.serviceType}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="ml-1">{request.assetLocation}</span>
              </div>
              <div className="flex items-center text-sm">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Budget:</span>
                <span className="ml-1">{request.budget}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Requested:</span>
                <span className="ml-1">{formatDate(request.requestDate)}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Preferred:</span>
                <span className="ml-1">{formatDate(request.preferredDate)}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Contact:</span>
                <span className="ml-1">{request.contactInfo.phone}</span>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">Description:</p>
            <p className="text-sm">{request.description}</p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-1" />
                Contact
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
            </div>
            <div className="flex space-x-2">
              {request.status === 'open' && (
                <Button 
                  size="sm" 
                  onClick={() => handleQuoteRequest(request.id)}
                >
                  Send Quote
                </Button>
              )}
              {request.status === 'quoted' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAcceptRequest(request.id)}
                >
                  Accept
                </Button>
              )}
              {request.status === 'in-progress' && (
                <Button size="sm" variant="outline">
                  Update Status
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Service Requests</h1>
          <p className="text-muted-foreground">
            Browse and manage maintenance opportunities from customers.
          </p>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by customer, company, asset, or service type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs for different request categories */}
      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">
            Available ({getRequestsByStatus('available').length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({getRequestsByStatus('active').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({getRequestsByStatus('completed').length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({filteredRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div>
            {getRequestsByStatus('available').length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3>No Available Requests</h3>
                  <p className="text-muted-foreground">
                    There are currently no open maintenance requests matching your filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              getRequestsByStatus('available').map(request => (
                <RequestCard key={request.id} request={request} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div>
            {getRequestsByStatus('active').length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3>No Active Requests</h3>
                  <p className="text-muted-foreground">
                    You don't have any active service requests at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              getRequestsByStatus('active').map(request => (
                <RequestCard key={request.id} request={request} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div>
            {getRequestsByStatus('completed').length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3>No Completed Requests</h3>
                  <p className="text-muted-foreground">
                    Your completed service requests will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              getRequestsByStatus('completed').map(request => (
                <RequestCard key={request.id} request={request} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div>
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3>No Requests Found</h3>
                  <p className="text-muted-foreground">
                    No maintenance requests match your current search and filter criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}