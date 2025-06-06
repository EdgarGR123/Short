<script>
	import '../app.css'
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
				error = data.error || 'Unknown error';
			}
		} catch (err) {
			error = 'Failed to connect to the server';
		}
	}

	async function generate_qr(){
		try {
			qrDataUrl = await QRCode.toDataURL(shortUrl);
		} catch (error) {
			console.error('Failed to generate QR code:', err);
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
	<title>Shorten URLs with QR and stats</title>
	<meta name="description" content="Free tool to shorten URLs, generate QR codes and view click stats. Fast and no registration.">
	<meta name="keywords" content="shorten links, free QR, analytics, URL shortener, QR generator">
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
				placeholder="Input your link here"
				required
			/>
			<button type="submit">Convert</button>
		</form>
		
		{#if !error}
			{#if shortUrl}
				<p>Short URL: <a href={shortUrl} target="_blank">{shortUrl}</a></p>
				<div>
		
					<button on:click={() => navigator.clipboard.writeText(shortUrl)}  on:click={() => {
    navigator.clipboard.writeText(shortUrl);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }}>📋 Copy</button>
					<button on:click={generate_qr}>🔳 QR</button>
					<button on:click={() => window.open(shortUrl, '_blank')}>🌐 Visit</button>
		
				</div>
			{/if}
		
			{#if qrDataUrl}
				<img src={qrDataUrl} alt="QR Code" />
				<hr>
				<button on:click={downloadQR}>Download</button>
			{/if}
		{/if}
		
		{#if error}
			<p style="color: red;">{error}</p>
		{/if}

		{#if copied}
  			<span class="copied-msg">Copied!</span>
		{/if}

	</main>

	<footer>
		<h1>Shortlk</h1>
		<a class="link-about" href="/about">About</a>
	</footer>
</div>


