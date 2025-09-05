const User = require('../../../models/user');

/**
 * Get asset query with organization permissions
 * @param {string} userId - The authenticated user's ID
 * @param {Object} additionalQuery - Additional query parameters to merge
 * @returns {Promise<Object>} Query object for asset operations
 */
async function getAssetQuery(userId, additionalQuery = {}) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  let baseQuery = { ...additionalQuery };

  if (user.organizationId) {
    // If user is part of an organization, allow access to assets from all organization members
    const orgMembers = await User.find({ organizationId: user.organizationId }).select('_id');
    const memberIds = orgMembers.map(member => member._id);
    baseQuery.userId = { $in: memberIds };
  } else {
    // If user is not in an organization, only show their own assets
    baseQuery.userId = userId;
  }

  return baseQuery;
}

/**
 * Get user query for dashboard/statistics with organization permissions
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Object>} Query object for user-based operations
 */
async function getUserQuery(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.organizationId) {
    // If user is part of an organization, include all organization members
    const orgMembers = await User.find({ organizationId: user.organizationId }).select('_id');
    const memberIds = orgMembers.map(member => member._id);
    return { userId: { $in: memberIds } };
  } else {
    // If user is not in an organization, only include their own data
    return { userId };
  }
}

/**
 * Check if user can delete a specific asset (owner only)
 * @param {string} userId - The authenticated user's ID
 * @param {number} assetId - The asset ID to check
 * @returns {Promise<Object>} Query object for delete operations
 */
function getDeleteAssetQuery(userId, assetId) {
  // For security, only allow users to delete their own assets, even in organizations
  return { id: assetId, userId };
}

module.exports = {
  getAssetQuery,
  getUserQuery,
  getDeleteAssetQuery
};

