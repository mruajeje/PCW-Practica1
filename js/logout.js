document.addEventListener('DOMContentLoaded', () => {
    // 1. Buscamos el enlace de Logout por su texto o atributo href
    // En tu menú actual, el href apunta a "index.html", vamos a interceptarlo.
    const menuLinks = document.querySelectorAll('.main-nav a');
    let logoutLink = null;

    // Buscamos cuál de los enlaces contiene la palabra "Logout"
    for (let link of menuLinks) {
        if (link.textContent.trim() === 'Logout') {
            logoutLink = link;
            break;
        }
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault(); // Evitamos que siga el enlace normal

            // 2. Limpiamos ambos almacenamientos (por si acaso)
            sessionStorage.clear();
            localStorage.clear();

            // 3. Redirigimos a la página de inicio
            window.location.href = 'index.html';
        });
    }
});