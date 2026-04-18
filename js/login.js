document.addEventListener('DOMContentLoaded', () => {
    
    // 1. COMPROBAR SI YA ESTÁ LOGUEADO
    // Si ya hay un token (en session o local), no pinta nada en la página de login
    const tokenSession = sessionStorage.getItem('token');
    const tokenLocal = localStorage.getItem('token');
    
    if (tokenSession || tokenLocal) {
        window.location.href = 'index.html';
        return; // Detenemos la ejecución del script
    }

    // 2. REFERENCIAS AL DOM
    const loginForm = document.querySelector('.auth-form');
    
    // Referencias al Modal
    const modal = document.getElementById('modal-mensaje');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalTexto = document.getElementById('modal-texto');
    const modalBtnCerrar = document.getElementById('modal-btn-cerrar');
    
    // Variable para saber si debemos redirigir al cerrar el modal
    let redirigirAlCerrar = false; 

    // Función auxiliar para mostrar el modal
    function mostrarModal(titulo, texto, redirigir = false) {
        modalTitulo.textContent = titulo;
        modalTexto.textContent = texto;
        redirigirAlCerrar = redirigir;
        modal.style.display = 'flex';
    }

    // Evento para cerrar el modal
    modalBtnCerrar.addEventListener('click', () => {
        modal.style.display = 'none';
        if (redirigirAlCerrar) {
            window.location.href = 'index.html';
        } else {
            // Si es un error, devolvemos el foco al campo login como pide el PDF
            document.getElementById('login').focus();
        }
    });

    // 3. EVENTO SUBMIT DEL FORMULARIO
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitamos que el formulario cambie de página

        const formData = new FormData(loginForm);

        try {
            // Hacemos la petición a la API
            const response = await fetch('api/usuarios/login', {
                method: 'POST',
                body: formData // Enviamos login, pwd y recordar (si está marcado)
            });

            // Parseamos el JSON que nos devuelve el PHP
            const data = await response.json();

            // Comprobamos la respuesta según el enunciado
            if (data.RESULTADO === 'OK') {
                
                // Limpiamos ambos storages por si acaso
                sessionStorage.clear();
                localStorage.clear();

                // Decidimos dónde guardar en función del checkbox "recordar"
                if (formData.has('recordar')) {
                    localStorage.setItem('token', data.TOKEN);
                    localStorage.setItem('usuario', data.LOGIN);
                } else {
                    sessionStorage.setItem('token', data.TOKEN);
                    sessionStorage.setItem('usuario', data.LOGIN);
                }

                // Mostramos mensaje de éxito y pedimos redirigir
                mostrarModal('Login Correcto', '¡Bienvenido, ' + data.LOGIN + '!', true);

            } else {
                // El servidor devolvió un error (ej: contraseña incorrecta)
                mostrarModal('Error de Login', data.DESCRIPCION, false);
            }

        } catch (error) {
            mostrarModal('Error de Conexión', 'No se pudo contactar con el servidor. Verifica que XAMPP está encendido.', false);
            console.error('Error de fetch:', error);
        }
    });
});