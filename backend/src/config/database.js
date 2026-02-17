import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;
let SQL = null;

/**
 * Initialize the SQLite database
 * Creates the database file if it doesn't exist, otherwise loads existing one
 */
export async function initializeDatabase() {
  try {
    // Initialize sql.js
    SQL = await initSqlJs();

    const dbPath = path.join(__dirname, '../../database/qa_demo.db');
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../database/seed.sql');

    // Check if database file exists
    const dbExists = fs.existsSync(dbPath);

    if (dbExists) {
      // Load existing database
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
      console.log('✓ Database loaded from file');
    } else {
      // Create new database
      db = new SQL.Database();
      console.log('✓ New database created');

      // Run schema
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema);
        console.log('✓ Database schema created');
      }

      // Run seed data
      if (fs.existsSync(seedPath)) {
        const seedData = fs.readFileSync(seedPath, 'utf8');
        db.exec(seedData);
        console.log('✓ Seed data inserted');
      }

      // Save database to file
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
      console.log('✓ Database saved to file');
    }

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Save database to file (call after write operations)
 */
export function saveDatabase() {
  if (!db) {
    throw new Error('Database not initialized.');
  }

  try {
    const dbPath = path.join(__dirname, '../../database/qa_demo.db');
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (error) {
    console.error('Error saving database:', error);
    throw error;
  }
}

/**
 * Execute a query with parameters
 * @param {string} sql - SQL query string
 * @param {Array} params - Parameters for the query
 * @returns {Array} - Query results
 */
export function query(sql, params = []) {
  const db = getDatabase();

  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();

    return results;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * Execute a write operation (INSERT, UPDATE, DELETE)
 * @param {string} sql - SQL statement
 * @param {Array} params - Parameters for the statement
 * @returns {Object} - Result with lastID and changes
 */
export function run(sql, params = []) {
  const db = getDatabase();

  try {
    db.run(sql, params);

    // Save database after write operation
    saveDatabase();

    // Get last inserted ID if applicable
    const lastIdResult = query('SELECT last_insert_rowid() as lastID');
    const lastID = lastIdResult[0]?.lastID || null;

    return {
      lastID,
      changes: db.getRowsModified()
    };
  } catch (error) {
    console.error('Run error:', error);
    throw error;
  }
}

/**
 * Get the full database schema as a string
 * Useful for providing context to the LLM
 */
export function getSchema() {
  const results = query(`
    SELECT sql FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `);

  return results.map(r => r.sql).join('\n\n');
}

/**
 * Get sample rows from all tables
 * Useful for providing examples to the LLM
 */
export function getSampleData(limit = 2) {
  const tables = query(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `);

  const samples = {};
  for (const { name } of tables) {
    try {
      const rows = query(`SELECT * FROM ${name} LIMIT ${limit}`);
      samples[name] = rows;
    } catch (error) {
      console.error(`Error getting sample data from ${name}:`, error);
      samples[name] = [];
    }
  }

  return samples;
}

export default {
  initializeDatabase,
  getDatabase,
  saveDatabase,
  query,
  run,
  getSchema,
  getSampleData
};
