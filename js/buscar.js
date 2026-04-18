window.onload = async () => {
    const form = document.getElementById('form-busqueda');
    const contenedor = document.getElementById('contenedor-actividades');

    // Comprobación de seguridad: Si no hay contenedor, no seguimos
    if (!contenedor) return;

    // --- 1. LÓGICA DE BÚSQUEDA AUTOMÁTICA (Punto 8.a) ---
    const params = new URLSearchParams(window.location.search);
    const urlAutor = params.get('autor');
    const urlLugar = params.get('lugar');
    const urlCat = params.get('categoria');

    if (urlAutor || urlLugar || urlCat) {
        // Rellenamos los campos si existen en el HTML 
        if (urlAutor && document.getElementById('filtro-autor')) 
            document.getElementById('filtro-autor').value = urlAutor;
        if (urlLugar && document.getElementById('filtro-lugar')) 
            document.getElementById('filtro-lugar').value = urlLugar;
        if (urlCat && document.getElementById('filtro-categoria')) 
            document.getElementById('filtro-categoria').value = urlCat;
        
        realizarBusqueda(); // Ejecutamos búsqueda automática 
    }

    // --- 2. GESTIÓN DEL FORMULARIO (Punto 8.b) ---
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            realizarBusqueda();
        };
    }

    async function realizarBusqueda() {
        // Usamos el operador ?. para evitar que el script muera si falta un ID
        const t = document.getElementById('filtro-texto')?.value || '';
        const l = document.getElementById('filtro-lugar')?.value || '';
        const a = document.getElementById('filtro-autor')?.value || '';
        const c = document.getElementById('filtro-categoria')?.value || '';

        // Construcción de URL con parámetros del enunciado
        let url = 'api/actividades?';
        if (t) url += `t=${t}&`;
        if (l) url += `l=${l}&`;
        if (a) url += `a=${a}&`;
        if (c) url += `c=${c}&`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.RESULTADO === 'OK') {
                pintar(data.FILAS); 
            } else {
                console.error("Error API:", data.DESCRIPCION);
            }
        } catch (error) {
            console.error("Fallo de conexión:", error);
        }
    }

    function pintar(filas) {
        contenedor.innerHTML = '';
        
        if (filas.length === 0) {
            contenedor.innerHTML = '<p>No hay resultados que coincidan.</p>';
            return;
        }

        filas.forEach(act => {
            // Reutilizamos estructura de index 
            contenedor.innerHTML += `
                <article class="activity-card">
                    <a href="actividad.html?id=${act.id}">
                        <img src="./fotos/actividades/${act.foto}" alt="${act.nombre}" class="activity-img">
                    </a>
                    <div class="activity-info">
                        <h3><a href="actividad.html?id=${act.id}" title="${act.nombre}">${act.nombre}</a></h3>
                        <p><i class="fa-solid fa-location-dot"></i> ${act.lugar}</p>
                        <p><i class="fa-solid fa-user"></i> ${act.autor}</p>
                    </div>
                </article>`;
        });
    }
};