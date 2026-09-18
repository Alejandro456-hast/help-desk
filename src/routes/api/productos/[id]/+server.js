import { json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

/** @param {{ params: { id: string } }} param0 */
export async function GET({ params }) {
	try {
		const { id } = params;

		if (!id) {
			return json({ error: 'ID de producto requerido' }, { status: 400 });
		}

		/** @type {any} */
		const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);

		if (Array.isArray(rows) && rows.length > 0) {
			return json(rows[0]);
		}

		return json({ error: 'Producto no encontrado' }, { status: 404 });
	} catch (error) {
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
