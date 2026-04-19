window.onload = function () {
    var parametros = new URLSearchParams(window.location.search);
    var idActividad = parametros.get('id');

    if (!idActividad || isNaN(idActividad)) {
        window.location.href = 'index.html';
        return;
    }

    var token = sessionStorage.getItem('token') || localStorage.getItem('token');
    var fotosActividad = [];
    var fotoActualIndex = 0;

    // --- CARGA DE DATOS ---
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
        .catch(function (err) { console.error("Error crítico:", err); });


    // --- FUNCIONES DE RENDERIZADO ---

    function pintarDatosBasicos(act) {
        var estrellas = '★'.repeat(Math.round(act.valoracion)) + '☆'.repeat(5 - Math.round(act.valoracion));
        
        // CORRECCIÓN DE RUTAS Y FALLBACKS
        var rutaFotoAct = 'fotos/actividades/' + (act.foto || 'default.jpg');
        var rutaFotoAutor = 'fotos/usuarios/' + (act.foto_autor || 'usuarioRegistro.png');

        document.getElementById('contenedor-detalles').innerHTML =
            '<div class="header-actividad">' +
            '<img src="' + rutaFotoAct + '" alt="' + act.nombre + '" class="imagen-representativa" style="max-width: 100%; border-radius: 8px;" onerror="this.src=\'img/ficha.png\'">' +
            '<h2 class="detail-title">' + act.nombre + '</h2>' +
            '<div class="detail-meta">' +
            '<span><i class="fa-solid fa-location-dot"></i> ' + act.lugar + '</span>' +
            '<span><i class="fa-solid fa-calendar-days"></i> ' + act.fecha_alta + '</span>' +
            '<span style="color:orange;"> ' + estrellas + ' (' + act.valoracion + ')</span>' +
            '</div>' +
            '</div>' +
            '<div class="autor-info" style="display: flex; align-items: center; margin: 15px 0;">' +
            '<img src="' + rutaFotoAutor + '" alt="' + act.autor + '" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; object-fit: cover;" onerror="this.src=\'img/usuarioRegistro.png\'">' +
            '<strong>Creado por: ' + act.autor + '</strong>' +
            '</div>' +
            '<p class="detail-description">' + act.descripcion + '</p>';
    }

    function actualizarVisorFoto() {
        var contenedor = document.getElementById('contenedor-galeria');
        if (!fotosActividad || fotosActividad.length === 0) {
            contenedor.innerHTML = '<h3>Galería</h3><p>No hay fotos disponibles.</p>';
            return;
        }
        var foto = fotosActividad[fotoActualIndex];
        var rutaImg = 'fotos/actividades/' + foto.fichero;

        contenedor.innerHTML =
            '<h3 style="margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Galería de Fotos</h3>' +
            '<div class="carousel-card" style="background: #f9f9f9; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">' +
            '<div class="image-wrapper" style="text-align:center;">' +
            '<img src="' + rutaImg + '" class="carousel-img-main" style="max-width:100%; height:auto; border-radius: 4px;" onerror="this.src=\'img/ficha.png\'">' +
            '<div class="caption-overlay" style="padding: 10px; font-style: italic; color: #555; background: #fff; margin-top: 10px; border-radius: 4px;">' +
            '<i class="fa-solid fa-camera" style="margin-right: 5px; color: #888;"></i>' + (foto.descripcion || 'Sin descripción') +
            '</div>' +
            '</div>' +
            '<div class="carousel-footer" style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 20px;">' +
            '<button id="btn-ant" class="btn-primary" style="padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">' +
            '<i class="fa-solid fa-chevron-left"></i> Anterior' +
            '</button>' +
            '<span class="step-indicator" style="font-weight: bold;">' + (fotoActualIndex + 1) + ' / ' + fotosActividad.length + '</span>' +
            '<button id="btn-sig" class="btn-primary" style="padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">' +
            'Siguiente <i class="fa-solid fa-chevron-right"></i>' +
            '</button>' +
            '</div>' +
            '</div>';

        var btnAnt = document.getElementById('btn-ant');
        var btnSig = document.getElementById('btn-sig');

        btnAnt.disabled = (fotoActualIndex === 0);
        btnSig.disabled = (fotoActualIndex === fotosActividad.length - 1);
        btnAnt.style.opacity = btnAnt.disabled ? '0.4' : '1';
        btnSig.style.opacity = btnSig.disabled ? '0.4' : '1';

        btnAnt.onclick = function () { fotoActualIndex--; actualizarVisorFoto(); };
        btnSig.onclick = function () { fotoActualIndex++; actualizarVisorFoto(); };
    }

    function pintarCategorias(cats) {
        var lista = document.getElementById('lista-categorias');
        if (!lista) return;
        lista.innerHTML = '';
        cats.forEach(function (c) {
            lista.innerHTML += '<span class="badge" style="background:#eee; padding:5px; margin-right:5px; border-radius:4px;">' + c.nombre + '</span> ';
        });
    }

    function pintarComentarios(comentarios) {
        document.getElementById('titulo-comentarios').innerHTML = 'Comentarios (' + comentarios.length + ')';
        var lista = document.getElementById('contenedor-lista-comentarios');
        lista.innerHTML = '';

        comentarios.forEach(function (c) {
            var estrellas = '★'.repeat(c.valoracion) + '☆'.repeat(5 - c.valoracion);
            // CORRECCIÓN RUTA FOTO COMENTARIO
            var rutaFotoC = 'fotos/usuarios/' + (c.foto_autor || 'usuarioRegistro.png');

            lista.innerHTML +=
                '<div class="comment-item" style="border-bottom: 1px solid #ccc; padding: 10px 0;">' +
                '<div style="display: flex; align-items: center; margin-bottom: 5px;">' +
                '<img src="' + rutaFotoC + '" alt="Autor" style="width:30px; height:30px; border-radius:50%; margin-right:10px; object-fit: cover;" onerror="this.src=\'img/usuarioRegistro.png\'">' +
                '<strong>' + c.login + '</strong> <small style="margin-left:10px; color:#666;">(' + formatearFecha(c.fecha_hora) + ')</small>' +
                '</div>' +
                '<p style="margin: 5px 0;">' + c.texto + '</p>' +
                '<p style="color:orange; margin:0;">' + estrellas + '</p>' +
                '</div>';
        });
    }

    function gestionarFormularioComentario() {
        var div = document.getElementById('contenedor-interaccion-usuario');
        if (!token) {
            div.innerHTML = '<p style="padding:15px; background:#fff3cd; border:1px solid #ffeeba;">Para dejar un comentario debes <a href="login.html">hacer login</a>.</p>';
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
        var fd = new FormData(e.target);
        fetch('api/actividades/' + idActividad + '/comentarios', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: new URLSearchParams(fd)
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.RESULTADO === 'OK') {
                    e.target.reset();
                    fetch('api/actividades/' + idActividad + '/comentarios')
                        .then(function (r) { return r.json(); })
                        .then(function (d) { pintarComentarios(d.FILAS); });
                    mostrarModal("Operación exitosa", "El comentario se ha guardado correctamente.");
                } else {
                    mostrarModal("Error", data.DESCRIPCION || "No se pudo guardar el comentario.");
                }
            });
    }

    function formatearFecha(f) {
        var d = new Date(f);
        var meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        return d.getDate() + " de " + meses[d.getMonth()] + " de " + d.getFullYear() + ", " + d.getHours() + ":" + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    }

    function mostrarModal(titulo, texto) {
        var modal = document.getElementById('modal-mensaje');
        if (!modal) return;
        document.getElementById('modal-titulo').textContent = titulo;
        document.getElementById('modal-texto').textContent = texto;
        modal.style.display = 'flex';
        document.getElementById('modal-btn-cerrar').onclick = function () { modal.style.display = 'none'; };
    }
};