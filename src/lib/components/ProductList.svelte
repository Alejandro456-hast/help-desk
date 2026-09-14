<script>
	/** @type {{ productos?: any[] }} */
	let { productos = [] } = $props();
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
	{#each productos as producto}
		<div class="product-card">
			<h3 class="product-title">{producto.nombre}</h3>
			<p class="product-desc">
				{producto.descripcion || 'Sin descripción'}
			</p>
			<div class="product-footer">
				<span class="product-price">${Number(producto.precio).toFixed(2)}</span>
				<span class="product-stock">Stock: {producto.stock}</span>
			</div>
		</div>
	{/each}
</div>
