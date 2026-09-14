<script>
	import { onMount } from 'svelte';
	import ProductList from '$lib/components/ProductList.svelte';
	import ClaimForm from '$lib/components/ClaimForm.svelte';

	/** @type {any[]} */
	let productos = $state([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const res = await fetch('/api/productos');
			if (res.ok) productos = await res.json();
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Tienda | Catálogo de Productos</title>
</svelte:head>

<main class="page-wrapper-light">
	<div class="page-container">
		<header class="navbar-client">
			<h1 class="page-heading">Catálogo de Productos</h1>
			<a href="/admin" class="nav-link-btn">Acceso Admin &rarr;</a>
		</header>

		<div class="content-grid-client">
			<!-- Columna principal (Productos) -->
			<div class="space-y-6 lg:col-span-2">
				<h2 class="section-title">Nuestros Productos</h2>
				{#if loading}
					<div class="animate-pulse space-y-4">
						<div class="h-10 w-full rounded bg-gray-300"></div>
						<div class="h-10 w-full rounded bg-gray-300"></div>
						<div class="h-10 w-full rounded bg-gray-300"></div>
					</div>
				{:else if productos.length === 0}
					<p class="rounded bg-white p-4 text-gray-500 italic shadow-sm">
						No hay productos disponibles por el momento.
					</p>
				{:else}
					<ProductList {productos} />
				{/if}
			</div>

			<!-- Sidebar (Help Desk) -->
			<div class="card-panel-sticky">
				<h2 class="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">Help Desk (Reclamos)</h2>
				<ClaimForm {productos} />
			</div>
		</div>
	</div>
</main>
