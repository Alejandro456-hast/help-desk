<script>
	import './LiveWidgetsBar.css';
	import { onMount } from 'svelte';

	/** @type {{ theme?: 'light' | 'dark' }} */
	let { theme = 'light' } = $props();

	// 1. Reloj Mundial
	let currentTime = $state(new Date());
	let selectedCity = $state('America/La_Paz');
	const worldCities = [
		{ name: 'La Paz 🇧🇴', tz: 'America/La_Paz' },
		{ name: 'Madrid 🇪🇸', tz: 'Europe/Madrid' },
		{ name: 'Nueva York 🇺🇸', tz: 'America/New_York' },
		{ name: 'Buenos Aires 🇦🇷', tz: 'America/Argentina/Buenos_Aires' },
		{ name: 'Tokio 🇯🇵', tz: 'Asia/Tokyo' }
	];

	// 2. Tipo de Cambio (Dólar a BOB y EUR)
	/** @type {{ BOB: string | null, EUR: string | null, lastUpdate: string }} */
	let exchangeRates = $state({ BOB: null, EUR: null, lastUpdate: '' });
	let exchangeLoading = $state(true);
	let convertAmount = $state(10);

	// 3. Clima en Vivo (Open-Meteo)
	/** @type {any} */
	let weather = $state(null);
	let weatherLoading = $state(true);
	let selectedWeatherCity = $state('lapaz');
	/** @type {Record<string, { name: string, lat: number, lon: number }>} */
	const weatherCities = {
		lapaz: { name: 'La Paz 🇧🇴', lat: -16.5, lon: -68.15 },
		santacruz: { name: 'Santa Cruz 🇧🇴', lat: -17.78, lon: -63.18 },
		cochabamba: { name: 'Cochabamba 🇧🇴', lat: -17.39, lon: -66.16 },
		madrid: { name: 'Madrid 🇪🇸', lat: 40.41, lon: -3.7 },
		buenosaires: { name: 'Buenos Aires 🇦🇷', lat: -34.6, lon: -58.38 }
	};

	// 4. Frase / Consejo Inspirador del Día
	/** @type {any} */
	let quote = $state(null);
	let quoteLoading = $state(true);

	// 5. IP & Conexión del Visitante
	/** @type {any} */
	let userLocation = $state(null);
	let ipLoading = $state(true);

	onMount(() => {
		const timer = setInterval(() => {
			currentTime = new Date();
		}, 1000);

		loadExchangeRates();
		loadWeather(selectedWeatherCity);
		loadQuote();
		loadUserLocation();

		return () => clearInterval(timer);
	});

	// API 1: Tipo de cambio Dólar
	async function loadExchangeRates() {
		try {
			exchangeLoading = true;
			const res = await fetch('https://open.er-api.com/v6/latest/USD');
			if (res.ok) {
				const data = await res.json();
				exchangeRates = {
					BOB: data.rates.BOB ? Number(data.rates.BOB).toFixed(2) : '6.96',
					EUR: data.rates.EUR ? Number(data.rates.EUR).toFixed(2) : '0.92',
					lastUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
				};
			}
		} catch (e) {
			console.error('Error al cargar tipo de cambio', e);
		} finally {
			exchangeLoading = false;
		}
	}

	// API 2: Clima (Open-Meteo)
	/** @param {string} cityKey */
	async function loadWeather(cityKey) {
		try {
			weatherLoading = true;
			selectedWeatherCity = cityKey;
			const target = weatherCities[cityKey] || weatherCities.lapaz;
			const res = await fetch(
				'https://api.open-meteo.com/v1/forecast?latitude=' + target.lat + '&longitude=' + target.lon + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto'
			);
			if (res.ok) {
				const data = await res.json();
				weather = {
					city: target.name,
					temp: Math.round(data.current.temperature_2m),
					humidity: data.current.relative_humidity_2m,
					wind: data.current.wind_speed_10m,
					code: data.current.weather_code,
					description: getWeatherDescription(data.current.weather_code)
				};
			}
		} catch (e) {
			console.error('Error al cargar clima', e);
		} finally {
			weatherLoading = false;
		}
	}

	/** @param {number} code */
	function getWeatherDescription(code) {
		if (code === 0) return { text: 'Cielo Despejado', icon: '☀️' };
		if (code <= 3) return { text: 'Parcialmente Nublado', icon: '⛅' };
		if (code <= 48) return { text: 'Niebla / Neblina', icon: '🌫️' };
		if (code <= 67) return { text: 'Lluvia Ligera/Moderada', icon: '🌧️' };
		if (code <= 77) return { text: 'Nevada', icon: '❄️' };
		if (code <= 82) return { text: 'Chubascos Fuertes', icon: '🌦️' };
		if (code <= 99) return { text: 'Tormenta Eléctrica', icon: '⛈️' };
		return { text: 'Clima Variable', icon: '🌡️' };
	}

	// API 3: Frase Inspiradora
	async function loadQuote() {
		try {
			quoteLoading = true;
			const res = await fetch('https://dummyjson.com/quotes/random');
			if (res.ok) {
				const data = await res.json();
				quote = data;
			}
		} catch (e) {
			quote = { quote: 'El servicio excelente es la mejor estrategia.', author: 'Atención al Cliente' };
		} finally {
			quoteLoading = false;
		}
	}

	// API 4: IP y Geolocalización
	async function loadUserLocation() {
		try {
			ipLoading = true;
			const res = await fetch('https://api.ipify.org?format=json');
			if (res.ok) {
				const ipData = await res.json();
				userLocation = { ip: ipData.ip };
			}
		} catch (e) {
			console.error('Error IP', e);
		} finally {
			ipLoading = false;
		}
	}

	/**
	 * @param {Date} time
	 * @param {string} tz
	 */
	function formatTimeForZone(time, tz) {
		try {
			return new Intl.DateTimeFormat('es-BO', {
				timeZone: tz,
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: true
			}).format(time);
		} catch (e) {
			return time.toLocaleTimeString();
		}
	}

	/**
	 * @param {Date} time
	 * @param {string} tz
	 */
	function formatDateForZone(time, tz) {
		try {
			return new Intl.DateTimeFormat('es-BO', {
				timeZone: tz,
				weekday: 'short',
				day: 'numeric',
				month: 'short'
			}).format(time);
		} catch (e) {
			return '';
		}
	}
</script>

<div class="widgets-wrapper {theme === 'dark' ? 'theme-dark' : 'theme-light'}">
	<div class="widgets-container">
		
		<!-- Widget 1: Reloj de La Paz & Mundo -->
		<div class="widget-card widget-clock">
			<div class="widget-header-row">
				<span class="widget-icon">🕒</span>
				<span class="widget-tag">HORA MUNDIAL</span>
			</div>
			<div class="widget-body">
				<div class="clock-display">
					<span class="clock-time">{formatTimeForZone(currentTime, selectedCity)}</span>
					<span class="clock-date">{formatDateForZone(currentTime, selectedCity)}</span>
				</div>
				<select 
					class="city-select" 
					bind:value={selectedCity}
				>
					{#each worldCities as c}
						<option value={c.tz}>{c.name}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Widget 2: Tipo de Cambio Dólar Bolivia -->
		<div class="widget-card widget-currency">
			<div class="widget-header-row">
				<span class="widget-icon">💵</span>
				<span class="widget-tag">DÓLAR EN BOLIVIA</span>
			</div>
			<div class="widget-body">
				{#if exchangeLoading}
					<span class="widget-loading">Cargando tasas...</span>
				{:else}
					<div class="currency-row">
						<span class="currency-main">1 USD = <strong>Bs. {exchangeRates.BOB}</strong></span>
						<span class="currency-sub">€ {exchangeRates.EUR} EUR</span>
					</div>
					<div class="quick-calc">
						<label for="convert-input" class="calc-label">Calculadora rápida:</label>
						<div class="calc-input-group">
							<span>$</span>
							<input id="convert-input" type="number" bind:value={convertAmount} min="1" class="calc-input" />
							<span>= Bs. {(convertAmount * Number(exchangeRates.BOB || 6.96)).toFixed(2)}</span>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Widget 3: Clima en Vivo (La Paz y ciudades) -->
		<div class="widget-card widget-weather">
			<div class="widget-header-row">
				<span class="widget-icon">{weather?.description?.icon || '⛅'}</span>
				<span class="widget-tag">CLIMA EN VIVO</span>
				<select 
					class="weather-select" 
					bind:value={selectedWeatherCity} 
					onchange={() => loadWeather(selectedWeatherCity)}
				>
					{#each Object.entries(weatherCities) as [key, val]}
						<option value={key}>{val.name}</option>
					{/each}
				</select>
			</div>
			<div class="widget-body">
				{#if weatherLoading}
					<span class="widget-loading">Consultando satélite...</span>
				{:else if weather}
					<div class="weather-row">
						<span class="weather-temp">{weather.temp}°C</span>
						<div class="weather-details">
							<span class="weather-status">{weather.description.text}</span>
							<span class="weather-sub">💧 {weather.humidity}% Humedad • 💨 {weather.wind} km/h</span>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Widget 4: Frase / Consejo de Servicio del Día -->
		<div class="widget-card widget-quote">
			<div class="widget-header-row">
				<span class="widget-icon">💡</span>
				<span class="widget-tag">FRASE DEL DÍA</span>
				<button type="button" class="btn-refresh-quote" title="Nueva frase" onclick={loadQuote}>🔄</button>
			</div>
			<div class="widget-body">
				{#if quoteLoading}
					<span class="widget-loading">Cargando consejo...</span>
				{:else if quote}
					<p class="quote-text">"{quote.quote}"</p>
					<span class="quote-author">— {quote.author}</span>
				{/if}
			</div>
		</div>

		<!-- Widget 5: Estado de Conexión & IP del Visitante -->
		<div class="widget-card widget-status">
			<div class="widget-header-row">
				<span class="widget-icon">🌐</span>
				<span class="widget-tag">TU CONEXIÓN</span>
				<span class="status-live-dot" title="Servicio Online">● Online</span>
			</div>
			<div class="widget-body">
				{#if ipLoading}
					<span class="widget-loading">Identificando red...</span>
				{:else}
					<div class="status-row">
						<span class="status-ip-label">Tu IP Pública:</span>
						<code class="status-ip-val">{userLocation?.ip || '127.0.0.1'}</code>
					</div>
					<div class="status-sub">
						<span class="badge-secure">🔒 Conexión Segura SSL</span>
					</div>
				{/if}
			</div>
		</div>

	</div>
</div>