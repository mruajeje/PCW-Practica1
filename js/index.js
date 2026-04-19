window.onload = function() {
    // =================================================================================
    // 1. GESTIÓN DE SESIÓN Y MENÚ
    // =================================================================================
    var token = sessionStorage.getItem('token') || localStorage.getItem('token');

    var liLogin = document.querySelector('a[href="login.html"]');
    var liRegistro = document.querySelector('a[href="registrar.html"]');
    var liNueva = document.querySelector('a[href="nueva.html"]');
    
    // Localizar el Logout dinámicamente
    var enlaces = document.querySelectorAll('.main-nav a');
    var liLogout = null;
    for (var i = 0; i < enlaces.length; i++) {
        if (enlaces[i].textContent.toLowerCase().includes('logout') || enlaces[i].getAttribute('onclick')) {
            liLogout = enlaces[i].parentElement;
        }
    }

    if (token) {
        if (liLogin) liLogin.parentElement.style.display = 'none';
        if (liRegistro) liRegistro.parentElement.style.display = 'none';
        if (liLogout) liLogout.style.display = 'block';
        if (liNueva) liNueva.parentElement.style.display = 'block';
    } else {
        if (liLogin) liLogin.parentElement.style.display = 'block';
        if (liRegistro) liRegistro.parentElement.style.display = 'block';
        if (liLogout) liLogout.style.display = 'none';
        if (liNueva) liNueva.parentElement.style.display = 'none';
    }

    // =================================================================================
    // 2. CARGA DE ACTIVIDADES (Paginación)
    // =================================================================================
    var contenedor = document.getElementById('contenedor-actividades');
    var infoPaginacion = document.getElementById('info-paginacion');
    var btnMostrarMas = document.getElementById('btn-mostrar-mas');
    
    var registroActual = 0;
    var cantidadPorPagina = 6;
    var totalActividades = 0;

    function cargarActividades(esInicio) {
        if (esInicio) {
            registroActual = 0;
            if (contenedor) contenedor.innerHTML = '';
        }

        // Ruta a tu API GET
        var url = 'api/get/actividades.php?reg=' + registroActual + '&cant=' + cantidadPorPagina;

        fetch(url)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.RESULTADO === 'OK') {
                    totalActividades = data.TOTAL_COINCIDENCIAS;
                    renderizarActividades(data.FILAS);
                    
                    // Actualizamos el puntero de registro
                    registroActual += data.FILAS.length;
                    actualizarInterfazPaginacion();
                }
            })
            .catch(function(err) {
                console.error("Error al cargar actividades:", err);
            });
    }

    // =================================================================================
    // 3. RENDERIZADO (Diseño del compañero mejorado)
    // =================================================================================
    function renderizarActividades(actividades) {
        if (!contenedor) return;

        actividades.forEach(function(act) {
            // Usamos la variable 'foto' que devuelve tu API actividades.php
            const rutaImagen = act.foto ? `fotos/actividades/${act.foto}` : 'img/actividad1.jpg';
            
            // Creamos las estrellas según la valoración media
            const estrellas = '⭐'.repeat(Math.round(act.valoracion)) || 'Sin valoración';

            const html = `
                <article class="activity-card">
                    <a href="actividad.html?id=${act.id}" class="img-link">
                        <img src="${rutaImagen}" alt="Foto de ${act.nombre}" class="activity-img" onerror="this.src='img/actividad1.jpg'">
                    </a>
                    <div class="activity-info">
                        <h3 class="activity-title" title="${act.nombre}">
                            <a href="actividad.html?id=${act.id}">${act.nombre}</a>
                        </h3>
                        <p class="fecha"><i class="fa-regular fa-calendar"></i> ${act.fecha_alta}</p>
                        <p class="valoracion">Puntuación: ${estrellas} (${act.valoracion}/5)</p>
                        <p class="lugar">📍 ${act.lugar}</p>
                        <p class="autor">Añadida por: <a href="buscar.html?a=${act.autor}" class="usuario">${act.autor}</a></p>
                    </div>
                </article>
            `;

            // Insertamos al final del contenedor usando la técnica eficiente
            contenedor.insertAdjacentHTML('beforeend', html);
        });
    }

    // =================================================================================
    // 4. FUNCIONES AUXILIARES DE INTERFAZ
    // =================================================================================
    function actualizarInterfazPaginacion() {
        if (infoPaginacion) {
            infoPaginacion.textContent = 'Mostrando ' + registroActual + ' de ' + totalActividades + ' actividades';
        }
        if (btnMostrarMas) {
            // Si ya hemos cargado todo, ocultamos el botón
            btnMostrarMas.style.display = (registroActual < totalActividades) ? 'inline-block' : 'none';
            btnMostrarMas.disabled = false;
            btnMostrarMas.textContent = "Mostrar más";
        }
    }

    if (btnMostrarMas) {
        btnMostrarMas.onclick = function() {
            btnMostrarMas.disabled = true;
            btnMostrarMas.textContent = "Cargando...";
            cargarActividades(false);
        };
    }

    // Función global de Logout
    window.logout = function() {
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        location.reload(); // Recarga la página para actualizar el menú
    };

    // Lanzar carga inicial nada más cargar la página
    cargarActividades(true);
};