window.onload = async () => {
    const parametros = new URLSearchParams(window.location.search);
    const idActividad = parametros.get('id');

    // Punto 7.a: Si no hay ID, redirigir a index 
    if (!idActividad) {
        window.location.href = 'index.html';
        return;
    }

    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

    // --- 1. CARGA INICIAL DE DATOS ---
    try {
        // Detalle de actividad [cite: 111]
        const resAct = await fetch(`api/actividades/${idActividad}`);
        const dataAct = await resAct.json();
        if (dataAct.RESULTADO === 'OK') pintarActividad(dataAct.FILAS[0]);

        // Comentarios [cite: 123]
        cargarComentarios();

        // Punto 7.f: Carga condicional del formulario [cite: 126]
        gestionarFormularioComentario();

    } catch (error) {
        console.error("Error inicial:", error);
    }

    // --- 2. GESTIÓN DEL FORMULARIO DINÁMICO (Punto 7.f) ---
    async function gestionarFormularioComentario() {
        const contenedor = document.getElementById('contenedor-interaccion-usuario');
        
        if (!token) {
            // Usuario no logueado: Mensaje con enlace [cite: 128, 129]
            contenedor.innerHTML = `
                <div class="login-warning">
                    <i class="fa-solid fa-circle-info"></i>
                    <p>Para dejar un comentario debes hacer <a href="login.html">login</a>.</p>
                </div>`;
        } else {
            // Usuario logueado: Petición fetch para obtener el HTML 
            try {
                const resHtml = await fetch('comentario_form.html');
                const html = await resHtml.text();
                contenedor.innerHTML = html;
                // Una vez inyectado, activamos su lógica [cite: 132]
                prepararEnvioComentario();
            } catch (e) {
                console.error("Error cargando el formulario externo", e);
            }
        }
    }

    // --- 3. ENVÍO DE COMENTARIO (Punto 7.g) ---
    function prepararEnvioComentario() {
        const formulario = document.getElementById('form-comentario');
        if (!formulario) return;

        formulario.onsubmit = async (e) => {
            e.preventDefault();

            const texto = document.getElementById('comment-text').value;
            const valoracion = formulario.querySelector('input[name="rating"]:checked')?.value;

            if (!valoracion) {
                mostrarModal("Atención", "Debes seleccionar una valoración.");
                return;
            }

            const fd = new URLSearchParams();
            fd.append('texto', texto);
            fd.append('valoracion', valoracion);

            try {
                const res = await fetch(`api/actividades/${idActividad}/comentarios`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }, // Formato Bearer 
                    body: fd
                });

                const resData = await res.json();

                if (resData.RESULTADO === 'OK') {
                    formulario.reset(); // Limpiar formulario [cite: 138]
                    mostrarModal("Éxito", "Comentario guardado correctamente."); // Modal informativo [cite: 138]
                    cargarComentarios(); // Actualizar lista sin recargar 
                } else {
                    mostrarModal("Error", resData.DESCRIPCION);
                }
            } catch (err) {
                console.error("Error al enviar comentario", err);
            }
        };
    }

    // --- 4. FUNCIONES DE APOYO (Pintar y Formatear) ---

    async function cargarComentarios() {
        const resCom = await fetch(`api/actividades/${idActividad}/comentarios`);
        const dataCom = await resCom.json();
        if (dataCom.RESULTADO === 'OK') pintarComentarios(dataCom.FILAS);
    }

    function pintarActividad(act) {
        document.getElementById('contenedor-detalles').innerHTML = `
            <h2>${act.nombre}</h2>
            <section class="activity-description">
                <h3>Descripción</h3>
                <p>${act.descripcion}</p>
            </section>
            <div class="activity-meta-links">
                <p class="meta-item"><i class="fa-solid fa-user"></i> Autor: ${act.autor}</p>
                <p class="meta-item"><i class="fa-solid fa-location-dot"></i> Lugar: ${act.lugar}</p>
                <p class="meta-item"><i class="fa-regular fa-calendar"></i> ${act.fecha_alta}</p>
            </div>`;
        
        document.getElementById('contenedor-galeria').innerHTML = `
            <h3>Galería</h3>
            <div class="photo-viewer">
                <img src="./fotos/actividades/${act.foto}" class="main-photo">
            </div>`;
    }

    function pintarComentarios(comentarios) {
        const lista = document.getElementById('contenedor-lista-comentarios');
        document.getElementById('titulo-comentarios').textContent = `Comentarios (${comentarios.length})`;
        lista.innerHTML = '';

        comentarios.forEach(c => {
            lista.innerHTML += `
                <article class="comment">
                    <div class="comment-header">
                        <span class="comment-author"><strong>${c.login}</strong></span>
                        <span class="comment-date">${formatearFecha(c.fecha_hora)}</span>
                    </div>
                    <div class="comment-body"><p>${c.texto}</p></div>
                    <div class="comment-rating">Valoración: ${c.valoracion}/5 <i class="fa-solid fa-star"></i></div>
                </article>`;
        });
    }

    // Punto 7.e: Formato de fecha "8 de febrero de 2026, 12:45" 
    function formatearFecha(fechaStr) {
        const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        const d = new Date(fechaStr);
        return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}, ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    // Función para el Modal (Enunciado prohíbe alert) [cite: 41]
    function mostrarModal(titulo, texto) {
        document.getElementById('modal-titulo').textContent = titulo;
        document.getElementById('modal-texto').textContent = texto;
        const modal = document.getElementById('modal-mensaje');
        modal.style.display = 'flex';
        document.getElementById('modal-btn-cerrar').onclick = () => modal.style.display = 'none';
    }
};