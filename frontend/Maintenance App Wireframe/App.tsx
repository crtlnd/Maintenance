import React from 'react';
import { Bell, Plus, LogOut, Settings, Wrench } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { Separator } from './components/ui/separator';

// Mock data for the asset table
const mockAssets = [
  {
    id: 1,
    name: "Truck #001",
    type: "Vehicle",
    location: "Houston Depot",
    condition: "Good",
    lastMaintenance: "2024-01-15"
  },
  {
    id: 2,
    name: "Generator A2",
    type: "Equipment",
    location: "Site B",
    condition: "Fair",
    lastMaintenance: "2024-01-10"
  },
  {
    id: 3,
    name: "Compressor #5",
    type: "Equipment",
    location: "Warehouse",
    condition: "Needs Attention",
    lastMaintenance: "2023-12-20"
  },
  {
    id: 4,
    name: "Truck #007",
    type: "Vehicle",
    location: "Dallas Depot",
    condition: "Good",
    lastMaintenance: "2024-01-18"
  }
];

function AppSidebar() {
  const menuItems = [
    { title: "Assets", icon: Settings },
    { title: "FMEA", icon: Settings },
    { title: "RCA", icon: Settings },
    { title: "RCM", icon: Settings },
    { title: "Providers", icon: Settings }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6" />
          <span className="font-medium">Maintenance App</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton>
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

function getConditionColor(condition: string) {
  switch (condition) {
    case "Good":
      return "bg-green-100 text-green-800";
    case "Fair":
      return "bg-yellow-100 text-yellow-800";
    case "Needs Attention":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function App() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-background px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-medium">Asset Management</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>TT</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Tommy's Trucking</span>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground justify-start">
                      <LogOut className="h-3 w-3 mr-1" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="flex gap-6 p-6">
              {/* Main Content */}
              <div className="flex-1 space-y-6">
                {/* Add Asset Button */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">Assets</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </div>

                {/* Asset Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Asset Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Last Maintenance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockAssets.map((asset) => (
                          <TableRow key={asset.id}>
                            <TableCell className="font-medium">{asset.name}</TableCell>
                            <TableCell>{asset.type}</TableCell>
                            <TableCell>{asset.location}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={getConditionColor(asset.condition)}>
                                {asset.condition}
                              </Badge>
                            </TableCell>
                            <TableCell>{asset.lastMaintenance}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Notification Area */}
              <div className="w-80">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Provider Messages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                      <p className="text-sm font-medium">New message from Houston Mechanics</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Service reminder for Truck #001 due next week
                      </p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="border-l-4 border-yellow-500 pl-4 py-2">
                      <p className="text-sm font-medium">Parts availability update</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Oil filters now in stock at Dallas location
                      </p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <p className="text-sm font-medium">Maintenance completed</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Generator A2 service finished ahead of schedule
                      </p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}