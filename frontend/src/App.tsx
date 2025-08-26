import React, { useState } from "react";
import { Wrench, Shapes, Users, ClipboardList, Bot } from "lucide-react";
import caseyUptimeLogo from "figma:asset/b0281f1af0d4ecb0182aeab92b8439ecbadd5431.png";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarFooter,
} from "./components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Button } from "./components/ui/button";
import { CurrentView, ServiceProviderView, AdminView, MaintenanceTask } from "./types";
import {
  initialAssets,
  initialFMEAData,
  initialRCAData,
  initialMaintenanceData,
  initialServiceProviders,
} from "./data/initialData";
import { TaskListView } from "./components/views/TaskListView";
import { AssetsView } from "./components/views/AssetsView";
import { AssetDetailView } from "./components/views/AssetDetailView";
import { ProvidersView } from "./components/views/ProvidersView";
import { AccountView } from "./components/views/AccountView";
import { ServiceProviderDashboardView } from "./components/views/ServiceProviderDashboardView";
import { ServiceRequestsView } from "./components/views/ServiceRequestsView";
import { ServiceProviderProfileView } from "./components/views/ServiceProviderProfileView";
import { AdminDashboardView } from "./components/views/AdminDashboardView";
import { AdminUsersView } from "./components/views/AdminUsersView";
import { AdminPaymentsView } from "./components/views/AdminPaymentsView";
import { AdminMatchingView } from "./components/views/AdminMatchingView";
import { AdminAnalyticsView } from "./components/views/AdminAnalyticsView";
import { ServiceProviderSidebar } from "./components/ServiceProviderSidebar";
import { AdminSidebar } from "./components/AdminSidebar";
import { AuthPage } from "./components/auth/AuthPage";
import { LandingPage } from "./components/LandingPage";
import { LandingPageDemo } from "./components/LandingPageDemo";
import { AuthProvider, useAuth } from "./utils/auth";
import { NotificationService, getResponsiblePersonContact } from "./utils/notifications";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";
import { AIAssistantView } from "./components/views/AIAssistantView";
import { SEOHead, generateAssetManagementSEO, generateProviderListingSEO } from "./utils/seo";

function AppSidebar({
  currentView,
  onViewChange,
}: {
  currentView: CurrentView;
  onViewChange: (view: CurrentView) => void;
}) {
  const { user } = useAuth();
  const baseMenuItems = [
    {
      title: "Asset Dashboard",
      icon: Shapes,
      key: "assets" as CurrentView,
    },
    {
      title: "Task List",
      icon: ClipboardList,
      key: "tasks" as CurrentView,
    },
    {
      title: "AI Assistant",
      icon: Bot,
      key: "ai-assistant" as CurrentView,
    },
    {
      title: "Service Providers",
      icon: Users,
      key: "providers" as CurrentView,
    },
  ];
  const menuItems = user?.userType === "customer" ? baseMenuItems : [
    {
      title: "Asset Dashboard",
      icon: Shapes,
      key: "assets" as CurrentView,
    },
    {
      title: "Task List",
      icon: ClipboardList,
      key: "tasks" as CurrentView,
    },
    {
      title: "Service Providers",
      icon: Users,
      key: "providers" as CurrentView,
    },
  ];
  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center">
          <img src={caseyUptimeLogo} alt="Casey Uptime" className="h-12 w-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={currentView === item.key}
                onClick={() => onViewChange(item.key)}
                className="w-full justify-start relative"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
                {item.key === "ai-assistant" && user?.subscription.plan !== "ai-powered" && (
                  <div className="ml-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    Pro
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={currentView === "account"}
            onClick={() => onViewChange("account")}
            className="w-full justify-start"
          >
            <div className="flex items-center gap-2 flex-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xs">
                  {user?.firstName[0]}{user?.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.role}
                </span>
              </div>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}

function MainApp() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<CurrentView>("assets");
  const [serviceProviderView, setServiceProviderView] = useState<ServiceProviderView>("dashboard");
  const [adminView, setAdminView] = useState<AdminView>("dashboard");
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [assets, setAssets] = useState(initialAssets);
  const [fmeaData, setFmeaData] = useState(initialFMEAData);
  const [rcaData, setRcaData] = useState(initialRCAData);
  const [maintenanceData, setMaintenanceData] = useState(initialMaintenanceData);
  const [serviceProviders] = useState(initialServiceProviders);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [showLandingPageDemo, setShowLandingPageDemo] = useState(false);

  const getSEOData = () => {
    if (!isAuthenticated && !showAuthPage) {
      return {
        title: "Casey Uptime - Modern Maintenance Management Software",
        description: "Stop reactive maintenance. Reduce downtime by 45% with smart asset management, preventive scheduling, and AI-powered insights. Start free - no credit card required.",
        keywords: "maintenance management software, preventive maintenance, asset management, CMMS, maintenance scheduling, equipment tracking, maintenance optimization",
      };
    }
    if (!isAuthenticated && showAuthPage) {
      return {
        title: "Login & Signup | Casey Uptime",
        description: "Sign in to your maintenance management account or create a new account to get started with professional asset management.",
        keywords: "login, signup, maintenance management, asset management, account creation",
      };
    }
    switch (currentView) {
      case "assets":
        return generateAssetManagementSEO();
      case "providers":
        return generateProviderListingSEO();
      case "tasks":
        return {
          title: "Maintenance Tasks & Work Orders | Maintenance Manager",
          description: "Manage maintenance tasks, work orders, and preventive maintenance schedules efficiently. Track progress and optimize workflow.",
          keywords: "maintenance tasks, work orders, preventive maintenance, task management, maintenance scheduling",
        };
      case "ai-assistant":
        return {
          title: "AI-Powered Maintenance Assistant | Maintenance Manager",
          description: "Get intelligent maintenance recommendations, predictive analysis, and automated insights with our advanced AI assistant.",
          keywords: "AI maintenance, predictive maintenance, intelligent recommendations, automated analysis, maintenance AI",
        };
      case "account":
        return {
          title: "Account Settings & Subscription | Maintenance Manager",
          description: "Manage your account settings, subscription plans, and billing information for Maintenance Manager platform.",
          keywords: "account settings, subscription, billing, profile management",
          noIndex: true,
        };
      default:
        return generateAssetManagementSEO();
    }
  };

  if (showLandingPageDemo) {
    return (
      <>
        <SEOHead
          title="Casey Uptime - Modern Maintenance Management Software"
          description="Stop reactive maintenance. Reduce downtime by 45% with smart asset management, preventive scheduling, and AI-powered insights. Start free - no credit card required."
          keywords="maintenance management software, preventive maintenance, asset management, CMMS, maintenance scheduling, equipment tracking, maintenance optimization"
        />
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => setShowLandingPageDemo(false)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Exit Demo Mode
          </Button>
        </div>
        <LandingPageDemo />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <SEOHead
          title="Loading... | Casey Uptime"
          description="Professional maintenance management platform loading."
          noIndex={true}
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <img src={caseyUptimeLogo} alt="Casey Uptime" className="h-12 w-auto" />
            <span>Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    if (showAuthPage) {
      return (
        <>
          <SEOHead {...getSEOData()} />
          <AuthPage />
        </>
      );
    }
    return (
      <>
        <SEOHead {...getSEOData()} />
        <LandingPage
          onGetStarted={() => setShowAuthPage(true)}
          onLogin={() => setShowAuthPage(true)}
        />
      </>
    );
  }

  const DemoModeButton = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setShowLandingPageDemo(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
      >
        🚀 Preview Landing Page
      </Button>
    </div>
  );

  if (user?.userType === "admin") {
    return (
      <>
        <SEOHead
          title="Admin Dashboard | Maintenance Manager"
          description="Administrative panel for managing users, service providers, and platform analytics."
          keywords="admin dashboard, user management, platform administration"
          noIndex={true}
        />
        <SidebarProvider>
          <div className="flex h-screen w-full">
            <AdminSidebar
              currentView={adminView}
              onViewChange={setAdminView}
            />
            <main className="flex-1 overflow-auto">
              {adminView === "dashboard" && <AdminDashboardView />}
              {adminView === "users" && <AdminUsersView />}
              {adminView === "providers" && <AdminUsersView />}
              {adminView === "payments" && <AdminPaymentsView />}
              {adminView === "matching" && <AdminMatchingView />}
              {adminView === "analytics" && <AdminAnalyticsView />}
              {adminView === "account" && <AccountView />}
            </main>
          </div>
        </SidebarProvider>
        <DemoModeButton />
      </>
    );
  }

  if (user?.userType === "service_provider") {
    const getServiceProviderSEO = () => {
      switch (serviceProviderView) {
        case "dashboard":
          return {
            title: "Service Provider Dashboard | Maintenance Manager",
            description: "Manage your maintenance service business, view requests, and track performance on the Maintenance Manager platform.",
            keywords: "service provider dashboard, maintenance business, service requests, business management",
          };
        case "requests":
          return {
            title: "Service Requests & Opportunities | Maintenance Manager",
            description: "View and respond to maintenance service requests from local businesses. Grow your maintenance service business.",
            keywords: "service requests, maintenance opportunities, business leads, service provider",
          };
        case "profile":
          return {
            title: "Service Provider Profile | Maintenance Manager",
            description: "Manage your service provider profile, certifications, service areas, and business information.",
            keywords: "service provider profile, business profile, certifications, service areas",
          };
        default:
          return {
            title: "Service Provider Portal | Maintenance Manager",
            description: "Professional portal for maintenance service providers to manage business and connect with customers.",
            keywords: "service provider portal, maintenance services, business management",
          };
      }
    };
    return (
      <>
        <SEOHead {...getServiceProviderSEO()} noIndex={true} />
        <SidebarProvider>
          <div className="flex h-screen w-full">
            <ServiceProviderSidebar
              currentView={serviceProviderView}
              onViewChange={setServiceProviderView}
            />
            <main className="flex-1 overflow-auto">
              {serviceProviderView === "dashboard" && <ServiceProviderDashboardView />}
              {serviceProviderView === "requests" && <ServiceRequestsView />}
              {serviceProviderView === "profile" && <ServiceProviderProfileView />}
              {serviceProviderView === "account" && <AccountView />}
            </main>
          </div>
        </SidebarProvider>
        <DemoModeButton />
      </>
    );
  }

  const getActiveView = (): CurrentView => {
    if (selectedAssetId && currentView !== "account") {
      return "assets";
    }
    return currentView;
  };

  const handleViewChange = (view: CurrentView) => {
    setCurrentView(view);
    setSelectedAssetId(null);
  };

  const handleSelectAsset = (assetId: number) => {
    setSelectedAssetId(assetId);
    setCurrentView("assets");
  };

  const handleBack = () => {
    setSelectedAssetId(null);
  };

  const handleAddAsset = (asset: any) => {
    const newId = Math.max(...assets.map((a) => a.id), 0) + 1;
    const newAsset = { ...asset, id: newId };
    setAssets((prev) => [...prev, newAsset]);
    return newId;
  };

  const handleEditAsset = (updatedAsset: any) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === updatedAsset.id ? updatedAsset : asset,
      ),
    );
  };

  const handleAddFMEA = (newFMEAEntries: any[]) => {
    const entriesWithIds = newFMEAEntries.map((entry, index) => ({
      ...entry,
      id: Math.max(...fmeaData.map((f) => f.id), 0) + index + 1,
    }));
    setFmeaData((prev) => [...prev, ...entriesWithIds]);
  };

  const handleAddMaintenanceTask = (newTasks: any[]) => {
    const tasksWithIds = newTasks.map((task, index) => ({
      ...task,
      id: Math.max(...maintenanceData.map((m) => m.id), 0) + index + 1,
    }));
    setMaintenanceData((prev) => [...prev, ...tasksWithIds]);
  };

  const handleAddSingleMaintenanceTask = async (newTask: any) => {
    const taskId = Math.max(...maintenanceData.map((m) => m.id), 0) + 1;
    const task = { ...newTask, id: taskId };
    setMaintenanceData((prev) => [...prev, task]);
    const asset = assets.find((a) => a.id === task.assetId);
    if (asset) {
      const notificationService = NotificationService.getInstance();
      const email = task.responsibleEmail;
      const phone = task.responsiblePhone;
      try {
        const result = await notificationService.notifyTaskAssignment(
          task,
          asset,
          email || "",
          phone || "",
        );
        const updatedTask = {
          ...task,
          notificationsSent: {
            email: result.emailSent,
            sms: result.smsSent,
            sentAt: new Date().toISOString(),
          },
        };
        setMaintenanceData((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t)),
        );
        if (result.emailSent || result.smsSent) {
          toast.success(
            `Task assigned successfully! ${result.emailSent ? "Email" : ""}${result.emailSent && result.smsSent ? " and " : ""}${result.smsSent ? "SMS" : ""} notification${result.emailSent && result.smsSent ? "s" : ""} sent to ${task.responsible}.`,
          );
        } else {
          toast.warning(
            "Task assigned, but notifications could not be sent. Please check contact information.",
          );
        }
      } catch (error) {
        console.error("Error sending notifications:", error);
        toast.error(
          "Task assigned, but there was an error sending notifications.",
        );
      }
    }
  };

  const handleCompleteTask = async (
    taskId: number,
    completionData: { completedBy: string; completionNotes: string; completedAt: string },
  ) => {
    const updatedTask: Partial<MaintenanceTask> = {
      status: "completed",
      ...completionData,
    };
    setMaintenanceData((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, ...updatedTask } : task,
      ),
    );
    const task = maintenanceData.find((t) => t.id === taskId);
    const asset = assets.find((a) => a.id === task?.assetId);
    if (task && asset) {
      const notificationService = NotificationService.getInstance();
      try {
        await notificationService.notifyTaskCompletion(
          { ...task, ...updatedTask } as MaintenanceTask,
          asset,
          completionData.completedBy,
          "supervisor@company.com",
          "+1-555-0199",
        );
        toast.success(`Task completed! Supervisor has been notified.`);
      } catch (error) {
        console.error("Error sending completion notification:", error);
        toast.warning("Task completed, but notification could not be sent.");
      }
    }
  };

  const handleAddRCA = (newRCA: any) => {
    const rcaId = Math.max(...rcaData.map((r) => r.id), 0) + 1;
    const rca = { ...newRCA, id: rcaId };
    setRcaData((prev) => [...prev, rca]);
  };

  const renderContent = () => {
    if (currentView === "account") {
      return <AccountView />;
    }
    if (selectedAssetId) {
      const asset = assets.find((a) => a.id === selectedAssetId);
      if (!asset) return null;
      return (
        <AssetDetailView
          asset={asset}
          fmeaData={fmeaData}
          rcaData={rcaData}
          maintenanceData={maintenanceData}
          defaultTab="overview"
          onBack={handleBack}
          onAddRCA={handleAddRCA}
          onAddMaintenanceTask={handleAddSingleMaintenanceTask}
          onEditAsset={handleEditAsset}
          onAddFMEA={handleAddFMEA}
        />
      );
    }
    switch (currentView) {
      case "assets":
        return (
          <AssetsView
            assets={assets}
            onAddAsset={handleAddAsset}
            onSelectAsset={handleSelectAsset}
            onAddFMEA={handleAddFMEA}
            onAddMaintenanceTask={handleAddMaintenanceTask}
            onAddSingleMaintenanceTask={handleAddSingleMaintenanceTask}
            onEditAsset={handleEditAsset}
          />
        );
      case "tasks":
        return (
          <TaskListView
            assets={assets}
            maintenanceData={maintenanceData}
            onSelectAsset={handleSelectAsset}
            onCompleteTask={handleCompleteTask}
            onAddMaintenanceTask={handleAddSingleMaintenanceTask}
          />
        );
      case "providers":
        return <ProvidersView providers={serviceProviders} />;
      case "ai-assistant":
        if (user?.subscription.plan === "ai-powered") {
          return (
            <AIAssistantView
              assets={assets}
              maintenanceData={maintenanceData}
            />
          );
        } else {
          const { AIAssistantUpgradeView } = require("./components/views/AIAssistantUpgradeView");
          return (
            <AIAssistantUpgradeView
              currentPlan={user?.subscription.plan || "free"}
            />
          );
        }
      default:
        return (
          <div className="p-6">
            <h2>{currentView} View</h2>
            <p className="text-muted-foreground">This view is under construction.</p>
          </div>
        );
    }
  };

  return (
    <>
      <SEOHead {...getSEOData()} />
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar
            currentView={getActiveView()}
            onViewChange={handleViewChange}
          />
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </SidebarProvider>
      <DemoModeButton />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
      <Toaster />
    </AuthProvider>
  );
}
