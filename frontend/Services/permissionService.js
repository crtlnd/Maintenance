// Simple permission service - placeholder for future expansion
// Keeps things simple but forward-compatible

export const PERMISSIONS = {
  // Asset permissions
  CREATE_ASSETS: 'create_assets',
  EDIT_ASSETS: 'edit_assets',
  DELETE_ASSETS: 'delete_assets',
  VIEW_ASSETS: 'view_assets',

  // Team permissions
  INVITE_MEMBERS: 'invite_members',
  REMOVE_MEMBERS: 'remove_members',
  MANAGE_ROLES: 'manage_roles',

  // Organization permissions
  MANAGE_ORG_SETTINGS: 'manage_org_settings',
  DELETE_ORGANIZATION: 'delete_organization',

  // Future: Service provider permissions placeholder
  VIEW_CLIENT_ASSETS: 'view_client_assets',
  EDIT_CLIENT_ASSETS: 'edit_client_assets',
};

export const ROLES = {
  OWNER: 'owner',
  TECHNICIAN: 'technician',
  // Future: SERVICE_PROVIDER: 'service_provider'
};

// Simple role-based permission mapping
const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: [
    // Owners can do everything
    PERMISSIONS.CREATE_ASSETS,
    PERMISSIONS.EDIT_ASSETS,
    PERMISSIONS.DELETE_ASSETS,
    PERMISSIONS.VIEW_ASSETS,
    PERMISSIONS.INVITE_MEMBERS,
    PERMISSIONS.REMOVE_MEMBERS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.MANAGE_ORG_SETTINGS,
    PERMISSIONS.DELETE_ORGANIZATION,
  ],

  [ROLES.TECHNICIAN]: [
    // Technicians can manage assets but not team/org
    PERMISSIONS.CREATE_ASSETS,
    PERMISSIONS.EDIT_ASSETS,
    PERMISSIONS.VIEW_ASSETS,
    // Note: No delete assets, no team management
  ],

  // Future: Service provider role would go here
};

export class PermissionService {
  /**
   * Check if user has a specific permission
   * @param {Object} user - User object with organizationRole
   * @param {string} permission - Permission to check
   * @returns {boolean}
   */
  static hasPermission(user, permission) {
    if (!user || !user.organizationRole) {
      return false;
    }

    const rolePermissions = ROLE_PERMISSIONS[user.organizationRole] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Check if user can perform an action on assets
   * @param {Object} user - User object
   * @param {string} action - Action to check (create, edit, delete, view)
   * @returns {boolean}
   */
  static canManageAssets(user, action = 'view') {
    const permissionMap = {
      create: PERMISSIONS.CREATE_ASSETS,
      edit: PERMISSIONS.EDIT_ASSETS,
      delete: PERMISSIONS.DELETE_ASSETS,
      view: PERMISSIONS.VIEW_ASSETS,
    };

    return this.hasPermission(user, permissionMap[action]);
  }

  /**
   * Check if user can manage team members
   * @param {Object} user - User object
   * @param {string} action - Action to check (invite, remove, manage_roles)
   * @returns {boolean}
   */
  static canManageTeam(user, action = 'invite') {
    const permissionMap = {
      invite: PERMISSIONS.INVITE_MEMBERS,
      remove: PERMISSIONS.REMOVE_MEMBERS,
      manage_roles: PERMISSIONS.MANAGE_ROLES,
    };

    return this.hasPermission(user, permissionMap[action]);
  }

  /**
   * Check if user can manage organization settings
   * @param {Object} user - User object
   * @returns {boolean}
   */
  static canManageOrganization(user) {
    return this.hasPermission(user, PERMISSIONS.MANAGE_ORG_SETTINGS);
  }

  /**
   * Get all permissions for a user's role
   * @param {Object} user - User object
   * @returns {string[]} Array of permissions
   */
  static getUserPermissions(user) {
    if (!user || !user.organizationRole) {
      return [];
    }

    return ROLE_PERMISSIONS[user.organizationRole] || [];
  }

  /**
   * Check if user is organization owner (convenience method)
   * @param {Object} user - User object
   * @returns {boolean}
   */
  static isOwner(user) {
    return user?.organizationRole === ROLES.OWNER;
  }

  /**
   * Check if user is technician (convenience method)
   * @param {Object} user - User object
   * @returns {boolean}
   */
  static isTechnician(user) {
    return user?.organizationRole === ROLES.TECHNICIAN;
  }

  // Future: Service provider permission methods would go here
  /**
   * Placeholder for service provider permissions
   * @param {Object} user - User object
   * @param {Object} clientOrg - Client organization
   * @returns {boolean}
   */
  static canAccessClientAssets(user, clientOrg) {
    // Future implementation for service provider access
    // Would check if user's organization has permission to access clientOrg assets
    return false;
  }
}

// Export convenience functions for use in components
export const hasPermission = PermissionService.hasPermission;
export const canManageAssets = PermissionService.canManageAssets;
export const canManageTeam = PermissionService.canManageTeam;
export const canManageOrganization = PermissionService.canManageOrganization;
export const isOwner = PermissionService.isOwner;
export const isTechnician = PermissionService.isTechnician;

export default PermissionService;
