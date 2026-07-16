const path = require('path');
const Database = require('better-sqlite3');
const { drizzle } = require('drizzle-orm/better-sqlite3');

// Import schema from src/db
const { patients, doctors, membershipPlans, members, appointments, revenueTransactions } = require('./src/db/schema');

const dbPath = path.join(__dirname, 'hospital.db'); // your existing DB
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

module.exports = db;
