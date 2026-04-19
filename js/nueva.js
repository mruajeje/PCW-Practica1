window.onload = function() {
    // 1. PROTECCIÓN DE ACCESO
    var token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) { 
        window.location.href = 'index.html'; 
        return; 
    }

    var categoriasAsignadas = [];
    var fotosSeleccionadas = []; // Array de objetos { archivo: File, desc: String }

    // 2. CARGAR CATEGORÍAS
    fetch('api/categorias')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.RESULTADO === 'OK') {
                var dl = document.getElementById('existing-categories');
                data.FILAS.forEach(function(c) {
                    var option = document.createElement('option');
                    option.value = c.nombre;
                    dl.appendChild(option);
                });
            }
        });

    // 3. GESTIÓN DE CATEGORÍAS
    var btnAddTag = document.getElementById('btn-add-tag');
    if (btnAddTag) {
        btnAddTag.onclick = function() {
            var input = document.getElementById('category-input');
            var val = input.value.trim();
            if (val && categoriasAsignadas.indexOf(val) === -1) {
                categoriasAsignadas.push(val);
                renderTags();
                input.value = '';
            }
        };
    }

    function renderTags() {
        var container = document.getElementById('assigned-tags-container');
        container.innerHTML = '';
        categoriasAsignadas.forEach(function(c, i) {
            var span = document.createElement('span');
            span.className = 'tag';
            span.textContent = c + ' ';
            var btnRem = document.createElement('button');
            btnRem.type = 'button';
            btnRem.innerHTML = '&times;';
            btnRem.onclick = function() {
                categoriasAsignadas.splice(i, 1);
                renderTags();
            };
            span.appendChild(btnRem);
            container.appendChild(span);
        });
    }

    // 4. GESTIÓN DE FOTOS
    var inputFile = document.getElementById('subir-ficha');
    var previewImg = document.getElementById('img-temp-preview');
    var btnSeleccionar = document.getElementById('btn-seleccionar');

    if (btnSeleccionar) btnSeleccionar.onclick = function() { inputFile.click(); };

    inputFile.onchange = function(e) {
        var file = e.target.files[0];
        if (file) {
            if (file.size > 200 * 1024) { 
                alert("La foto no puede superar los 200KB.");
                inputFile.value = '';
                previewImg.src = 'img/ficha.png';
                return;
            }
            var reader = new FileReader();
            reader.onload = function(ev) { previewImg.src = ev.target.result; };
            reader.readAsDataURL(file);
        }
    };

    document.getElementById('btn-confirmar-foto').onclick = function() {
        var descInput = document.getElementById('foto-desc-temp');
        var desc = descInput.value.trim();
        if (inputFile.files.length > 0 && desc !== "") {
            fotosSeleccionadas.push({ archivo: inputFile.files[0], desc: desc });
            renderFotos();
            descInput.value = '';
            inputFile.value = '';
            previewImg.src = 'img/ficha.png';
        }
    };

    function renderFotos() {
        var list = document.getElementById('added-photos-list');
        list.innerHTML = '';
        fotosSeleccionadas.forEach(function(f, i) {
            var item = document.createElement('article');
            item.className = 'photo-item';
            var urlTemp = URL.createObjectURL(f.archivo);
            item.innerHTML = '<img src="' + urlTemp + '"><p>' + f.desc + '</p>';
            var btnDel = document.createElement('button');
            btnDel.className = 'btn-delete';
            btnDel.textContent = 'Eliminar';
            btnDel.onclick = function() {
                fotosSeleccionadas.splice(i, 1);
                renderFotos();
            };
            item.appendChild(btnDel);
            list.appendChild(item);
        });
    }

    // 5. ENVÍO FINAL
    var form = document.getElementById('form-nueva-actividad');
    form.onsubmit = function(e) {
        e.preventDefault();
        if (fotosSeleccionadas.length === 0) {
            alert("Debes añadir al menos una foto.");
            return;
        }

        var fd = new FormData(form);
        categoriasAsignadas.forEach(function(c) { fd.append('categorias[]', c); });
        
        // Sincronización de nombres con el servidor
        fotosSeleccionadas.forEach(function(f) {
            fd.append('foto[]', f.archivo);
            fd.append('texto[]', f.desc);
        });

        fetch('api/actividades', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: fd
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.RESULTADO === 'OK') {
                alert("Actividad publicada");
                window.location.href = 'index.html';
            } else {
                alert(data.DESCRIPCION);
            }
        });
    };
};