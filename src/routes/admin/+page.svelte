<script>
	import { onMount } from 'svelte';
	import ProductForm from '$lib/components/ProductForm.svelte';
	import ClaimList from '$lib/components/ClaimList.svelte';

	/** @type {any[]} */
	let reclamos = $state([]);
	let loading = $state(true);

	const loadReclamos = async () => {
		try {
			const res = await fetch('/api/reclamos');
			if (res.ok) reclamos = await res.json();
		} finally {
			loading = false;
		}
	};

	onMount(() => {
		loadReclamos();
	});
</script>

<svelte:head>
	<title>Dashboard Admin | Tienda</title>
</svelte:head>

<main class="page-wrapper-dark">
	<div class="page-container">
		<header class="navbar-admin">
			<h1 class="page-heading-light">Dashboard Administrativo</h1>
			<a href="/" class="nav-link-btn-dark">&larr; Volver a la Tienda</a>
		</header>

		<div class="content-grid-admin">
			<div class="card-panel-admin-blue">
				<h2 class="mb-4 flex items-center text-xl font-semibold text-gray-700">
					<svg
						class="mr-2 h-6 w-6 text-blue-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						></path></svg
					>
					Registrar Nuevo Producto
				</h2>
				<ProductForm />
			</div>

			<div class="card-panel-admin-red">
				<h2 class="mb-4 flex items-center text-xl font-semibold text-gray-700">
					<svg
						class="mr-2 h-6 w-6 text-red-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						></path></svg
					>
					Gestión de Reclamos
				</h2>
				{#if loading}
					<div class="mt-4 animate-pulse space-y-3">
						<div class="h-8 rounded bg-gray-200"></div>
						<div class="h-8 rounded bg-gray-200"></div>
					</div>
				{:else}
					<ClaimList {reclamos} onupdate={loadReclamos} />
				{/if}
			</div>
		</div>
	</div>
</main>
