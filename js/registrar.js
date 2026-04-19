window.onload = function () {
    var form = document.getElementById('form-registro');
    var inputUser = document.getElementById('username');
    var inputPhoto = document.getElementById('user-photo');
    var photoPreview = document.getElementById('photo-preview');

    // --- LÓGICA DE MOSTRAR/OCULTAR CONTRASEÑA ---
    var botonesToggle = document.querySelectorAll('.toggle-password');
    botonesToggle.forEach(function (btn) {
        btn.onclick = function (e) {
            var input = e.currentTarget.parentElement.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
            } else {
                input.type = 'password';
            }
            var icono = e.currentTarget.querySelector('i');
            if (icono) icono.classList.toggle('fa-eye-slash');
        };
    });

    // 1. COMPROBAR DISPONIBILIDAD DE LOGIN (Punto 6.a) - SIN ASYNC
    if (inputUser) {
        inputUser.onblur = function () {
            var login = inputUser.value.trim();
            if (login.length < 4) return;

            // Llamada al endpoint de verificación
            fetch('api/usuarios/' + login)
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    var errorMsg = document.getElementById('error-login');
                    if (data.DISPONIBLE === false) {
                        errorMsg.style.display = 'block';
                        inputUser.style.borderColor = '#d9534f';
                    } else {
                        errorMsg.style.display = 'none';
                        inputUser.style.borderColor = '';
                    }
                })
                .catch(function (err) {
                    console.error("Error al validar login:", err);
                });
        };
    }

    // 2. PREVISUALIZACIÓN DE FOTO (Punto 6.b)
    if (inputPhoto) {
        inputPhoto.onchange = function (e) {
            var file = e.target.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function (ev) {
                    if (photoPreview) photoPreview.src = ev.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // 3. ENVÍO DEL FORMULARIO DE REGISTRO
    if (form) {
        // --- ENVÍO DEL FORMULARIO DE REGISTRO ---
        form.onsubmit = function (e) {
            e.preventDefault();

            var pwd = document.getElementById('password').value;
            var pwdConfirm = document.getElementById('password-confirm').value;

            if (pwd !== pwdConfirm) {
                mostrarModal("Error", "Las contraseñas no coinciden.");
                return;
            }

            var fd = new FormData(form);

            // Requisito 6: Petición POST a api/usuarios
            fetch('api/usuarios', {
                method: 'POST',
                body: fd // El navegador ya pone el Content-Type correcto para FormData
            })
                .then(function (res) {
                    return res.json();
                })
                .then(function (data) {
                    if (data.RESULTADO === 'OK') {
                        // Si el registro es éxito, mostramos modal y redirigimos al cerrar
                        mostrarModal("Registro completado", "¡Bienvenido! Ya puedes iniciar sesión.");

                        document.getElementById('modal-btn-cerrar').onclick = function () {
                            window.location.href = 'login.html';
                        };
                    } else {
                        // Si la API devuelve un error (ej: login ya existe)
                        mostrarModal("Error de registro", data.DESCRIPCION);
                    }
                })
                .catch(function (err) {
                    mostrarModal("Error", "No se pudo conectar con el servidor.");
                    console.error("Fallo en fetch:", err);
                });
        };
    }

    function mostrarModal(titulo, texto) {
        var modal = document.getElementById('modal-mensaje'); // Usa el ID de tu HTML
        var mTitulo = document.getElementById('modal-titulo');
        var mTexto = document.getElementById('modal-texto');
        var mBtn = document.getElementById('modal-btn-cerrar');

        if (modal && mTitulo && mTexto) {
            mTitulo.textContent = titulo;
            mTexto.textContent = texto;
            modal.style.display = 'flex';
            mBtn.onclick = function () {
                modal.style.display = 'none';
            };
        }
    }
};