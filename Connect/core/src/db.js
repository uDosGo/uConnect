/**
 * Database Module for uDos Core
 * SQLite database wrapper with promise-based API
 */

import sqlite3 from 'sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Database configuration - use relative path from project root
const DB_PATH = resolve(process.cwd(), 'udos.db');

// Create database connection pool
const db = new sqlite3.Database(DB_PATH);

/**
 * Execute SQL query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<void>}
 */
export async function execute(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Fetch single row
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} Single row or null
 */
export async function fetchOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
}

/**
 * Fetch all rows
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Array of rows
 */
export async function fetchAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

/**
 * Begin transaction
 * @returns {Promise<void>}
 */
export async function beginTransaction() {
  return execute('BEGIN TRANSACTION');
}

/**
 * Commit transaction
 * @returns {Promise<void>}
 */
export async function commitTransaction() {
  return execute('COMMIT');
}

/**
 * Rollback transaction
 * @returns {Promise<void>}
 */
export async function rollbackTransaction() {
  return execute('ROLLBACK');
}

/**
 * Close database connection
 * @returns {Promise<void>}
 */
export async function close() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

const dbModule = {
  execute,
  fetchOne,
  fetchAll,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  close
};

export default dbModule;