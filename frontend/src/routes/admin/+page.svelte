<script>
    	async function get_all_links(event) {
		event.preventDefault()

		if (!code){
			error= 'No short link generated yet';
			return;
		}

		try {
			const res = await fetch(`http://localhost:3000/stats/${code}`);
			const data = await res.json()
			if (res.ok){
				stats= data;
				error= '';
			}else{
				err= data.error || 'Could not get stats';
			}
		} catch (error) {
			error= 'Fail to fetch stats';
		}
	}
</script>

<form on:submit={get_all_links}>
	<button>VIEW LINKS</button>
</form>



{#if stats}
	<p>Original URL: {stats.originalUrl}</p>
	<p>Clicks: {stats.clicks}</p>
{/if }

{#if error}
	<p style="color: red;">{error}</p>
{/if}
