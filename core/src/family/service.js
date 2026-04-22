/**
 * Multi-Family Namespace Service
 * Implements family isolation for uDos
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

class FamilyService {
  /**
   * Create a new family namespace
   * @param {string} name - Family name
   * @param {string} ownerId - Owner user ID
   * @returns {Promise<Object>} Created family
   */
  async createFamily(name, ownerId) {
    const familyId = `fam_${uuidv4()}`;
    
    await db.execute(
      `INSERT INTO families (id, name, owner_id, created_at, updated_at) 
       VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
      [familyId, name, ownerId]
    );
    
    return this.getFamily(familyId);
  }
  
  /**
   * Get family by ID
   * @param {string} familyId - Family ID
   * @returns {Promise<Object>} Family object
   */
  async getFamily(familyId) {
    return db.fetchOne(
      `SELECT * FROM families WHERE id = ?`,
      [familyId]
    );
  }
  
  /**
   * List all families for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of family objects
   */
  async listFamilies(userId) {
    return db.fetchAll(
      `SELECT f.* FROM families f 
       JOIN family_members fm ON f.id = fm.family_id 
       WHERE fm.user_id = ? 
       ORDER BY f.name`,
      [userId]
    );
  }
  
  /**
   * Add member to family
   * @param {string} familyId - Family ID
   * @param {string} userId - User ID
   * @param {string} role - Member role (admin, member, viewer)
   * @returns {Promise<Object>} Family membership
   */
  async addFamilyMember(familyId, userId, role = 'member') {
    await db.execute(
      `INSERT INTO family_members (family_id, user_id, role, joined_at) 
       VALUES (?, ?, ?, datetime('now'))`,
      [familyId, userId, role]
    );
    
    return this.getFamilyMembership(familyId, userId);
  }
  
  /**
   * Get family membership
   * @param {string} familyId - Family ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Membership object
   */
  async getFamilyMembership(familyId, userId) {
    return db.fetchOne(
      `SELECT * FROM family_members 
       WHERE family_id = ? AND user_id = ?`,
      [familyId, userId]
    );
  }
  
  /**
   * Check if user has access to family
   * @param {string} familyId - Family ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if user has access
   */
  async checkFamilyAccess(familyId, userId) {
    const result = await db.fetchOne(
      `SELECT 1 FROM family_members 
       WHERE family_id = ? AND user_id = ?`,
      [familyId, userId]
    );
    return !!result;
  }
  
  /**
   * Get user's role in family
   * @param {string} familyId - Family ID
   * @param {string} userId - User ID
   * @returns {Promise<string>} User's role
   */
  async getUserRole(familyId, userId) {
    const result = await db.fetchOne(
      `SELECT role FROM family_members 
       WHERE family_id = ? AND user_id = ?`,
      [familyId, userId]
    );
    return result?.role || null;
  }
  
  /**
   * Middleware for family isolation
   * @param {string} familyId - Family ID
   * @returns {Function} Express middleware
   */
  familyIsolationMiddleware(familyId) {
    return async (req, res, next) => {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const hasAccess = await this.checkFamilyAccess(familyId, userId);
      
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Access denied to family',
          family_id: familyId
        });
      }
      
      // Attach family context to request
      req.family = { id: familyId };
      req.familyRole = await this.getUserRole(familyId, userId);
      
      next();
    };
  }
  
  /**
   * Generate compartment path for family
   * @param {string} familyId - Family ID
   * @param {string} namespace - Optional namespace
   * @returns {string} Compartment path
   */
  getCompartmentPath(familyId, namespace = null) {
    if (namespace) {
      return `family/${familyId}/${namespace}`;
    }
    return `family/${familyId}`;
  }
}

module.exports = new FamilyService();