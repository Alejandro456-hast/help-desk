<script>
	import './ClaimList.css';

	/** @type {{ reclamos?: any[], onupdate?: () => void }} */
	let { reclamos = [], onupdate } = $props();

	/** @type {any} */
	let selectedClaim = $state(null);
	let responseText = $state('');
	let statusValue = $state('Resuelto');
	let saving = $state(false);
	let saveMessage = $state('');
	let saveError = $state('');

	/** @param {any} claim */
	const openModal = (claim) => {
		selectedClaim = claim;
		responseText = claim.respuesta || '';
		statusValue = claim.estado || 'Resuelto';
		saveMessage = '';
		saveError = '';
	};

	const closeModal = () => {
		selectedClaim = null;
	};

	/** @param {SubmitEvent} e */
	const handleSaveResponse = async (e) => {
		e.preventDefault();
		if (!selectedClaim) return;

		saving = true;
		saveMessage = '';
		saveError = '';

		try {
			const res = await fetch('/api/reclamos', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: selectedClaim.id,
					respuesta: responseText,
					estado: statusValue
				})
			});

			const data = await res.json();
			if (res.ok) {
				saveMessage = data.mensaje;
				selectedClaim.respuesta = responseText;
				selectedClaim.estado = statusValue;
				selectedClaim.respondido_en = new Date().toISOString();

				if (onupdate) {
					onupdate();
				}

				setTimeout(() => {
					closeModal();
				}, 1200);
			} else {
				saveError = data.error || 'Error al guardar la respuesta';
			}
		} catch (err) {
			saveError = 'Error de conexión con el servidor';
		} finally {
			saving = false;
		}
	};
</script>

{#if reclamos.length === 0}
	<p class="empty-claims-notice">No hay reclamos registrados.</p>
{:else}
	<div class="table-wrapper">
		<table class="data-table">
			<thead class="table-head">
				<tr>
					<th class="table-th">Ticket</th>
					<th class="table-th">Fecha</th>
					<th class="table-th">Producto / Cliente</th>
					<th class="table-th">Estado</th>
					<th class="table-th-center">Acción</th>
				</tr>
			</thead>
			<tbody class="table-body">
				{#each reclamos as reclamo}
					<tr class="table-row">
						<td class="table-cell-ticket">
							{reclamo.ticket || `TK-${reclamo.id}`}
						</td>
						<td class="table-cell-nowrap">
							{new Date(reclamo.creado_en).toLocaleDateString()}
						</td>
						<td class="table-cell">
							<p class="claim-prod-title">{reclamo.producto_nombre}</p>
							<a href="mailto:{reclamo.email_cliente}" class="claim-client-email">
								{reclamo.email_cliente}
							</a>
							<p class="claim-subject">{reclamo.asunto}</p>
						</td>
						<td class="table-cell-nowrap">
							{#if reclamo.estado === 'Resuelto'}
								<span class="badge-resolved">✓ Resuelto</span>
							{:else if reclamo.estado === 'En proceso'}
								<span class="badge-progress">⏳ En proceso</span>
							{:else}
								<span class="badge-pending">● Pendiente</span>
							{/if}
						</td>
						<td class="table-cell-center">
							<button type="button" onclick={() => openModal(reclamo)} class="btn-action-small">
								{reclamo.respuesta ? 'Ver / Editar' : 'Responder'}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<!-- Modal de Respuesta para el Administrador -->
{#if selectedClaim}
	<div class="modal-backdrop">
		<div class="modal-container">
			<div class="modal-header">
				<div>
					<span class="modal-ticket-badge">
						{selectedClaim.ticket || `TK-${selectedClaim.id}`}
					</span>
					<h3 class="modal-title">Gestionar Reclamo</h3>
				</div>
				<button type="button" onclick={closeModal} class="modal-close-btn">&times;</button>
			</div>

			<div class="modal-info-box">
				<p><span class="modal-info-label">Cliente:</span> {selectedClaim.email_cliente}</p>
				<p><span class="modal-info-label">Producto:</span> {selectedClaim.producto_nombre}</p>
				<p><span class="modal-info-label">Asunto:</span> {selectedClaim.asunto}</p>
				<div class="modal-user-msg-box">
					<span class="modal-msg-title">Mensaje del cliente:</span>
					<p class="modal-msg-text">{selectedClaim.mensaje}</p>
				</div>
			</div>

			<form onsubmit={handleSaveResponse}>
				<div class="form-group">
					<label for="modal_estado" class="form-label">Estado del Reclamo</label>
					<select id="modal_estado" bind:value={statusValue} required class="form-select">
						<option value="Pendiente">● Pendiente</option>
						<option value="En proceso">⏳ En proceso</option>
						<option value="Resuelto">✓ Resuelto (Concluido)</option>
					</select>
				</div>

				<div class="form-group">
					<label for="modal_respuesta" class="form-label">Respuesta para el Cliente</label>
					<textarea
						id="modal_respuesta"
						bind:value={responseText}
						rows="4"
						placeholder="Escribe la solución o respuesta que el cliente verá en su seguimiento..."
						required
						class="form-textarea"></textarea>
				</div>

				{#if saveError}
					<div class="alert-error">{saveError}</div>
				{/if}
				{#if saveMessage}
					<div class="alert-success">{saveMessage}</div>
				{/if}

				<div class="modal-footer">
					<button type="button" onclick={closeModal} class="btn-secondary"> Cancelar </button>
					<button type="submit" disabled={saving} class="btn-save-modal">
						{saving ? 'Guardando...' : 'Guardar y Notificar'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
