window.onload = () => {
    // 1. GESTIÓN DEL MENÚ SEGÚN EL TOKEN
    const tokenSession = sessionStorage.getItem('token');
    const tokenLocal = localStorage.getItem('token');
    const token = tokenSession || tokenLocal;

    const btnLogin = document.querySelector('a[href="login.html"]')?.parentElement;
    const btnRegistro = document.querySelector('a[href="registrar.html"]')?.parentElement;
    const btnNueva = document.querySelector('a[href="nueva.html"]')?.parentElement;
    
    let btnLogout = null;
    document.querySelectorAll('.main-nav a').forEach(link => {
        if (link.textContent.trim() === 'Logout') btnLogout = link.parentElement;
    });

    if (token) {
        if(btnLogin) btnLogin.style.display = 'none';
        if(btnRegistro) btnRegistro.style.display = 'none';
        if(btnLogout) btnLogout.style.display = 'block';
        if(btnNueva) btnNueva.style.display = 'block';
    } else {
        if(btnLogin) btnLogin.style.display = 'block';
        if(btnRegistro) btnRegistro.style.display = 'block';
        if(btnLogout) btnLogout.style.display = 'none';
        if(btnNueva) btnNueva.style.display = 'none';
    }

    // 2. SISTEMA DE PAGINACIÓN (Conexión directa al HTML)
    const contenedor = document.getElementById('contenedor-actividades');
    const infoPaginacion = document.getElementById('info-paginacion');
    const btnMostrarMas = document.getElementById('btn-mostrar-mas');
    
    // Variables de estado
    let registroActual = 0;
    const cantidadPorPagina = 6;
    let totalActividades = 0;

    // 3. LA FUNCIÓN DE CARGA
    async function cargarActividades(reset = false) {
        if (reset) {
            registroActual = 0;
            contenedor.innerHTML = ''; 
        }

        try {
            const url = `api/get/actividades.php?reg=${registroActual}&cant=${cantidadPorPagina}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.RESULTADO === 'OK') {
                totalActividades = data.TOTAL_COINCIDENCIAS;
                
                renderizarActividades(data.FILAS);
                
                registroActual += data.FILAS.length;
                actualizarInterfazPaginacion();
            } else {
                contenedor.innerHTML = '<p>No se han podido cargar las actividades.</p>';
            }
        } catch (error) {
            console.error("Error al obtener actividades:", error);
            if (registroActual === 0) {
                contenedor.innerHTML = '<p>Error de conexión con el servidor.</p>';
            }
        }
    }

    // 4. RENDERIZADO VISUAL
    function renderizarActividades(actividades) {
        actividades.forEach(act => {
            const card = document.createElement('article');
            card.className = 'activity-card';
            
            card.innerHTML = `
                <a href="actividad.html?id=${act.id}" class="img-link">
                    <img src="./fotos/actividades/${act.foto}" alt="${act.nombre}" class="activity-img">
                </a>
                
                <div class="activity-info">
                    <h3 class="activity-title" title="${act.nombre}">
                        <a href="actividad.html?id=${act.id}">${act.nombre}</a>
                    </h3>
                    
                    <div class="activity-meta">
                        <p class="date">Fecha de creación: ${act.fecha_alta}</p>
                        <p class="location"><i class="fa-solid fa-location-dot"></i> ${act.lugar}</p>
                        <p class="author"><i class="fa-solid fa-user"></i> ${act.autor}</p>
                    </div>
                </div>
            `;
            contenedor.appendChild(card);
        });
    }

    // 5. CONTROLADOR DEL BOTÓN Y TEXTO
    function actualizarInterfazPaginacion() {
        if(infoPaginacion) {
            infoPaginacion.textContent = `Mostrando ${registroActual} de ${totalActividades} actividades`;
        }

        if(btnMostrarMas) {
            if (registroActual >= totalActividades) {
                btnMostrarMas.style.display = 'none';
            } else {
                btnMostrarMas.style.display = 'inline-block';
                btnMostrarMas.disabled = false;
            }
        }
    }

    if(btnMostrarMas) {
        btnMostrarMas.onclick = () => {
            btnMostrarMas.disabled = true; 
            btnMostrarMas.textContent = "Cargando...";
            cargarActividades().then(() => {
                btnMostrarMas.textContent = "Mostrar más";
            });
        };
    }

    // Arrancamos la primera carga
    cargarActividades(true);
};