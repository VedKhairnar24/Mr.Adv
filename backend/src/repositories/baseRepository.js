const db = require('../../config/db');
const logger = require('../config/logger');

/**
 * Base Repository Pattern
 * Provides common CRUD operations for all repositories
 */
class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * Find record by ID
   */
  async findById(id) {
    try {
      const [rows] = await db.promise.query(
        `SELECT * FROM ${this.tableName} WHERE id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error finding ${this.tableName} by ID:`, error);
      throw error;
    }
  }

  /**
   * Find all records with optional filters
   */
  async findAll(filters = {}, options = {}) {
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      const values = [];
      const conditions = [];

      // Build WHERE clause from filters
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          conditions.push(`${key} = ?`);
          values.push(filters[key]);
        }
      });

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      // Apply ordering
      if (options.orderBy) {
        query += ` ORDER BY ${options.orderBy}`;
      } else {
        query += ' ORDER BY created_at DESC';
      }

      // Apply limit and offset
      if (options.limit) {
        query += ' LIMIT ?';
        values.push(options.limit);
      }

      if (options.offset) {
        query += ' OFFSET ?';
        values.push(options.offset);
      }

      const [rows] = await db.promise.query(query, values);
      return rows;
    } catch (error) {
      logger.error(`Error finding all ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');

      const query = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
      const [result] = await db.promise.query(query, values);

      return {
        id: result.insertId,
        ...data,
      };
    } catch (error) {
      logger.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update a record by ID
   */
  async update(id, data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map((key) => `${key} = ?`).join(', ');

      const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
      const [result] = await db.promise.query(query, [...values, id]);

      if (result.affectedRows === 0) {
        return null;
      }

      return this.findById(id);
    } catch (error) {
      logger.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id) {
    try {
      const [result] = await db.promise.query(
        `DELETE FROM ${this.tableName} WHERE id = ?`,
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Count records with optional filters
   */
  async count(filters = {}) {
    try {
      let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const values = [];
      const conditions = [];

      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          conditions.push(`${key} = ?`);
          values.push(filters[key]);
        }
      });

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      const [rows] = await db.promise.query(query, values);
      return rows[0].count;
    } catch (error) {
      logger.error(`Error counting ${this.tableName}:`, error);
      throw error;
    }
  }
}

module.exports = BaseRepository;
