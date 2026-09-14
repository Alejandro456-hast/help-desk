import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: '', // Asegúrate de configurar la clave correcta
	database: 'svelte_store',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});
