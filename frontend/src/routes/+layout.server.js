/** @type {import('./$types').LayoutServerLoad} */
export async function load({ url, request }) {
	const lang = request.headers.get('accept-language')?.split(',')[0] || 'en';

	// Si ya está en ruta de idioma, no redirigir
	if (url.pathname.startsWith('/es') || url.pathname.startsWith('/pt')) {
		return {};
	}

	// Redirigir según idioma
	if (lang.startsWith('es')) {
		return {
			status: 302,
			redirect: '/es'
		};
	} else if (lang.startsWith('pt')) {
		return {
			status: 302,
			redirect: '/pt'
		};
	}

	// Si es inglés o no detectado, quedarse en default (/)
	return {};
}
