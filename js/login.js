// Esperamos a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.auth-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitamos que la página se recargue

        // 1. Recoger datos del formulario
        const formData = new FormData(loginForm);
        
        // El enunciado pide: login, pwd y recordar [cite: 267, 268, 269, 270]
        // Ojo: 'recordar' solo se envía si el checkbox está marcado
        
        try {
            // 2. Petición al servidor [cite: 77, 263]
            const response = await fetch('api/usuarios/login', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.RESULTADO === 'OK') {
                // LOGIN CORRECTO [cite: 81, 274]
                
                // 3. ¿Dónde guardamos?
                const storage = formData.has('recordar') ? localStorage : sessionStorage;
                
                // Guardamos el TOKEN y el LOGIN [cite: 83, 275]
                storage.setItem('token', data.TOKEN);
                storage.setItem('usuario', data.LOGIN);
                
                // 4. Mensaje modal y Redirección [cite: 81, 82]
                // Aquí deberías llamar a tu función de "mostrarModal"
                alert('¡Bienvenido, ' + data.LOGIN + '!'); 
                window.location.href = 'index.html';
                
            } else {
                // LOGIN INCORRECTO [cite: 80, 206]
                alert('Error: ' + data.DESCRIPCION);
                document.getElementById('login').focus(); // Devolver foco 
            }
        } catch (error) {
            console.error('Error en la conexión:', error);
        }
    });
});