import { Settings, Zap, Truck, Wrench } from 'lucide-react';

export function getConditionColor(condition: string) {
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

export function getRPNColor(rpn: number) {
  if (rpn >= 150) return "bg-red-100 text-red-800";
  if (rpn >= 100) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
}

export function getStatusColor(status: string) {
  switch (status) {
    case "Complete":
    case "completed":
      return "bg-green-100 text-green-800";
    case "In Progress":
    case "scheduled":
      return "bg-blue-100 text-blue-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getUrgencyColor(urgencyScore: number) {
  if (urgencyScore >= 90) return "bg-red-100 text-red-800";
  if (urgencyScore >= 70) return "bg-orange-100 text-orange-800";
  if (urgencyScore >= 50) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
}

export function getProviderTypeColor(type: string) {
  switch (type) {
    case "dealer":
      return "bg-blue-100 text-blue-800";
    case "specialized":
      return "bg-purple-100 text-purple-800";
    case "fleet":
      return "bg-green-100 text-green-800";
    case "independent":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getPricingColor(pricing: string) {
  switch (pricing) {
    case "budget":
      return "bg-green-100 text-green-800";
    case "mid-range":
      return "bg-yellow-100 text-yellow-800";
    case "premium":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getProviderTypeIcon(type: string) {
  switch (type) {
    case "dealer":
      return Settings;
    case "specialized":
      return Zap;
    case "fleet":
      return Truck;
    case "independent":
      return Wrench;
    default:
      return Settings;
  }
}