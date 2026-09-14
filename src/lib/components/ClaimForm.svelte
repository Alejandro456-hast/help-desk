<script>
	/** @type {{ productos?: any[] }} */
	let { productos = [] } = $props();

	let activeTab = $state('crear'); // 'crear' | 'consultar'

	// Formulario de creación
	let form = $state({
		producto_id: '',
		email_cliente: '',
		asunto: '',
		mensaje: ''
	});
	let loading = $state(false);
	let message = $state('');
	let errorMsg = $state('');
	let createdTicket = $state('');

	// Consulta de Ticket
	let searchTicket = $state('');
	let searchLoading = $state(false);
	let searchError = $state('');
	/** @type {any} */
	let ticketData = $state(null);
	let copied = $state(false);

	/** @param {SubmitEvent} e */
	const submitClaim = async (e) => {
		e.preventDefault();
		loading = true;
		message = '';
		errorMsg = '';
		createdTicket = '';

		try {
			const res = await fetch('/api/reclamos', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			});

			const data = await res.json();
			if (res.ok) {
				message = data.mensaje;
				createdTicket = data.ticket;
				form = { producto_id: '', email_cliente: '', asunto: '', mensaje: '' };
			} else {
				errorMsg = data.error;
			}
		} catch (err) {
			errorMsg = 'Error al contactar con el servidor';
		} finally {
			loading = false;
		}
	};

	/** @param {SubmitEvent} e */
	const checkTicket = async (e) => {
		e.preventDefault();
		if (!searchTicket.trim()) return;

		searchLoading = true;
		searchError = '';
		ticketData = null;

		try {
			const res = await fetch(`/api/reclamos?ticket=${encodeURIComponent(searchTicket.trim())}`);
			const data = await res.json();

			if (res.ok) {
				ticketData = data;
			} else {
				searchError = data.error || 'Ticket no encontrado';
			}
		} catch (err) {
			searchError = 'Error al consultar el ticket';
		} finally {
			searchLoading = false;
		}
	};

	const copyTicket = () => {
		if (createdTicket) {
			navigator.clipboard.writeText(createdTicket);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2500);
		}
	};

	/** @param {string} ticketCode */
	const goToSearchTicket = (ticketCode) => {
		searchTicket = ticketCode;
		activeTab = 'consultar';
		ticketData = null;
		searchError = '';
		searchLoading = true;
		fetch(`/api/reclamos?ticket=${encodeURIComponent(ticketCode)}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.id) {
					ticketData = data;
				} else {
					searchError = data.error;
				}
			})
			.catch(() => {
				searchError = 'Error al consultar ticket';
			})
			.finally(() => {
				searchLoading = false;
			});
	};
</script>

<div class="space-y-4">
	<!-- Pestañas de navegación -->
	<div class="tab-header">
		<button
			type="button"
			onclick={() => (activeTab = 'crear')}
			class={activeTab === 'crear' ? 'tab-btn-active' : 'tab-btn-inactive'}
		>
			Enviar Reclamo
		</button>
		<button
			type="button"
			onclick={() => (activeTab = 'consultar')}
			class={activeTab === 'consultar' ? 'tab-btn-active' : 'tab-btn-inactive'}
		>
			Consultar Ticket
		</button>
	</div>

	{#if activeTab === 'crear'}
		<form onsubmit={submitClaim}>
			<div class="form-group">
				<label for="producto_id" class="form-label">Producto</label>
				<select id="producto_id" bind:value={form.producto_id} required class="form-select">
					<option value="" disabled selected>Selecciona un producto</option>
					{#each productos as prod}
						<option value={prod.id}>{prod.nombre}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="email_cliente" class="form-label">Correo Electrónico</label>
				<input
					type="email"
					id="email_cliente"
					bind:value={form.email_cliente}
					required
					class="form-input"
				/>
			</div>

			<div class="form-group">
				<label for="asunto" class="form-label">Asunto</label>
				<input type="text" id="asunto" bind:value={form.asunto} required class="form-input" />
			</div>

			<div class="form-group">
				<label for="mensaje" class="form-label">Mensaje</label>
				<textarea id="mensaje" bind:value={form.mensaje} required rows="3" class="form-textarea"
				></textarea>
			</div>

			{#if errorMsg}
				<div class="alert-error mb-4">{errorMsg}</div>
			{/if}

			{#if createdTicket}
				<div class="alert-ticket-box mb-4">
					<p class="text-sm font-semibold">{message}</p>
					<div class="ticket-display-box">
						<span class="ticket-code-accent">{createdTicket}</span>
						<button type="button" onclick={copyTicket} class="btn-copy">
							{copied ? '¡Copiado!' : 'Copiar'}
						</button>
					</div>
					<button
						type="button"
						onclick={() => goToSearchTicket(createdTicket)}
						class="mt-3 text-xs font-semibold text-blue-600 underline hover:text-blue-800"
					>
						Ver seguimiento de este ticket &rarr;
					</button>
				</div>
			{/if}

			<button type="submit" disabled={loading} class="btn-primary">
				{loading ? 'Enviando...' : 'Enviar Reclamo'}
			</button>
		</form>
	{:else}
		<!-- Vista de Consulta / Seguimiento -->
		<div class="space-y-4">
			<form onsubmit={checkTicket}>
				<div class="form-group">
					<label for="search_ticket" class="form-label">Número de Ticket</label>
					<div class="flex gap-2">
						<input
							type="text"
							id="search_ticket"
							bind:value={searchTicket}
							placeholder="Ej: TK-A7B2X9"
							required
							class="form-input flex-1 uppercase"
						/>
						<button type="submit" disabled={searchLoading} class="btn-search">
							{searchLoading ? '...' : 'Buscar'}
						</button>
					</div>
				</div>
			</form>

			{#if searchError}
				<div class="alert-error">{searchError}</div>
			{/if}

			{#if ticketData}
				<div class="ticket-card">
					<div class="ticket-header">
						<span class="ticket-code">{ticketData.ticket}</span>
						{#if ticketData.estado === 'Resuelto'}
							<span class="badge-resolved">✓ Resuelto</span>
						{:else if ticketData.estado === 'En proceso'}
							<span class="badge-progress">⏳ En proceso</span>
						{:else}
							<span class="badge-pending">● Pendiente</span>
						{/if}
					</div>

					<div class="ticket-details">
						<p><strong class="text-gray-700">Producto:</strong> {ticketData.producto_nombre}</p>
						<p><strong class="text-gray-700">Asunto:</strong> {ticketData.asunto}</p>
						<p>
							<strong class="text-gray-700">Fecha:</strong>
							{new Date(ticketData.creado_en).toLocaleString()}
						</p>
					</div>

					<div class="ticket-user-msg">
						<strong class="mb-1 block text-gray-800">Tu mensaje:</strong>
						{ticketData.mensaje}
					</div>

					<!-- Respuesta del Administrador -->
					{#if ticketData.respuesta}
						<div class="ticket-response-box">
							<strong class="mb-1 block font-semibold text-blue-900">
								Respuesta del Soporte ({new Date(ticketData.respondido_en).toLocaleDateString()}):
							</strong>
							<p class="whitespace-pre-line text-blue-800">{ticketData.respuesta}</p>
						</div>
					{:else}
						<p class="ticket-pending-box">
							Tu reclamo está siendo revisado por nuestro equipo de atención.
						</p>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
