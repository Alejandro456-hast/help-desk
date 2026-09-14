import { json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

/** @param {{ url: URL }} param0 */
export async function GET({ url }) {
	try {
		const ticket = url.searchParams.get('ticket');

		if (ticket) {
			/** @type {any} */
			const [rows] = await pool.query(
				`SELECT r.*, p.nombre as producto_nombre 
                 FROM reclamos r 
                 JOIN productos p ON r.producto_id = p.id 
                 WHERE r.ticket = ?`,
				[ticket.trim().toUpperCase()]
			);

			if (Array.isArray(rows) && rows.length > 0) {
				return json(rows[0]);
			}
			return json(
				{ error: 'No se encontró ningún reclamo con ese número de ticket.' },
				{ status: 404 }
			);
		}

		/** @type {any} */
		const [rows] = await pool.query(`
            SELECT r.*, p.nombre as producto_nombre 
            FROM reclamos r 
            JOIN productos p ON r.producto_id = p.id 
            ORDER BY r.creado_en DESC
        `);
		return json(rows);
	} catch (error) {
		return json({ error: 'Error al obtener reclamos' }, { status: 500 });
	}
}

/** @param {{ request: Request }} param0 */
export async function POST({ request }) {
	try {
		const { producto_id, email_cliente, asunto, mensaje } = await request.json();

		if (!producto_id || !email_cliente || !asunto || !mensaje) {
			return json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
		}

		/** @type {any} */
		const [existing] = await pool.query(
			`SELECT id FROM reclamos 
             WHERE producto_id = ? AND email_cliente = ? AND mensaje = ? 
             AND creado_en > (NOW() - INTERVAL 1 HOUR)`,
			[producto_id, email_cliente, mensaje]
		);

		if (Array.isArray(existing) && existing.length > 0) {
			return json(
				{
					error:
						'Reclamo duplicado detectado. Por favor, evita enviar el mismo mensaje repetidas veces.'
				},
				{ status: 429 }
			);
		}

		// Generar código de ticket único (ej: TK-A7B2X9)
		const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
		const ticket = `TK-${randomStr}`;

		/** @type {any} */
		const [result] = await pool.query(
			'INSERT INTO reclamos (ticket, producto_id, email_cliente, asunto, mensaje, estado) VALUES (?, ?, ?, ?, ?, ?)',
			[ticket, producto_id, email_cliente, asunto, mensaje, 'Pendiente']
		);

		return json(
			{
				id: result.insertId,
				ticket,
				mensaje:
					'Reclamo enviado correctamente. Guarda tu número de ticket para hacer el seguimiento.'
			},
			{ status: 201 }
		);
	} catch (error) {
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}

/** @param {{ request: Request }} param0 */
export async function PATCH({ request }) {
	try {
		const { id, respuesta, estado } = await request.json();

		if (!id || !estado) {
			return json({ error: 'El ID y el estado son obligatorios' }, { status: 400 });
		}

		const estadosValidos = ['Pendiente', 'En proceso', 'Resuelto'];
		if (!estadosValidos.includes(estado)) {
			return json({ error: 'Estado no válido' }, { status: 400 });
		}

		await pool.query(
			`UPDATE reclamos 
             SET respuesta = ?, estado = ?, respondido_en = NOW() 
             WHERE id = ?`,
			[respuesta || null, estado, id]
		);

		return json({ mensaje: 'Reclamo actualizado correctamente' });
	} catch (error) {
		return json({ error: 'Error al actualizar el reclamo' }, { status: 500 });
	}
}
