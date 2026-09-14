import { json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function GET() {
	try {
		const [rows] = await pool.query('SELECT * FROM productos ORDER BY creado_en DESC');
		return json(rows);
	} catch (error) {
		return json({ error: 'Error al obtener productos' }, { status: 500 });
	}
}

/** @param {{ request: Request }} param0 */
export async function POST({ request }) {
	try {
		const { nombre, descripcion, precio, stock } = await request.json();

		if (!nombre || precio === undefined || stock === undefined) {
			return json({ error: 'Faltan campos obligatorios' }, { status: 400 });
		}
		if (precio < 0 || stock < 0) {
			return json({ error: 'El precio y stock no pueden ser negativos' }, { status: 400 });
		}

		/** @type {any} */
		const [result] = await pool.query(
			'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)',
			[nombre, descripcion, precio, stock]
		);

		return json({ id: result.insertId, mensaje: 'Producto creado exitosamente' }, { status: 201 });
	} catch (/** @type {any} */ error) {
		if (error && error.code === 'ER_DUP_ENTRY') {
			return json({ error: 'El producto ya existe (nombre duplicado)' }, { status: 409 });
		}
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
