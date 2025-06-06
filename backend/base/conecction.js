import dotenv from 'dotenv';
dotenv.config();

import sqlite3 from 'sqlite3';

const db = new sqlite3.Database(process.env.DATABASE_FILE);

export { db };
