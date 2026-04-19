window.onload = function () {
    var parametros = new URLSearchParams(window.location.search);
    var idActividad = parametros.get('id');

    // 1. Validar ID
    if (!idActividad || isNaN(idActividad)) {
        window.location.href = 'index.html';
        return;
    }

    var token = sessionStorage.getItem('token') || localStorage.getItem('token');
    var fotosActividad = [];
    var fotoActualIndex = 0;

    // 2. MOTOR DE CARGA SECUENCIAL (Sin async/await)
    fetch('api/actividades/' + idActividad)
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.RESULTADO === 'OK') pintarDatosBasicos(data.FILAS[0]);
            return fetch('api/actividades/' + idActividad + '/fotos');
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.RESULTADO === 'OK') {
                fotosActividad = data.FILAS;
                actualizarVisorFoto();
            }
            return fetch('api/actividades/' + idActividad + '/categorias');
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.RESULTADO === 'OK') pintarCategorias(data.FILAS);
            return fetch('api/actividades/' + idActividad + '/comentarios');
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.RESULTADO === 'OK') pintarComentarios(data.FILAS);
            gestionarFormularioComentario();
        })
        .catch(function (err) { console.error("Error crítico en la carga:", err); });


    // --- FUNCIONES DE RENDERIZADO Y LÓGICA ---

    function pintarDatosBasicos(act) {
        var estrellas = '<i class="fa-solid fa-star"></i>'.repeat(Math.round(act.valoracion)) +
            '<i class="fa-regular fa-star"></i>'.repeat(5 - Math.round(act.valoracion));

        var rutaFotoAutor = 'fotos/usuarios/' + (act.foto_autor || 'nofotousu.webp');

        document.getElementById('contenedor-detalles').innerHTML =
            '<div class="header-actividad">' +
            '<h2>' + act.nombre + '</h2>' +
            '<section class="activity-description">' +
            '<h3>Descripción de la experiencia</h3>' +
            '<p>' + act.descripcion + '</p>' +
            '</section>' +
            '<div class="activity-meta-links">' +
            '<p class="meta-item"><i class="fa-solid fa-user"></i> Creado por: <img src="' + rutaFotoAutor + '" style="width:20px; height:20px; border-radius:50%; margin: 0 5px;" onerror="this.src=\'./img/usuarioRegistro.png\'"> <a href="buscar.html?autor=' + act.autor + '" class="highlight-link">' + act.autor + '</a></p>' +
            '<p class="meta-item"><i class="fa-solid fa-location-dot"></i> Lugar: <a href="buscar.html?lugar=' + act.lugar + '" class="highlight-link">' + act.lugar + '</a></p>' +
            '<p class="meta-item"><i class="fa-regular fa-calendar"></i> Publicado: ' + act.fecha_alta + '</p>' +
            '<div id="lista-categorias-meta"></div>' +
            '<div class="rating-badge">Valoración: <span style="color:orange;">' + estrellas + '</span> (' + act.valoracion + '/5)</div>' +
            '</div>' +
            '</div>';
    }

    function pintarCategorias(cats) {
        var contenedor = document.getElementById('lista-categorias-meta');
        if (!contenedor) return;

        var html = '<p class="meta-item"><i class="fa-solid fa-tag"></i> Categorías: ';
        cats.forEach(function (c) {
            html += '<a href="buscar.html?cat=' + c.id + '" class="highlight-link" style="margin-right:8px; background:#eee; padding:3px 6px; border-radius:4px;">' + c.nombre + '</a>';
        });
        html += '</p>';
        contenedor.innerHTML = html;
    }

    function actualizarVisorFoto() {
        var contenedor = document.getElementById('contenedor-galeria');
        if (fotosActividad.length === 0) return;
        var foto = fotosActividad[fotoActualIndex];
        var rutaImg = 'fotos/actividades/' + (foto.fichero || foto.nombre);

        contenedor.innerHTML =
            '<h3 style="margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Galería de Fotos</h3>' +
            '<div class="carousel-card" style="background: #f9f9f9; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">' +
            '<div class="image-wrapper" style="text-align:center; position: relative;">' +
            '<img src="' + rutaImg + '" class="carousel-img-main" style="max-width:100%; height:auto; border-radius: 4px;" onerror="this.src=\'./img/ficha.png\'">' +
            '<div class="caption-overlay" style="padding: 10px; font-style: italic; color: #555; background: #fff; margin-top: 10px; border-radius: 4px;">' +
            '<i class="fa-solid fa-camera" style="margin-right: 5px; color: #888;"></i>' + (foto.descripcion || 'Sin descripción') +
            '</div>' +
            '</div>' +
            '<div class="carousel-footer" style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 20px;">' +
            '<button id="btn-ant" class="btn-primary" style="display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; transition: opacity 0.2s;">' +
            '<i class="fa-solid fa-chevron-left"></i> Anterior' +
            '</button>' +
            '<span class="step-indicator" style="font-weight: bold; font-size: 1.1em; color: #333; min-width: 60px; text-align: center;">' +
            (fotoActualIndex + 1) + ' / ' + fotosActividad.length +
            '</span>' +
            '<button id="btn-sig" class="btn-primary" style="display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; transition: opacity 0.2s;">' +
            'Siguiente <i class="fa-solid fa-chevron-right"></i>' +
            '</button>' +
            '</div>' +
            '</div>';

        var btnAnt = document.getElementById('btn-ant');
        var btnSig = document.getElementById('btn-sig');

        var esPrimero = (fotoActualIndex === 0);
        var esUltimo = (fotoActualIndex === fotosActividad.length - 1);

        btnAnt.disabled = esPrimero;
        btnSig.disabled = esUltimo;

        btnAnt.style.opacity = esPrimero ? '0.4' : '1';
        btnAnt.style.cursor = esPrimero ? 'not-allowed' : 'pointer';

        btnSig.style.opacity = esUltimo ? '0.4' : '1';
        btnSig.style.cursor = esUltimo ? 'not-allowed' : 'pointer';

        btnAnt.onclick = function () { fotoActualIndex--; actualizarVisorFoto(); };
        btnSig.onclick = function () { fotoActualIndex++; actualizarVisorFoto(); };
    }

    function pintarComentarios(comentarios) {
        document.getElementById('titulo-comentarios').innerHTML = 'Comentarios de usuarios (' + comentarios.length + ')';
        var lista = document.getElementById('contenedor-lista-comentarios');
        lista.innerHTML = (comentarios.length === 0) ? '<p>No hay comentarios todavía.</p>' : '';

        comentarios.forEach(function (c) {
            var estrellas = '<i class="fa-solid fa-star"></i>'.repeat(c.valoracion) +
                '<i class="fa-regular fa-star"></i>'.repeat(5 - c.valoracion);
            var rutaFotoC = 'fotos/usuarios/' + (c.foto_autor || 'nofotousu.webp');

            lista.innerHTML +=
                '<article class="comment" style="border-bottom: 1px solid #ccc; padding: 15px 0;">' +
                '<div class="comment-header" style="display: flex; align-items: center; margin-bottom: 10px;">' +
                '<img src="' + rutaFotoC + '" style="width:45px; height:45px; border-radius:50%; margin-right:12px; object-fit:cover;" onerror="this.src=\'./img/usuarioRegistro.png\'">' +
                '<div class="comment-meta">' +
                '<span class="comment-author" style="font-weight: bold; display: block;">' + c.login + '</span>' +
                // APLICACIÓN DE LA REGLA DE FORMATO DE FECHA
                '<span class="comment-date" style="color: #666; font-size: 0.9em;">' + formatearFecha(c.fecha_hora) + '</span>' +
                '</div>' +
                '</div>' +
                '<div class="comment-body"><p style="margin: 5px 0;">' + c.texto + '</p></div>' +
                '<div class="comment-rating" style="color: orange; margin-top: 5px;">' + estrellas + ' (' + c.valoracion + '/5)</div>' +
                '</article>';
        });
    }

    function gestionarFormularioComentario() {
        var div = document.getElementById('contenedor-interaccion-usuario');
        if (!token) {
            div.innerHTML = '<div class="login-warning" style="padding:15px; background:#fff3cd; border:1px solid #ffeeba; border-radius:5px;"><i class="fa-solid fa-circle-info"></i> Para comentar tienes que <a href="login.html" style="font-weight:bold;">iniciar sesión</a>.</div>';
        } else {
            fetch('comentario_form.html')
                .then(function (r) { return r.text(); })
                .then(function (html) {
                    div.innerHTML = html;
                    document.getElementById('form-comentario').onsubmit = enviarComentario;
                });
        }
    }

    function enviarComentario(e) {
        e.preventDefault();

        if (!token) {
            mostrarModal("Error", "Debes estar logueado para comentar.");
            return;
        }

        var fd = new FormData(e.target);

        fetch('api/actividades/' + idActividad + '/comentarios', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/x-www-form-urlencoded' // CRÍTICO: El servidor exige esto para texto
            },
            body: new URLSearchParams(fd) // CRÍTICO: Decodifica el objeto FormData a texto
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.RESULTADO === 'OK') {
                    e.target.reset();

                    // Refresco silencioso de comentarios
                    fetch('api/actividades/' + idActividad + '/comentarios')
                        .then(function (r) { return r.json(); })
                        .then(function (d) {
                            if (d.RESULTADO === 'OK') pintarComentarios(d.FILAS);
                        });

                    mostrarModal("Operación exitosa", "El comentario se ha guardado correctamente.");
                } else {
                    mostrarModal("Error", data.DESCRIPCION || "No se pudo guardar el comentario.");
                }
            })
            .catch(function (err) {
                console.error("Error POST:", err);
                mostrarModal("Error", "No se pudo conectar con el servidor.");
            });
    }

    // --- FUNCIONES AUXILIARES ---

    function formatearFecha(fechaString) {
        var d = new Date(fechaString);
        var meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        var dia = d.getDate();
        var mes = meses[d.getMonth()];
        var anio = d.getFullYear();
        var horas = d.getHours();
        var minutos = d.getMinutes();
        if (minutos < 10) minutos = '0' + minutos;
        return dia + " de " + mes + " de " + anio + ", " + horas + ":" + minutos;
    }

    function mostrarModal(titulo, texto) {
        var modal = document.getElementById('modal-mensaje');
        if (!modal) return alert(titulo + ": " + texto); // Salvavidas si destruyes el HTML

        document.getElementById('modal-titulo').textContent = titulo;
        document.getElementById('modal-texto').textContent = texto;
        modal.style.display = 'flex';
        document.getElementById('modal-btn-cerrar').onclick = function () {
            modal.style.display = 'none';
        };
    }
};