import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';

export const pool = mysql.createPool({
	host: env.DB_HOST || process.env.DB_HOST || 'localhost',
	user: env.DB_USER || process.env.DB_USER || 'root',
	password: env.DB_PASSWORD || process.env.DB_PASSWORD || '',
	database: env.DB_NAME || process.env.DB_NAME || 'svelte_store',
	port: Number(env.DB_PORT || process.env.DB_PORT) || 3306,
	ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});
