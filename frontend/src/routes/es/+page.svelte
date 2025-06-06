<script>
	import QRCode from 'qrcode'
	let url = '';
	let shortUrl = '';
	let error = '';
	let code= '';
	let stats= null;
	let qrDataUrl = '';
	let copied= false;

	async function handleSubmit(event) {
		event.preventDefault();

		try {
			const res = await fetch('http://localhost:3000/TakeLinks', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ url })
			});

			const data = await res.json();

			if (res.ok) {
				shortUrl = data.shortUrl;
				code = data.ShortLink; // <--- Guarda el código aquí
			} else {
				error = data.error || 'Error desconocido';
			}
		} catch (err) {
			error = 'No se pudo conectar con el servidor';
		}
	}

	async function generate_qr(){
		try {
			qrDataUrl = await QRCode.toDataURL(shortUrl);
		} catch (error) {
			console.error('Error al generar el código QR:', err);
		}
	}


	function downloadQR() {
		const a = document.createElement('a');
		a.href = qrDataUrl;
		a.download = 'qrcode.png';
		a.click();
	}

</script>

<svelte:head>
	<title>Acortar URLs con QR y estadísticas</title>
	<meta name="description" content="Herramienta gratuita para acortar URLs, generar códigos QR y ver estadísticas de clics. Rápido y sin registro.">
	<meta name="keywords" content="acortar enlaces, QR gratis, analíticas, acortador de URL, generador de QR">
	<meta name="robots" content="index, follow">

	<link rel="alternate" hreflang="es" href="https://tusitio.com/es" />
	<link rel="alternate" hreflang="pt" href="https://tusitio.com/pt" />
	<link rel="alternate" hreflang="en" href="https://tusitio.com/" />

</svelte:head>


<div class="page">
	<main>

		<form on:submit={handleSubmit}>
			<input
				type="text"
				bind:value={url}
				placeholder="Introduce tu enlace aquí"
				required
			/>
			<button type="submit">Convertir</button>
		</form>
		
		{#if !error}
			{#if shortUrl}
				<p>URL corta: <a href={shortUrl} target="_blank">{shortUrl}</a></p>
				<div>
		
					<button on:click={() => navigator.clipboard.writeText(shortUrl)} on:click={() => {
						navigator.clipboard.writeText(shortUrl);
						copied = true;
						setTimeout(() => copied = false, 2000);
					}}>📋 Copiar</button>
					<button on:click={generate_qr}>🔳 QR</button>
					<button on:click={() => window.open(shortUrl, '_blank')}>🌐 Visitar</button>
		
				</div>
			{/if}
		
			{#if qrDataUrl}
				<img src={qrDataUrl} alt="Código QR" />
				<hr>
				<button on:click={downloadQR}>Descargar</button>
			{/if}
		{/if}
		
		{#if error}
			<p style="color: red;">{error}</p>
		{/if}

		{#if copied}
  			<span class="copied-msg">¡Copiado!</span>
		{/if}

	</main>

	<footer>
		<h1>Shortlk</h1>
		<a class="link-about" href="/es/about">Acerca de</a>
	</footer>
</div>
