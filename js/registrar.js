window.onload = () => {
    const form = document.getElementById('form-registro');
    const inputUser = document.getElementById('username');
    const inputPhoto = document.getElementById('user-photo');
    const photoPreview = document.getElementById('photo-preview');

    // Lógica para mostrar/ocultar contraseña
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.onclick = (e) => {
            const input = e.currentTarget.parentElement.querySelector('input');
            input.type = input.type === 'password' ? 'text' : 'password';
            e.currentTarget.querySelector('i').classList.toggle('fa-eye-slash');
        };
    });

    // 1. COMPROBAR DISPONIBILIDAD (Punto 6.a)
    inputUser.onblur = async () => {
        const login = inputUser.value.trim();
        if (login.length < 4) return;

        try {
            // Llamada directa al archivo GET pasando el parámetro _rec_ [cite: 115]
            const res = await fetch(`api/get/usuarios.php?_rec_=${login}`);
            const data = await res.json();
            const errorMsg = document.getElementById('error-login');

            if (data.DISPONIBLE === false) {
                errorMsg.style.display = 'block';
                inputUser.style.borderColor = '#d9534f';
            } else {
                errorMsg.style.display = 'none';
                inputUser.style.borderColor = '';
            }
        } catch (e) { 
            console.error("Error al validar usuario", e); 
        }
    };

    // 2. GESTIÓN DE FOTO (Punto 6.c)
    document.getElementById('btn-trigger-upload').onclick = () => inputPhoto.click();
    document.getElementById('area-foto').onclick = () => inputPhoto.click();

    inputPhoto.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 200 * 1024) { // Límite 200KB [cite: 115]
                mostrarModal("Error", "La imagen no puede superar los 200KB.");
                inputPhoto.value = '';
                photoPreview.src = './img/usuarioRegistro.png';
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => photoPreview.src = ev.target.result;
            reader.readAsDataURL(file);
        }
    };

    document.getElementById('remove-photo').onclick = () => {
        inputPhoto.value = '';
        photoPreview.src = './img/usuarioRegistro.png';
    };

    // 3. ENVÍO DEL REGISTRO (Punto 6.d)
    form.onsubmit = async (e) => {
        e.preventDefault();

        const p1 = document.getElementById('password').value;
        const p2 = document.getElementById('password-confirm').value;

        if (p1 !== p2) {
            mostrarModal("Atención", "Las contraseñas no coinciden.");
            return;
        }

        const fd = new FormData(form);

        try {
            // Llamada directa al archivo físico de registro [cite: 117]
            const res = await fetch('api/post/usuarios/registro.php', {
                method: 'POST', 
                body: fd 
            });
            const data = await res.json();

            if (data.RESULTADO === 'OK') {
                if (data.ERROR_FOTO) {
                    mostrarModal("Usuario creado, pero...", data.ERROR_FOTO);
                } else {
                    mostrarModal("Éxito", "Usuario y foto registrados correctamente.");
                    document.getElementById('modal-btn-cerrar').onclick = () => {
                        window.location.href = 'login.html';
                    };
                }
            } else {
                mostrarModal("Error", data.DESCRIPCION || "Error en el registro.");
            }
        } catch (err) {
            mostrarModal("Error", "No se pudo conectar con el servidor.");
        }
    };

    function mostrarModal(titulo, texto) {
        document.getElementById('modal-titulo').innerText = titulo;
        document.getElementById('modal-texto').innerText = texto;
        document.getElementById('modal-registro').style.display = 'flex';
        document.getElementById('modal-btn-cerrar').onclick = () => {
            document.getElementById('modal-registro').style.display = 'none';
        };
    }
};