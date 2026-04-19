window.onload = function () {
    // 1. REFERENCIAS A ELEMENTOS DEL DOM
    const form = document.getElementById('form-registro');
    const inputUser = document.getElementById('username');
    const inputPhoto = document.getElementById('user-photo');
    const photoPreview = document.getElementById('photo-preview');
    const areaFoto = document.getElementById('area-foto');
    const btnUpload = document.getElementById('btn-trigger-upload');
    const btnRemove = document.getElementById('remove-photo');
    
    // Imagen por defecto cuando no hay selección
    const FOTO_POR_DEFECTO = './img/usuarioRegistro.png';

    // --- 2. LÓGICA DE MOSTRAR/OCULTAR CONTRASEÑA ---
    const botonesToggle = document.querySelectorAll('.toggle-password');
    botonesToggle.forEach(function (btn) {
        btn.onclick = function (e) {
            const input = e.currentTarget.parentElement.querySelector('input');
            const icono = e.currentTarget.querySelector('i');
           
            if (input.type === 'password') {
                input.type = 'text';
                if (icono) icono.className = 'fa-solid fa-eye-slash';
            } else {
                input.type = 'password';
                if (icono) icono.className = 'fa-solid fa-eye';
            }
        };
    });

    // --- 3. GESTIÓN DINÁMICA DE LA FOTO ---
    
    // Abrir el selector de archivos al hacer clic en el botón o en la imagen actual
    if (inputPhoto) {
        const dispararSelector = function() { inputPhoto.click(); };
        if (btnUpload) btnUpload.onclick = dispararSelector;
        if (areaFoto) areaFoto.onclick = dispararSelector;

        // Previsualización de la foto seleccionada (Lectura local)
        inputPhoto.onchange = function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (ev) {
                    if (photoPreview) photoPreview.src = ev.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // Botón Eliminar: Limpia el input y restaura la imagen por defecto
    if (btnRemove) {
        btnRemove.onclick = function() {
            if (inputPhoto) inputPhoto.value = ''; 
            if (photoPreview) photoPreview.src = FOTO_POR_DEFECTO;
        };
    }

    // --- 4. COMPROBACIÓN DE USUARIO (API) ---
    if (inputUser) {
        inputUser.onblur = function () {
            const login = inputUser.value.trim();
            if (login.length < 4) return;

            fetch('api/usuarios/' + login)
                .then(res => res.json())
                .then(data => {
                    const errorMsg = document.getElementById('error-login');
                    if (data.DISPONIBLE === false) {
                        errorMsg.style.display = 'block';
                        inputUser.style.borderColor = '#d9534f';
                    } else {
                        errorMsg.style.display = 'none';
                        inputUser.style.borderColor = '';
                    }
                })
                .catch(err => console.error("Error al validar login:", err));
        };
    }

    // --- 5. ENVÍO DEL FORMULARIO (REGISTRO) ---
    if (form) {
        form.onsubmit = function (e) {
            e.preventDefault();

            // Validación de contraseñas iguales
            const pwd = document.getElementById('password').value;
            const pwdConfirm = document.getElementById('password-confirm').value;

            if (pwd !== pwdConfirm) {
                mostrarModal("Error", "Las contraseñas no coinciden.");
                return;
            }

            // Captura todos los datos, incluida la FOTO como archivo binario
            const fd = new FormData(form);

            fetch('api/usuarios/registrar', {
                method: 'POST',
                body: fd
            })
            .then(res => res.json())
            .then(data => {
                if (data.RESULTADO === 'OK') {
                    let mensaje = "¡Bienvenido! Ya puedes iniciar sesión.";
                    if (data.ERROR_FOTO) {
                        mensaje = "Usuario creado, pero hubo un problema con tu foto: " + data.ERROR_FOTO;
                    }
                    
                    mostrarModal("Registro completado", mensaje);

                    // Al cerrar el modal con éxito, redirigir
                    document.getElementById('modal-btn-cerrar').onclick = function () {
                        window.location.href = 'login.html';
                    };
                } else {
                    mostrarModal("Error de registro", data.DESCRIPCION || "No se pudo completar el registro.");
                }
            })
            .catch(err => {
                mostrarModal("Error", "No hay conexión con el servidor.");
                console.error("Fallo en fetch:", err);
            });
        };
    }

    // --- 6. FUNCIÓN DEL MODAL ---
    function mostrarModal(titulo, texto) {
        const modal = document.getElementById('modal-registro');
        const mTitulo = document.getElementById('modal-titulo');
        const mTexto = document.getElementById('modal-texto');
        const mBtn = document.getElementById('modal-btn-cerrar');

        if (modal && mTitulo && mTexto && mBtn) {
            mTitulo.textContent = titulo;
            mTexto.textContent = texto;
            modal.style.display = 'flex';
           
            // Por defecto, el botón solo cierra el modal
            mBtn.onclick = function () {
                modal.style.display = 'none';
            };
        }
    }
};