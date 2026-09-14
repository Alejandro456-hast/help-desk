<script>
	import './ProductForm.css';

	let form = $state({
		nombre: '',
		descripcion: '',
		precio: '',
		stock: ''
	});
	let loading = $state(false);
	let message = $state('');
	let errorMsg = $state('');

	/** @param {SubmitEvent} e */
	const submitProduct = async (e) => {
		e.preventDefault();
		loading = true;
		message = '';
		errorMsg = '';

		try {
			const res = await fetch('/api/productos', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			});

			const data = await res.json();
			if (res.ok) {
				message = data.mensaje;
				form = { nombre: '', descripcion: '', precio: '', stock: '' };
			} else {
				errorMsg = data.error;
			}
		} catch (err) {
			errorMsg = 'Error al comunicarse con el servidor';
		} finally {
			loading = false;
		}
	};
</script>

<form onsubmit={submitProduct} class="product-form">
	<div class="form-group">
		<label for="nombre" class="form-label">Nombre del Producto</label>
		<input type="text" id="nombre" bind:value={form.nombre} required class="form-input" />
	</div>

	<div class="form-group">
		<label for="descripcion" class="form-label">Descripción</label>
		<textarea id="descripcion" bind:value={form.descripcion} rows="3" class="form-textarea"
		></textarea>
	</div>

	<div class="form-group form-grid-2">
		<div>
			<label for="precio" class="form-label">Precio ($)</label>
			<input
				type="number"
				id="precio"
				bind:value={form.precio}
				min="0"
				step="0.01"
				required
				class="form-input"
			/>
		</div>
		<div>
			<label for="stock" class="form-label">Stock Inicial</label>
			<input type="number" id="stock" bind:value={form.stock} min="0" required class="form-input" />
		</div>
	</div>

	{#if errorMsg}
		<div class="alert-error">{errorMsg}</div>
	{/if}
	{#if message}
		<div class="alert-success">{message}</div>
	{/if}

	<button type="submit" disabled={loading} class="btn-submit-product">
		{loading ? 'Guardando...' : 'Guardar Producto'}
	</button>
</form>
