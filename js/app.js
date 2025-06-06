// HU2: Gestionar plantillas en Estado Global
const appState = {
    plantillas: [],
    modoVista: 'lista', // HU4: Estado para modo grilla/lista
    filtros: {
        busqueda: '',
        hashtag: ''
    }
};

// Función para agregar plantillas
function agregarPlantilla(template) {
    appState.plantillas.push(template);
    
    actualizarEstadisticas();
    
    actualizarOpcionesHashtag();

    renderPlantillas();
}


// Función para eliminar plantillas por título
function eliminarPlantilla(titulo) {
    const index = appState.plantillas.findIndex(p => p.titulo === titulo);
    if (index !== -1) {
        appState.plantillas.splice(index, 1);
        actualizarEstadisticas();
        actualizarOpcionesHashtag();
        renderPlantillas();
        return true;
    }
    return false;
}

// Función para buscar plantilla por título
function buscarPlantilla(titulo) {
    return appState.plantillas.find(
      p => p.titulo.toLowerCase() === titulo.toLowerCase()
    );
}

// Función para filtrar plantillas
function filtrarPlantillas() {
    return appState.plantillas.filter(template => {
        const coincideBusqueda = template.titulo.toLowerCase().includes(appState.filtros.busqueda.toLowerCase()) ||
                                template.mensaje.toLowerCase().includes(appState.filtros.busqueda.toLowerCase());
        
        const coincideHashtag = !appState.filtros.hashtag || 
                               template.hashtag.includes(appState.filtros.hashtag) ||
                               template.categoria.includes(appState.filtros.hashtag);
                               
        return coincideBusqueda && coincideHashtag;
    });
}

// HU3: Renderizado Global - muestra el estado global
const container = document.getElementById('templates-container');
const emptyState = document.getElementById('empty-templates-state');

function renderPlantillas() {
    const plantillasFiltradas = filtrarPlantillas();
    
    container.innerHTML = '';
    
    if (plantillasFiltradas.length === 0) {
        if (appState.plantillas.length === 0) {
            emptyState.classList.remove('hidden');
            container.classList.add('hidden');
        } else {
            container.innerHTML = '<div class="text-center py-8 text-gray-500">No se encontraron plantillas con los filtros aplicados.</div>';
            emptyState.classList.add('hidden');
            container.classList.remove('hidden');
        }
        return;
    }
    
    emptyState.classList.add('hidden');
    container.classList.remove('hidden');
    
    // HU4: Aplicar modo de vista
    if (appState.modoVista === 'grilla') {
        container.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
    } else {
        container.className = 'space-y-4';
    }
    
    plantillasFiltradas.forEach(template => {
        const card = template.render(); // Estado local del objeto
        container.appendChild(card);
    });
    
    // Agregar event listeners a los botones después de renderizar
    agregarEventListeners();
}

// Event Listeners para botones de acción
function agregarEventListeners() {
    // Botones de copiar
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const titulo = e.currentTarget.dataset.titulo;
            const template = buscarPlantilla(titulo);
            if (template) {
                navigator.clipboard.writeText(template.getTextoParaCopiar()).then(() => {
                    mostrarNotificacion('Plantilla copiada al portapapeles', 'success');
                });
            }
        });
    });
    
    // Botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const titulo = e.currentTarget.dataset.titulo;
            if (confirm(`¿Estás seguro de eliminar la plantilla "${titulo}"?`)) {
                if (eliminarPlantilla(titulo)) {
                    mostrarNotificacion('Plantilla eliminada correctamente', 'success');
                }
            }
        });
    });
    
    // Botones de editar
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const titulo = e.currentTarget.dataset.titulo;
            const template = buscarPlantilla(titulo);
            if (template) {
                cargarPlantillaEnFormulario(template);
            }
        });
    });
}

// Función para cargar plantilla en formulario para edición
function cargarPlantillaEnFormulario(template) {
    document.getElementById('template-title').value = template.titulo;
    document.getElementById('template-hashtag').value = template.hashtag;
    document.getElementById('template-message').value = template.mensaje;
    
    // Eliminar la plantilla original para "editarla"
    eliminarPlantilla(template.titulo);
    
    // Cambiar texto del botón
    const saveBtn = document.getElementById('save-template-btn');
    saveBtn.innerHTML = '<i class="fas fa-save"></i><span>Actualizar Plantilla</span>';
    
    // Scroll al formulario
    document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    const total = appState.plantillas.length;
    const categorias = new Set();
    let recientes = 0;
    
    appState.plantillas.forEach(template => {
        categorias.add(template.hashtag);
        categorias.add(template.categoria);
        
        const dias = (new Date() - template.fechaCreacion) / (1000 * 60 * 60 * 24);
        if (dias <= 7) recientes++;
    });
    
    document.getElementById('total-templates').textContent = total;
    document.getElementById('total-categories').textContent = categorias.size;
    document.getElementById('recent-templates').textContent = recientes;
    document.getElementById('most-used').textContent = Math.min(total, 2); // Simulado
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
    
    const colores = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    
    notification.classList.add(...colores[tipo].split(' '));
    notification.textContent = mensaje;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// HU4: Toggle modo vista
function toggleModoVista() {
    appState.modoVista = appState.modoVista === 'lista' ? 'grilla' : 'lista';
    renderPlantillas();
}

// Inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const inputTitle = document.getElementById('template-title');
    const inputHashtag = document.getElementById('template-hashtag');
    const inputMessage = document.getElementById('template-message');
    const saveBtn = document.getElementById('save-template-btn');
    const clearBtn = document.getElementById('clear-form-btn');
    const searchInput = document.getElementById('search-templates');
    const filterSelect = document.getElementById('filter-hashtag');
    const previewContent = document.getElementById('preview-content');
    const charCount = document.getElementById('char-count');
    
    // Event Listener para guardar plantilla
    saveBtn.addEventListener('click', function() {
        const titulo = inputTitle.value.trim();
        const hashtag = inputHashtag.value.trim().replace('#', '');
        const mensaje = inputMessage.value.trim();
        
        // Validación de campos vacíos
        if (!titulo || !hashtag || !mensaje) {
            mostrarNotificacion('Por favor completa todos los campos', 'error');
            return;
        }
        // Validación de duplicado por título
        if (buscarPlantilla(titulo)) {
            mostrarNotificacion('Ya existe una plantilla con ese título', 'error');
            return;
        }

        
        // Extraer categoría del hashtag (primera palabra)
        const hashtags = hashtag.split(' ').filter(h => h.length > 0);
        const categoria = hashtags.length > 1 ? hashtags[1].replace('#', '') : 'general';
        
        const nuevaPlantilla = new Template(
            titulo,
            mensaje,
            hashtags[0].replace('#', ''),
            categoria,
            'Usuario' // Por ahora hardcodeado
        );
        
        agregarPlantilla(nuevaPlantilla);
        limpiarFormulario();
        mostrarNotificacion('Plantilla guardada correctamente', 'success');
    });
    
    // Event Listener para limpiar formulario
    clearBtn.addEventListener('click', limpiarFormulario);
    
    // Event Listeners para búsqueda y filtros
    searchInput.addEventListener('input', function() {
        appState.filtros.busqueda = this.value;
        renderPlantillas();
    });
    
    filterSelect.addEventListener('change', function() {
        appState.filtros.hashtag = this.value;
        renderPlantillas();
    });
    
    // Vista previa en tiempo real
    function actualizarVistaPrevia() {
        const mensaje = inputMessage.value;
        if (mensaje.trim()) {
            previewContent.innerHTML = mensaje.replace(/\n/g, '<br>');
            previewContent.classList.remove('text-gray-400', 'italic');
            previewContent.classList.add('text-gray-700');
        } else {
            previewContent.innerHTML = 'La vista previa aparecerá aquí mientras escribes...';
            previewContent.classList.add('text-gray-400', 'italic');
            previewContent.classList.remove('text-gray-700');
        }
    }
    
    // Contador de caracteres
    function actualizarContador() {
        const length = inputMessage.value.length;
        charCount.textContent = `${length}/1000 caracteres`;
        
        if (length > 800) {
            charCount.classList.add('text-red-500');
        } else {
            charCount.classList.remove('text-red-500');
            charCount.classList.add('text-gray-400');
        }
    }
    
    inputMessage.addEventListener('input', function() {
        actualizarVistaPrevia();
        actualizarContador();
    });
    
    // Función para limpiar formulario
    function limpiarFormulario() {
        inputTitle.value = '';
        inputHashtag.value = '';
        inputMessage.value = '';
        actualizarVistaPrevia();
        actualizarContador();
        
        // Restaurar botón de guardar
        saveBtn.innerHTML = '<i class="fas fa-save"></i><span>Guardar Plantilla</span>';
    }
    
    // Plantillas de ejemplo (solo si no hay plantillas guardadas)
    if (appState.plantillas.length === 0) {
        const ejemplo1 = new Template(
            'Mensaje de Bienvenida', 
            '¡Hola {nombre}! 👋\n\nBienvenido/a a {empresa}. Estamos emocionados de tenerte como parte de nuestra comunidad.\n\nSi tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!\n\nSaludos cordiales,\nEl equipo de {empresa}', 
            'bienvenida', 
            'nuevos-clientes', 
            'Sistema'
        );
        
        const ejemplo2 = new Template(
            'Seguimiento de Ventas', 
            'Hola {nombre}, 😊\n\nEspero que estés bien. Te contacto para hacer seguimiento a tu consulta sobre {producto}.\n\n¿Tienes alguna pregunta adicional? Me encantaría ayudarte a encontrar la mejor solución para tus necesidades.\n\n¡Quedo atento a tu respuesta!\n{vendedor}', 
            'ventas', 
            'seguimiento', 
            'Sistema'
        );
        
        const ejemplo3 = new Template(
            'Soporte Técnico', 
            'Hola {nombre}, 🔧\n\nHemos recibido tu consulta de soporte técnico sobre {issue}.\n\nNuestro equipo está trabajando en resolver tu problema. Te mantendremos informado sobre el progreso.\n\nTiempo estimado de resolución: {tiempo}\n\nGracias por tu paciencia.\nSoporte Técnico', 
            'soporte', 
            'tecnico', 
            'Sistema'
        );
        
        agregarPlantilla(ejemplo1);
        agregarPlantilla(ejemplo2);
        agregarPlantilla(ejemplo3);
    }
    
    // Renderizar estado inicial
    renderPlantillas();
    actualizarEstadisticas();
});

function actualizarOpcionesHashtag() {
    const select = document.getElementById('filter-hashtag');

    // Limpiar opciones actuales excepto "Todos los hashtags"
    const valorSeleccionado = select.value;
    select.innerHTML = '<option value="">Todos los hashtags</option>';

    // Extraer hashtags únicos desde el estado global
    const hashtagsUnicos = [...new Set(appState.plantillas.map(p => p.hashtag))];

    hashtagsUnicos.forEach(hashtag => {
        const option = document.createElement('option');
        option.value = hashtag;
        option.textContent = `#${hashtag}`;
        select.appendChild(option);
    });

    // Restaurar selección anterior si aún existe
    if (hashtagsUnicos.includes(valorSeleccionado)) {
        select.value = valorSeleccionado;
    }
}
